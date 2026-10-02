import React from 'react';
import { ArrowRight, ArrowDown, HelpCircle, Sparkles, BookOpen, ArrowLeftRight } from 'lucide-react';
import { WordClue } from '../types/game';

interface ActiveClueBannerProps {
  activeClue: WordClue | null;
  onToggleDirection: () => void;
  onOpenHintModal: (tab: 'consonant' | 'textbook' | 'reveal') => void;
  revealedConsonants: { [clueId: string]: boolean };
  combo: number;
}

export const ActiveClueBanner: React.FC<ActiveClueBannerProps> = ({
  activeClue,
  onToggleDirection,
  onOpenHintModal,
  revealedConsonants,
  combo
}) => {
  if (!activeClue) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-center text-slate-500 text-sm">
        십자말풀이 칸이나 아래의 문제(열쇠) 목록을 클릭하여 풀이를 시작하세요.
      </div>
    );
  }

  const isAcross = activeClue.direction === 'across';
  const hasConsonantRevealed = revealedConsonants[activeClue.id];

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 sm:p-5 shadow-xs transition-all relative overflow-hidden">
      {/* Combo badge floating on top right if combo >= 2 */}
      {combo >= 2 && (
        <div className="absolute top-2 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-xs animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{combo}연속 콤보!</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {/* Direction toggle button */}
          <button
            onClick={onToggleDirection}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              isAcross
                ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
            }`}
            title="방향 전환 (스페이스바로도 전환 가능)"
          >
            {isAcross ? (
              <>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-700" />
                <span>가로 {activeClue.number}번</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-3.5 h-3.5 text-emerald-700" />
                <span>세로 {activeClue.number}번</span>
              </>
            )}
            <ArrowLeftRight className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          <span className="text-xs font-medium text-slate-500">
            {activeClue.categoryLabel}
          </span>
          <span className="text-xs text-slate-300">|</span>
          <span className="text-xs font-semibold text-slate-600">
            {activeClue.word.length}글자
          </span>

          {hasConsonantRevealed && (
            <span className="ml-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              초성: {activeClue.consonants}
            </span>
          )}
        </div>

        {/* Quick Hint Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => onOpenHintModal('consonant')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border border-slate-200 hover:border-indigo-200"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>초성 힌트</span>
          </button>

          <button
            onClick={() => onOpenHintModal('textbook')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-slate-200 hover:border-emerald-200"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>교과서 팁</span>
          </button>

          <button
            onClick={() => onOpenHintModal('reveal')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer border border-amber-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>한 글자 열기</span>
          </button>
        </div>
      </div>

      {/* Clue Question Text */}
      <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
        {activeClue.clue}
      </p>
    </div>
  );
};
