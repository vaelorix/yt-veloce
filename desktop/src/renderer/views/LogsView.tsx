import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../../../shared/types';
import {
  Search,
  Trash2,
  Copy,
  Download,
  Check,
  Send,
  Terminal as TerminalIcon,
  Maximize2
} from 'lucide-react';

interface LogsViewProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onClearLogs }) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [wrapLines, setWrapLines] = useState(true);
  const [autoFollow, setAutoFollow] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((l) => {
    if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
    if (levelFilter !== 'all' && l.level !== levelFilter) return false;
    if (search.trim() && !l.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    if (autoFollow && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, autoFollow]);

  const handleCopy = () => {
    const text = filteredLogs
      .map(
        (l) =>
          `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.category.toUpperCase()}] [${l.level.toUpperCase()}] ${l.message}`
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

  const handleSendInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    // Log user input entry to UI
    setCustomInput('');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'var(--accent-danger)';
      case 'warn':
        return 'var(--accent-warning)';
      case 'debug':
        return 'var(--text-muted)';
      default:
        return 'var(--accent-primary-bright)';
    }
  };

  return (
    <div className="view-container" style={{ gap: 12, height: '100%', paddingBottom: 16 }}>
      {/* Top Header & Toolbar (matching Screenshot 4) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Logs</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Real-time execution diagnostics, standard output, and process events
          </div>
        </div>

        {/* Toolbar Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search / Filter with Lines Count badge (matching screenshot 4) */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: 240 }}>
              <Search
                size={13}
                style={{
                  position: 'absolute',
                  left: 8,
                  color: 'var(--text-muted)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Filter output..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: 26,
                  paddingRight: 64,
                  fontSize: 12,
                  height: 30
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: 6,
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d',
                  padding: '1px 5px',
                  borderRadius: 3,
                  pointerEvents: 'none'
                }}
              >
                {filteredLogs.length} lines
              </span>
            </div>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ fontSize: 12, height: 30, padding: '4px 8px' }}
            >
              <option value="all">All Channels</option>
              <option value="yt-dlp">yt-dlp Engine</option>
              <option value="ffmpeg">FFmpeg</option>
              <option value="download">Downloads</option>
              <option value="system">System</option>
            </select>

            {/* Level Dropdown */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              style={{ fontSize: 12, height: 30, padding: '4px 8px' }}
            >
              <option value="all">All Severities</option>
              <option value="info">INFO</option>
              <option value="warn">WARN</option>
              <option value="error">ERROR</option>
              <option value="debug">DEBUG</option>
            </select>
          </div>

          {/* Right Toolbar: Segmented Controls [Wrap] [Follow] [Select] + Action Buttons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Segmented [Wrap | Follow | Select] */}
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-btn ${wrapLines ? 'active' : ''}`}
                onClick={() => setWrapLines(!wrapLines)}
              >
                Wrap
              </button>
              <button
                type="button"
                className={`segmented-btn ${autoFollow ? 'active' : ''}`}
                onClick={() => setAutoFollow(!autoFollow)}
              >
                Follow
              </button>
              <button
                type="button"
                className={`segmented-btn ${selectionMode ? 'active' : ''}`}
                onClick={() => setSelectionMode(!selectionMode)}
              >
                Select
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleCopy}
              className="btn-secondary"
              style={{ padding: '4px 10px', height: 28, fontSize: 12 }}
              title="Copy to clipboard"
            >
              {copied ? <Check size={13} color="var(--accent-primary-bright)" /> : <Copy size={13} />}
            </button>

            <button
              onClick={handleExport}
              className="btn-secondary"
              style={{ padding: '4px 10px', height: 28, fontSize: 12 }}
              title="Export logs to file"
            >
              <Download size={13} />
            </button>

            <button
              onClick={onClearLogs}
              className="btn-secondary"
              style={{ padding: '4px 10px', height: 28, fontSize: 12 }}
              title="Clear output"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Console View (matching Screenshot 4) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-terminal)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}
      >
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            padding: '12px 16px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
            userSelect: selectionMode ? 'text' : 'auto'
          }}
        >
          {/* Header line inside terminal (matching screenshot 4) */}
          <div
            style={{
              color: 'var(--text-muted)',
              marginBottom: 10,
              paddingBottom: 6,
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: 11
            }}
          >
            — yt-dlp Engine Diagnostics · Active Session
          </div>

          {filteredLogs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 60 }}>
              No log entries matching your current filters.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} style={{ display: 'flex', gap: 10, padding: '1px 0' }}>
                <span style={{ color: 'var(--text-muted)', userSelect: 'none', flexShrink: 0 }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  style={{
                    color: 'var(--accent-info)',
                    width: 76,
                    flexShrink: 0,
                    fontWeight: 600
                  }}
                >
                  [{log.category.toUpperCase()}]
                </span>
                <span
                  style={{
                    color: getLevelColor(log.level),
                    width: 50,
                    flexShrink: 0,
                    fontWeight: 600
                  }}
                >
                  [{log.level.toUpperCase()}]
                </span>
                <span
                  style={{
                    flex: 1,
                    wordBreak: 'break-all',
                    color: log.level === 'error' ? 'var(--accent-danger)' : 'inherit'
                  }}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Bottom Input Command Bar (matching screenshot 4) */}
        <form
          onSubmit={handleSendInput}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-input)'
          }}
        >
          <span style={{ color: 'var(--accent-primary-bright)', fontFamily: 'var(--font-mono)' }}>
            &gt;
          </span>
          <input
            type="text"
            placeholder="Send input to the running script or engine..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              padding: 0
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '4px 12px', fontSize: 11, height: 26, gap: 4 }}
          >
            <Send size={11} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
