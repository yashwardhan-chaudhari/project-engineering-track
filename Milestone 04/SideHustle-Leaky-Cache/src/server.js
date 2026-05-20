const express = require('express');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(express.json());
app.use('/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SideHustle cache fix server running on port ${PORT}`);
});
