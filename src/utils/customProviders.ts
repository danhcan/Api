import { CustomProviderConfig, ProviderDefinition } from '../types';
import { PROVIDERS } from '../data/providers';

const STORAGE_KEY = 'api_key_custom_providers_v1';
const EVENT_NAME = 'custom_providers_changed';

export const PRESET_PROVIDERS: Omit<CustomProviderConfig, 'id' | 'createdAt'>[] = [
  {
    name: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/v1',
    apiKey: '',
    placeholder: 'Không cần key (hoặc nhập bất kỳ)',
    authHeaderType: 'none',
    defaultModel: 'llama3.2',
    availableModels: ['llama3.2', 'deepseek-r1:8b', 'qwen2.5-coder:7b', 'mistral:latest', 'phi4:latest'],
    docsUrl: 'https://ollama.com',
    helpTip: 'Chạy mô hình AI cục bộ trên máy tính qua cổng mặc định 11434 của Ollama. Hoàn toàn miễn phí & riêng tư.',
    color: '#0f172a',
  },
  {
    name: 'LM Studio (Local)',
    baseUrl: 'http://localhost:1234/v1',
    apiKey: 'lm-studio',
    placeholder: 'lm-studio hoặc sk-...',
    authHeaderType: 'bearer',
    defaultModel: 'local-model',
    availableModels: ['local-model'],
    docsUrl: 'https://lmstudio.ai',
    helpTip: 'Chạy server OpenAI-compatible cục bộ của LM Studio trên cổng 1234.',
    color: '#2563eb',
  },
  {
    name: 'Mistral AI',
    baseUrl: 'https://api.mistral.ai/v1',
    apiKey: '',
    placeholder: 'mistral-... hoặc sk-...',
    keyPrefix: 'mistral',
    authHeaderType: 'bearer',
    defaultModel: 'mistral-large-latest',
    availableModels: [
      'mistral-large-latest',
      'pixtral-large-latest',
      'codestral-latest',
      'mistral-small-latest',
      'ministral-8b-latest',
      'ministral-3b-latest',
    ],
    docsUrl: 'https://console.mistral.ai',
    helpTip: 'Dịch vụ mô hình AI hàng đầu châu Âu từ Mistral AI.',
    color: '#f97316',
  },
  {
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    apiKey: '',
    placeholder: 'Key từ together.xyz...',
    authHeaderType: 'bearer',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    availableModels: [
      'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      'deepseek-ai/DeepSeek-V3',
      'deepseek-ai/DeepSeek-R1',
      'Qwen/Qwen2.5-72B-Instruct-Turbo',
      'mistralai/Mixtral-8x22B-Instruct-v0.1',
    ],
    docsUrl: 'https://api.together.xyz/settings/api-keys',
    helpTip: 'Hạ tầng tính toán suy luận đám mây siêu tốc với hàng trăm model mã nguồn mở.',
    color: '#0ea5e9',
  },
  {
    name: 'Perplexity AI',
    baseUrl: 'https://api.perplexity.ai',
    apiKey: '',
    placeholder: 'pplx-...',
    keyPrefix: 'pplx-',
    authHeaderType: 'bearer',
    defaultModel: 'sonar-pro',
    availableModels: [
      'sonar-pro',
      'sonar',
      'sonar-reasoning-pro',
      'sonar-reasoning',
    ],
    docsUrl: 'https://docs.perplexity.ai',
    helpTip: 'Mô hình Sonar tìm kiếm và tổng hợp thông tin trực tuyến từ Perplexity.',
    color: '#059669',
  },
  {
    name: 'SiliconFlow (SiliconCloud)',
    baseUrl: 'https://api.siliconflow.cn/v1',
    apiKey: '',
    placeholder: 'sk-...',
    keyPrefix: 'sk-',
    authHeaderType: 'bearer',
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    availableModels: [
      'deepseek-ai/DeepSeek-V3',
      'deepseek-ai/DeepSeek-R1',
      'Qwen/Qwen2.5-72B-Instruct',
      'Tele-AI/TeleChat2',
    ],
    docsUrl: 'https://cloud.siliconflow.cn',
    helpTip: 'Cổng suy luận DeepSeek V3/R1 tốc độ cao tại châu Á.',
    color: '#8b5cf6',
  },
];

export function getCustomProviders(): CustomProviderConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load custom providers:', e);
    return [];
  }
}

export function saveCustomProvider(provider: CustomProviderConfig): void {
  const current = getCustomProviders();
  const index = current.findIndex(p => p.id === provider.id);
  let updated: CustomProviderConfig[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = provider;
  } else {
    updated = [...current, provider];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
}

export function deleteCustomProvider(id: string): void {
  const current = getCustomProviders();
  const updated = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
}

export function toProviderDefinition(cfg: CustomProviderConfig): ProviderDefinition {
  return {
    id: cfg.id,
    name: cfg.name,
    category: 'custom',
    placeholder: cfg.placeholder || (cfg.keyPrefix ? `${cfg.keyPrefix}...` : 'Nhập API key...'),
    keyPrefix: cfg.keyPrefix,
    defaultModel: cfg.defaultModel || (cfg.availableModels[0] || 'default'),
    availableModels: cfg.availableModels && cfg.availableModels.length > 0 ? cfg.availableModels : [cfg.defaultModel || 'default'],
    docsUrl: cfg.docsUrl || cfg.baseUrl,
    helpTip: cfg.helpTip || `Base URL: ${cfg.baseUrl}`,
    color: cfg.color || '#0891b2',
    isCustom: true,
    customConfig: cfg,
  };
}

export function getAllProviders(customList?: CustomProviderConfig[]): ProviderDefinition[] {
  const customs = (customList || getCustomProviders()).map(toProviderDefinition);
  // Keep built-in providers (except raw generic 'custom' which is shown in tab), then append user custom providers
  const builtins = PROVIDERS.filter(p => p.id !== 'custom');
  return [...builtins, ...customs];
}

export function subscribeCustomProviders(callback: (providers: CustomProviderConfig[]) => void): () => void {
  const handler = () => {
    callback(getCustomProviders());
  };
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}
