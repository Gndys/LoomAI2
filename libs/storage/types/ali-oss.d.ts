declare module 'ali-oss' {
  interface OSSOptions {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    endpoint?: string;
    secure?: boolean;
  }

  interface PutResult {
    name: string;
    url: string;
    etag: string;
  }

  interface HeadResult {
    res: {
      headers: Record<string, string>;
    };
    meta?: Record<string, string>;
  }

  interface ListResult {
    objects?: Array<{
      name: string;
      size: number;
      lastModified: string;
      type?: string;
      etag: string;
    }>;
  }

  interface SignatureUrlOptions {
    expires: number;
    method: string;
    secure?: boolean;
    'Content-Type'?: string;
  }

  interface ListOptions {
    prefix?: string;
    'max-keys'?: number;
  }

  class OSS {
    constructor(options: OSSOptions);
    put(key: string, file: Buffer, options?: any): Promise<PutResult>;
    delete(key: string): Promise<void>;
    head(key: string): Promise<HeadResult>;
    list(options?: ListOptions): Promise<ListResult>;
    signatureUrl(key: string, options: SignatureUrlOptions): string;
  }

  export = OSS;
}

