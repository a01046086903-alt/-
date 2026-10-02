import React, { useState, useMemo } from 'react';
import { Search, BookOpen, CheckCircle, Sparkles, Filter } from 'lucide-react';
import { STAGES } from '../data/stages';
import { WordClue, CategoryType } from '../types/game';
import { sound } from '../utils/audio';

interface ConceptDictionaryModalProps {
  onBackToGame: () => void;
  solvedWordIds: Set<string>;
}

export const ConceptDictionaryModal: React.FC<ConceptDictionaryModalProps> = ({
  onBackToGame,
  solvedWordIds
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Collect all unique clues across all stages
  const allClues = useMemo(() => {
    const map = new Map<string, WordClue>();
    STAGES.forEach((stage) => {
      stage.clues.forEach((clue) => {
        if (!map.has(clue.word)) {
          map.set(clue.word, clue);
        }
      });
    });
    return Array.from(map.values());
  }, []);

  const filteredClues = useMemo(() => {
    return allClues.filter((clue) => {
      const matchesCategory =
        selectedCategory === 'all' || clue.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        clue.word.toLowerCase().includes(q) ||
        clue.clue.toLowerCase().includes(q) ||
        clue.textbookTip.toLowerCase().includes(q) ||
        clue.consonants.replace(/\s+/g, '').includes(q) ||
        clue.categoryLabel.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [allClues, searchQuery, selectedCategory]);

  const categories = [
    { key: 'all', label: '전체' },
    { key: 'literature', label: '문학 갈래·표현' },
    { key: 'grammar', label: '문법·음운 변동' },
    { key: 'reading_logic', label: '읽기·논리와 설득' },
    { key: 'idiom', label: '사자성어·어휘' },
    { key: 'comprehensive', label: '종합' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-700/60 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>중3 국어 교과서 핵심 개념 총정리</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            국어 개념 & 어휘 백과사전
          </h2>
          <p className="text-sm text-indigo-200 mt-2 leading-relaxed">
            십자말풀이에 등장하는 대한민국 중학교 3학년 국어 교육과정의 모든 핵심 문학 이론, 음운 변동 규칙, 논증 기법, 필수 사자성어를 한눈에 학습하세요.
          </p>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="어휘, 초성(예: ㅂㅇㅂ), 개념 설명 검색..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
          />
        </div>

        {/* Category Filter Pills (Functional Filter Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setSelectedCategory(cat.key);
                sound.playKeyClick();
              }}
              className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-4">
        <span>총 {filteredClues.length}개의 교과서 어휘</span>
        <span>
          정복한 어휘: {allClues.filter((c) => solvedWordIds.has(c.id)).length}개
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClues.map((clue) => {
          const isSolved = solvedWordIds.has(clue.id);

          return (
            <div
              key={clue.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {clue.word}
                    </h3>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      초성 {clue.consonants}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {clue.categoryLabel}
                    </span>
                    {isSolved && (
                      <span
                        className="text-emerald-600"
                        title="십자말풀이에서 정답을 맞힌 단어입니다"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Definition */}
                <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {clue.clue}
                </p>

                {/* Textbook Concept Tip */}
                <div className="text-xs text-slate-600 leading-relaxed mb-3">
                  <span className="font-bold text-indigo-900 block mb-0.5">
                    [교과서 핵심 포인트]
                  </span>
                  {clue.textbookTip}
                </div>
              </div>

              {/* Example box */}
              <div className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-2.5 text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold text-amber-950">교과서 예문: </span>
                {clue.example}
              </div>
            </div>
          );
        })}
      </div>

      {filteredClues.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">
            검색 결과에 맞는 어휘가 없습니다.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            다른 검색어나 카테고리를 선택해보세요.
          </p>
        </div>
      )}

      {/* Return to Game Button */}
      <div className="mt-8 text-center">
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
