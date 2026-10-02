import React from 'react';
import { Volume2, VolumeX, BookOpen, Award, Layers } from 'lucide-react';
import { sound } from '../utils/audio';
import { PlayerStats } from '../types/game';
import { getRankByExp } from '../data/stages';

interface TopNavProps {
  currentView: 'stage-select' | 'game' | 'dictionary' | 'achievements';
  onNavigate: (view: 'stage-select' | 'dictionary' | 'achievements') => void;
  playerStats: PlayerStats;
  isMuted: boolean;
  onToggleMute: () => void;
  activeStageTitle?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onNavigate,
  playerStats,
  isMuted,
  onToggleMute,
  activeStageTitle
}) => {
  const rank = getRankByExp(playerStats.exp);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('stage-select')}
            className="text-left group cursor-pointer focus:outline-hidden"
          >
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-indigo-900 group-hover:text-indigo-600 transition-colors">
                중3 국어 십자말풀이
              </span>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                교육과정 연계
              </span>
            </div>
            {activeStageTitle && currentView === 'game' && (
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                {activeStageTitle}
              </p>
            )}
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('stage-select')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentView === 'stage-select'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>단원 선택</span>
          </button>

          <button
            onClick={() => onNavigate('dictionary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentView === 'dictionary'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>개념 사전</span>
          </button>

          <button
            onClick={() => onNavigate('achievements')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentView === 'achievements'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>업적·칭호</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions and Sound Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Level / Title Indicator */}
          <div className="hidden md:flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Lv.{rank.level} {rank.title}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              EXP {playerStats.exp}점
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              sound.playKeyClick();
            }}
            title={isMuted ? '음소거 해제' : '음소거'}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={isMuted ? '음소거 해제' : '소리 끄기'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
