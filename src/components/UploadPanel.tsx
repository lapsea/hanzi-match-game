import { useRef, useState } from 'react';
import type { CustomLevel, ParseResult, WordPair } from '../types';

interface Props {
  onSave: (level: CustomLevel) => void;
  onPlay: (level: CustomLevel) => void;
  onClose: () => void;
}

function parseContent(content: string): ParseResult {
  const lines = content.split('\n');
  const pairs: WordPair[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  lines.forEach((raw, i) => {
    const line = raw.trim().replace(/[^一-鿿]/g, '');
    if (line.length === 0) return;
    if (line.length !== 2) {
      warnings.push(`第${i + 1}行「${raw.trim()}」不是2个汉字，已跳过`);
      return;
    }
    pairs.push([line[0], line[1]]);
  });

  if (pairs.length < 18) {
    errors.push(`有效词语不足18个（当前：${pairs.length}个），请补充后重试`);
  }

  return { pairs, errors, warnings };
}

type Mode = 'upload' | 'paste';

interface PreviewState {
  title: string;
  result: ParseResult;
}

export function UploadPanel({ onSave, onPlay, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      const result = parseContent(content);
      if (result.errors.length > 0) {
        alert('解析失败：\n' + result.errors.join('\n'));
        return;
      }
      setPreview({ title: file.name.replace(/\.txt$/i, ''), result });
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handlePasteSubmit = () => {
    setPasteError('');
    const result = parseContent(pasteText);
    if (result.errors.length > 0) {
      setPasteError(result.errors[0]);
      return;
    }
    setPreview({ title: pasteTitle.trim() || '我的字库', result });
  };

  const confirmSave = () => {
    if (!preview) return;
    const level: CustomLevel = {
      id: `custom-${Date.now()}`,
      title: preview.title,
      pairs: preview.result.pairs,
      createdAt: Date.now(),
      playCount: 0,
    };
    onSave(level);
    onPlay(level);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content upload-modal">
        <div className="upload-modal-header">
          <span className="modal-title" style={{ fontSize: '1.1rem' }}>上传词库</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="input-mode-tabs">
          <button className={`input-mode-btn${mode === 'upload' ? ' active' : ''}`} onClick={() => setMode('upload')}>
            📂 上传文件
          </button>
          <button className={`input-mode-btn${mode === 'paste' ? ' active' : ''}`} onClick={() => setMode('paste')}>
            📋 粘贴内容
          </button>
        </div>

        {mode === 'upload' ? (
          <div
            className={`upload-zone${dragOver ? ' upload-zone-over' : ''}`}
            style={{ marginTop: 0 }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="upload-icon">📂</div>
            <div className="upload-text">点击或拖拽上传 .txt 文件</div>
            <div className="upload-sub">每行一个词语，至少18个，UTF-8 编码</div>
          </div>
        ) : (
          <div className="paste-panel">
            <input
              className="paste-title-input"
              placeholder="字库名称（选填，默认「我的字库」）"
              value={pasteTitle}
              onChange={e => setPasteTitle(e.target.value)}
            />
            <textarea
              className="paste-textarea"
              placeholder={'每行一个词语，至少18个，例如：\n苹果\n香蕉\n天空\n月亮\n…'}
              value={pasteText}
              onChange={e => { setPasteText(e.target.value); setPasteError(''); }}
              rows={7}
            />
            {pasteError && <div className="paste-error">⚠ {pasteError}</div>}
            <button className="btn btn-primary" onClick={handlePasteSubmit}>解析并保存</button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        />

        {preview && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-body">
                <div className="modal-title" style={{ fontSize: '1.2rem' }}>确认保存</div>
                <div style={{ margin: '12px 0', textAlign: 'left' }}>
                  <p>📄 <strong>{preview.title}</strong></p>
                  <p>词语总数：{preview.result.pairs.length} 个</p>
                  <p>每局随机抽取：18 个</p>
                  {preview.result.warnings.length > 0 && (
                    <div className="preview-warnings">
                      {preview.result.warnings.map((w, i) => <p key={i} className="warning-text">⚠ {w}</p>)}
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={confirmSave}>确认保存并开始</button>
                  <button className="btn btn-outline" onClick={() => setPreview(null)}>取消</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
