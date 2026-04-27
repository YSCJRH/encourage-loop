# WinChronicle 下一轮分阶段工作计划：v0.1 Beta Hardening

## Summary

当前 `main` 已发布 `v0.1.0-alpha.1`。下一轮目标不是立刻做 Phase 6 screenshot/OCR，而是把 alpha 主干收敛成可重复验证、可演示、可发布的 `v0.1.0-beta.0` 候选版本。

默认策略：继续保持 UIA-first、harness-first、read-only MCP first；不新增截图、OCR、音频、键盘、剪贴板、LLM、网络上传或桌面控制能力。

## Execution Cursor

- Current stage: R0
- Stage status: in_progress
- Next atomic task: Add Windows GitHub Actions workflow for pytest, helper/watcher builds, harness, and git diff --check.

## Phase R0 — CI / Release Gate 固化

- 新增 Windows GitHub Actions，硬跑 pytest、dotnet helper/watcher builds、harness、git diff --check。
- 增加 release checklist 文档。
- 保持真实 UIA smoke 为 manual gate。

## Phase R1 — UIA Helper Product-Preview Hardening

- 保持产品边界不变。
- 强化 helper 可诊断性。
- 补强 fake-helper 与 helper-like fixture tests。

## Phase R2 — Watcher Preview 收口

- 把现有 watcher 定义为 v0.1 preview watcher 接口。
- 强化 watcher failure modes。
- 增加 manual watcher smoke 文档。

## Phase R3 — MCP + Memory v0.1 Contract

- 扩展 read-only MCP 增加 `search_memory(query, entry_type?, limit?)`。
- 强化 memory generation。
- 禁止 arbitrary file read/write tools/desktop control tools。

## Phase R4 — Phase 6 只做隐私规格预备，不实现截图/OCR

- 新增 Phase 6 privacy spec/scorecard 草案。
- 不实现 screenshot capture、不实现 OCR、不创建 screenshot cache。

## Test Plan

- `python -m pytest -q`
- `python harness/scripts/run_harness.py`
- helper/watcher dotnet builds
- `git diff --check`
