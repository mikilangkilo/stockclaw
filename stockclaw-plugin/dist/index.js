import { Type } from "typebox";
import { defineToolPlugin } from "openclaw/plugin-sdk/tool-plugin";
import { analyzeImage } from "./vision.js";
export default defineToolPlugin({
    id: "stockclaw-plugin",
    name: "StockClaw",
    description: "A股/港美股 行情、信号与持仓跟踪工具集。",
    configSchema: Type.Object({
        siliconflowApiKey: Type.Optional(Type.String({
            description: "硅基流动 API Key（用于 deepseek-vl2 视觉分析）",
        })),
        siliconflowBaseUrl: Type.Optional(Type.String({
            description: "硅基流动 Base URL，默认 https://api.siliconflow.cn/v1",
        })),
    }),
    tools: (tool) => [
        tool({
            name: "stock_vision_analyze",
            description: "分析用户发来的图片（K线图、分时图、研报截图、新闻截图），返回文字解读。" +
                "当消息包含图片且用户希望你解读时使用。",
            parameters: Type.Object({
                imageBase64: Type.String({
                    description: "图片的 base64 内容（不含 data: 前缀）",
                }),
                mime: Type.String({ description: "图片 MIME，如 image/png" }),
                question: Type.Optional(Type.String({ description: "针对图片的具体问题" })),
            }),
            execute: async ({ imageBase64, mime, question }, config, context) => {
                context.signal?.throwIfAborted();
                return await analyzeImage({
                    imageBase64,
                    mime,
                    question,
                    apiKey: config.siliconflowApiKey ?? "",
                    baseUrl: config.siliconflowBaseUrl,
                });
            },
        }),
    ],
});
