import React from 'react';
import { Star, Clock, ArrowRight, CheckCircle2, Sparkles, BookOpen, Layers } from 'lucide-react';
import { StageData, PlayerStats } from '../types/game';
import { STAGES, getRankByExp } from '../data/stages';
import { sound } from '../utils/audio';

interface StageSelectViewProps {
  playerStats: PlayerStats;
  onSelectStage: (stage: StageData) => void;
  onOpenDictionary: () => void;
  onOpenAchievements: () => void;
}

export const StageSelectView: React.FC<StageSelectViewProps> = ({
  playerStats,
  onSelectStage,
  onOpenDictionary,
  onOpenAchievements
}) => {
  const rank = getRankByExp(playerStats.exp);

  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs < 10 ? '0' : ''}${secs}초`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-700/60 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>대한민국 중학교 3학년 국어 교육과정 완벽 반영</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            중3 국어 십자말풀이 마스터
          </h1>

          <p className="text-xs sm:text-sm text-indigo-200 mt-2.5 leading-relaxed">
            문학 이론, 음운 변동과 문법, 비판적 논증, 필수 사자성어까지! 가로세로 낱말을 맞히며 성취감 넘치게 국어 내신과 고등 연계 개념을 완전 정복해보세요.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => {
                onSelectStage(STAGES[0]);
                sound.playKeyClick();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>1단원부터 바로 시작하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onOpenDictionary();
                sound.playKeyClick();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-xs transition-colors cursor-pointer border border-white/15"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>교과서 개념 사전</span>
            </button>
          </div>
        </div>

        {/* Decorative background typography */}
        <div
          className="absolute -right-6 -bottom-8 select-none pointer-events-none opacity-5 text-white font-extrabold text-9xl tracking-widest hidden sm:block"
          aria-hidden="true"
        >
          國語
        </div>
      </div>

      {/* Quick Player Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            현재 칭호
          </span>
          <span className="text-sm sm:text-base font-extrabold text-indigo-900 block truncate">
            {rank.title}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Lv.{rank.level} ({playerStats.exp} EXP)
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            정복한 별점
          </span>
          <div className="flex items-center justify-center gap-1 text-amber-500 font-extrabold text-sm sm:text-base">
            <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
            <span>
              {Object.values(playerStats.stars).reduce((a, b) => a + b, 0)} / 15개
            </span>
          </div>
          <span className="text-[11px] text-slate-500">별 3개 퍼펙트 목표!</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            완성한 낱말 수
          </span>
          <span className="text-sm sm:text-base font-extrabold text-emerald-700 block">
            {playerStats.solvedWordIds.length}개 낱말
          </span>
          <span className="text-[11px] text-slate-500">교과서 핵심 어휘</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            학습 달성도
          </span>
          <span className="text-sm sm:text-base font-extrabold text-slate-800 block">
            {Math.round((playerStats.completedStages.length / STAGES.length) * 100)}% 완료
          </span>
          <span className="text-[11px] text-slate-500">
            {playerStats.completedStages.length} / {STAGES.length}개 단원 정복
          </span>
        </div>
      </div>

      {/* Stage Cards Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>단원별 십자말풀이 스테이지</span>
          </h2>
          <span className="text-xs text-slate-500">
            원하는 단원을 선택해 도전하세요
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STAGES.map((stage) => {
            const isCompleted = playerStats.completedStages.includes(stage.id);
            const stars = playerStats.stars[stage.id] || 0;
            const bestTime = playerStats.bestTime[stage.id];

            return (
              <div
                key={stage.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {stage.gradeBadge}
                    </span>

                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= stars
                              ? 'fill-amber-400 stroke-amber-500'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-indigo-800 font-medium mt-0.5">
                    {stage.subtitle}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {stage.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{stage.clues.length}개 낱말</span>
                    {bestTime && (
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatTime(bestTime)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onSelectStage(stage);
                      sound.playKeyClick();
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>다시 풀기</span>
                      </>
                    ) : (
                      <>
                        <span>도전하기</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
