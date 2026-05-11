import type { LevelData } from '../types';

interface Props {
  level: LevelData;
  eliminatedCount: number;
  isCustom?: boolean;
  customTitle?: string;
  onSelectLevel: () => void;
  onUpload: () => void;
}

const GRADE_NAMES: Record<number, string> = { 1: '启蒙', 2: '进阶', 3: '挑战' };

export function GameHeader({ level, eliminatedCount, isCustom, customTitle, onUpload }: Props) {
  return (
    <div className="game-header">
      <div className="game-header-top">
        <span className="game-title">汉字对对碰</span>
        <button className="btn btn-sm btn-upload" onClick={onUpload}>上传词库</button>
      </div>
      <div className="game-header-info">
        <span className="level-label">
          {isCustom
            ? `自定义 · ${customTitle}`
            : `第${level.grade}级（${GRADE_NAMES[level.grade]}）· 第${level.level}关 · ${level.title}`}
        </span>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${(eliminatedCount / 18) * 100}%` }} />
        </div>
        <span className="progress-count">{eliminatedCount}/18</span>
      </div>
    </div>
  );
}
