import React from 'react';
import { Check, ArrowRight, ArrowDown } from 'lucide-react';
import { WordClue } from '../types/game';

interface ClueListProps {
  clues: WordClue[];
  activeClueId?: string;
  solvedWordIds: Set<string>;
  onSelectClue: (clue: WordClue) => void;
}

export const ClueList: React.FC<ClueListProps> = ({
  clues,
  activeClueId,
  solvedWordIds,
  onSelectClue
}) => {
  const acrossClues = clues.filter((c) => c.direction === 'across');
  const downClues = clues.filter((c) => c.direction === 'down');

  const renderClueItem = (clue: WordClue) => {
    const isSolved = solvedWordIds.has(clue.id);
    const isActive = activeClueId === clue.id;

    return (
      <button
        key={clue.id}
        type="button"
        onClick={() => onSelectClue(clue)}
        className={`w-full text-left p-2.5 sm:p-3 rounded-xl border text-sm transition-all cursor-pointer ${
          isActive
            ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400 shadow-xs'
            : isSolved
            ? 'bg-slate-50/80 border-slate-200 text-slate-500'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-800'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <div
            className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
              isActive
                ? 'bg-indigo-600 text-white'
                : isSolved
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isSolved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : clue.number}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[11px] font-semibold text-indigo-700">
                {clue.categoryLabel}
              </span>
              <span className="text-[11px] text-slate-400">·</span>
              <span className="text-[11px] text-slate-500">
                {clue.word.length}글자
              </span>
              {isSolved && (
                <span className="text-[11px] font-bold text-emerald-600 ml-auto">
                  완료 ({clue.word})
                </span>
              )}
            </div>

            <p
              className={`text-xs sm:text-sm font-medium leading-relaxed ${
                isSolved ? 'line-through text-slate-400' : 'text-slate-800'
              }`}
            >
              {clue.clue}
            </p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Across Column */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <div className="p-1 rounded-md bg-indigo-50 text-indigo-700">
            <ArrowRight className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            가로 열쇠
          </h3>
          <span className="ml-auto text-xs text-slate-500 font-medium">
            {acrossClues.filter((c) => solvedWordIds.has(c.id)).length} / {acrossClues.length} 완료
          </span>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {acrossClues.map(renderClueItem)}
        </div>
      </div>

      {/* Down Column */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <div className="p-1 rounded-md bg-indigo-50 text-indigo-700">
            <ArrowDown className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            세로 열쇠
          </h3>
          <span className="ml-auto text-xs text-slate-500 font-medium">
            {downClues.filter((c) => solvedWordIds.has(c.id)).length} / {downClues.length} 완료
          </span>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {downClues.map(renderClueItem)}
        </div>
      </div>
    </div>
  );
};
