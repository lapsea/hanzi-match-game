import type { LevelData } from '../types';

const GRADE_NAMES: Record<number, string> = { 1: '启蒙', 2: '进阶', 3: '挑战' };

interface Props {
  levels: LevelData[];
  saveData: { unlockedLevels: string[]; completedLevels: string[] };
  onBack: () => void;
}

export function WordBookScreen({ levels, saveData, onBack }: Props) {
  const totalWords = levels
    .filter(l => saveData.completedLevels.includes(l.id))
    .reduce((sum, l) => sum + l.pairs.length, 0);

  return (
    <div className="wordbook-screen">
      <div className="wordbook-topbar">
        <button className="wordbook-back-btn" onClick={onBack}>← 返回</button>
        <span className="wordbook-topbar-title">我的词语本</span>
        <div className="wordbook-topbar-spacer" />
      </div>

      <div className="wordbook-hero">
        <span className="wordbook-hero-num">{totalWords}</span>
        <span className="wordbook-hero-label">已学会的词语</span>
      </div>

      <div className="wordbook-sections">
        {([1, 2, 3] as const).map(grade => {
          const gradeLevels = levels.filter(l => l.grade === grade);
          const unlockedCount = gradeLevels.filter(l => saveData.unlockedLevels.includes(l.id)).length;
          const completedPairs = gradeLevels
            .filter(l => saveData.completedLevels.includes(l.id))
            .flatMap(l => l.pairs);
          const isGradeLocked = unlockedCount === 0;

          return (
            <div key={grade} className={`wordbook-section${isGradeLocked ? ' wordbook-section-locked' : ''}`}>
              <div className="wordbook-section-header">
                <span className="wordbook-section-title">第{grade}级 · {GRADE_NAMES[grade]}</span>
                <span className={`wordbook-section-badge${isGradeLocked ? ' badge-locked' : ''}`}>
                  {isGradeLocked ? '未解锁' : `已解锁 ${unlockedCount} 关`}
                </span>
              </div>

              {isGradeLocked ? (
                <div className="wordbook-locked-hint">完成上一级后解锁</div>
              ) : completedPairs.length === 0 ? (
                <div className="wordbook-empty-hint">完成关卡后词语将收录在这里～</div>
              ) : (
                <div className="wordbook-chips">
                  {completedPairs.map((pair, i) => (
                    <span key={i} className="word-chip">{pair[0]}{pair[1]}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
