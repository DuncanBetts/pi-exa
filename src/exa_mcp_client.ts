import { Type, TSchema } from "typebox";
import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";
import { Tool } from "@modelcontextprotocol/sdk/types";

export async function connectToExaMcp(apiKey?: string): Promise<Client> {
  const exaMcpUrl = new URL("https://mcp.exa.ai/mcp");
  exaMcpUrl.searchParams.set(
    "tools",
    //"web_search_exa,web_search_advanced_exa,web_fetch_exa",
    "web_fetch_exa",
  );
  if (apiKey) {
    exaMcpUrl.searchParams.set("exaApiKey", apiKey);
  }

  const transport = new StreamableHTTPClientTransport(exaMcpUrl);

  const client = new Client(
    { name: "pi-web-search", version: "0.1.0" },
    { capabilities: {} },
  );

  // TODO: error handling for connection
  await client.connect(transport);
  return client;
}

export function buildTypeboxSchema(tool: Tool) {
  const props: Record<string, TSchema> = {};
  const required = new Set(tool.inputSchema.required);

  for (const [key, desc] of Object.entries(tool.inputSchema.properties ?? {})) {
    const raw_desc = desc as Record<string, unknown>;
    const typeboxType = jsonToTypebox(raw_desc, required.has(key));

    props[key] = typeboxType;
  }

  return Type.Object(props);
}

function jsonToTypebox(
  prop: Record<string, unknown>,
  required: boolean,
): TSchema {
  // NOTE: assumed that every property in the mcp tool schema has `type` key
  const typeName = prop.type as string;
  const { type, ...opts } = prop;

  let chosenType: TSchema = Type.Unsafe(opts);
  switch (typeName) {
    case "string":
      chosenType = Type.String(opts);
      break;
    case "number":
      chosenType = Type.Number(opts);
      break;
    case "array":
      chosenType = Type.Array(
        prop.items
          ? jsonToTypebox(prop.items as Record<string, unknown>, true)
          : Type.Any(),
        opts,
      );
  }

  if (!required) {
    return Type.Optional(chosenType);
  }
  return chosenType;
}
