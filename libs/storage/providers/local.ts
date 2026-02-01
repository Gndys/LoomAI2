import { existsSync, promises as fs } from 'fs';
import path from 'path';
import type { FileMetadata, SignedUrlParams, SignedUrlResult, StorageProvider, UploadParams, UploadResult } from '../types';

function resolveBaseDir(): string {
  const envDir = process.env.STORAGE_LOCAL_DIR;
  if (envDir) {
    return envDir;
  }

  const candidates = [
    path.join(process.cwd(), 'apps/next-app/public'),
    path.join(process.cwd(), 'public'),
  ];

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) {
      return candidate;
    }
  }

  return path.join(process.cwd(), 'public');
}

function sanitizeKey(key: string): string {
  const normalized = path.posix
    .normalize(key)
    .replace(/^(\.\.(\/|\\|$))+/, '')
    .replace(/^\/+/, '');
  if (normalized.includes('..')) {
    throw new Error('Invalid storage key');
  }
  return normalized;
}

export class LocalProvider implements StorageProvider {
  private readonly baseDir: string;

  constructor() {
    this.baseDir = resolveBaseDir();
  }

  async uploadFile(params: UploadParams): Promise<UploadResult> {
    const folder = params.folder ? sanitizeKey(params.folder) : '';
    const fileName = sanitizeKey(params.fileName);
    const key = path.posix.join(folder, fileName);
    const filePath = path.join(this.baseDir, key);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, params.file);

    return {
      key,
      url: `/${key}`,
      size: params.file.length,
    };
  }

  async generateSignedUrl(params: SignedUrlParams): Promise<SignedUrlResult> {
    const key = sanitizeKey(params.key);
    const expiresIn = params.expiresIn ?? 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    return {
      url: `/${key}`,
      expiresAt,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    const safeKey = sanitizeKey(key);
    const filePath = path.join(this.baseDir, safeKey);
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async fileExists(key: string): Promise<boolean> {
    const safeKey = sanitizeKey(key);
    const filePath = path.join(this.baseDir, safeKey);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileMetadata(key: string): Promise<FileMetadata> {
    const safeKey = sanitizeKey(key);
    const filePath = path.join(this.baseDir, safeKey);
    const stat = await fs.stat(filePath);
    return {
      key: safeKey,
      size: stat.size,
      lastModified: stat.mtime,
    };
  }

  async listFiles(folder: string, limit = 100): Promise<FileMetadata[]> {
    const safeFolder = sanitizeKey(folder);
    const dirPath = path.join(this.baseDir, safeFolder);
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = entries.filter(entry => entry.isFile()).slice(0, limit);
    const results: FileMetadata[] = [];

    for (const entry of files) {
      const filePath = path.join(dirPath, entry.name);
      const stat = await fs.stat(filePath);
      results.push({
        key: path.posix.join(safeFolder, entry.name),
        size: stat.size,
        lastModified: stat.mtime,
      });
    }

    return results;
  }
}
