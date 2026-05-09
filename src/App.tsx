import { useState } from 'react';
import type { LevelData, CustomLevel } from './types';
import { useLevels } from './hooks/useLevels';
import { useSaveData } from './hooks/useSaveData';
import { LevelSelectScreen } from './components/LevelSelectScreen';
import { GameScreen } from './components/GameScreen';
import { WordBookScreen } from './components/WordBookScreen';

type Screen = 'select' | 'game' | 'wordbook';

export default function App() {
  const { levels, loading, error } = useLevels();
  const { saveData, customLevels, completeLevel, saveCustomLevel, deleteCustomLevel, incrementPlayCount } = useSaveData();

  const [screen, setScreen] = useState<Screen>('game');
  const [activeLevel, setActiveLevel] = useState<LevelData | null>(null);
  const [activeCustomLevel, setActiveCustomLevel] = useState<CustomLevel | null>(null);

  // Auto-enter first level once levels load, if none selected yet
  if (!loading && !error && levels.length > 0 && activeLevel === null) {
    setActiveLevel(levels[0]);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div>加载字库中…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-icon">⚠️</div>
        <div>字库加载失败</div>
        <div className="error-detail">{error}</div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>重试</button>
      </div>
    );
  }

  const getNextLevel = (currentLevel: LevelData): LevelData | null => {
    const idx = levels.findIndex(l => l.id === currentLevel.id);
    return idx >= 0 && idx < levels.length - 1 ? levels[idx + 1] : null;
  };

  const handleSelectLevel = (level: LevelData) => {
    setActiveLevel(level);
    setActiveCustomLevel(null);
    setScreen('game');
  };

  const handlePlayCustom = (level: CustomLevel) => {
    setActiveCustomLevel(level);
    setActiveLevel(levels[0]);
    setScreen('game');
  };

  const handleNextLevel = (level: LevelData) => {
    setActiveLevel(level);
    setActiveCustomLevel(null);
  };

  const handleComplete = (levelId: string, nextId: string | null) => {
    completeLevel(levelId, nextId);
  };

  if (screen === 'game' && activeLevel) {
    return (
      <GameScreen
        key={activeCustomLevel ? activeCustomLevel.id : activeLevel.id}
        level={activeLevel}
        nextLevel={activeCustomLevel ? null : getNextLevel(activeLevel)}
        onSelectLevel={() => setScreen('select')}
        onNextLevel={handleNextLevel}
        onComplete={handleComplete}
        customLevel={activeCustomLevel ?? undefined}
        onIncrementPlayCount={incrementPlayCount}
        onSaveCustom={saveCustomLevel}
        onPlayCustom={handlePlayCustom}
        onWordBook={() => setScreen('wordbook')}
      />
    );
  }

  if (screen === 'wordbook') {
    return (
      <WordBookScreen
        levels={levels}
        saveData={saveData}
        onBack={() => setScreen('game')}
      />
    );
  }

  return (
    <LevelSelectScreen
      levels={levels}
      saveData={saveData}
      customLevels={customLevels}
      onSelectLevel={handleSelectLevel}
      onPlayCustom={handlePlayCustom}
      onSaveCustom={saveCustomLevel}
      onDeleteCustom={deleteCustomLevel}
    />
  );
}
