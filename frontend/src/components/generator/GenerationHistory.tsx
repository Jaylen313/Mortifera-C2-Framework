import React from 'react';
import { Clock, Download, Trash2 } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface GeneratedAgent {
  id: string;
  filename: string;
  platform: string;
  features: string[];
  timestamp: string;
  type: 'executable' | 'python';
}

interface GenerationHistoryProps {
  onDownload: (filename: string) => void;
}

export function GenerationHistory({ onDownload }: GenerationHistoryProps) {
  // Get history from localStorage
  const [history, setHistory] = React.useState<GeneratedAgent[]>(() => {
    const saved = localStorage.getItem('generation_history');
    return saved ? JSON.parse(saved) : [];
  });

  const handleDelete = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('generation_history', JSON.stringify(updated));
  };

  const handleClear = () => {
    if (confirm('Clear all generation history?')) {
      setHistory([]);
      localStorage.removeItem('generation_history');
    }
  };

  if (history.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-dark-900">
            Generation History
          </h2>
        </div>
        <p className="text-sm text-dark-600 text-center py-8">
          No agents generated yet. Create your first agent to see history.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-dark-900">
            Recent Generations ({history.length})
          </h2>
        </div>
        <button
          onClick={handleClear}
          className="text-xs text-red-600 hover:text-red-700"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm font-semibold text-dark-900 truncate">
                {item.filename}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  {item.platform}
                </span>
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                  {item.type}
                </span>
                <span className="text-xs text-dark-600">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onDownload(item.filename)}
                className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Remove from history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}