import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Server,
  Globe,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  ArrowRight,
  Sliders,
  Check,
} from 'lucide-react';
import { CustomProviderConfig } from '../types';
import {
  PRESET_PROVIDERS,
  saveCustomProvider,
  deleteCustomProvider,
} from '../utils/customProviders';

interface CustomProvidersManagerProps {
  customProviders: CustomProviderConfig[];
  onSelectProviderForTest?: (providerId: string) => void;
  onClose?: () => void;
}

const COLOR_OPTIONS = [
  '#0891b2', // cyan
  '#2563eb', // blue
  '#7c3aed', // purple
  '#ea580c', // orange
  '#059669', // emerald
  '#db2777', // pink
  '#4f46e5', // indigo
  '#0f172a', // dark
];

export const CustomProvidersManager: React.FC<CustomProvidersManagerProps> = ({
  customProviders,
  onSelectProviderForTest,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [keyPrefix, setKeyPrefix] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [authHeaderType, setAuthHeaderType] = useState<'bearer' | 'x-api-key' | 'custom' | 'none'>('bearer');
  const [customHeaderName, setCustomHeaderName] = useState('x-api-key');
  const [defaultModel, setDefaultModel] = useState('');
  const [modelsInput, setModelsInput] = useState('');
  const [docsUrl, setDocsUrl] = useState('');
  const [helpTip, setHelpTip] = useState('');
  const [color, setColor] = useState('#0891b2');

  // Model auto-fetch state
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick test state for provider card
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { success: boolean; message: string; latencyMs?: number }>>({});

  const handleApplyPreset = (preset: typeof PRESET_PROVIDERS[0]) => {
    setName(preset.name);
    setBaseUrl(preset.baseUrl);
    setApiKey(preset.apiKey || '');
    setKeyPrefix(preset.keyPrefix || '');
    setPlaceholder(preset.placeholder || '');
    setAuthHeaderType(preset.authHeaderType);
    setDefaultModel(preset.defaultModel);
    setModelsInput(preset.availableModels.join(', '));
    setDocsUrl(preset.docsUrl || '');
    setHelpTip(preset.helpTip || '');
    setColor(preset.color || '#0891b2');
    setFetchMessage(null);
  };

  const handleOpenAddForm = () => {
    setIsEditing(true);
    setEditingId(null);
    setName('');
    setBaseUrl('');
    setApiKey('');
    setKeyPrefix('');
    setPlaceholder('');
    setAuthHeaderType('bearer');
    setCustomHeaderName('x-api-key');
    setDefaultModel('');
    setModelsInput('');
    setDocsUrl('');
    setHelpTip('');
    setColor('#0891b2');
    setFetchMessage(null);
  };

  const handleEditProvider = (provider: CustomProviderConfig) => {
    setIsEditing(true);
    setEditingId(provider.id);
    setName(provider.name);
    setBaseUrl(provider.baseUrl);
    setApiKey(provider.apiKey || '');
    setKeyPrefix(provider.keyPrefix || '');
    setPlaceholder(provider.placeholder || '');
    setAuthHeaderType(provider.authHeaderType);
    setCustomHeaderName(provider.customHeaderName || 'x-api-key');
    setDefaultModel(provider.defaultModel);
    setModelsInput(provider.availableModels.join(', '));
    setDocsUrl(provider.docsUrl || '');
    setHelpTip(provider.helpTip || '');
    setColor(provider.color || '#0891b2');
    setFetchMessage(null);
  };

  const handleFetchModels = async () => {
    if (!baseUrl.trim()) {
      setFetchMessage({ type: 'error', text: 'Vui lòng nhập Base URL trước khi tải model.' });
      return;
    }

    setFetchingModels(true);
    setFetchMessage(null);

    try {
      const res = await fetch('/api/fetch-custom-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: baseUrl.trim(),
          apiKey: apiKey.trim(),
          authHeaderType,
          customHeaderName,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.models) && data.models.length > 0) {
        setModelsInput(data.models.join(', '));
        if (!defaultModel.trim()) {
          setDefaultModel(data.models[0]);
        }
        setFetchMessage({
          type: 'success',
          text: `Đã tự động tìm thấy ${data.models.length} model từ máy chủ (${data.latencyMs}ms)!`,
        });
      } else {
        setFetchMessage({
          type: 'error',
          text: data.error || 'Không tìm thấy model nào từ endpoint /models của URL này.',
        });
      }
    } catch (e: any) {
      setFetchMessage({
        type: 'error',
        text: e.message || 'Lỗi kết nối khi gửi yêu cầu tải danh sách model.',
      });
    } finally {
      setFetchingModels(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !baseUrl.trim()) {
      alert('Vui lòng điền đầy đủ Tên nhà cung cấp và Base URL');
      return;
    }

    const parsedModels = modelsInput
      .split(/[,\n]/)
      .map(m => m.trim())
      .filter(Boolean);

    const providerId = editingId || `custom-${Date.now()}`;
    const newConfig: CustomProviderConfig = {
      id: providerId,
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim() || undefined,
      keyPrefix: keyPrefix.trim() || undefined,
      placeholder: placeholder.trim() || undefined,
      authHeaderType,
      customHeaderName: authHeaderType === 'custom' ? customHeaderName.trim() : undefined,
      defaultModel: defaultModel.trim() || (parsedModels[0] || 'default'),
      availableModels: parsedModels.length > 0 ? parsedModels : [defaultModel.trim() || 'default'],
      docsUrl: docsUrl.trim() || undefined,
      helpTip: helpTip.trim() || undefined,
      color,
      createdAt: Date.now(),
    };

    saveCustomProvider(newConfig);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleDelete = (id: string, providerName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp "${providerName}" không?`)) {
      deleteCustomProvider(id);
    }
  };

  const handleQuickTest = async (provider: CustomProviderConfig) => {
    setTestingId(provider.id);
    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: provider.id,
          apiKey: provider.apiKey || '',
          testType: 'ping',
          customConfig: {
            baseUrl: provider.baseUrl,
            authHeaderType: provider.authHeaderType,
            customHeaderName: provider.customHeaderName,
            defaultModel: provider.defaultModel,
          },
        }),
      });

      const data = await res.json();
      setTestResult(prev => ({
        ...prev,
        [provider.id]: {
          success: data.success,
          message: data.message || (data.success ? 'Kết nối thành công!' : 'Thất bại'),
          latencyMs: data.latencyMs,
        },
      }));
    } catch (e: any) {
      setTestResult(prev => ({
        ...prev,
        [provider.id]: {
          success: false,
          message: e.message || 'Lỗi mạng khi test',
        },
      }));
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-sm shadow-cyan-600/20">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  Quản lý Nhà cung cấp Tùy chỉnh (Custom Providers)
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200/60">
                    {customProviders.length} dịch vụ
                  </span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Thêm bất kỳ dịch vụ LLM OpenAI-compatible (Ollama, Mistral, Together AI, Perplexity, vLLM, LM Studio...).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={handleOpenAddForm}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm nhà cung cấp mới
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-medium transition-colors"
              >
                Đóng
              </button>
            )}
          </div>
        </div>

        {/* Quick Add Presets (Mẫu gợi ý 1 chạm) */}
        {!isEditing && (
          <div className="mt-5 pt-4 border-t border-neutral-100">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
              ⚡ Mẫu thêm nhanh 1 chạm (Nhấn vào để điền form tự động):
            </span>
            <div className="flex items-center flex-wrap gap-2">
              {PRESET_PROVIDERS.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    handleOpenAddForm();
                    handleApplyPreset(preset);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-800 flex items-center gap-1.5 transition-all hover:scale-102"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form: Add or Edit Provider */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-white border-2 border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <h3 className="text-sm font-bold text-neutral-900">
                {editingId ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp AI Tùy chỉnh'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-neutral-500 hover:text-neutral-800"
            >
              Hủy bỏ
            </button>
          </div>

          {/* Preset Buttons inside form */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              Chọn mẫu có sẵn (Tùy chọn):
            </label>
            <div className="flex items-center flex-wrap gap-1.5">
              {PRESET_PROVIDERS.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provider Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Tên Nhà Cung Cấp *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="VD: Mistral AI, Ollama Local, vLLM Server..."
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium"
              />
            </div>

            {/* Base URL */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Base URL (Endpoint API) *
              </label>
              <input
                type="url"
                required
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                placeholder="VD: https://api.mistral.ai/v1 hoặc http://localhost:11434/v1"
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-mono"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Đường dẫn gốc OpenAI-compatible chứa endpoint <code>/chat/completions</code> và <code>/models</code>.
              </span>
            </div>

            {/* Auth Header Type */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Kiểu Header Xác Thực (Authentication)
              </label>
              <select
                value={authHeaderType}
                onChange={e => setAuthHeaderType(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium"
              >
                <option value="bearer">Authorization: Bearer &lt;key&gt; (Chuẩn OpenAI / Phổ biến nhất)</option>
                <option value="x-api-key">x-api-key: &lt;key&gt;</option>
                <option value="custom">Custom Header (Tự đặt tên header)</option>
                <option value="none">Không cần Key / Header xác thực (Ví dụ: Ollama Local)</option>
              </select>
            </div>

            {/* Custom Header Name if chosen */}
            {authHeaderType === 'custom' && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Tên Header Tùy Biến
                </label>
                <input
                  type="text"
                  value={customHeaderName}
                  onChange={e => setCustomHeaderName(e.target.value)}
                  placeholder="VD: api-key hoặc X-Auth-Token"
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden font-mono"
                />
              </div>
            )}

            {/* Sample / Default API Key */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                API Key Mẫu / Lưu trước (Tùy chọn)
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Nhập API key để tự động điền khi test (hoặc để trống)"
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden font-mono"
              />
            </div>

            {/* Key Prefix */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Tiền tố Key (Key Prefix - Tùy chọn)
              </label>
              <input
                type="text"
                value={keyPrefix}
                onChange={e => setKeyPrefix(e.target.value)}
                placeholder="VD: mistral-, pplx-, sk-..."
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden font-mono"
              />
            </div>

            {/* Default Model */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Mô hình Mặc Định (Default Model) *
              </label>
              <input
                type="text"
                required
                value={defaultModel}
                onChange={e => setDefaultModel(e.target.value)}
                placeholder="VD: llama3.2, mistral-large-latest, sonar-pro..."
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Models list and Auto Fetch */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Danh sách Mô hình Khả dụng (Phân cách bằng dấu phẩy)
              </label>
              <button
                type="button"
                onClick={handleFetchModels}
                disabled={fetchingModels || !baseUrl}
                className="text-xs px-2.5 py-1 rounded bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-semibold border border-cyan-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {fetchingModels ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Đang quét endpoint /models...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    🔍 Tự động tải danh sách Model từ Base URL
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={2}
              value={modelsInput}
              onChange={e => setModelsInput(e.target.value)}
              placeholder="VD: llama3.2, deepseek-r1:8b, mistral-large-latest (hoặc bấm nút 'Tự động tải' ở trên)"
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden font-mono"
            />

            {fetchMessage && (
              <div
                className={`mt-2 p-2 rounded-lg text-xs flex items-center gap-2 ${
                  fetchMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {fetchMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{fetchMessage.text}</span>
              </div>
            )}
          </div>

          {/* Color & Help tip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Màu sắc nhận diện
              </label>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c ? 'scale-110 border-neutral-900 shadow-xs' : 'border-white hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Ghi chú / Hướng dẫn (Help Tip)
              </label>
              <input
                type="text"
                value={helpTip}
                onChange={e => setHelpTip(e.target.value)}
                placeholder="VD: Cần chạy Ollama trước bằng lệnh `ollama serve`"
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Cập nhật Nhà cung cấp' : 'Lưu Nhà cung cấp'}
            </button>
          </div>
        </form>
      )}

      {/* List of Custom Providers */}
      {customProviders.length === 0 && !isEditing ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center mx-auto">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">
            Chưa có nhà cung cấp tùy chỉnh nào
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Bạn có thể tự thêm bất kỳ dịch vụ LLM riêng của mình (Local Ollama, vLLM, Mistral, Together AI, Perplexity...) hoặc nhấn vào các mẫu 1 chạm ở trên để thêm ngay!
          </p>
          <button
            type="button"
            onClick={handleOpenAddForm}
            className="mt-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm nhà cung cấp đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customProviders.map(p => {
            const result = testResult[p.id];
            const isTesting = testingId === p.id;
            return (
              <div
                key={p.id}
                className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: p.color || '#0891b2' }}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </h4>
                        <span className="text-[11px] font-mono text-neutral-500 break-all block mt-0.5">
                          {p.baseUrl}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditProvider(p)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center flex-wrap gap-1.5 my-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                      Auth: {p.authHeaderType === 'bearer' ? 'Bearer' : p.authHeaderType === 'x-api-key' ? 'x-api-key' : p.authHeaderType === 'none' ? 'None (No Key)' : p.customHeaderName || 'Custom'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                      Default: {p.defaultModel}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      {p.availableModels.length} models
                    </span>
                  </div>

                  {/* Help tip if any */}
                  {p.helpTip && (
                    <p className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded-lg border border-neutral-100 mb-3">
                      {p.helpTip}
                    </p>
                  )}

                  {/* Test Result Message */}
                  {result && (
                    <div
                      className={`mb-3 p-2 rounded-lg text-xs flex items-center gap-2 ${
                        result.success
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span className="truncate">{result.message}</span>
                      {result.latencyMs !== undefined && (
                        <span className="ml-auto font-mono text-[10px] opacity-75">{result.latencyMs}ms</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickTest(p)}
                    disabled={isTesting}
                    className="px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {isTesting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3 text-amber-500" />
                    )}
                    Test kết nối
                  </button>

                  {onSelectProviderForTest && (
                    <button
                      type="button"
                      onClick={() => onSelectProviderForTest(p.id)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    >
                      Dùng trong Tester
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
