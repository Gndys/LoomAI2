import type { Metadata } from 'next'

const metadataMap = {
  'zh-CN': {
    title: '白底产品图｜服装电商快速上架',
    description: '上传商品图，批量生成可上架白底主图。支持平台尺寸与批量导出，快速上新更省时。',
    keywords: ['白底图', '商品图', '服装电商', '主图', '批量出图', '上架素材'],
  },
  en: {
    title: 'White Background Product Photos | Fast Listing for Fashion Sellers',
    description: 'Upload product photos and batch-generate clean white background images with size presets and export ready for listings.',
    keywords: ['white background', 'product photos', 'fashion sellers', 'listing images', 'batch export'],
  },
} as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = lang === 'en' ? 'en' : 'zh-CN'
  const meta = metadataMap[locale]

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  }
}

export default function ProductWhiteBackgroundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
