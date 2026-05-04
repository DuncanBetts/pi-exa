import { Static, Type } from "typebox";
import { StringEnum } from "@mariozechner/pi-ai";
import Exa, { type BaseSearchOptions, type DeepSearchType } from "exa-js";

export const DeepSearchParams = Type.Object({
  query: Type.String({ description: "The search query" }),
  numResults: Type.Optional(
    Type.Number({
      description: "Number of results to return",
      default: 10,
      minimum: 1,
      maximum: 100,
    }),
  ),
  type: Type.Optional(StringEnum(["deep-lite", "deep", "deep-reasoning"] as const)),
  category: Type.Optional(
    StringEnum(
      [
        "company",
        "research paper",
        "news",
        "pdf",
        "personal site",
        "financial report",
        "people",
      ] as const,
      { description: "A data category to focus on" },
    ),
  ),
});
export type DeepSearchParams = Static<typeof DeepSearchParams>;

type StrictEqual<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : never
  : never;

// trigger compile time errors if there is drift between TypeBox and Exa type definitions
const _assertType: StrictEqual<
  Exclude<DeepSearchParams["type"], undefined>,
  DeepSearchType
> = true;
const _assertCategory: StrictEqual<
  Exclude<DeepSearchParams["category"], undefined>,
  Exclude<BaseSearchOptions["category"], undefined>
> = true;

export async function deepSearch(exa: Exa, params: DeepSearchParams) {
  const { query, type = "deep-lite", numResults = 10, category } = params;

  const res = await exa.search(query, {
    outputSchema: {
      type: "text",
    },
    contents: {
      highlights: true,
    },
    type,
    numResults,
    category,
  });

  return res;
}
