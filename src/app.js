// Quiz Arena — Game Logic
// Fetches question data from data/questions.json on init.

;(async () => {
  'use strict'

  const {
    questions: QUESTIONS,
    categories: CATEGORIES,
    difficulties: DIFFICULTIES
  } = await fetch('data/questions.json').then((r) => r.json())

  // ── Constants ────────────────────────────────────────────────────────────
  const POINTS_PER_QUESTION = 10
  const QUESTIONS_PER_GAME = 10
  const STREAK_2X_THRESHOLD = 3
  const STREAK_3X_THRESHOLD = 5
  const LEADERBOARD_KEY = 'quizArenaLeaderboard'
  const LEADERBOARD_MAX = 10

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    results: document.getElementById('results-screen'),
    review: document.getElementById('review-screen'),
    leaderboard: document.getElementById('leaderboard-screen')
  }

  const el = {
    // Start
    playerName: document.getElementById('player-name'),
    categoryGrid: document.getElementById('category-grid'),
    difficultyGrid: document.getElementById('difficulty-grid'),
    startBtn: document.getElementById('start-btn'),
    viewLeaderboardBtn: document.getElementById('view-leaderboard-btn'),

    // Game
    questionCounter: document.getElementById('question-counter'),
    progressFill: document.getElementById('progress-fill'),
    streakBadge: document.getElementById('streak-badge'),
    streakCount: document.getElementById('streak-count'),
    streakMultiplier: document.getElementById('streak-multiplier'),
    scoreValue: document.getElementById('score-value'),
    timerFill: document.getElementById('timer-fill'),
    timerNumber: document.getElementById('timer-number'),
    questionCard: document.getElementById('question-card'),
    questionCategory: document.getElementById('question-category'),
    questionText: document.getElementById('question-text'),
    answersGrid: document.getElementById('answers-grid'),
    answerBtns: Array.from(document.querySelectorAll('.btn-answer')),

    // Results
    resultsTrophy: document.getElementById('results-trophy'),
    resultsTitle: document.getElementById('results-title'),
    resultsSubtitle: document.getElementById('results-subtitle'),
    statScore: document.getElementById('stat-score'),
    statAccuracy: document.getElementById('stat-accuracy'),
    statTime: document.getElementById('stat-time'),
    statStreak: document.getElementById('stat-streak'),
    playAgainBtn: document.getElementById('play-again-btn'),
    resultsReviewBtn: document.getElementById('results-review-btn'),
    resultsLeaderboardBtn: document.getElementById('results-leaderboard-btn'),
    confettiCanvas: document.getElementById('confetti-canvas'),

    // Review
    reviewSubtitle: document.getElementById('review-subtitle'),
    reviewList: document.getElementById('review-list'),
    reviewBackBtn: document.getElementById('review-back-btn'),
    reviewPlayAgainBtn: document.getElementById('review-play-again-btn'),

    // Leaderboard
    leaderboardList: document.getElementById('leaderboard-list'),
    lbBackBtn: document.getElementById('lb-back-btn'),
    lbClearBtn: document.getElementById('lb-clear-btn')
  }

  // ── GameState ─────────────────────────────────────────────────────────────
  let state = {
    questions: [],
    current: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    startTime: null,
    questionStartTime: null,
    timer: null,
    timerDuration: 15,
    playerName: '',
    category: 'mix',
    difficulty: 'medium',
    answers: [],
    answered: false,
    prevScreen: 'start'
  }

  // ── Utility ───────────────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove('active'))
    screens[name].classList.add('active')
  }

  function categoryLabel(id) {
    const cat = CATEGORIES.find((c) => c.id === id)
    return cat ? cat.label : id
  }

  function difficultySeconds(id) {
    const diff = DIFFICULTIES.find((d) => d.id === id)
    return diff ? diff.seconds : 15
  }

  function formatTime(ms) {
    const s = Math.round(ms / 1000)
    if (s < 60) return `${s}s`
    return `${Math.floor(s / 60)}m ${s % 60}s`
  }

  function getMultiplier(streak) {
    if (streak >= STREAK_3X_THRESHOLD) return 3
    if (streak >= STREAK_2X_THRESHOLD) return 2
    return 1
  }

  // ── Leaderboard helpers ───────────────────────────────────────────────────
  function loadLeaderboard() {
    try {
      return JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || []
    } catch {
      return []
    }
  }

  function saveToLeaderboard(entry) {
    const board = loadLeaderboard()
    board.push(entry)
    board.sort((a, b) => b.score - a.score)
    board.splice(LEADERBOARD_MAX)
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board))
  }

  // ── Build Start Screen ────────────────────────────────────────────────────
  function buildStartScreen() {
    el.categoryGrid.innerHTML = ''
    CATEGORIES.forEach((cat) => {
      const btn = document.createElement('button')
      btn.className = 'option-btn' + (state.category === cat.id ? ' selected' : '')
      btn.dataset.value = cat.id
      btn.innerHTML = `<span class="option-icon">${cat.icon}</span>${cat.label}`
      btn.addEventListener('click', () => {
        state.category = cat.id
        el.categoryGrid
          .querySelectorAll('.option-btn')
          .forEach((b) => b.classList.remove('selected'))
        btn.classList.add('selected')
      })
      el.categoryGrid.appendChild(btn)
    })

    el.difficultyGrid.innerHTML = ''
    DIFFICULTIES.forEach((diff) => {
      const btn = document.createElement('button')
      btn.className = 'option-btn' + (state.difficulty === diff.id ? ' selected' : '')
      btn.dataset.value = diff.id
      btn.innerHTML = `<span class="option-icon">${diff.icon}</span>${diff.label} (${diff.seconds}s)`
      btn.addEventListener('click', () => {
        state.difficulty = diff.id
        el.difficultyGrid
          .querySelectorAll('.option-btn')
          .forEach((b) => b.classList.remove('selected'))
        btn.classList.add('selected')
      })
      el.difficultyGrid.appendChild(btn)
    })
  }

  // ── showStartScreen ───────────────────────────────────────────────────────
  function showStartScreen() {
    buildStartScreen()
    showScreen('start')
  }

  // ── startGame ─────────────────────────────────────────────────────────────
  function startGame() {
    const name = el.playerName.value.trim()
    state.playerName = name || 'Anonymous'

    // Filter questions by category
    let pool =
      state.category === 'mix' ? QUESTIONS : QUESTIONS.filter((q) => q.category === state.category)

    if (pool.length === 0) pool = QUESTIONS

    state.questions = shuffle(pool).slice(0, QUESTIONS_PER_GAME)
    state.current = 0
    state.score = 0
    state.streak = 0
    state.maxStreak = 0
    state.answers = []
    state.timerDuration = difficultySeconds(state.difficulty)
    state.startTime = Date.now()

    showScreen('game')
    showQuestion(0)
  }

  // ── showQuestion ──────────────────────────────────────────────────────────
  function showQuestion(index) {
    clearTimer()
    state.answered = false

    const q = state.questions[index]
    const total = state.questions.length

    // Progress
    el.questionCounter.textContent = `Question ${index + 1} of ${total}`
    el.progressFill.style.width = `${((index + 1) / total) * 100}%`

    // Streak display
    updateStreakDisplay()

    // Score display
    el.scoreValue.textContent = state.score

    // Category label
    const catObj = CATEGORIES.find((c) => c.id === q.category)
    el.questionCategory.textContent = catObj ? `${catObj.icon} ${catObj.label}` : q.category

    // Question text — animate card
    el.questionCard.style.opacity = '0'
    el.questionCard.style.transform = 'translateY(12px)'
    el.questionText.textContent = q.question

    // Shuffle answer order for this display
    const indices = shuffle([0, 1, 2, 3])
    el.answerBtns.forEach((btn, displayPos) => {
      const origIdx = indices[displayPos]
      btn.textContent = q.answers[origIdx]
      btn.dataset.origIndex = origIdx
      btn.className = 'btn btn-answer'
      btn.disabled = false
    })

    // Animate card in
    requestAnimationFrame(() => {
      el.questionCard.style.transition = 'opacity 0.25s ease, transform 0.25s ease'
      el.questionCard.style.opacity = '1'
      el.questionCard.style.transform = 'translateY(0)'
    })

    state.questionStartTime = Date.now()
    startTimer()
  }

  // ── selectAnswer ──────────────────────────────────────────────────────────
  function selectAnswer(btn) {
    if (state.answered) return
    state.answered = true
    clearTimer()

    const q = state.questions[state.current]
    const chosenOrig = parseInt(btn.dataset.origIndex, 10)
    const isCorrect = chosenOrig === q.correct
    const timeUsed = (Date.now() - state.questionStartTime) / 1000

    // Disable all buttons
    el.answerBtns.forEach((b) => (b.disabled = true))

    // Reveal correct answer
    el.answerBtns.forEach((b) => {
      if (parseInt(b.dataset.origIndex, 10) === q.correct) {
        b.classList.add('reveal')
      }
    })

    if (isCorrect) {
      state.streak++
      if (state.streak > state.maxStreak) state.maxStreak = state.streak

      const mult = getMultiplier(state.streak)
      const points = POINTS_PER_QUESTION * mult
      state.score += points

      btn.classList.add('correct')
      showScorePopup(btn, points, mult > 1)
      animateScore()
      updateStreakDisplay()
    } else {
      state.streak = 0
      btn.classList.add('wrong')
      updateStreakDisplay()
    }

    state.answers.push({ correct: isCorrect, timeUsed, chosen: chosenOrig })

    // Advance after brief pause
    setTimeout(() => nextQuestion(), 900)
  }

  // ── tickTimer ─────────────────────────────────────────────────────────────
  function tickTimer() {
    const elapsed = (Date.now() - state.questionStartTime) / 1000
    const remaining = Math.max(0, state.timerDuration - elapsed)
    const pct = (remaining / state.timerDuration) * 100

    el.timerNumber.textContent = Math.ceil(remaining)
    el.timerFill.style.width = `${pct}%`

    // Color transitions
    const isWarn = pct <= 50 && pct > 25
    const isDanger = pct <= 25

    el.timerFill.classList.toggle('warn', isWarn)
    el.timerFill.classList.toggle('danger', isDanger)
    el.timerNumber.classList.toggle('warn', isWarn)
    el.timerNumber.classList.toggle('danger', isDanger)

    if (remaining <= 0) {
      clearTimer()
      // Auto-skip — count as wrong
      if (!state.answered) {
        state.answered = true
        state.streak = 0
        state.answers.push({ correct: false, timeUsed: state.timerDuration, chosen: null })
        updateStreakDisplay()

        // Reveal correct
        el.answerBtns.forEach((b) => {
          b.disabled = true
          if (parseInt(b.dataset.origIndex, 10) === state.questions[state.current].correct) {
            b.classList.add('reveal')
          }
        })

        setTimeout(() => nextQuestion(), 800)
      }
    }
  }

  function startTimer() {
    el.timerFill.style.transition = 'none'
    el.timerFill.style.width = '100%'
    el.timerFill.className = 'timer-fill'
    el.timerNumber.className = 'timer-number'
    el.timerNumber.textContent = state.timerDuration

    // Re-enable smooth transition after reset
    requestAnimationFrame(() => {
      el.timerFill.style.transition = 'width 1s linear, background 0.5s ease'
    })

    state.timer = setInterval(tickTimer, 100)
  }

  function clearTimer() {
    if (state.timer) {
      clearInterval(state.timer)
      state.timer = null
    }
  }

  // ── nextQuestion ──────────────────────────────────────────────────────────
  function nextQuestion() {
    state.current++
    if (state.current < state.questions.length) {
      showQuestion(state.current)
    } else {
      showResults()
    }
  }

  // ── updateStreakDisplay ───────────────────────────────────────────────────
  function updateStreakDisplay() {
    el.streakCount.textContent = state.streak
    const mult = getMultiplier(state.streak)

    el.streakMultiplier.textContent = mult > 1 ? `×${mult}` : ''
    el.streakBadge.classList.remove('hot', 'blazing')

    if (state.streak >= STREAK_3X_THRESHOLD) {
      el.streakBadge.classList.add('blazing')
    } else if (state.streak >= STREAK_2X_THRESHOLD) {
      el.streakBadge.classList.add('hot')
    }
  }

  // ── animateScore ──────────────────────────────────────────────────────────
  function animateScore() {
    el.scoreValue.textContent = state.score
    el.scoreValue.classList.remove('bump')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scoreValue.classList.add('bump')
        setTimeout(() => el.scoreValue.classList.remove('bump'), 150)
      })
    })
  }

  // ── showScorePopup ────────────────────────────────────────────────────────
  function showScorePopup(btn, points, isBonus) {
    const rect = btn.getBoundingClientRect()
    const popup = document.createElement('div')
    popup.className = 'score-popup' + (isBonus ? ' bonus' : '')
    popup.textContent = `+${points}${isBonus ? ' 🔥' : ''}`
    popup.style.left = `${rect.left + rect.width / 2 - 30}px`
    popup.style.top = `${rect.top - 10}px`
    document.body.appendChild(popup)
    setTimeout(() => popup.remove(), 1000)
  }

  // ── showResults ───────────────────────────────────────────────────────────
  function showResults() {
    clearTimer()
    showScreen('results')

    const totalTime = Date.now() - state.startTime
    const correct = state.answers.filter((a) => a.correct).length
    const total = state.answers.length
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

    // Trophy & title
    let trophy = '🏅'
    let title = 'Good effort!'
    if (accuracy === 100) {
      trophy = '🏆'
      title = 'Perfect Score!'
    } else if (accuracy >= 80) {
      trophy = '🥇'
      title = 'Excellent!'
    } else if (accuracy >= 60) {
      trophy = '🥈'
      title = 'Well done!'
    } else if (accuracy >= 40) {
      trophy = '🥉'
      title = 'Keep practicing!'
    }

    el.resultsTrophy.textContent = trophy
    el.resultsTitle.textContent = title
    el.resultsSubtitle.textContent = `${state.playerName} — ${categoryLabel(state.category)} · ${state.difficulty}`
    el.statScore.textContent = state.score
    el.statAccuracy.textContent = `${accuracy}%`
    el.statTime.textContent = formatTime(totalTime)
    el.statStreak.textContent = state.maxStreak

    // Save to leaderboard
    saveToLeaderboard({
      name: state.playerName,
      score: state.score,
      accuracy,
      time: totalTime,
      category: state.category,
      difficulty: state.difficulty,
      date: new Date().toLocaleDateString()
    })

    // Confetti if accuracy >= 60
    if (accuracy >= 60) {
      launchConfetti()
    }
  }

  // ── showLeaderboard ───────────────────────────────────────────────────────
  function showLeaderboard(from) {
    state.prevScreen = from || 'start'
    const board = loadLeaderboard()
    el.leaderboardList.innerHTML = ''

    if (board.length === 0) {
      el.leaderboardList.innerHTML = '<div class="lb-empty">No scores yet. Play a game!</div>'
    } else {
      board.forEach((entry, i) => {
        const row = document.createElement('div')
        row.className = 'lb-row'
        row.style.animationDelay = `${i * 0.05}s`

        const medals = ['🥇', '🥈', '🥉']
        const rankDisplay = medals[i] || `#${i + 1}`

        row.innerHTML = `
          <div class="lb-rank">${rankDisplay}</div>
          <div class="lb-name">${escapeHtml(entry.name)}</div>
          <div class="lb-meta">${entry.accuracy}% · ${entry.date}</div>
          <div class="lb-score">${entry.score}</div>
        `
        el.leaderboardList.appendChild(row)
      })
    }

    showScreen('leaderboard')
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  // ── Confetti ──────────────────────────────────────────────────────────────
  function launchConfetti() {
    const canvas = el.confettiCanvas
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#fb923c']
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      opacity: 1
    }))

    let frame = 0
    const maxFrames = 180

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.rot += p.rotSpeed
        p.vy += 0.05 // gravity
        if (frame > 120) p.opacity -= 0.02

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })

      frame++
      if (frame < maxFrames) {
        requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    requestAnimationFrame(draw)
  }

  // ── showReviewScreen ──────────────────────────────────────────────────────
  function showReviewScreen() {
    const correctCount = state.answers.filter((a) => a.correct).length
    const total = state.answers.length
    el.reviewSubtitle.textContent = `${correctCount} of ${total} correct · ${state.playerName}`

    el.reviewList.innerHTML = ''
    state.questions.forEach((q, i) => {
      const ans = state.answers[i]
      const isTimeout = ans.chosen === null
      const statusClass = ans.correct
        ? 'review-correct'
        : isTimeout
          ? 'review-skipped'
          : 'review-wrong'
      const resultLabel = ans.correct ? '✓ Correct' : isTimeout ? '— Time up' : '✗ Wrong'
      const resultMod = ans.correct ? 'correct' : isTimeout ? 'skipped' : 'wrong'

      const catObj = CATEGORIES.find((c) => c.id === q.category)
      const diffObj = DIFFICULTIES.find((d) => d.id === q.difficulty)

      const answersHtml = q.answers
        .map((text, idx) => {
          let cls = 'review-ans'
          if (idx === q.correct) cls += ' review-ans-correct'
          else if (!isTimeout && idx === ans.chosen) cls += ' review-ans-wrong'
          return `<div class="${cls}">${escapeHtml(text)}</div>`
        })
        .join('')

      const timeLabel = isTimeout ? 'Timed out' : `${ans.timeUsed.toFixed(1)}s`

      const card = document.createElement('div')
      card.className = `review-card ${statusClass}`
      card.style.animationDelay = `${i * 0.04}s`
      card.innerHTML = `
        <div class="review-card-top">
          <span class="review-q-num">Q${i + 1}</span>
          <div class="review-badges">
            <span class="review-badge">${catObj ? catObj.icon + ' ' + catObj.label : q.category}</span>
            <span class="review-badge review-diff-${q.difficulty}">${diffObj ? diffObj.label : q.difficulty}</span>
          </div>
          <span class="review-result review-result-${resultMod}">${resultLabel}</span>
        </div>
        <p class="review-question">${escapeHtml(q.question)}</p>
        <div class="review-answers">${answersHtml}</div>
        ${q.explanation ? `<p class="review-explanation">${escapeHtml(q.explanation)}</p>` : ''}
        <div class="review-time">⏱ ${timeLabel}</div>
      `
      el.reviewList.appendChild(card)
    })

    showScreen('review')
  }

  // ── Event Listeners ───────────────────────────────────────────────────────
  el.startBtn.addEventListener('click', startGame)

  el.viewLeaderboardBtn.addEventListener('click', () => showLeaderboard('start'))

  el.answerBtns.forEach((btn) => {
    btn.addEventListener('click', () => selectAnswer(btn))
  })

  el.playAgainBtn.addEventListener('click', () => {
    showStartScreen()
  })

  el.resultsReviewBtn.addEventListener('click', () => showReviewScreen())

  el.resultsLeaderboardBtn.addEventListener('click', () => showLeaderboard('results'))

  el.reviewBackBtn.addEventListener('click', () => showScreen('results'))

  el.reviewPlayAgainBtn.addEventListener('click', () => showStartScreen())

  el.lbBackBtn.addEventListener('click', () => {
    if (state.prevScreen === 'results') {
      showScreen('results')
    } else {
      showStartScreen()
    }
  })

  el.lbClearBtn.addEventListener('click', () => {
    if (confirm('Clear all leaderboard scores?')) {
      localStorage.removeItem(LEADERBOARD_KEY)
      showLeaderboard(state.prevScreen)
    }
  })

  // Allow pressing Enter on name field to start
  el.playerName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startGame()
  })

  // Resize confetti canvas on window resize
  window.addEventListener('resize', () => {
    el.confettiCanvas.width = window.innerWidth
    el.confettiCanvas.height = window.innerHeight
  })

  // ── Init ──────────────────────────────────────────────────────────────────
  showStartScreen()
})()
