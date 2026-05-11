interface Props {
  onNextLevel: (() => void) | null;
  onRestart: () => void;
  onSelectLevel: () => void;
}

export function CompletionModal({ onNextLevel, onRestart, onSelectLevel }: Props) {
  return (
    <div className="modal-overlay">
      <div className="confetti-wrap" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} className="confetti-dot" style={{ '--ci': i } as React.CSSProperties} />
        ))}
      </div>
      <div className="modal-content">
        <div className="modal-hero-band">
          <div className="modal-emoji">🎉</div>
          <div className="modal-stars-row">
            <span className="mstar mstar-1">⭐</span>
            <span className="mstar mstar-2">⭐</span>
            <span className="mstar mstar-3">⭐</span>
          </div>
        </div>
        <div className="modal-body">
          <div className="modal-title">太棒了！</div>
          <div className="modal-sub">全部消除，过关！</div>
          <div className="modal-actions">
            {onNextLevel && (
              <button className="btn btn-primary" onClick={onNextLevel}>下一关</button>
            )}
            <button className="btn btn-restart" onClick={onRestart}>再玩一次</button>
            <button className="btn btn-outline" onClick={onSelectLevel}>选关</button>
          </div>
        </div>
      </div>
    </div>
  );
}
