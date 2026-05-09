import { useState } from 'react';
import type { LevelData, CustomLevel } from '../types';
import { CustomTab } from './CustomTab';

interface Props {
  levels: LevelData[];
  saveData: { unlockedLevels: string[]; completedLevels: string[] };
  customLevels: CustomLevel[];
  onSelectLevel: (level: LevelData) => void;
  onPlayCustom: (level: CustomLevel) => void;
  onSaveCustom: (level: CustomLevel) => void;
  onDeleteCustom: (id: string) => void;
}

type Tab = 1 | 2 | 3 | 'custom';

const GRADE_NAMES: Record<number, string> = { 1: '第1级·启蒙', 2: '第2级·进阶', 3: '第3级·挑战' };

export function LevelSelectScreen({
  levels,
  saveData,
  customLevels,
  onSelectLevel,
  onPlayCustom,
  onSaveCustom,
  onDeleteCustom,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(1);

  const levelsByGrade = (grade: number) => levels.filter(l => l.grade === grade);

  const isUnlocked = (id: string) => saveData.unlockedLevels.includes(id);
  const isCompleted = (id: string) => saveData.completedLevels.includes(id);

  return (
    <div className="level-select-screen">
      <div className="level-select-header">
        <h1 className="game-title">汉字对对碰</h1>
        <p className="game-subtitle">选择关卡，开始挑战！</p>
      </div>

      <div className="tabs">
        {([1, 2, 3] as const).map(g => (
          <button
            key={g}
            className={`tab-btn${activeTab === g ? ' tab-active' : ''}`}
            onClick={() => setActiveTab(g)}
          >
            {GRADE_NAMES[g]}
          </button>
        ))}
        <button
          className={`tab-btn tab-btn-custom${activeTab === 'custom' ? ' tab-active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          ✨ 我的字库
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'custom' ? (
          <CustomTab
            customLevels={customLevels}
            onPlay={onPlayCustom}
            onDelete={onDeleteCustom}
            onSave={onSaveCustom}
          />
        ) : (
          <div className="level-grid">
            {levelsByGrade(activeTab).map(level => {
              const unlocked = isUnlocked(level.id);
              const completed = isCompleted(level.id);
              return (
                <div
                  key={level.id}
                  className={`level-card${unlocked ? '' : ' level-locked'}${completed ? ' level-completed' : ''}`}
                  onClick={() => unlocked && onSelectLevel(level)}
                >
                  <div className="level-card-top">
                    <span className="level-number">第{level.level}关</span>
                    {completed && <span className="level-badge">✓</span>}
                    {!unlocked && <span className="level-badge">🔒</span>}
                  </div>
                  <div className="level-card-title">{level.title}</div>
                  <div className="level-card-sub">18 组词对</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="level-select-footer">
        v1.5 · 哈维yao
      </div>
    </div>
  );
}
