// Node.js adapter for tests — browser loads data via fetch() in app.js
const data = require('../data/questions.json')
const QUESTIONS = data.questions
const CATEGORIES = data.categories
const DIFFICULTIES = data.difficulties

module.exports = { QUESTIONS, CATEGORIES, DIFFICULTIES }
