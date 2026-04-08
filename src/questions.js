// Quiz Arena — Question Bank
// Each question: { id, category, difficulty, question, answers: [string x4], correct: 0-3 }

const QUESTIONS = [
  // ── Claude AI / Claude Code ──────────────────────────────────────────────
  {
    id: 1,
    category: 'claude',
    difficulty: 'easy',
    question: 'What company created Claude?',
    answers: ['OpenAI', 'Google DeepMind', 'Anthropic', 'Meta AI'],
    correct: 2
  },
  {
    id: 2,
    category: 'claude',
    difficulty: 'medium',
    question: 'What command initializes a CLAUDE.md file in Claude Code?',
    answers: ['/start', '/init', '/setup', '/config'],
    correct: 1
  },
  {
    id: 3,
    category: 'claude',
    difficulty: 'medium',
    question: "What does MCP stand for in Claude's context?",
    answers: [
      'Multi-Channel Processing',
      'Machine Compute Protocol',
      'Model Context Protocol',
      'Managed Cloud Platform'
    ],
    correct: 2
  },
  {
    id: 4,
    category: 'claude',
    difficulty: 'easy',
    question: 'Which Claude model tier is optimized for speed and efficiency?',
    answers: ['Opus', 'Sonnet', 'Haiku', 'Maestro'],
    correct: 2
  },
  {
    id: 5,
    category: 'claude',
    difficulty: 'hard',
    question: 'What file does Claude Code read first for project-specific instructions?',
    answers: ['README.md', '.clauderc', 'CLAUDE.md', 'claude.config.json'],
    correct: 2
  },
  {
    id: 6,
    category: 'claude',
    difficulty: 'hard',
    question: 'Claude was primarily designed around which safety principle?',
    answers: [
      'Capability maximization',
      'Constitutional AI',
      'Reinforcement from human feedback only',
      'Chain-of-thought suppression'
    ],
    correct: 1
  },

  // ── Game Design ──────────────────────────────────────────────────────────
  {
    id: 7,
    category: 'gamedesign',
    difficulty: 'medium',
    question: 'What does "game feel" refer to?',
    answers: [
      'The overall narrative tone of a game',
      'The tactile sensation and responsiveness of controls',
      'How a game is physically packaged',
      'The difficulty curve of a game'
    ],
    correct: 1
  },
  {
    id: 8,
    category: 'gamedesign',
    difficulty: 'easy',
    question: 'What is a "game loop"?',
    answers: [
      'A repeating story arc in an RPG',
      'The menu that appears after game over',
      'The cycle of input, update, render that runs every frame',
      'An infinite level with no end state'
    ],
    correct: 2
  },
  {
    id: 9,
    category: 'gamedesign',
    difficulty: 'medium',
    question: 'What is "juice" in game design?',
    answers: [
      'A monetization strategy',
      'Visual/audio feedback that makes actions feel satisfying',
      'The in-game currency system',
      'Frame-rate optimization techniques'
    ],
    correct: 1
  },
  {
    id: 10,
    category: 'gamedesign',
    difficulty: 'hard',
    question: 'What genre pioneered the "health bar" mechanic?',
    answers: ['Role-playing games', 'Platformers', 'Fighting games', "Shoot 'em ups"],
    correct: 2
  },
  {
    id: 11,
    category: 'gamedesign',
    difficulty: 'hard',
    question: 'What term describes the range between the easiest and hardest a game can get?',
    answers: ['Flow channel', 'Difficulty slope', 'Skill ceiling', 'Engagement arc'],
    correct: 0
  },

  // ── Science ──────────────────────────────────────────────────────────────
  {
    id: 12,
    category: 'science',
    difficulty: 'easy',
    question: 'What is the approximate speed of light in a vacuum?',
    answers: ['149,000 km/s', '299,792 km/s', '500,000 km/s', '186,000 km/s'],
    correct: 1
  },
  {
    id: 13,
    category: 'science',
    difficulty: 'easy',
    question: 'How many bones are in the adult human body?',
    answers: ['178', '196', '206', '215'],
    correct: 2
  },
  {
    id: 14,
    category: 'science',
    difficulty: 'easy',
    question: 'What is the chemical symbol for gold?',
    answers: ['Go', 'Gd', 'Gl', 'Au'],
    correct: 3
  },
  {
    id: 15,
    category: 'science',
    difficulty: 'easy',
    question: 'What planet is known as the Red Planet?',
    answers: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
    correct: 2
  },
  {
    id: 16,
    category: 'science',
    difficulty: 'medium',
    question: 'What is the powerhouse of the cell?',
    answers: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'],
    correct: 2
  },
  {
    id: 17,
    category: 'science',
    difficulty: 'hard',
    question: 'What is the atomic number of carbon?',
    answers: ['4', '6', '8', '12'],
    correct: 1
  },

  // ── General Knowledge ────────────────────────────────────────────────────
  {
    id: 18,
    category: 'general',
    difficulty: 'easy',
    question: 'How many sides does a hexagon have?',
    answers: ['5', '6', '7', '8'],
    correct: 1
  },
  {
    id: 19,
    category: 'general',
    difficulty: 'easy',
    question: 'What is the capital of Japan?',
    answers: ['Osaka', 'Kyoto', 'Hiroshima', 'Tokyo'],
    correct: 3
  },
  {
    id: 20,
    category: 'general',
    difficulty: 'medium',
    question: 'In what year did the first iPhone launch?',
    answers: ['2005', '2006', '2007', '2008'],
    correct: 2
  },
  {
    id: 21,
    category: 'general',
    difficulty: 'hard',
    question: 'What programming language was JavaScript originally named?',
    answers: ['LiveScript', 'Mocha', 'JScript', 'ECMAScript'],
    correct: 1
  },
  {
    id: 22,
    category: 'general',
    difficulty: 'medium',
    question: 'How many continents are there on Earth?',
    answers: ['5', '6', '7', '8'],
    correct: 2
  },
  {
    id: 23,
    category: 'general',
    difficulty: 'easy',
    question: 'What is the largest ocean on Earth?',
    answers: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correct: 3
  }
]

// Category metadata used by the UI
const CATEGORIES = [
  { id: 'mix', label: 'Mix (All)', icon: '🎲' },
  { id: 'claude', label: 'Claude AI', icon: '🤖' },
  { id: 'gamedesign', label: 'Game Design', icon: '🎮' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'general', label: 'General Knowledge', icon: '🌍' }
]

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', seconds: 20, icon: '🟢' },
  { id: 'medium', label: 'Medium', seconds: 15, icon: '🟡' },
  { id: 'hard', label: 'Hard', seconds: 10, icon: '🔴' }
]

if (typeof module !== 'undefined') {
  module.exports = { QUESTIONS, CATEGORIES, DIFFICULTIES }
}
