const express = require('express')
const router = express.Router()
const redis = require('../redis')

const configs = require('../util/config')

let visits = 0
let createdTodos = 0

/* GET index data. */
router.get('/', async (req, res) => {
  visits++
  res.send({
    ...configs,
    visits,
  })
})

router.get('/statistics', async (req, res) => {
  const added_todos = await redis.getAsync('added_todos')
  if (!added_todos) {
    redis.setAsync('added_todos', JSON.stringify(createdTodos))
  } else {
    res.json({ added_todos: added_todos })
  }
})

module.exports = router
