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
    defaultStyle: 'minimal',
  },
  
  'sketch': {
    id: 'sketch',
    name: '服装线稿',
    icon: '✏️',
    description: '技术制版',
    positive: 'technical fashion sketch, clean line drawing, black lines on white background, detailed stitching lines, construction lines, flat pattern view',
    negative: 'color, shading, texture, photo, realistic, model, person, shadows',
    defaultSize: 'Auto',
    defaultStyle: 'minimal',
  },
  
  'promo': {
    id: 'promo',
    name: '宣传图生成',
    icon: '🎨',
    description: '社交媒体',
    positive: 'lifestyle product photography, natural lighting, aesthetic composition, minimalist scene, soft shadows, professional styling',
    negative: 'cluttered, messy, low quality, distorted, unrealistic',
    defaultSize: '16:9',
    defaultStyle: 'casual',
  },
  
  'pattern': {
    id: 'pattern',
    name: '版型拆解',
    icon: '📐',
    description: '结构分析',
    positive: 'exploded view, pattern pieces separated, technical illustration, flat lay of garment components, labeled parts, construction breakdown',
    negative: 'assembled, complete garment, model, person, shadows',
    defaultSize: 'Auto',
    defaultStyle: 'minimal',
  },
  
  'recolor': {
    id: 'recolor',
    name: '智能改色',
    icon: '🔄',
    description: '配色方案',
    positive: 'same design, same style, same cut, preserve all details, accurate structure',
    negative: 'different style, different design, pattern change, texture change, deformed',
    defaultSize: 'Auto',
    defaultStyle: 'minimal',
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
// 风格/服装类型选项
export const styleOptions = [
  { value: 'casual', label: '休闲装' },
  { value: 'formal', label: '正装' },
  { value: 'sports', label: '运动装' },
  { value: 'street', label: '街头风' },
  { value: 'vintage', label: '复古风' },
  { value: 'minimal', label: '极简风' },
  { value: 'punk', label: '朋克风' },
  { value: 'couture', label: '高定' },
]

// 配色方案
export const colorOptions = [
  { value: 'morandi', label: '莫兰迪色系' },
  { value: 'earth', label: '大地色系' },
  { value: 'mono', label: '黑白灰' },
  { value: 'contrast', label: '撞色搭配' },
  { value: 'gradient', label: '渐变色' },
  { value: 'seasonal', label: '季节色彩' },
  { value: 'custom', label: '自定义色板' },
]

// 面料材质
export const fabricOptions = [
  { value: 'cotton', label: '棉质' },
  { value: 'silk', label: '丝绸' },
  { value: 'denim', label: '牛仔' },
  { value: 'leather', label: '皮革' },
  { value: 'knit', label: '针织' },
  { value: 'chiffon', label: '雪纺' },
  { value: 'linen', label: '麻料' },
  { value: 'tech', label: '功能面料' },
]

// 展示方式
export const viewOptions = [
  { value: 'flat_lay', label: '平铺图' },
  { value: 'front', label: '正面视图' },
  { value: 'back', label: '背面视图' },
  { value: 'side', label: '侧面视图' },
  { value: 'detail', label: '细节特写' },
  { value: 'on_model', label: '上身效果' },
  { value: 'hanging', label: '悬挂展示' },
  { value: 'turntable', label: '360°旋转视图' },
]

// 版型设计
export const fitOptions = [
  { value: 'slim', label: '修身' },
  { value: 'loose', label: '宽松' },
  { value: 'regular', label: '直筒' },
  { value: 'oversized', label: '廓形' },
  { value: 'a_line', label: 'A字型' },
  { value: 'h_line', label: 'H字型' },
  { value: 'x_line', label: 'X字型' },
]

// 设计元素
export const elementOptions = [
  { value: 'pattern', label: '印花图案' },
  { value: 'embroidery', label: '刺绣' },
  { value: 'patchwork', label: '拼接' },
  { value: 'pleats', label: '褶皱' },
  { value: 'pockets', label: '口袋设计' },
  { value: 'collar', label: '领型' },
  { value: 'sleeve', label: '袖型' },
]

// 目标人群
export const genderOptions = [
  { value: 'male', label: '男装' },
  { value: 'female', label: '女装' },
  { value: 'kids', label: '童装' },
]

export const ageOptions = [
  { value: '18-25', label: '18-25' },
  { value: '26-35', label: '26-35' },
  { value: '36-45', label: '36-45' },
]

export const sceneOptions = [
  { value: 'commute', label: '通勤' },
  { value: 'date', label: '约会' },
  { value: 'sport', label: '运动' },
  { value: 'home', label: '居家' },
]

export const seasonOptions = [
  { value: 'spring_summer', label: '春夏' },
  { value: 'autumn_winter', label: '秋冬' },
]

// 模型选项（固定为 Loom Pro）
export const modelOptions = [
  { value: 'loom-pro', label: 'Loom Pro' },
]
