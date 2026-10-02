import React, { useRef, useEffect } from 'react';
import { WordClue, Direction } from '../types/game';
import { sound } from '../utils/audio';

interface CrosswordBoardProps {
  gridWidth: number;
  gridHeight: number;
  clues: WordClue[];
  activeCell: { x: number; y: number } | null;
  activeClue: WordClue | null;
  direction: Direction;
  userAnswers: { [cellKey: string]: string };
  solvedWordIds: Set<string>;
  revealedCells: Set<string>;
  onSelectCell: (x: number, y: number) => void;
  onCellInput: (char: string) => void;
  onBackspace: () => void;
  onNavigateArrow: (dx: number, dy: number) => void;
  onToggleDirection: () => void;
}

export const CrosswordBoard: React.FC<CrosswordBoardProps> = ({
  gridWidth,
  gridHeight,
  clues,
  activeCell,
  activeClue,
  direction,
  userAnswers,
  solvedWordIds,
  revealedCells,
  onSelectCell,
  onCellInput,
  onBackspace,
  onNavigateArrow,
  onToggleDirection
}) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Build coordinate lookup tables with array of clue numbers
  const cellMap: {
    [key: string]: {
      char: string;
      numbers: number[];
      acrossClue?: WordClue;
      downClue?: WordClue;
    };
  } = {};

  clues.forEach((clue) => {
    for (let i = 0; i < clue.word.length; i++) {
      const x = clue.direction === 'across' ? clue.startX + i : clue.startX;
      const y = clue.direction === 'across' ? clue.startY : clue.startY + i;
      const key = `${x},${y}`;

      if (!cellMap[key]) {
        cellMap[key] = { char: clue.word[i], numbers: [] };
      }

      // If this is the starting cell of the clue, record its number
      if (i === 0) {
        if (!cellMap[key].numbers.includes(clue.number)) {
          cellMap[key].numbers.push(clue.number);
        }
      }

      if (clue.direction === 'across') {
        cellMap[key].acrossClue = clue;
      } else {
        cellMap[key].downClue = clue;
      }
    }
  });

  // Calculate active word cell keys
  const activeWordCellKeys = new Set<string>();
  if (activeClue) {
    for (let i = 0; i < activeClue.word.length; i++) {
      const x = activeClue.direction === 'across' ? activeClue.startX + i : activeClue.startX;
      const y = activeClue.direction === 'across' ? activeClue.startY : activeClue.startY + i;
      activeWordCellKeys.add(`${x},${y}`);
    }
  }

  // Focus hidden input whenever active cell changes, to capture physical keyboard input seamlessly
  useEffect(() => {
    if (activeCell && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [activeCell]);

  // Handle physical keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onNavigateArrow(0, -1);
      sound.playKeyClick();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onNavigateArrow(0, 1);
      sound.playKeyClick();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onNavigateArrow(-1, 0);
      sound.playKeyClick();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onNavigateArrow(1, 0);
      sound.playKeyClick();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      onBackspace();
      sound.playKeyClick();
    } else if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Tab') {
      e.preventDefault();
      onToggleDirection();
      sound.playKeyClick();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val && val.length > 0) {
      // Pick the last entered Korean character or letter
      const lastChar = val[val.length - 1];
      onCellInput(lastChar);
    }
    // Clear input to receive next keystroke
    e.target.value = '';
  };

  // Check if a cell is part of an already solved word
  const isCellSolved = (x: number, y: number): boolean => {
    const data = cellMap[`${x},${y}`];
    if (!data) return false;
    const acrossSolved = data.acrossClue ? solvedWordIds.has(data.acrossClue.id) : false;
    const downSolved = data.downClue ? solvedWordIds.has(data.downClue.id) : false;
    return acrossSolved || downSolved;
  };

  return (
    <div className="relative flex flex-col items-center select-none w-full">
      {/* Hidden input to capture physical keyboard typing (especially for Korean IME) */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="opacity-0 absolute -top-10 left-0 w-1 h-1 pointer-events-none"
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="inline-block p-3 sm:p-5 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-x-auto max-w-full">
        <div
          className="grid gap-1 sm:gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${gridWidth}, minmax(38px, 48px))`,
            gridTemplateRows: `repeat(${gridHeight}, minmax(38px, 48px))`
          }}
        >
          {Array.from({ length: gridHeight }).map((_, y) =>
            Array.from({ length: gridWidth }).map((_, x) => {
              const cellKey = `${x},${y}`;
              const cellData = cellMap[cellKey];
              const isCellPlayable = Boolean(cellData);

              if (!isCellPlayable) {
                // Empty/blocked cell
                return (
                  <div
                    key={cellKey}
                    className="w-full h-full rounded-md bg-slate-100/70 border border-transparent"
                    aria-hidden="true"
                  />
                );
              }

              const isActive = activeCell?.x === x && activeCell?.y === y;
              const isInActiveWord = activeWordCellKeys.has(cellKey);
              const isSolved = isCellSolved(x, y);
              const isRevealed = revealedCells.has(cellKey);
              const userAnswer = userAnswers[cellKey] || (isSolved || isRevealed ? cellData.char : '');

              let cellStyle = 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400';

              if (isActive) {
                cellStyle = 'bg-indigo-600 border-indigo-600 text-white font-extrabold shadow-md ring-2 ring-indigo-400 ring-offset-1 scale-[1.03] z-10';
              } else if (isInActiveWord) {
                cellStyle = 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold';
              } else if (isSolved) {
                cellStyle = 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold';
              }

              return (
                <button
                  key={cellKey}
                  type="button"
                  onClick={() => {
                    onSelectCell(x, y);
                    if (hiddenInputRef.current) {
                      hiddenInputRef.current.focus();
                    }
                  }}
                  className={`relative w-full aspect-square flex items-center justify-center rounded-xl border-2 text-base sm:text-lg transition-all duration-150 cursor-pointer select-none ${cellStyle}`}
                >
                  {/* Clue Number Badge in top left corner (supports compound 1·2 for sharing cells) */}
                  {cellData.numbers.length > 0 && (
                    <span
                      className={`absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-extrabold leading-none ${
                        isActive ? 'text-indigo-200' : 'text-slate-500'
                      }`}
                    >
                      {cellData.numbers.join('·')}
                    </span>
                  )}

                  {/* Character */}
                  <span className={`select-none ${isActive ? 'text-white' : ''}`}>
                    {userAnswer}
                  </span>

                  {/* Small hint sparkle indicator if revealed */}
                  {isRevealed && !isActive && (
                    <span className="absolute bottom-0.5 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
