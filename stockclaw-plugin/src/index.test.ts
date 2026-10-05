import { describe, expect, it } from "vitest";
import entry from "./index.js";
import { getToolPluginMetadata } from "openclaw/plugin-sdk/tool-plugin";

describe("stockclaw-plugin", () => {
  it("声明了 stock_vision_analyze 工具元数据", () => {
    expect(getToolPluginMetadata(entry)?.tools.map((tool) => tool.name)).toEqual([
      "stock_vision_analyze",
    ]);
  });

  it("声明了硅基流动配置项", () => {
    const schema = getToolPluginMetadata(entry)?.configSchema as {
      properties?: Record<string, unknown>;
    };
    expect(Object.keys(schema?.properties ?? {}).sort()).toEqual([
      "siliconflowApiKey",
      "siliconflowBaseUrl",
    ]);
  });
});
