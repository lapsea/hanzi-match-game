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

export function GameHeader({ level, eliminatedCount, isCustom, customTitle, onSelectLevel, onUpload }: Props) {
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
        <span className="progress-label">已消除：{eliminatedCount}/18 词对</span>
      </div>
    </div>
  );
}
