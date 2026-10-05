/**
 * 视觉分析：直调硅基流动托管的 deepseek-vl2。
 *
 * 为什么不走 OpenClaw 的模型路由：如果依赖宿主把图片透传给 primary model，
 * 就必须把 primary model 设成 VL 模型；而 deepseek-vl2 的推理能力弱于
 * deepseek-chat，拿它做交易分析不划算。这里让插件自己发请求，
 * 于是 primary model 可以保持文本模型，视觉与推理解耦。
 *
 * 本模块是纯逻辑，不 import 任何 openclaw 模块 —— 便于单测，
 * 且宿主插件 API 变动时无需改动此处。
 */
export declare const DEFAULT_BASE_URL = "https://api.siliconflow.cn/v1";
export declare const DEFAULT_MODEL = "deepseek-ai/deepseek-vl2";
export interface VisionRequest {
    model?: string;
    imageBase64: string;
    mime: string;
    question?: string;
}
export interface AnalyzeOptions extends VisionRequest {
    apiKey: string;
    baseUrl?: string;
    fetchImpl?: typeof fetch;
}
/** 拼出 OpenAI 兼容的图文消息体。 */
export declare function buildVisionRequest({ model, imageBase64, mime, question, }: VisionRequest): Record<string, unknown>;
/** 从 OpenAI 兼容响应中取出正文。 */
export declare function parseVisionResponse(json: unknown): string;
/** 调用 deepseek-vl2 解读图片，返回文字描述。 */
export declare function analyzeImage({ imageBase64, mime, question, apiKey, baseUrl, model, fetchImpl, }: AnalyzeOptions): Promise<string>;
