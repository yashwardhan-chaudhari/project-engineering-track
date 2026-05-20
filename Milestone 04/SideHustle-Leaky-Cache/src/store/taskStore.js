let tasks = [
  {
    id: 1,
    title: 'Create profile listing',
    description: 'Add a user-facing task listing for the SideHustle app.',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Review student requests',
    description: 'Review open tasks and respond to student inquiries.',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

function delay(result) {
  return new Promise((resolve) => setTimeout(() => resolve(result), 10));
}

async function getAllTasks() {
  return delay([...tasks]);
}

async function getTaskById(id) {
  const task = tasks.find((item) => item.id === id);
  return delay(task ? { ...task } : null);
}

async function createTask(data) {
  const nextId = tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;
  const newTask = {
    id: nextId,
    title: data.title,
    description: data.description || '',
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  return delay({ ...newTask });
}

async function updateTask(id, updates) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return delay(null);

  tasks[index] = {
    ...tasks[index],
    title: updates.title !== undefined ? updates.title : tasks[index].title,
    description: updates.description !== undefined ? updates.description : tasks[index].description,
    completed: updates.completed !== undefined ? Boolean(updates.completed) : tasks[index].completed,
  };

  return delay({ ...tasks[index] });
}

async function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return delay(false);
  tasks.splice(index, 1);
  return delay(true);
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
