export type ModelProviderName = "deterministic" | "openai_compatible" | "anthropic_compatible" | "gemini_compatible" | "local_slm";

export type ModelRequest = {
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
};

export type ModelResponse = {
  provider: ModelProviderName;
  model: string;
  output: string;
  usedExternalModel: boolean;
  latencyMs: number;
};

export function configuredModelProviders() {
  return [
    {
      provider: "deterministic" as const,
      configured: true,
      model: "rules-engine",
      purpose: "Always-on deterministic fallback for demos, tests, and regulated dry-run planning."
    },
    {
      provider: "openai_compatible" as const,
      configured: Boolean(process.env.LLM_BASE_URL && process.env.LLM_API_KEY),
      model: process.env.LLM_MODEL ?? "configured-model",
      purpose: "Any OpenAI-compatible API, hosted LLM gateway, local vLLM, Ollama proxy, or enterprise model router."
    },
    {
      provider: "anthropic_compatible" as const,
      configured: Boolean(process.env.ANTHROPIC_API_KEY),
      model: process.env.ANTHROPIC_MODEL ?? "configured-anthropic-model",
      purpose: "Anthropic-compatible message endpoint through enterprise gateway."
    },
    {
      provider: "gemini_compatible" as const,
      configured: Boolean(process.env.GEMINI_API_KEY),
      model: process.env.GEMINI_MODEL ?? "configured-gemini-model",
      purpose: "Gemini-compatible generateContent endpoint through enterprise gateway."
    },
    {
      provider: "local_slm" as const,
      configured: Boolean(process.env.LOCAL_SLM_URL),
      model: process.env.LOCAL_SLM_MODEL ?? "local-small-language-model",
      purpose: "Private small language model endpoint for air-gapped or low-latency planning."
    }
  ];
}

export async function completeWithModel(input: ModelRequest, preferredProvider?: ModelProviderName): Promise<ModelResponse> {
  const started = Date.now();
  const provider = selectProvider(preferredProvider);
  if (provider === "deterministic") {
    return deterministicResponse(input, started);
  }
  try {
    if (provider === "openai_compatible") return openAiCompatible(input, started);
    if (provider === "anthropic_compatible") return anthropicCompatible(input, started);
    if (provider === "gemini_compatible") return geminiCompatible(input, started);
    if (provider === "local_slm") return localSlm(input, started);
  } catch (error) {
    return {
      provider: "deterministic",
      model: "rules-engine",
      output: `${fallbackPlan(input)}\n\nModel gateway fallback reason: ${error instanceof Error ? error.message : "unknown error"}`,
      usedExternalModel: false,
      latencyMs: Date.now() - started
    };
  }
  return deterministicResponse(input, started);
}

export function selectProvider(preferredProvider?: ModelProviderName): ModelProviderName {
  if (preferredProvider && configuredModelProviders().some((item) => item.provider === preferredProvider && item.configured)) {
    return preferredProvider;
  }
  const configured = configuredModelProviders().find((item) => item.provider !== "deterministic" && item.configured);
  return configured?.provider ?? "deterministic";
}

function deterministicResponse(input: ModelRequest, started: number): ModelResponse {
  return {
    provider: "deterministic",
    model: "rules-engine",
    output: fallbackPlan(input),
    usedExternalModel: false,
    latencyMs: Date.now() - started
  };
}

function fallbackPlan(input: ModelRequest) {
  const lower = input.prompt.toLowerCase();
  const focus = lower.includes("virtual") || lower.includes("path") ? "Prioritize virtual patching and attack-path interruption before permanent change." : "Prioritize risk reduction with approval and evidence gates.";
  return [
    focus,
    "Recommended agent steps:",
    "1. Gather tenant risk context, top findings, assets, workflows, simulations, policies, and evidence status.",
    "2. Select the highest business-risk remediation actions with stale or missing simulations.",
    "3. Run simulation before execution and require rollback planning for production assets.",
    "4. Use virtual patching or path breakers when the target is internet exposed, high criticality, or missing a safe patch.",
    "5. Route approvals through security, platform owner, business owner, and CAB when required.",
    "6. Keep execution dry-run until credentials, change windows, and policy approvals are verified.",
    "7. Seal evidence after validation and update campaign/report status."
  ].join("\n");
}

async function openAiCompatible(input: ModelRequest, started: number): Promise<ModelResponse> {
  const baseUrl = process.env.LLM_BASE_URL?.replace(/\/$/, "");
  const model = process.env.LLM_MODEL ?? "configured-model";
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.LLM_API_KEY}`
    },
    body: JSON.stringify({
      model,
      temperature: input.temperature ?? 0.2,
      max_tokens: input.maxTokens ?? 1200,
      response_format: input.json ? { type: "json_object" } : undefined,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.prompt }
      ]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`OpenAI-compatible model error ${response.status}`);
  return { provider: "openai_compatible", model, output: data.choices?.[0]?.message?.content ?? "", usedExternalModel: true, latencyMs: Date.now() - started };
}

async function anthropicCompatible(input: ModelRequest, started: number): Promise<ModelResponse> {
  const model = process.env.ANTHROPIC_MODEL ?? "configured-anthropic-model";
  const response = await fetch(process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      system: input.system,
      max_tokens: input.maxTokens ?? 1200,
      temperature: input.temperature ?? 0.2,
      messages: [{ role: "user", content: input.prompt }]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Anthropic-compatible model error ${response.status}`);
  return { provider: "anthropic_compatible", model, output: data.content?.map((item: { text?: string }) => item.text ?? "").join("\n") ?? "", usedExternalModel: true, latencyMs: Date.now() - started };
}

async function geminiCompatible(input: ModelRequest, started: number): Promise<ModelResponse> {
  const model = process.env.GEMINI_MODEL ?? "gemini-pro";
  const baseUrl = process.env.GEMINI_BASE_URL ?? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await fetch(`${baseUrl}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      generationConfig: { temperature: input.temperature ?? 0.2, maxOutputTokens: input.maxTokens ?? 1200 },
      contents: [{ role: "user", parts: [{ text: `${input.system}\n\n${input.prompt}` }] }]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Gemini-compatible model error ${response.status}`);
  return { provider: "gemini_compatible", model, output: data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("\n") ?? "", usedExternalModel: true, latencyMs: Date.now() - started };
}

async function localSlm(input: ModelRequest, started: number): Promise<ModelResponse> {
  const model = process.env.LOCAL_SLM_MODEL ?? "local-small-language-model";
  const response = await fetch(process.env.LOCAL_SLM_URL ?? "", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, system: input.system, prompt: input.prompt, temperature: input.temperature ?? 0.1, maxTokens: input.maxTokens ?? 1200 })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Local SLM error ${response.status}`);
  return { provider: "local_slm", model, output: data.output ?? data.response ?? data.text ?? "", usedExternalModel: true, latencyMs: Date.now() - started };
}
