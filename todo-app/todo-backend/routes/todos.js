const express = require('express')
const { Todo } = require('../mongo')
const router = express.Router()
const redis = require('../redis')

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos)
})

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false,
  })
  let added_todos = await redis.getAsync('added_todos')
  await redis.setAsync('added_todos', JSON.stringify(parseInt(added_todos) + 1))
  res.send(todo)
})

const singleRouter = express.Router()

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()
  res.sendStatus(200)
})

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  try {
    res.status(200).send(req.todo)
  } catch (error) {
    console.log(error)
  }
})

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  const body = req.body
  try {
    const todo = {
      text: body.text,
      done: body.done,
    }
    await Todo.updateOne(req.todo, todo)
    res.status(200).send('updated succesfully')
  } catch (error) {
    console.log(error)
  }
})

router.use('/:id', findByIdMiddleware, singleRouter)

module.exports = router
