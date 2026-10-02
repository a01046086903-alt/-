import React from 'react';
import {
  Award,
  Crown,
  Zap,
  BookOpen,
  Search,
  CheckCircle,
  Bookmark,
  Feather,
  Lock,
  Star
} from 'lucide-react';
import { PlayerStats, Achievement } from '../types/game';
import { INITIAL_ACHIEVEMENTS, getRankByExp, LEVEL_RANKS } from '../data/stages';
import { sound } from '../utils/audio';

interface AchievementsModalProps {
  playerStats: PlayerStats;
  onBackToGame: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  playerStats,
  onBackToGame
}) => {
  const rank = getRankByExp(playerStats.exp);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Feather':
        return <Feather className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Award':
        return <Award className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Search':
        return <Search className="w-5 h-5" />;
      case 'CheckCircle':
        return <CheckCircle className="w-5 h-5" />;
      case 'Bookmark':
        return <Bookmark className="w-5 h-5" />;
      case 'Crown':
      default:
        return <Crown className="w-5 h-5" />;
    }
  };

  // Total stars calculated
  const totalStars = Object.values(playerStats.stars).reduce((acc, s) => acc + s, 0);

  // Progress percentage
  const currentLevelMin = rank.minExp;
  const nextLevelMin = rank.nextMinExp;
  const progressPercent = Math.min(
    100,
    Math.round(((playerStats.exp - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Player Profile & Level Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar Seal */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md">
            <Crown className="w-10 h-10" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                Lv.{rank.level}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {rank.title}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              대한민국 중학교 3학년 국어 교육과정을 탐구하는 열정적인 학습자
            </p>

            {/* EXP Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>경험치 진행도</span>
                <span className="font-mono">
                  {playerStats.exp} / {rank.nextMinExp} EXP
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-center">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 block mb-0.5">
              획득한 별점
            </span>
            <div className="flex items-center justify-center gap-1 text-amber-500 font-extrabold text-base">
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
              <span>{totalStars} / 15</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 block mb-0.5">
              정복한 단원
            </span>
            <span className="text-base font-extrabold text-slate-800">
              {playerStats.completedStages.length} / 5개
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 block mb-0.5">
              완성한 낱말
            </span>
            <span className="text-base font-extrabold text-indigo-700">
              {playerStats.solvedWordIds.length}개
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 block mb-0.5">
              최고 정답 콤보
            </span>
            <span className="text-base font-extrabold text-emerald-600">
              {playerStats.maxCombo}연속
            </span>
          </div>
        </div>
      </div>

      {/* Badges and Achievements Grid */}
      <div className="mb-8">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <span>학습 업적 뱃지</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INITIAL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = playerStats.unlockedAchievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-white border-amber-200/80 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-100 text-amber-600 border border-amber-200'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isUnlocked ? getIcon(ach.icon) : <Lock className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {ach.title}
                    </h4>
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        달성 완료
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">
                        도전 중
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level System Roadmap */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-8">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          중3 국어 칭호 등급표
        </h4>
        <div className="space-y-2">
          {LEVEL_RANKS.map((r) => {
            const isReached = playerStats.exp >= r.minExp;
            const isCurrent = rank.level === r.level;

            return (
              <div
                key={r.level}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                  isCurrent
                    ? 'bg-indigo-50 border-indigo-300 font-bold text-indigo-950'
                    : isReached
                    ? 'bg-white border-slate-200 text-slate-700 font-medium'
                    : 'bg-transparent border-transparent text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 text-center font-mono">Lv.{r.level}</span>
                  <span>{r.title}</span>
                  {isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold ml-1">
                      현재 칭호
                    </span>
                  )}
                </div>
                <span className="font-mono">{r.minExp} EXP</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => {
            onBackToGame();
            sound.playKeyClick();
          }}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors cursor-pointer"
        >
          십자말풀이 게임으로 돌아가기
        </button>
      </div>
    </div>
  );
};
