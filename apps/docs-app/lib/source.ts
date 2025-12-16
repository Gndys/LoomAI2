import { docs } from '@/.source/server';
import { i18n } from '@/lib/i18n';
import { loader } from 'fumadocs-core/source';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  // it assigns a URL to your pages
  i18n,
  baseUrl: '/',
  source: docs.toFumadocsSource(),
});
