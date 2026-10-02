import React, { useState, useEffect, useMemo } from 'react';
import { Delete, ArrowLeftRight, Shuffle } from 'lucide-react';
import { WordClue } from '../types/game';
import { sound } from '../utils/audio';

interface VirtualKeyboardProps {
  activeClue: WordClue | null;
  activeCell: { x: number; y: number } | null;
  allStageClues: WordClue[];
  onInputChar: (char: string) => void;
  onBackspace: () => void;
  onToggleDirection: () => void;
}

// Fisher-Yates array shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeClue,
  activeCell,
  allStageClues,
  onInputChar,
  onBackspace,
  onToggleDirection
}) => {
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  // Pool of high-yield Korean Grade 3 curriculum distractor syllables
  const generalDistractors = useMemo(() => [
    '역', '설', '풍', '자', '문', '학', '시', '점', '비', '유', '구', '개',
    '화', '음', '운', '절', '파', '생', '어', '근', '합', '성', '귀', '납',
    '연', '추', '론', '토', '입', '상', '조', '사', '초', '가', '온', '고',
    '신', '결', '률', '체', '계', '모', '반', '법', '복', '선', '희', '곡'
  ], []);

  // Compute thoroughly randomized syllable buttons
  const displaySyllables = useMemo(() => {
    if (!activeClue) {
      return shuffleArray(generalDistractors).slice(0, 24);
    }

    // 1. Mandatory target syllables from active word
    const targetChars = activeClue.word.split('');

    // 2. Curated distractors from other words in the current stage
    const stageDistractors: string[] = [];
    allStageClues.forEach((c) => {
      if (c.id !== activeClue.id) {
        stageDistractors.push(...c.word.split(''));
      }
    });

    // 3. Pool of non-target distractors
    const otherDistractors = [...stageDistractors, ...generalDistractors].filter(
      (ch) => !targetChars.includes(ch)
    );
    const uniqueDistractors = Array.from(new Set(otherDistractors));
    const shuffledDistractors = shuffleArray(uniqueDistractors);

    // 4. Fill up to 24 slots (or 18 minimum)
    const neededDistractors = Math.max(15, 24 - targetChars.length);
    const pickedDistractors = shuffledDistractors.slice(0, neededDistractors);

    // 5. Combine target chars + distractors, and SHUFFLE thoroughly!
    const combined = [...targetChars, ...pickedDistractors];
    return shuffleArray(combined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClue?.id, shuffleSeed, allStageClues, generalDistractors]);

  // Compute which letter position is currently being entered (e.g. 1st, 2nd, 3rd)
  const currentPositionIndex = useMemo(() => {
    if (!activeClue || !activeCell) return null;
    if (activeClue.direction === 'across') {
      const pos = activeCell.x - activeClue.startX;
      if (pos >= 0 && pos < activeClue.word.length) return pos + 1;
    } else {
      const pos = activeCell.y - activeClue.startY;
      if (pos >= 0 && pos < activeClue.word.length) return pos + 1;
    }
    return null;
  }, [activeClue, activeCell]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs">
      {/* Header with input position feedback & random shuffle button */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            어휘 입력 자판
          </span>
          {activeClue && currentPositionIndex !== null && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              {activeClue.direction === 'across' ? '가로' : '세로'} {activeClue.number}번 · {currentPositionIndex}번째 글자 입력 중
            </span>
          )}
        </div>

        {/* Shuffle Button */}
        <button
          type="button"
          onClick={() => {
            setShuffleSeed((prev) => prev + 1);
            sound.playKeyClick();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer border border-indigo-200"
          title="자판의 글자들을 무작위로 다시 섞습니다"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>글자 다시 섞기</span>
        </button>
      </div>

      {/* Randomized Syllable Buttons Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5 mb-2.5">
        {displaySyllables.map((syl, idx) => (
          <button
            key={`${syl}-${idx}-${shuffleSeed}`}
            type="button"
            onClick={() => {
              onInputChar(syl);
            }}
            className="h-10 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-800 hover:text-indigo-700 font-bold text-base transition-colors flex items-center justify-center active:scale-95 cursor-pointer shadow-2xs select-none"
          >
            {syl}
          </button>
        ))}
      </div>

      {/* Control Actions (Direction Toggle, Backspace) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onToggleDirection();
            sound.playKeyClick();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>
            {activeClue?.direction === 'across' ? '세로 방향으로 전환 (Space)' : '가로 방향으로 전환 (Space)'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            onBackspace();
            sound.playKeyClick();
          }}
          className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
        >
          <Delete className="w-3.5 h-3.5" />
          <span>한 글자 지우기</span>
        </button>
      </div>
    </div>
  );
};
