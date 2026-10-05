# StockClaw 插件（`stockclaw-plugin`）

OpenClaw 工具插件：为手机端炒股助手提供行情、信号、持仓与看图分析能力。

## 环境要求

| 项 | 要求 |
|---|---|
| Node | **24.16+ 或 26.1+**（OpenClaw 插件 SDK 硬要求） |
| 语言 | TypeScript ESM，产物进 `dist/` |
| 宿主 | `openclaw >= 2026.5.17` |

## ⚠️ 本机开发方式（macOS 10.15 Catalina，必须用 Docker）

本机 macOS 是 10.15.7，**官方 Node 24 的 macOS 二进制要求 macOS 13.5+，直接跑会 dyld 报错**：

```
dyld: Symbol not found: ...
  Referenced from: node v24.21.0/bin/node (which was built for Mac OS X 13.5)
```

所以本地所有涉及 `openclaw` CLI 或 `vitest` 的命令，**都通过 Docker 里的 Linux Node 24 执行**
（这反而更贴近真实运行环境——手机 rootfs 也是 Linux）。

Docker Hub 在国内不可达，用 Daocloud 镜像（首次需要）：

```bash
docker pull docker.m.daocloud.io/library/node:24-slim
docker tag docker.m.daocloud.io/library/node:24-slim node:24-slim
```

### 构建 / 校验 / 测试（一条命令跑完）

```bash
cd stockclaw-plugin
docker run --rm -v "$PWD":/work -w /work \
  -e npm_config_registry=https://registry.npmmirror.com \
  node:24-slim \
  sh -c "npm install && npm run plugin:build && npm run plugin:validate && npm test"
```

> 首次 `npm install` 会拉整个 `openclaw` 包（约 790MB，耗时 5-7 分钟）。
> 之后 `node_modules` 常驻本地，可把上面命令里的 `npm install &&` 去掉，秒级完成。

### 推荐：用 `dev.sh`（已封装好上面这些）

```bash
./dev.sh                 # 构建 + 校验 + 测试（约 4 秒，已装依赖时）
./dev.sh npm install     # 装/补依赖
./dev.sh npx vitest run  # 只跑测试
./dev.sh bash            # 进容器交互 shell
```

脚本会自动处理镜像拉取（Docker Hub 不可达时走 Daocloud 镜像）和 npm 镜像源。

### 单独跑某一步（不用脚本时）

```bash
# 只跑测试
docker run --rm -v "$PWD":/work -w /work node:24-slim npx vitest run

# 只跑构建 + 校验
docker run --rm -v "$PWD":/work -w /work node:24-slim \
  sh -c "npm run plugin:build && npm run plugin:validate"
```

### 进入容器里的交互 shell 排查

```bash
docker run --rm -it -v "$PWD":/work -w /work node:24-slim bash
```

## 本地安装到 OpenClaw（调试用）

```bash
openclaw plugins install ./stockclaw-plugin
openclaw plugins inspect stockclaw-plugin --runtime
```

## 代码结构

```
src/
├── index.ts          # 插件入口：defineToolPlugin 注册工具（唯一依赖 openclaw 的文件）
├── index.test.ts     # 元数据断言（工具名、configSchema）
├── vision.ts         # 纯逻辑：直调硅基流动 deepseek-vl2
└── vision.test.ts    # 视觉客户端单测
```

**分层原则**：`vision.ts` 这类业务模块**不 import 任何 openclaw 模块**。

原因：OpenClaw 官方声明**所有插件 API 都是 experimental**，且要求「pin 住宿主版本、每次升级重新测」。
把业务逻辑与宿主 API 隔离后，API 变动时**只需改 `index.ts` 这一层**。

## 工具清单

| 工具名 | 说明 |
|---|---|
| `stock_vision_analyze` | 分析图片（K线图/分时图/研报截图），直调硅基流动 `deepseek-ai/deepseek-vl2` |

> 命名规范：**下划线**（`stock_xxx`），lowercase，避免与核心工具或其它插件撞名。

## 关键设计：视觉不走 OpenClaw 的模型路由

若依赖宿主把图片透传给 primary model，就必须把 primary model 设成 VL 模型；
而 `deepseek-vl2` 的推理能力弱于 `deepseek-chat`，拿它做交易分析不划算。

因此 `stock_vision_analyze` **自己发 HTTP 请求**给硅基流动，于是：

- primary model 保持 `deepseek-chat`（推理强、便宜），负责分析、复盘、对话
- 图片交给 `deepseek-vl2`，只做「图 → 结构化描述」
- 两者各自做擅长的事

## 注意事项

- `tsconfig.json` 的 `include` 是 `src/**/*.ts` 且 `exclude` 了 `*.test.ts`。
  **新增业务模块时无需改配置**；但若改成只列 `index.ts`，新模块不会被编译进 `dist/`。
- `openclaw.plugin.json` 是**生成产物**，由 `npm run plugin:build` 写出，不要手改。
- `dist/` 随仓库提交（插件必须 ship 编译产物）。CI 可用 `plugins build --check` 校验是否过期。
