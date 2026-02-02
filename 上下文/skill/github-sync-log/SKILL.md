---
name: github-sync-log
description: 同步代码到 GitHub 并写规范化 commit message；适用于需要版本号递增、固定日期格式（YYYY.MM.DD）、要点列表，以及自动维护 `上下文/更新记录.md` 的提交流程。
---

# GitHub Sync With Versioned Commits

## Workflow

1. 查看工作区状态与差异，确认要提交的文件。
2. 读取或更新 `上下文/更新记录.md`，在最顶部追加本次版本记录（版本号 + 日期 + 要点列表）。
3. 生成 commit message：
   - 标题：`vX.Y.Z | YYYY.MM.DD`
   - 正文：每条改动用 `- ` 开头的要点列表
4. 暂存所需文件并提交，最后推送到 `origin/main`。

## Versioning Rules

- 版本号从 `v0.1.0` 开始递增，每次提交加 1（`v0.1.1`, `v0.1.2` …）。
- 日期使用本地当天，格式 `YYYY.MM.DD`。

## Update Log Format

写入 `上下文/更新记录.md`（置顶）：

```
## vX.Y.Z | YYYY.MM.DD
- 改动要点1
- 改动要点2
- 改动要点3
```

## Commit Message Template

```
vX.Y.Z | YYYY.MM.DD
- 改动要点1
- 改动要点2
- 改动要点3
```

## Notes

- 若仅部分文件需要提交，先确认范围再 add。
- 若存在大幅变更，优先提炼 2–5 条关键要点，保持简洁。
