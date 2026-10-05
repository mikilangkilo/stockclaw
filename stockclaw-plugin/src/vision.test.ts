import { describe, expect, it, vi } from "vitest";
import {
  analyzeImage,
  buildVisionRequest,
  parseVisionResponse,
} from "./vision.js";

describe("buildVisionRequest", () => {
  it("拼出 OpenAI 兼容的图文消息体", () => {
    const body = buildVisionRequest({
      imageBase64: "AAAA",
      mime: "image/png",
      question: "这图什么趋势？",
    }) as {
      model: string;
      messages: Array<{ role: string; content: Array<Record<string, unknown>> }>;
    };

    expect(body.model).toBe("deepseek-ai/deepseek-vl2");
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0]!.role).toBe("user");
    expect(body.messages[0]!.content[0]).toEqual({
      type: "text",
      text: "这图什么趋势？",
    });
    expect(body.messages[0]!.content[1]).toEqual({
      type: "image_url",
      image_url: { url: "data:image/png;base64,AAAA" },
    });
  });

  it("未传问题时给默认提示词", () => {
    const body = buildVisionRequest({
      imageBase64: "AAAA",
      mime: "image/jpeg",
    }) as { messages: Array<{ content: Array<{ text?: string }> }> };
    expect(body.messages[0]!.content[0]!.text).toBe("请描述这张图片。");
  });

  it("无图片时抛错", () => {
    expect(() =>
      buildVisionRequest({ imageBase64: "", mime: "image/png" }),
    ).toThrow(/image/i);
  });

  it("无 mime 时抛错", () => {
    expect(() =>
      buildVisionRequest({ imageBase64: "AAAA", mime: "" }),
    ).toThrow(/mime/i);
  });
});

describe("parseVisionResponse", () => {
  it("取出 content 文本", () => {
    expect(
      parseVisionResponse({
        choices: [{ message: { content: "上升趋势，量能温和放大。" } }],
      }),
    ).toBe("上升趋势，量能温和放大。");
  });

  it("异常响应抛错", () => {
    expect(() => parseVisionResponse({})).toThrow(/choices/);
    expect(() => parseVisionResponse({ choices: [] })).toThrow(/choices/);
  });
});

describe("analyzeImage", () => {
  it("未配置 apiKey 时抛错", async () => {
    await expect(
      analyzeImage({ imageBase64: "AAAA", mime: "image/png", apiKey: "" }),
    ).rejects.toThrow(/apiKey/);
  });

  it("拼出正确的请求并解析结果", async () => {
    const fetchImpl = vi.fn(async () => {
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "箱体震荡" } }],
        }),
      } as unknown as Response;
    });

    const text = await analyzeImage({
      imageBase64: "AAAA",
      mime: "image/png",
      apiKey: "sk-test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(text).toBe("箱体震荡");
    const [url, init] = fetchImpl.mock.calls[0]! as unknown as [
      string,
      { headers: Record<string, string>; body: string },
    ];
    expect(url).toBe("https://api.siliconflow.cn/v1/chat/completions");
    expect(init.headers.Authorization).toBe("Bearer sk-test");
    expect(JSON.parse(init.body).model).toBe("deepseek-ai/deepseek-vl2");
  });

  it("自定义 baseUrl 时去掉尾部斜杠", async () => {
    const fetchImpl = vi.fn(async () => {
      return {
        ok: true,
        json: async () => ({ choices: [{ message: { content: "ok" } }] }),
      } as unknown as Response;
    });

    await analyzeImage({
      imageBase64: "AAAA",
      mime: "image/png",
      apiKey: "k",
      baseUrl: "https://example.com/v1/",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(fetchImpl.mock.calls[0]![0]).toBe(
      "https://example.com/v1/chat/completions",
    );
  });

  it("HTTP 非 2xx 时抛错并带上状态码", async () => {
    const fetchImpl = vi.fn(async () => {
      return {
        ok: false,
        status: 401,
        text: async () => "unauthorized",
      } as unknown as Response;
    });

    await expect(
      analyzeImage({
        imageBase64: "AAAA",
        mime: "image/png",
        apiKey: "bad",
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/401/);
  });
});
