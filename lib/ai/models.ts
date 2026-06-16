// The models the assistant can answer with, served through the Vercel AI Gateway
// (one key, many providers). Shared by the picker (client) and the answer route's
// allowlist (server), so the two never drift. Ids follow the gateway's
// <provider>/<model> convention. All listed models can read attached images.

export interface AssistantModel {
  readonly id: string
  readonly label: string
}

export const ASSISTANT_MODELS: readonly AssistantModel[] = [
  { id: 'anthropic/claude-haiku-4.5', label: 'Claude Haiku 4.5' },
  { id: 'anthropic/claude-sonnet-4.6', label: 'Claude Sonnet 4.6' },
  { id: 'google/gemini-3-pro-preview', label: 'Gemini 3 Pro' },
  { id: 'openai/gpt-5.5', label: 'GPT-5.5' },
  { id: 'xai/grok-4.3', label: 'Grok 4.3' },
]

export const DEFAULT_MODEL: string = ASSISTANT_MODELS[0].id

export const MODEL_IDS: readonly string[] = ASSISTANT_MODELS.map((m) => m.id)
