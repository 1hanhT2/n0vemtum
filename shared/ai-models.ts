export const geminiModelOptions = [
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash" },
  { id: "gemini-3-pro-preview", label: "Gemini 3 Pro" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
] as const;

export type GeminiModelId = (typeof geminiModelOptions)[number]["id"];

export const DEFAULT_GEMINI_MODEL: GeminiModelId = "gemini-3-flash-preview";

const geminiModelSet = new Set<string>(geminiModelOptions.map((model) => model.id));

export function isGeminiModelId(value: unknown): value is GeminiModelId {
  return typeof value === "string" && geminiModelSet.has(value);
}
