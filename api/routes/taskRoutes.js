/* const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Task = require("../models/Task");

// Lanzar dado para el usuario logueado
router.get("/random/:dice", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No logueado" });

  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    let availableTasks =
      user.assignedTasks && user.assignedTasks.length > 0
        ? user.assignedTasks
        : await Task.find({});

    if (!availableTasks || availableTasks.length === 0)
      return res.json({ task: null });

    const randomIndex = Math.floor(Math.random() * availableTasks.length);
    const task = availableTasks[randomIndex];

    if (!user.tasks.some((t) => t.taskId?.toString() === task._id.toString())) {
      user.tasks.push({
        taskId: task._id,
        title: task.title,
        description: task.description,
      });
      await user.save();
    }

    res.json({ task });
  } catch (err) {
    console.error("Error al obtener tarea:", err.message);
    res.status(500).json({ error: "Error al obtener la tarea" });
  }
});

// Lanzar dado para un familiar por email
router.get("/random-by-email/:email", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No logueado" });

  const email = req.params.email;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ task: null });

    const usedTaskIds = user.tasks.map((t) => t.taskId?.toString());
    if (!user.assignedTasks || user.assignedTasks.length === 0) {
      const newTasks = await Task.find({ _id: { $nin: usedTaskIds } });
      user.assignedTasks = newTasks.map((t) => ({
        taskId: t._id,
        title: t.title,
        description: t.description,
      }));
      await user.save();
    }

    if (!user.assignedTasks || user.assignedTasks.length === 0)
      return res.json({ task: null });

    const randomIndex = Math.floor(Math.random() * user.assignedTasks.length);
    const task = user.assignedTasks[randomIndex];

    user.tasks.push(task);
    user.assignedTasks.splice(randomIndex, 1);
    await user.save();

    res.json({ task });
  } catch (err) {
    console.error("Error al obtener tarea familiar:", err.message);
    res.status(500).json({ error: "Error al obtener tarea" });
  }
});

// Obtener historial de un usuario o familiar
router.get("/user/:email/tasks", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No logueado" });

  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ tasks: [] });
    res.json({ tasks: user.tasks });
  } catch (err) {
    console.error("Error al obtener historial:", err.message);
    res.status(500).json({ tasks: [] });
  }
});

// ========================
// Borrar historial propio o de un familiar
// ========================
router.post("/clear/:email?", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No logueado" });

  try {
    const email = req.params.email;
    let user;

    if (email) {
      user = await User.findOne({ email });
      if (!user)
        return res.status(404).json({ error: "Usuario no encontrado" });
    } else {
      const userId = req.user._id || req.user.id;
      user = await User.findById(userId);
    }

    user.tasks = [];
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Error al borrar historial:", err.message);
    res.status(500).json({ error: "Error al borrar historial" });
  }
});

module.exports = router;
 */
