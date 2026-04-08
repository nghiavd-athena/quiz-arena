'use strict'

// Pure game logic — no DOM, no globals.
// Used by app.js (browser) and tests/run.js (Node.js).

const POINTS_PER_QUESTION = 10
const STREAK_2X_THRESHOLD = 3
const STREAK_3X_THRESHOLD = 5
const LEADERBOARD_MAX = 10

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getMultiplier(streak) {
  if (streak >= STREAK_3X_THRESHOLD) return 3
  if (streak >= STREAK_2X_THRESHOLD) return 2
  return 1
}

function calculatePoints(streak) {
  return POINTS_PER_QUESTION * getMultiplier(streak)
}

function formatTime(ms) {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function calculateAccuracy(answers) {
  if (answers.length === 0) return 0
  const correct = answers.filter((a) => a.correct).length
  return Math.round((correct / answers.length) * 100)
}

function getTrophy(accuracy) {
  if (accuracy === 100) return { trophy: '🏆', title: 'Perfect Score!' }
  if (accuracy >= 80) return { trophy: '🥇', title: 'Excellent!' }
  if (accuracy >= 60) return { trophy: '🥈', title: 'Well done!' }
  if (accuracy >= 40) return { trophy: '🥉', title: 'Keep practicing!' }
  return { trophy: '🏅', title: 'Good effort!' }
}

// Leaderboard helpers — accept a plain array to avoid localStorage coupling
function addToLeaderboard(board, entry) {
  const updated = [...board, entry]
  updated.sort((a, b) => b.score - a.score)
  updated.splice(LEADERBOARD_MAX)
  return updated
}

function filterQuestions(questions, category) {
  if (category === 'mix') return questions
  return questions.filter((q) => q.category === category)
}

function difficultySeconds(difficulties, id) {
  const diff = difficulties.find((d) => d.id === id)
  return diff ? diff.seconds : 15
}

if (typeof module !== 'undefined') {
  module.exports = {
    shuffle,
    getMultiplier,
    calculatePoints,
    formatTime,
    escapeHtml,
    calculateAccuracy,
    getTrophy,
    addToLeaderboard,
    filterQuestions,
    difficultySeconds,
    POINTS_PER_QUESTION,
    STREAK_2X_THRESHOLD,
    STREAK_3X_THRESHOLD,
    LEADERBOARD_MAX
  }
}
