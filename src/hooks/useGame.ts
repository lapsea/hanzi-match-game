import { useState, useCallback, useRef } from 'react';
import type { Cell, LevelData, WordPair } from '../types';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickPairsForGame(allPairs: WordPair[]): WordPair[] {
  if (allPairs.length <= 18) return [...allPairs];
  return shuffleArray(allPairs).slice(0, 18);
}

function initBoard(pairs: WordPair[]): Cell[][] {
  const allCells = pairs.flatMap((pair, pairId) => [
    { char: pair[0], pairId, role: 'first' as const },
    { char: pair[1], pairId, role: 'second' as const },
  ]);
  const shuffled = shuffleArray(allCells);
  return Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: 6 }, (_, c) => ({
      id: `cell-${r}-${c}`,
      ...shuffled[r * 6 + c],
      isEmpty: false,
      isSelected: false,
      isHinted: false,
      isEliminating: false,
      isShaking: false,
    }))
  );
}

export function useGame(level: LevelData, pairsOverride?: WordPair[]) {
  const activePairs = pairsOverride ?? level.pairs;
  const [cells, setCells] = useState<Cell[][]>(() => initBoard(activePairs));
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [eliminatedCount, setEliminatedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [milestone, setMilestone] = useState<string | null>(null);
  const milestoneShownRef = useRef(false);

  const showFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1500);
  }, []);

  const restart = useCallback((newPairs?: WordPair[]) => {
    setCells(initBoard(newPairs ?? activePairs));
    setSelected(null);
    setEliminatedCount(0);
    setIsComplete(false);
    setFeedback(null);
    setMilestone(null);
    milestoneShownRef.current = false;
  }, [activePairs]);

  const showHint = useCallback(() => {
    // Find all valid pairs still on board
    const flat: { cell: Cell; row: number; col: number }[] = [];
    cells.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (!cell.isEmpty) flat.push({ cell, row: r, col: c });
      })
    );
    const firsts = flat.filter(x => x.cell.role === 'first');
    const seconds = flat.filter(x => x.cell.role === 'second');
    const validPairs: [typeof firsts[0], typeof seconds[0]][] = [];
    firsts.forEach(f => {
      const s = seconds.find(s => s.cell.pairId === f.cell.pairId);
      if (s) validPairs.push([f, s]);
    });
    if (validPairs.length === 0) return;
    const pick = validPairs[Math.floor(Math.random() * validPairs.length)];
    setCells(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell, isHinted: false })));
      next[pick[0].row][pick[0].col].isHinted = true;
      next[pick[1].row][pick[1].col].isHinted = true;
      return next;
    });
    setTimeout(() => {
      setCells(prev => prev.map(row => row.map(cell => ({ ...cell, isHinted: false }))));
    }, 2000);
  }, [cells]);

  const handleCellClick = useCallback((row: number, col: number) => {
    const cell = cells[row][col];
    if (cell.isEmpty || cell.isEliminating) return;

    if (selected === null) {
      // First selection
      setCells(prev => {
        const next = prev.map(r => r.map(c => ({ ...c, isSelected: false })));
        next[row][col].isSelected = true;
        return next;
      });
      setSelected({ row, col });
      return;
    }

    // Same cell — deselect
    if (selected.row === row && selected.col === col) {
      setCells(prev => {
        const next = prev.map(r => r.map(c => ({ ...c, isSelected: false })));
        return next;
      });
      setSelected(null);
      return;
    }

    const first = cells[selected.row][selected.col];
    const second = cell;

    const canEliminate =
      first.pairId === second.pairId &&
      first.role === 'first' &&
      second.role === 'second';

    const isReversed =
      first.pairId === second.pairId &&
      first.role === 'second' &&
      second.role === 'first';

    if (canEliminate) {
      // Start elimination animation
      setCells(prev => {
        const next = prev.map(r => r.map(c => ({ ...c, isSelected: false, isHinted: false })));
        next[selected.row][selected.col].isEliminating = true;
        next[row][col].isEliminating = true;
        return next;
      });
      setSelected(null);
      setTimeout(() => {
        setCells(prev => {
          const next = prev.map(r => r.map(c => ({ ...c })));
          next[selected.row][selected.col].isEmpty = true;
          next[selected.row][selected.col].isEliminating = false;
          next[row][col].isEmpty = true;
          next[row][col].isEliminating = false;
          return next;
        });
        setEliminatedCount(prev => {
          const next = prev + 1;
          if (next >= 18) setIsComplete(true);
          if (next === 9 && !milestoneShownRef.current) {
            milestoneShownRef.current = true;
            setMilestone('已经消了一半啦！继续加油 ⚡');
            setTimeout(() => setMilestone(null), 2000);
          }
          return next;
        });
      }, 300);
    } else if (isReversed) {
      // Shake both
      setCells(prev => {
        const next = prev.map(r => r.map(c => ({ ...c, isSelected: false })));
        next[selected.row][selected.col].isShaking = true;
        next[row][col].isShaking = true;
        return next;
      });
      setSelected(null);
      showFeedback('换个顺序试试～');
      setTimeout(() => {
        setCells(prev => prev.map(r => r.map(c => ({ ...c, isShaking: false }))));
      }, 500);
    } else {
      // No match — move selection to newly clicked cell
      setCells(prev => {
        const next = prev.map(r => r.map(c => ({ ...c, isSelected: false })));
        next[row][col].isSelected = true;
        return next;
      });
      setSelected({ row, col });
    }
  }, [cells, selected, showFeedback]);

  return {
    cells,
    eliminatedCount,
    isComplete,
    feedback,
    milestone,
    handleCellClick,
    showHint,
    restart,
  };
}
