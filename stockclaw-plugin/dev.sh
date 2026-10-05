#!/usr/bin/env bash
#
# 在 Linux 容器里运行插件工具链。
#
# 为什么需要它：本机是 macOS 10.15.7，官方 Node 24 的 macOS 二进制要求 macOS 13.5+，
# 直接跑会 dyld 报错。而 OpenClaw 插件 SDK 硬性要求 Node 24.16+。
# 容器里的 Linux Node 24 反而更贴近真实运行环境（手机 rootfs 也是 Linux）。
#
# 用法：
#   ./dev.sh                                  # 构建 + 校验 + 测试
#   ./dev.sh npm install                      # 装依赖
#   ./dev.sh npx vitest run                   # 只跑测试
#   ./dev.sh bash                             # 进交互 shell
#
set -euo pipefail
cd "$(dirname "$0")"

IMAGE="node:24-slim"
MIRROR_IMAGE="docker.m.daocloud.io/library/${IMAGE}"

if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  echo ">>> 本地无 ${IMAGE}，从 Daocloud 镜像拉取（Docker Hub 国内不可达）..."
  docker pull "$MIRROR_IMAGE"
  docker tag "$MIRROR_IMAGE" "$IMAGE"
fi

if [ $# -eq 0 ]; then
  set -- sh -c "npm run plugin:build && npm run plugin:validate && npm test"
fi

exec docker run --rm -v "$PWD":/work -w /work \
  -e npm_config_registry=https://registry.npmmirror.com \
  -e npm_config_fund=false \
  -e npm_config_audit=false \
  "$IMAGE" "$@"
