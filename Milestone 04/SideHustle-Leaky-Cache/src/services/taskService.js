const cacheService = require('./cacheService');
const taskStore = require('../store/taskStore');

const TASK_LIST_KEY = 'tasks:list';
const TASK_KEY = (id) => `task:${id}`;
const CACHE_TTL_MS = 60 * 1000;

async function getTasks() {
  const cached = cacheService.get(TASK_LIST_KEY);
  if (cached) {
    return cached;
  }

  const tasks = await taskStore.getAllTasks();
  cacheService.set(TASK_LIST_KEY, tasks, CACHE_TTL_MS);
  return tasks;
}

async function getTaskById(id) {
  const cacheKey = TASK_KEY(id);
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const task = await taskStore.getTaskById(id);
  if (!task) {
    return null;
  }

  cacheService.set(cacheKey, task, CACHE_TTL_MS);
  return task;
}

async function createTask(taskData) {
  const createdTask = await taskStore.createTask(taskData);
  cacheService.del(TASK_LIST_KEY);
  return createdTask;
}

async function updateTask(id, updates) {
  const updatedTask = await taskStore.updateTask(id, updates);
  if (!updatedTask) {
    return null;
  }

  cacheService.del(TASK_LIST_KEY);
  cacheService.del(TASK_KEY(id));
  return updatedTask;
}

async function deleteTask(id) {
  const deleted = await taskStore.deleteTask(id);
  if (!deleted) {
    return false;
  }

  cacheService.del(TASK_LIST_KEY);
  cacheService.del(TASK_KEY(id));
  return true;
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
