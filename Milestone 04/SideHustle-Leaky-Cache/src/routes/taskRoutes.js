const express = require('express');
const taskService = require('../services/taskService');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const tasks = await taskService.getTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Task id must be a positive integer' });
    }

    const task = await taskService.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required and must be a string' });
    }

    const task = await taskService.createTask({ title, description });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Task id must be a positive integer' });
    }

    const { title, description, completed } = req.body;
    const task = await taskService.updateTask(id, { title, description, completed });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Task id must be a positive integer' });
    }

    const deleted = await taskService.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
