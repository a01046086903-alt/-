import React from 'react';
import { X, HelpCircle, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { WordClue } from '../types/game';
import { sound } from '../utils/audio';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClue: WordClue | null;
  defaultTab?: 'consonant' | 'textbook' | 'reveal';
  onRevealConsonant: (clueId: string) => void;
  onRevealLetter: (clue: WordClue) => void;
  hasConsonantRevealed: boolean;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  activeClue,
  defaultTab = 'consonant',
  onRevealConsonant,
  onRevealLetter,
  hasConsonantRevealed
}) => {
  const [activeTab, setActiveTab] = React.useState<'consonant' | 'textbook' | 'reveal'>(defaultTab);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  if (!isOpen || !activeClue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                국어 도우미 힌트 연구실
              </h3>
              <p className="text-xs text-slate-500">
                {activeClue.direction === 'across' ? '가로' : '세로'} {activeClue.number}번 · {activeClue.categoryLabel} ({activeClue.word.length}글자)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              sound.playKeyClick();
            }}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('consonant')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'consonant'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>초성 힌트</span>
          </button>

          <button
            onClick={() => setActiveTab('textbook')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'textbook'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>교과서 팁</span>
          </button>

          <button
            onClick={() => setActiveTab('reveal')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'reveal'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>글자 열기</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[160px] flex flex-col justify-center">
          {activeTab === 'consonant' && (
            <div className="text-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col items-center gap-3">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                단어의 첫 자음(초성) 모음
              </span>
              <div className="text-3xl font-extrabold tracking-widest text-indigo-950 font-mono py-1">
                {activeClue.consonants}
              </div>
              <p className="text-xs text-slate-500 max-w-xs">
                각 글자의 첫소리 자음입니다. 교과서에서 배운 어휘를 떠올려보세요!
              </p>
              {!hasConsonantRevealed && (
                <button
                  onClick={() => {
                    onRevealConsonant(activeClue.id);
                    sound.playHint();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  상단 배너에 초성 고정하기
                </button>
              )}
            </div>
          )}

          {activeTab === 'textbook' && (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>중3 교과서 핵심 콕콕 노트</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                {activeClue.textbookTip}
              </p>
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/60 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-emerald-900">교과서 예시: </span>
                {activeClue.example}
              </div>
            </div>
          )}

          {activeTab === 'reveal' && (
            <div className="text-center p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex flex-col items-center gap-3">
              <Sparkles className="w-8 h-8 text-amber-500 animate-spin" />
              <div className="text-sm font-bold text-amber-950">
                아직 채워지지 않은 빈칸 중 1글자를 즉시 열어줍니다.
              </div>
              <p className="text-xs text-slate-500 max-w-xs">
                막혔을 때 한 글자의 힌트로 생각의 실마리를 풀어보세요!
              </p>
              <button
                onClick={() => {
                  onRevealLetter(activeClue);
                  sound.playHint();
                  onClose();
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                한 글자 공개하기
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              onClose();
              sound.playKeyClick();
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
