import { useRef, useState } from 'react';
import type { CustomLevel, ParseResult, WordPair } from '../types';

interface Props {
  customLevels: CustomLevel[];
  onPlay: (level: CustomLevel) => void;
  onDelete: (id: string) => void;
  onSave: (level: CustomLevel) => void;
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

interface PreviewState {
  title: string;
  result: ParseResult;
}

type InputMode = 'upload' | 'paste';

export function CustomTab({ customLevels, onPlay, onDelete, onSave }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<InputMode>('upload');
  const [pasteText, setPasteText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);

  const hasLevels = customLevels.length > 0;

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      const result = parseContent(content);
      if (result.errors.length > 0) {
        alert('解析失败：\n' + result.errors.join('\n'));
        return;
      }
      const title = file.name.replace(/\.txt$/i, '');
      setPreview({ title, result });
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
    const title = pasteTitle.trim() || '我的字库';
    setPreview({ title, result });
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
    setPreview(null);
    setPasteText('');
    setPasteTitle('');
    setShowInput(false);
    onPlay(level);
  };

  const inputPanel = (
    <div className="input-panel">
      <div className="input-mode-tabs">
        <button
          className={`input-mode-btn${mode === 'upload' ? ' active' : ''}`}
          onClick={() => setMode('upload')}
        >
          📂 上传文件
        </button>
        <button
          className={`input-mode-btn${mode === 'paste' ? ' active' : ''}`}
          onClick={() => setMode('paste')}
        >
          📋 粘贴内容
        </button>
      </div>

      {mode === 'upload' ? (
        <div
          className={`upload-zone${dragOver ? ' upload-zone-over' : ''}`}
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
            rows={8}
          />
          {pasteError && <div className="paste-error">⚠ {pasteError}</div>}
          <button className="btn btn-primary" onClick={handlePasteSubmit}>
            解析并保存
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );

  return (
    <div className="custom-tab">
      {hasLevels ? (
        <>
          <button
            className="btn btn-sm btn-outline upload-btn-small"
            onClick={() => setShowInput(v => !v)}
          >
            {showInput ? '收起' : '+ 添加字库'}
          </button>
          {showInput && inputPanel}
        </>
      ) : (
        inputPanel
      )}

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
                <button className="btn btn-primary" onClick={confirmSave}>确认保存</button>
                <button className="btn btn-outline" onClick={() => setPreview(null)}>取消</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-body">
            <div className="modal-title" style={{ fontSize: '1.1rem' }}>
              确定删除「{customLevels.find(l => l.id === deleteConfirm)?.title}」？
            </div>
            <div style={{ color: '#666', margin: '8px 0' }}>此操作不可撤销</div>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null); }}>删除</button>
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>取消</button>
            </div>
            </div>
          </div>
        </div>
      )}

      <div className="custom-level-list">
        {customLevels.map(level => (
          <div key={level.id} className="custom-level-card">
            <div className="custom-level-card-top">
              <span className="custom-level-title">📄 {level.title}</span>
              <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(level.id)}>删除</button>
            </div>
            <div className="custom-level-meta">
              共 {level.pairs.length} 个词语 · 已玩 {level.playCount} 次
            </div>
            <div className="custom-level-meta">
              {new Date(level.createdAt).toLocaleDateString('zh-CN')} 上传
            </div>
            <button className="btn btn-primary custom-play-btn" onClick={() => onPlay(level)}>开始游戏</button>
          </div>
        ))}
      </div>
    </div>
  );
}
