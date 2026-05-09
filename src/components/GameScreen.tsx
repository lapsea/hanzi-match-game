import { useState, useMemo, useRef } from 'react';
import type { LevelData, CustomLevel, WordPair } from '../types';
import { useGame, pickPairsForGame } from '../hooks/useGame';
import { GameBoard } from './GameBoard';
import { GameHeader } from './GameHeader';
import { GameControls } from './GameControls';
import { FeedbackToast } from './FeedbackToast';
import { MilestoneToast } from './MilestoneToast';
import { CompletionModal } from './CompletionModal';
import { UploadPanel } from './UploadPanel';

interface Props {
  level: LevelData;
  nextLevel: LevelData | null;
  onSelectLevel: () => void;
  onNextLevel: (level: LevelData) => void;
  onComplete: (levelId: string, nextId: string | null) => void;
  customLevel?: CustomLevel;
  onIncrementPlayCount?: (id: string) => void;
  onSaveCustom: (level: CustomLevel) => void;
  onPlayCustom: (level: CustomLevel) => void;
  onWordBook: () => void;
}

export function GameScreen({
  level,
  nextLevel,
  onSelectLevel,
  onNextLevel,
  onComplete,
  customLevel,
  onIncrementPlayCount,
  onSaveCustom,
  onPlayCustom,
  onWordBook,
}: Props) {
  const activePairs = useMemo<WordPair[]>(() => {
    if (customLevel) return pickPairsForGame(customLevel.pairs);
    return level.pairs;
  }, []);

  const completedRef = useRef(false);
  const [showUpload, setShowUpload] = useState(false);

  const { cells, eliminatedCount, isComplete, feedback, milestone, handleCellClick, showHint, restart } =
    useGame(level, activePairs);

  if (isComplete && !completedRef.current) {
    completedRef.current = true;
    if (!customLevel) {
      onComplete(level.id, nextLevel?.id ?? null);
    } else if (onIncrementPlayCount) {
      onIncrementPlayCount(customLevel.id);
    }
  }

  const handleRestart = () => {
    completedRef.current = false;
    const newPairs = customLevel ? pickPairsForGame(customLevel.pairs) : level.pairs;
    restart(newPairs);
  };

  return (
    <div className="game-screen">
      <GameHeader
        level={level}
        eliminatedCount={eliminatedCount}
        isCustom={!!customLevel}
        customTitle={customLevel?.title}
        onSelectLevel={onSelectLevel}
        onUpload={() => setShowUpload(true)}
      />
      <MilestoneToast message={milestone} />
      <GameBoard cells={cells} onCellClick={handleCellClick} />
      <FeedbackToast message={feedback} />
      <GameControls
        onHint={showHint}
        onRestart={handleRestart}
        onSelectLevel={onSelectLevel}
      />
      <button className="btn-wordbook-entry" onClick={onWordBook}>
        我的词语本
      </button>
      {isComplete && (
        <CompletionModal
          onNextLevel={nextLevel && !customLevel ? () => onNextLevel(nextLevel) : null}
          onRestart={handleRestart}
          onSelectLevel={onSelectLevel}
        />
      )}
      {showUpload && (
        <UploadPanel
          onSave={onSaveCustom}
          onPlay={onPlayCustom}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
