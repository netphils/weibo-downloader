# AGENTS.md

## 项目概述

基于 Vite + vite-plugin-monkey 的 Tampermonkey 用户脚本，使用 TypeScript 编写，用于微博内容下载。

## 目录结构约定

```
src/
├── main.ts              # 入口文件，仅做初始化调度，不包含业务逻辑
├── config.ts            # 常量、配置项、默认值
├── types/               # 类型定义
│   ├── index.ts         # 统一导出所有类型
│   ├── weibo.d.ts       # 微博业务实体类型（API 响应、资源等）
│   └── gm.d.ts          # GM_* API 扩展类型（补充缺失的声明）
├── utils/               # 纯工具函数，无副作用，不依赖浏览器/GM API 之外的全局状态
│   ├── dom.ts           # DOM 操作封装（选择器、等待元素、事件绑定等）
│   ├── request.ts       # GM_xmlhttpRequest 封装
│   ├── storage.ts       # GM_getValue / GM_setValue 封装
│   ├── style.ts         # GM_addStyle 封装
│   └── logger.ts        # 统一日志工具
├── services/            # 业务逻辑层，允许副作用（调用 API、读写存储）
│   ├── auth.service.ts  # 认证相关逻辑
│   ├── data.service.ts  # 数据获取/处理逻辑
│   └── weibo-api.service.ts  # 微博 API 调用（getInfoById、getVideoHD 等）
├── features/            # 按功能模块划分，每个模块独立目录
│   ├── auto-sign/       # 示例：自动签到功能（仅供格式示例，实际无此模块）
│   │   ├── index.ts     # 模块入口，负责注册/初始化
│   │   ├── auto-sign.ts # 核心逻辑
│   │   └── auto-sign.css# 模块专属样式
│   ├── dark-mode/
│   │   ├── index.ts
│   │   └── dark-mode.ts
│   └── ui-enhance/
│       ├── index.ts
│       ├── components.ts# 注入的 UI 组件
│       └── styles.css
├── styles/              # 全局样式
│   ├── global.css
│   └── variables.css
assets/                  # 静态资源（图标等），构建时内联为 base64
dist/                    # 构建输出，git ignore
tests/                   # 单元测试，目录结构与 src/ 对应
```

## 代码规范

### TypeScript
- 严格模式（`strict: true`）
- 所有函数声明参数和返回值类型，不依赖类型推断
- 类型定义统一放在 `src/types/`，通过 `src/types/index.ts` 导出
- 禁止使用 `any`，必要时使用 `unknown`
- 优先使用 `interface` 定义对象类型，`type` 用于联合类型和工具类型

### 模块设计
- `utils/`：纯函数，无副作用，可独立单元测试
- `services/`：业务逻辑，允许副作用，依赖 utils
- `features/`：功能模块，每个模块通过 `index.ts` 暴露 `register()` 或 `init()` 入口
- `main.ts` 仅负责按需调用各 feature 模块的注册函数

### 配置管理
- 所有常量、配置项、默认值、魔法数字统一放在 `src/config.ts` 中
- 各模块不得在内部定义常量，必须从 `@/config` 导入
- 包括但不限于：API 端点、存储键名、DOM ID/CSS 类名、超时时间、阈值、延迟、前缀等
- 相关常量按类别分组（如 `AUTO_DOWNLOAD`、`STORAGE_KEYS`），使用 `UPPER_SNAKE_CASE` 命名
- 禁止在业务代码中硬编码字符串和数字

### 命名规范
- 文件名：kebab-case（`auto-sign.ts`、`auth.service.ts`）
- 函数/变量：camelCase
- 类型/接口：PascalCase
- 常量：UPPER_SNAKE_CASE
- CSS 类名：以 `gm-` 为前缀，避免与页面原有样式冲突

### GM API 使用
- 所有 GM_* API 调用统一通过 `src/utils/` 下的封装层，不直接在业务代码中调用
- 请求统一使用 `GM.xmlHttpRequest`，通过 `src/utils/request.ts` 封装
- 持久化存储统一使用 `GM.getValue` / `GM.setValue`，通过 `src/utils/storage.ts` 封装
- 样式注入统一使用 `GM_addStyle`，通过 `src/utils/style.ts` 封装

### 样式
- 全局变量/主题定义在 `src/styles/variables.css`
- 各模块样式独立放在模块目录下，在 `index.ts` 中通过 `injectStyle()` 注入
- 避免使用 `!important`，通过提高选择器特异性覆盖

### 路径别名
- `@/` 映射到 `src/`，在 `vite.config.ts` 和 `vitest.config.ts` 中均需配置
- 导入时使用 `@/` 前缀（如 `import { request } from '@/utils/request'`）

## 开发命令

使用 npm 作为包管理器。

```bash
npm run dev            # 开发模式（热更新）
npm run build          # 生产构建
npm run lint           # ESLint 检查
npm run format         # Prettier 格式化
npm run test           # 运行单元测试
npm run test:watch     # 监听模式，测试驱动开发
npm run test:coverage  # 生成覆盖率报告
```

## 构建产物

- 输出目录：`dist/`
- 输出文件：`weibo-downloader.user.js`
- 构建时自动注入 Tampermonkey 所需的 UserScript header（`@name`、`@match`、`@grant` 等）
- `@match` 模式在 `vite.config.ts` 的 `vite-plugin-monkey` 配置中定义

## 其他约定

- 提交前必须通过 lint、typecheck 和 test
- 提交信息格式：`<type>: <description>`（如 `feat: add download service`、`fix: correct image url parsing`）
- 新增 feature 模块时，在 `src/features/` 下创建独立目录，包含 `index.ts` 入口
- 不在业务代码中直接操作 DOM，统一使用 `src/utils/dom.ts` 的封装函数
- 敏感信息（token、密钥等）不硬编码，通过 `GM.getValue` 存储在用户脚本存储中