export type BuiltinProviderId = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'deepseek' | 'openrouter' | 'kira' | 'custom';
export type ApiProviderId = BuiltinProviderId | string;

export type TestType = 'ping' | 'models' | 'prompt';

export interface CustomProviderConfig {
  id: string; // unique ID e.g. 'custom-1718291029' or slug
  name: string; // e.g. "Ollama (Local)", "Mistral AI", "Together AI"
  baseUrl: string; // e.g. "http://localhost:11434/v1", "https://api.mistral.ai/v1"
  apiKey?: string; // Optional default test key
  placeholder?: string; // e.g. "sk-..." or "Token..."
  keyPrefix?: string; // e.g. "sk-", "Bearer "
  authHeaderType: 'bearer' | 'x-api-key' | 'custom' | 'none';
  customHeaderName?: string; // if authHeaderType === 'custom'
  defaultModel: string; // e.g. "llama3.2", "mistral-large-latest"
  availableModels: string[]; // List of available models
  docsUrl?: string; // Documentation link
  helpTip?: string; // Guidance / hint
  color?: string; // Hex color code
  createdAt: number;
}

export interface ProviderDefinition {
  id: ApiProviderId;
  name: string;
  category: 'llm' | 'custom';
  placeholder: string;
  keyPrefix?: string;
  defaultModel: string;
  availableModels: string[];
  docsUrl: string;
  helpTip: string;
  color: string;
  isCustom?: boolean;
  customConfig?: CustomProviderConfig;
}

export interface DiagnosticInfo {
  type: 'ok' | 'auth_error' | 'quota_error' | 'permission_error' | 'network_error' | 'not_found' | 'server_error';
  title: string;
  suggestion: string;
  helpUrl?: string;
}

export interface ModelItem {
  id: string;
  name?: string;
  description?: string;
  category?: 'chat' | 'multimodal' | 'embedding' | 'reasoning' | 'audio' | 'other';
  status?: 'active' | 'preview' | 'legacy' | 'restricted';
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedMethods?: string[];
  ownedBy?: string;
  contextWindow?: number;
  probeStatus?: 'idle' | 'checking' | 'healthy' | 'unhealthy' | 'rate_limited';
  probeLatencyMs?: number;
  probeMessage?: string;
}

export interface TestResult {
  id: string;
  timestamp: string;
  provider: ApiProviderId;
  maskedKey: string;
  testType: TestType;
  success: boolean;
  statusCode: number;
  statusText: string;
  latencyMs: number;
  message: string;
  models?: string[];
  modelDetails?: ModelItem[];
  promptResult?: string;
  headers?: Record<string, string>;
  rawResponse?: any;
  diagnostic: DiagnosticInfo;
}

export interface BatchItemResult {
  index: number;
  key: string;
  maskedKey: string;
  success: boolean;
  statusCode: number;
  latencyMs: number;
  message: string;
  diagnosticType: DiagnosticInfo['type'];
  diagnosticTitle: string;
}

export interface BatchSummary {
  total: number;
  valid: number;
  invalid: number;
  rateLimited: number;
  error: number;
}

export interface CustomApiConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT';
  authHeader: string; // e.g. "Authorization: Bearer <key>" or "x-api-key: <key>"
  customHeaders: { key: string; value: string }[];
  body: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  latencyMs?: number;
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  error?: boolean;
  diagnostic?: DiagnosticInfo;
}

