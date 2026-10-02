import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Clock, Zap, Award, ArrowRight, RotateCcw, BookOpen } from 'lucide-react';
import { StageData, PlayerStats } from '../types/game';
import { sound } from '../utils/audio';

interface StageClearModalProps {
  stage: StageData;
  timeElapsed: number; // in seconds
  hintsUsed: number;
  maxCombo: number;
  onNextStage: () => void;
  onRetry: () => void;
  onOpenDictionary: () => void;
  hasNextStage: boolean;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({
  stage,
  timeElapsed,
  hintsUsed,
  maxCombo,
  onNextStage,
  onRetry,
  onOpenDictionary,
  hasNextStage
}) => {
  // Calculate stars:
  // 3 stars if hintsUsed <= 1
  // 2 stars if hintsUsed <= 3
  // 1 star otherwise
  const starsCount = hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;
  const gainedExp = 150 + starsCount * 30 + maxCombo * 10;

  useEffect(() => {
    // Launch celebratory confetti burst!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } catch {
      // Confetti fallback
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs < 10 ? '0' : ''}${secs}초`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
        {/* Celebration Title */}
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mb-3 shadow-xs">
            <Award className="w-9 h-9" />
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 mb-1">
            {stage.gradeBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            스테이지 클리어!
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {stage.title}의 모든 낱말을 성공적으로 맞혔습니다.
          </p>

          {/* Star Rating Display */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((starIdx) => (
              <div
                key={starIdx}
                className={`p-2 rounded-2xl transition-all duration-300 ${
                  starIdx <= starsCount
                    ? 'bg-amber-100 text-amber-500 scale-110 shadow-xs'
                    : 'bg-slate-100 text-slate-300'
                }`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                    starIdx <= starsCount ? 'fill-amber-400 stroke-amber-500' : ''
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Results Metrics Card */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>소요 시간</span>
            </div>
            <span className="text-base sm:text-lg font-extrabold text-slate-800 font-mono">
              {formatTime(timeElapsed)}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>최고 콤보</span>
            </div>
            <span className="text-base sm:text-lg font-extrabold text-indigo-700 font-mono">
              {maxCombo}연속
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              <span>획득 경험치</span>
            </div>
            <span className="text-base sm:text-lg font-extrabold text-emerald-600 font-mono">
              +{gainedExp} EXP
            </span>
          </div>
        </div>

        {/* Learning Review List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>이번 스테이지 핵심 학습 단어 정리</span>
            </h4>
            <span className="text-xs text-slate-400 font-medium">
              총 {stage.clues.length}개 어휘 정복
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-slate-200 rounded-2xl p-2.5 bg-slate-50/50">
            {stage.clues.map((clue) => (
              <div
                key={clue.id}
                className="bg-white p-2.5 rounded-xl border border-slate-200/70 text-left text-xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-extrabold text-indigo-900 text-sm">
                    {clue.word}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {clue.categoryLabel}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {clue.textbookTip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={() => {
              onRetry();
              sound.playKeyClick();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 풀기</span>
          </button>

          <button
            onClick={() => {
              onOpenDictionary();
              sound.playKeyClick();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>개념 사전 보기</span>
          </button>

          {hasNextStage && (
            <button
              onClick={() => {
                onNextStage();
                sound.playKeyClick();
              }}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition-colors cursor-pointer"
            >
              <span>다음 단원 풀기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
