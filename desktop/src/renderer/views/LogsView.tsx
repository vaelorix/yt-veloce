import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../../../shared/types';
import {
  ScrollText,
  Search,
  Filter,
  Trash2,
  Copy,
  Download,
  Check,
  ArrowDown
} from 'lucide-react';

interface LogsViewProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onClearLogs }) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((l) => {
    if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
    if (levelFilter !== 'all' && l.level !== levelFilter) return false;
    if (search.trim() && !l.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const handleCopy = () => {
    const text = filteredLogs
      .map(
        (l) =>
          `[${new Date(l.timestamp).toISOString()}] [${l.category.toUpperCase()}] [${l.level.toUpperCase()}] ${l.message}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const text = filteredLogs
      .map(
        (l) =>
          `[${new Date(l.timestamp).toISOString()}] [${l.category.toUpperCase()}] [${l.level.toUpperCase()}] ${l.message}`
      )
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yt-dlp-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'var(--accent-danger)';
      case 'warn': return 'var(--accent-warning)';
      case 'debug': return 'var(--text-muted)';
      default: return '#38bdf8';
    }
  };

  return (
    <div className="view-container">
      {/* Filters Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ fontSize: 13, padding: '6px 10px' }}
          >
            <option value="all">All Channels</option>
            <option value="yt-dlp">yt-dlp Core</option>
            <option value="ffmpeg">FFmpeg</option>
            <option value="download">Downloads</option>
            <option value="system">System / Database</option>
          </select>

          {/* Level Dropdown */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            style={{ fontSize: 13, padding: '6px 10px' }}
          >
            <option value="all">All Severities</option>
            <option value="info">INFO</option>
            <option value="warn">WARN</option>
            <option value="error">ERROR</option>
            <option value="debug">DEBUG</option>
          </select>

          {/* Search box */}
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={14} style={{ position: 'absolute', left: 8, top: 9, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 28, fontSize: 12 }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-Scroll
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleCopy} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
            {copied ? <Check size={14} color="var(--accent-success)" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button onClick={handleExport} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
            <Download size={14} /> Export
          </button>

          <button onClick={onClearLogs} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Log Console Terminal */}
      <div
        ref={scrollRef}
        className="card"
        style={{
          flex: 1,
          minHeight: 480,
          backgroundColor: '#030712',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          padding: 16,
          overflowY: 'auto',
          lineHeight: 1.6,
          color: '#cbd5e1'
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 60 }}>
            No log entries matching your current filters.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} style={{ display: 'flex', gap: 10, padding: '1px 0' }}>
              <span style={{ color: '#64748b', userSelect: 'none', flexShrink: 0 }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span style={{ color: 'var(--accent-primary)', width: 80, flexShrink: 0, fontWeight: 600 }}>
                [{log.category.toUpperCase()}]
              </span>
              <span style={{ color: getLevelColor(log.level), width: 55, flexShrink: 0, fontWeight: 600 }}>
                [{log.level.toUpperCase()}]
              </span>
              <span style={{ flex: 1, wordBreak: 'break-all', color: log.level === 'error' ? '#f43f5e' : 'inherit' }}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
