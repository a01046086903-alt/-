import React, { useState, useEffect } from 'react';
import { STAGES } from './data/stages';
import { StageData, WordClue, Direction, PlayerStats } from './types/game';
import { TopNav } from './components/TopNav';
import { ActiveClueBanner } from './components/ActiveClueBanner';
import { CrosswordBoard } from './components/CrosswordBoard';
import { ClueList } from './components/ClueList';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { HintModal } from './components/HintModal';
import { StageClearModal } from './components/StageClearModal';
import { StageSelectView } from './components/StageSelectView';
import { ConceptDictionaryModal } from './components/ConceptDictionaryModal';
import { AchievementsModal } from './components/AchievementsModal';
import { sound } from './utils/audio';

const STORAGE_KEY = 'korean_crossword_player_stats_v1';

export default function App() {
  const [currentView, setCurrentView] = useState<'stage-select' | 'game' | 'dictionary' | 'achievements'>('stage-select');
  const [activeStage, setActiveStage] = useState<StageData>(STAGES[0]);

  // Board state
  const [activeCell, setActiveCell] = useState<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState<Direction>('across');
  const [activeClue, setActiveClue] = useState<WordClue | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [cellKey: string]: string }>({});
  const [solvedWordIds, setSolvedWordIds] = useState<Set<string>>(new Set());
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [revealedConsonants, setRevealedConsonants] = useState<{ [clueId: string]: boolean }>({});

  // Game metrics & Gamification
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isStageClear, setIsStageClear] = useState<boolean>(false);

  // Modals & UI
  const [isHintModalOpen, setIsHintModalOpen] = useState<boolean>(false);
  const [hintModalDefaultTab, setHintModalDefaultTab] = useState<'consonant' | 'textbook' | 'reveal'>('consonant');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // Persistent Player Stats
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return {
      exp: 0,
      level: 1,
      title: '국어 새싹 탐험가',
      stars: {},
      bestTime: {},
      completedStages: [],
      solvedWordIds: [],
      usedHintsCount: 0,
      totalCorrectWords: 0,
      maxCombo: 0,
      unlockedAchievements: []
    };
  });

  // Save player stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playerStats));
    } catch {
      // Storage fallback
    }
  }, [playerStats]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && !isStageClear) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isStageClear]);

  // Start stage helper
  const handleStartStage = (stage: StageData) => {
    setActiveStage(stage);
    setUserAnswers({});
    setSolvedWordIds(new Set());
    setRevealedCells(new Set());
    setRevealedConsonants({});
    setCombo(0);
    setMaxCombo(0);
    setHintsUsed(0);
    setTimeElapsed(0);
    setIsStageClear(false);
    setIsTimerRunning(true);

    // Set initial active clue (first clue)
    if (stage.clues.length > 0) {
      const firstClue = stage.clues[0];
      setActiveClue(firstClue);
      setDirection(firstClue.direction);
      setActiveCell({ x: firstClue.startX, y: firstClue.startY });
    }

    setCurrentView('game');
  };

  // Find clues associated with coordinates
  const getCluesAt = (x: number, y: number, stage: StageData = activeStage) => {
    let acrossClue: WordClue | undefined;
    let downClue: WordClue | undefined;

    stage.clues.forEach((clue) => {
      if (clue.direction === 'across') {
        if (y === clue.startY && x >= clue.startX && x < clue.startX + clue.word.length) {
          acrossClue = clue;
        }
      } else {
        if (x === clue.startX && y >= clue.startY && y < clue.startY + clue.word.length) {
          downClue = clue;
        }
      }
    });

    return { acrossClue, downClue };
  };

  // Check if (x, y) is inside a specific clue
  const isCellInClue = (x: number, y: number, clue: WordClue): boolean => {
    if (clue.direction === 'across') {
      return y === clue.startY && x >= clue.startX && x < clue.startX + clue.word.length;
    } else {
      return x === clue.startX && y >= clue.startY && y < clue.startY + clue.word.length;
    }
  };

  // Select cell on board with intelligent orientation handling
  const handleSelectCell = (x: number, y: number) => {
    const { acrossClue, downClue } = getCluesAt(x, y);
    if (!acrossClue && !downClue) return;

    // Case 1: Clicking the exact currently active cell again -> Toggle orientation if both exist!
    if (activeCell && activeCell.x === x && activeCell.y === y) {
      if (acrossClue && downClue) {
        handleToggleDirection();
        return;
      }
    }

    // Case 2: If clicking a cell that belongs to the CURRENT active clue -> KEEP current clue & direction!
    if (activeClue && isCellInClue(x, y, activeClue)) {
      setActiveCell({ x, y });
      sound.playKeyClick();
      return;
    }

    // Case 3: Outside current clue:
    // If cell is the start of a down clue and not an across clue start, prioritize down!
    const isStartOfDown = downClue && downClue.startX === x && downClue.startY === y;
    const isStartOfAcross = acrossClue && acrossClue.startX === x && acrossClue.startY === y;

    setActiveCell({ x, y });

    if (isStartOfDown && !isStartOfAcross) {
      setDirection('down');
      setActiveClue(downClue);
    } else if (isStartOfAcross && !isStartOfDown) {
      setDirection('across');
      setActiveClue(acrossClue);
    } else {
      // Respect current direction if that clue exists at this cell
      if (direction === 'down' && downClue) {
        setActiveClue(downClue);
      } else if (direction === 'across' && acrossClue) {
        setActiveClue(acrossClue);
      } else if (downClue) {
        setDirection('down');
        setActiveClue(downClue);
      } else if (acrossClue) {
        setDirection('across');
        setActiveClue(acrossClue);
      }
    }

    sound.playKeyClick();
  };

  // Toggle direction between across and down
  const handleToggleDirection = () => {
    if (!activeCell) return;
    const { acrossClue, downClue } = getCluesAt(activeCell.x, activeCell.y);

    if (activeClue?.direction === 'across' && downClue) {
      setDirection('down');
      setActiveClue(downClue);
      sound.playKeyClick();
    } else if (activeClue?.direction === 'down' && acrossClue) {
      setDirection('across');
      setActiveClue(acrossClue);
      sound.playKeyClick();
    } else {
      // If cell only has one orientation, toggle to nearest clue in the other direction!
      const targetDir: Direction = activeClue?.direction === 'across' ? 'down' : 'across';
      const candidateClue = activeStage.clues.find(
        (c) => c.direction === targetDir && !solvedWordIds.has(c.id)
      ) || activeStage.clues.find((c) => c.direction === targetDir);

      if (candidateClue) {
        handleSelectClue(candidateClue);
      }
    }
  };

  // Select clue directly from list
  const handleSelectClue = (clue: WordClue) => {
    setActiveClue(clue);
    setDirection(clue.direction);

    // Find first unfilled cell in this clue
    let targetX = clue.startX;
    let targetY = clue.startY;

    for (let i = 0; i < clue.word.length; i++) {
      const cx = clue.direction === 'across' ? clue.startX + i : clue.startX;
      const cy = clue.direction === 'across' ? clue.startY : clue.startY + i;
      const key = `${cx},${cy}`;
      if (!userAnswers[key]) {
        targetX = cx;
        targetY = cy;
        break;
      }
    }

    setActiveCell({ x: targetX, y: targetY });
    sound.playKeyClick();
  };

  // Check if a word is correctly solved
  const checkWordSolved = (
    clue: WordClue,
    answers: { [key: string]: string },
    revealed: Set<string>
  ): boolean => {
    for (let i = 0; i < clue.word.length; i++) {
      const cx = clue.direction === 'across' ? clue.startX + i : clue.startX;
      const cy = clue.direction === 'across' ? clue.startY : clue.startY + i;
      const key = `${cx},${cy}`;
      const char = answers[key] || (revealed.has(key) ? clue.word[i] : '');
      if (char !== clue.word[i]) {
        return false;
      }
    }
    return true;
  };

  // Check achievements after solving words
  const updateAchievements = (
    newSolvedWordIds: Set<string>,
    currentCombo: number,
    hints: number,
    isStageFinished: boolean
  ) => {
    setPlayerStats((prev) => {
      const unlocked = new Set(prev.unlockedAchievements);

      // 1. First word solved
      if (newSolvedWordIds.size >= 1) {
        unlocked.add('ach-first-word');
      }

      // 2. Combo 3
      if (currentCombo >= 3) {
        unlocked.add('ach-combo-3');
      }

      // 3. Stage completed achievements
      if (isStageFinished) {
        if (hints === 0) {
          unlocked.add('ach-no-hint');
        }
        if (activeStage.id === 'stage-1') unlocked.add('ach-stage-1');
        if (activeStage.id === 'stage-2') unlocked.add('ach-stage-2');
        if (activeStage.id === 'stage-3') unlocked.add('ach-stage-3');
        if (activeStage.id === 'stage-4') unlocked.add('ach-stage-4');

        // Check if all 5 stages completed
        const completed = new Set([...prev.completedStages, activeStage.id]);
        if (completed.size >= 5) {
          unlocked.add('ach-all-clear');
        }
      }

      return {
        ...prev,
        unlockedAchievements: Array.from(unlocked)
      };
    });
  };

  // Smart cursor advancement: skips over already filled cells
  const advanceCursor = (currentX: number, currentY: number, currentAnswers: { [key: string]: string }) => {
    if (!activeClue) return;
    const clueLen = activeClue.word.length;

    const currentOffset = activeClue.direction === 'across'
      ? currentX - activeClue.startX
      : currentY - activeClue.startY;

    let targetOffset = -1;

    // First, look for any remaining empty cell after current cell in this word
    for (let offset = currentOffset + 1; offset < clueLen; offset++) {
      const cx = activeClue.direction === 'across' ? activeClue.startX + offset : activeClue.startX;
      const cy = activeClue.direction === 'across' ? activeClue.startY : activeClue.startY + offset;
      const key = `${cx},${cy}`;
      if (!currentAnswers[key]) {
        targetOffset = offset;
        break;
      }
    }

    if (targetOffset !== -1) {
      const nextX = activeClue.direction === 'across' ? activeClue.startX + targetOffset : activeClue.startX;
      const nextY = activeClue.direction === 'across' ? activeClue.startY : activeClue.startY + targetOffset;
      setActiveCell({ x: nextX, y: nextY });
    } else {
      // If no unfilled cell after, stay on current cell or move to immediately next if within bounds
      if (currentOffset + 1 < clueLen) {
        const nextX = activeClue.direction === 'across' ? currentX + 1 : currentX;
        const nextY = activeClue.direction === 'down' ? currentY + 1 : currentY;
        setActiveCell({ x: nextX, y: nextY });
      }
    }
  };

  // Backspace handler
  const handleBackspace = () => {
    if (!activeCell) return;
    const key = `${activeCell.x},${activeCell.y}`;

    // If cell has an answer, remove it
    if (userAnswers[key]) {
      setUserAnswers((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      // Step cursor back 1 cell in current direction
      if (activeClue) {
        if (activeClue.direction === 'across') {
          const prevX = activeCell.x - 1;
          if (prevX >= activeClue.startX) {
            setActiveCell({ x: prevX, y: activeCell.y });
            setUserAnswers((prev) => {
              const next = { ...prev };
              delete next[`${prevX},${activeCell.y}`];
              return next;
            });
          }
        } else {
          const prevY = activeCell.y - 1;
          if (prevY >= activeClue.startY) {
            setActiveCell({ x: activeCell.x, y: prevY });
            setUserAnswers((prev) => {
              const next = { ...prev };
              delete next[`${activeCell.x},${prevY}`];
              return next;
            });
          }
        }
      }
    }
  };

  // Arrow key navigation
  const handleNavigateArrow = (dx: number, dy: number) => {
    if (!activeCell) return;
    const nx = Math.max(0, Math.min(activeStage.gridWidth - 1, activeCell.x + dx));
    const ny = Math.max(0, Math.min(activeStage.gridHeight - 1, activeCell.y + dy));
    const { acrossClue, downClue } = getCluesAt(nx, ny);
    if (acrossClue || downClue) {
      handleSelectCell(nx, ny);
    }
  };

  // User inputs a character
  const handleCellInput = (char: string) => {
    if (!activeCell || !activeClue) return;
    const key = `${activeCell.x},${activeCell.y}`;

    const newAnswers = { ...userAnswers, [key]: char };
    setUserAnswers(newAnswers);
    sound.playLetterInput();

    // Check intersecting clues
    const { acrossClue, downClue } = getCluesAt(activeCell.x, activeCell.y);
    const affectedClues = [acrossClue, downClue].filter(Boolean) as WordClue[];

    let newWordSolved = false;
    const nextSolvedWordIds = new Set(solvedWordIds);

    affectedClues.forEach((clue) => {
      if (!solvedWordIds.has(clue.id)) {
        if (checkWordSolved(clue, newAnswers, revealedCells)) {
          nextSolvedWordIds.add(clue.id);
          newWordSolved = true;

          // Copy all characters of the solved word into newAnswers to ensure perfect sync
          for (let i = 0; i < clue.word.length; i++) {
            const cx = clue.direction === 'across' ? clue.startX + i : clue.startX;
            const cy = clue.direction === 'across' ? clue.startY : clue.startY + i;
            newAnswers[`${cx},${cy}`] = clue.word[i];
          }
        }
      }
    });

    if (newWordSolved) {
      setUserAnswers({ ...newAnswers });
      setSolvedWordIds(nextSolvedWordIds);
      const newCombo = combo + 1;
      setCombo(newCombo);
      const newMaxCombo = Math.max(maxCombo, newCombo);
      setMaxCombo(newMaxCombo);

      if (newCombo >= 2) {
        sound.playCombo(newCombo);
      } else {
        sound.playWordComplete();
      }

      // Add EXP and record stats
      setPlayerStats((prev) => ({
        ...prev,
        exp: prev.exp + 25 + newCombo * 5,
        totalCorrectWords: prev.totalCorrectWords + 1,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        solvedWordIds: Array.from(new Set([...prev.solvedWordIds, ...Array.from(nextSolvedWordIds)]))
      }));

      // Check if all clues in stage are now solved!
      const isAllSolved = activeStage.clues.every((c) => nextSolvedWordIds.has(c.id));
      if (isAllSolved) {
        handleStageClear(newMaxCombo);
      } else {
        // Auto-select next unsolved clue
        const nextUnsolved = activeStage.clues.find(
          (c) => c.direction === activeClue.direction && !nextSolvedWordIds.has(c.id)
        ) || activeStage.clues.find((c) => !nextSolvedWordIds.has(c.id));

        if (nextUnsolved) {
          setTimeout(() => {
            handleSelectClue(nextUnsolved);
          }, 350);
        }
      }

      updateAchievements(nextSolvedWordIds, newCombo, hintsUsed, isAllSolved);
    } else {
      // Auto-advance cursor in current word
      advanceCursor(activeCell.x, activeCell.y, newAnswers);
    }
  };

  // Stage clear handler
  const handleStageClear = (finalMaxCombo: number) => {
    setIsStageClear(true);
    setIsTimerRunning(false);
    sound.playStageClear();

    const starsCount = hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;
    const gainedExp = 150 + starsCount * 30 + finalMaxCombo * 10;

    setPlayerStats((prev) => {
      const prevStars = prev.stars[activeStage.id] || 0;
      const prevBest = prev.bestTime[activeStage.id];
      const newBestTime = prevBest ? Math.min(prevBest, timeElapsed) : timeElapsed;

      return {
        ...prev,
        exp: prev.exp + gainedExp,
        stars: {
          ...prev.stars,
          [activeStage.id]: Math.max(prevStars, starsCount)
        },
        bestTime: {
          ...prev.bestTime,
          [activeStage.id]: newBestTime
        },
        completedStages: Array.from(new Set([...prev.completedStages, activeStage.id]))
      };
    });
  };

  // Reveal Consonants Hint
  const handleRevealConsonant = (clueId: string) => {
    setRevealedConsonants((prev) => ({ ...prev, [clueId]: true }));
    setHintsUsed((prev) => prev + 1);
    setPlayerStats((prev) => ({ ...prev, usedHintsCount: prev.usedHintsCount + 1 }));
  };

  // Reveal One Cell Hint
  const handleRevealLetter = (clue: WordClue) => {
    // Find first empty or incorrect cell in clue
    for (let i = 0; i < clue.word.length; i++) {
      const cx = clue.direction === 'across' ? clue.startX + i : clue.startX;
      const cy = clue.direction === 'across' ? clue.startY : clue.startY + i;
      const key = `${cx},${cy}`;
      const expectedChar = clue.word[i];

      if (userAnswers[key] !== expectedChar) {
        const newAnswers = { ...userAnswers, [key]: expectedChar };
        setUserAnswers(newAnswers);
        setRevealedCells((prev) => new Set([...prev, key]));
        setHintsUsed((prev) => prev + 1);
        setPlayerStats((prev) => ({ ...prev, usedHintsCount: prev.usedHintsCount + 1 }));

        // Check if word solved
        if (checkWordSolved(clue, newAnswers, revealedCells)) {
          const nextSolved = new Set([...solvedWordIds, clue.id]);
          setSolvedWordIds(nextSolved);
          sound.playWordComplete();

          const isAllSolved = activeStage.clues.every((c) => nextSolved.has(c.id));
          if (isAllSolved) {
            handleStageClear(maxCombo);
          }
        }
        break;
      }
    }
  };

  // Next stage transition
  const handleNextStage = () => {
    const nextIdx = STAGES.findIndex((s) => s.id === activeStage.id) + 1;
    if (nextIdx < STAGES.length) {
      handleStartStage(STAGES[nextIdx]);
    } else {
      setCurrentView('stage-select');
    }
  };

  // Format MM:SS for HUD
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Bar Contract Compliant Navigation */}
      <TopNav
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'stage-select') {
            setIsTimerRunning(false);
          }
          setCurrentView(view);
        }}
        playerStats={playerStats}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(sound.toggleMute())}
        activeStageTitle={activeStage.title}
      />

      <main className="flex-1">
        {/* VIEW 1: STAGE SELECT */}
        {currentView === 'stage-select' && (
          <StageSelectView
            playerStats={playerStats}
            onSelectStage={handleStartStage}
            onOpenDictionary={() => setCurrentView('dictionary')}
            onOpenAchievements={() => setCurrentView('achievements')}
          />
        )}

        {/* VIEW 2: DICTIONARY / STUDY CARDS */}
        {currentView === 'dictionary' && (
          <ConceptDictionaryModal
            onBackToGame={() => setCurrentView('stage-select')}
            solvedWordIds={new Set(playerStats.solvedWordIds)}
          />
        )}

        {/* VIEW 3: ACHIEVEMENTS & TITLES */}
        {currentView === 'achievements' && (
          <AchievementsModal
            playerStats={playerStats}
            onBackToGame={() => setCurrentView('stage-select')}
          />
        )}

        {/* VIEW 4: ACTIVE CROSSWORD GAME */}
        {currentView === 'game' && (
          <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
            {/* Stage HUD (Timer, Progress, Return Button) */}
            <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('stage-select')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  ← 단원 목록
                </button>
                <div className="hidden sm:block text-xs font-bold text-indigo-900">
                  {activeStage.title}
                </div>
              </div>

              {/* Progress and Timer */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span>정답 진행:</span>
                  <span className="text-indigo-700 font-extrabold text-sm">
                    {solvedWordIds.size} / {activeStage.clues.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono">
                  <span>시간</span>
                  <span className="font-extrabold">{formatTimer(timeElapsed)}</span>
                </div>
              </div>
            </div>

            {/* Active Clue Banner pinned above board */}
            <ActiveClueBanner
              activeClue={activeClue}
              onToggleDirection={handleToggleDirection}
              onOpenHintModal={(tab) => {
                setHintModalDefaultTab(tab);
                setIsHintModalOpen(true);
                sound.playKeyClick();
              }}
              revealedConsonants={revealedConsonants}
              combo={combo}
            />

            {/* Main Interactive Stage Grid */}
            <div className="flex flex-col items-center justify-center py-2 sm:py-4 bg-white/60 rounded-3xl border border-slate-200/80 p-2 sm:p-6 shadow-xs">
              <CrosswordBoard
                gridWidth={activeStage.gridWidth}
                gridHeight={activeStage.gridHeight}
                clues={activeStage.clues}
                activeCell={activeCell}
                activeClue={activeClue}
                direction={direction}
                userAnswers={userAnswers}
                solvedWordIds={solvedWordIds}
                revealedCells={revealedCells}
                onSelectCell={handleSelectCell}
                onCellInput={handleCellInput}
                onBackspace={handleBackspace}
                onNavigateArrow={handleNavigateArrow}
                onToggleDirection={handleToggleDirection}
              />
            </div>

            {/* Virtual On-Screen Korean Keyboard with Random Shuffling */}
            <VirtualKeyboard
              activeClue={activeClue}
              activeCell={activeCell}
              allStageClues={activeStage.clues}
              onInputChar={handleCellInput}
              onBackspace={handleBackspace}
              onToggleDirection={handleToggleDirection}
            />

            {/* Clue List: Across & Down */}
            <ClueList
              clues={activeStage.clues}
              activeClueId={activeClue?.id}
              solvedWordIds={solvedWordIds}
              onSelectClue={handleSelectClue}
            />
          </div>
        )}
      </main>

      {/* Pedagogical Hint Modal */}
      <HintModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        activeClue={activeClue}
        defaultTab={hintModalDefaultTab}
        onRevealConsonant={handleRevealConsonant}
        onRevealLetter={handleRevealLetter}
        hasConsonantRevealed={activeClue ? Boolean(revealedConsonants[activeClue.id]) : false}
      />

      {/* Stage Clear Victory Modal */}
      {isStageClear && (
        <StageClearModal
          stage={activeStage}
          timeElapsed={timeElapsed}
          hintsUsed={hintsUsed}
          maxCombo={maxCombo}
          onNextStage={handleNextStage}
          onRetry={() => handleStartStage(activeStage)}
          onOpenDictionary={() => {
            setIsStageClear(false);
            setCurrentView('dictionary');
          }}
          hasNextStage={
            STAGES.findIndex((s) => s.id === activeStage.id) < STAGES.length - 1
          }
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>대한민국 중학교 3학년 국어 교육과정 연계 십자말풀이 게임</span>
          <span>문학 · 문법 · 읽기/쓰기 · 필수 사자성어 완전 정복</span>
        </div>
      </footer>
    </div>
  );
}
