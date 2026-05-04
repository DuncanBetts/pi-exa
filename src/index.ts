import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { connectToExaMcp } from "./exa_mcp_client";

export default async function (pi: ExtensionAPI) {
  const client = await connectToExaMcp();
  const { tools } = await client.listTools();

  for (const tool of tools) {
    pi.registerTool({
      name: tool.name,
      label: tool.name,
      description: tool.description ?? "",
      parameters: "",

      async execute() {
        return;
      },
    });
  }

  pi.registerTool({
    name: "web_search",
    label: "Web Search",
    description:
      "Search the web for information. Returns search results for the given query.",
    parameters: Type.Object({
      query: Type.String({ description: "The search query" }),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      // TODO: Implement your web search logic here
      return {
        content: [
          {
            type: "text" as const,
            text: `Search results for "${params.query}" — not yet implemented.`,
          },
        ],
        details: {},
      };
    },
  });
}
