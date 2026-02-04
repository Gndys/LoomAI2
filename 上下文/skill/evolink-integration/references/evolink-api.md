# Evolink 接口要点（速查）

## Base URL 与鉴权
- Base URL: https://api.evolink.ai/v1
- Header：Authorization: Bearer <EVOLINK_API_KEY>
- 文档示例常见 key 前缀：sk-evo-...

## 文本生成（OpenAI 兼容 Chat）
- Endpoint: POST /chat/completions
- 必填：model, messages
- 常用可选：stream, temperature, top_p, top_k
- 示例模型家族：gpt-5.2
- 返回：OpenAI 风格的 chat.completion（choices + usage）

## 图片生成（异步任务）
- Endpoint: POST /images/generations
- 返回 task id 与状态
- 轮询任务：GET /tasks/{taskId}
- 完成后 results[] 返回图片 URL
