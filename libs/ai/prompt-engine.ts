/**
 * AI 图片生成提示词引擎
 * 为不同的服装处理功能提供专业的提示词模板
 */

export interface PromptTemplate {
  id: string
  name: string
  icon: string
  description: string
  positive: string
  negative: string
  defaultSize: string
  defaultStyle: string
  previewImage?: string
}

export const promptTemplates: Record<string, PromptTemplate> = {
  'flat-lay': {
    id: 'flat-lay',
    name: '平铺图生成',
    icon: '📸',
    description: '商品展示',
    positive: 'flat lay product photography, white background, top view, centered, professional lighting, clean, minimal',
    negative: 'person, model, human, hands, face, body, UI elements, text, watermark, shadows, wrinkles, accessories',
    defaultSize: 'Auto',
    defaultStyle: '无风格',
  },
  
  'sketch': {
    id: 'sketch',
    name: '服装线稿',
    icon: '✏️',
    description: '技术制版',
    positive: 'technical fashion sketch, clean line drawing, black lines on white background, detailed stitching lines, construction lines, flat pattern view',
    negative: 'color, shading, texture, photo, realistic, model, person, shadows',
    defaultSize: 'Auto',
    defaultStyle: '技术线稿',
  },
  
  'promo': {
    id: 'promo',
    name: '宣传图生成',
    icon: '🎨',
    description: '社交媒体',
    positive: 'lifestyle product photography, natural lighting, aesthetic composition, minimalist scene, soft shadows, professional styling',
    negative: 'cluttered, messy, low quality, distorted, unrealistic',
    defaultSize: '16:9',
    defaultStyle: '生活方式',
  },
  
  'pattern': {
    id: 'pattern',
    name: '版型拆解',
    icon: '📐',
    description: '结构分析',
    positive: 'exploded view, pattern pieces separated, technical illustration, flat lay of garment components, labeled parts, construction breakdown',
    negative: 'assembled, complete garment, model, person, shadows',
    defaultSize: 'Auto',
    defaultStyle: '技术插图',
  },
  
  'recolor': {
    id: 'recolor',
    name: '智能改色',
    icon: '🔄',
    description: '配色方案',
    positive: 'same design, same style, same cut, preserve all details, accurate structure',
    negative: 'different style, different design, pattern change, texture change, deformed',
    defaultSize: 'Auto',
    defaultStyle: '保持原样',
  },
}

// 获取所有功能列表
export function getAllFunctions(): PromptTemplate[] {
  return Object.values(promptTemplates)
}

// 根据 ID 获取功能
export function getFunctionById(id: string): PromptTemplate | undefined {
  return promptTemplates[id]
}

// 生成随机提示词示例
export function generateRandomPrompt(): string {
  const examples = [
    'flat lay product photography, minimalist style, clean background',
    'technical fashion sketch, detailed construction lines, professional',
    'lifestyle product shot, natural lighting, aesthetic composition',
    'exploded view, pattern pieces, technical illustration',
    'same design, change color to navy blue, preserve details',
  ]
  
  return examples[Math.floor(Math.random() * examples.length)]
}

// 尺寸选项
export const sizeOptions = [
  { value: 'Auto', label: 'Auto' },
  { value: '1:1', label: '1:1 正方形' },
  { value: '16:9', label: '16:9 横屏' },
  { value: '9:16', label: '9:16 竖屏' },
  { value: 'custom', label: '自定义' },
]

// 风格选项
export const styleOptions = [
  { value: '无风格', label: '无风格' },
  { value: '技术线稿', label: '技术线稿' },
  { value: '生活方式', label: '生活方式' },
  { value: '技术插图', label: '技术插图' },
  { value: '保持原样', label: '保持原样' },
]

// 模型选项（固定为 Loom Pro）
export const modelOptions = [
  { value: 'loom-pro', label: 'Loom Pro' },
]
