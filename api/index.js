const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
require("dotenv").config();

require("./config/db"); // MongoDB
require("./config/auth"); // Passport Google + Local

const User = require("./models/User");
const Task = require("./models/Task");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));
app.set("view engine", "ejs");

// Sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecreto",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// =======================
// Rutas básicas
// =======================
app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.render("login"));
app.get("/home", async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const user = await User.findById(req.user.id);
  res.render("home", { user });
});

// Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => res.redirect("/home")
);
app.get("/auth/logout", (req, res) => {
  req.logout(() => res.redirect("/login"));
});

// =======================
// Rutas de tareas
// =======================

// Lanzar dado para el usuario actual
app.get("/task/random/:dice?", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No logueado" });

  try {
    const user = await User.findById(req.user.id);
    let availableTasks =
      user.assignedTasks && user.assignedTasks.length > 0
        ? user.assignedTasks
        : await Task.find({});
    if (!availableTasks || availableTasks.length === 0)
      return res.json({ task: null });

    const randomIndex = Math.floor(Math.random() * availableTasks.length);
    const task = availableTasks[randomIndex];

    if (!user.tasks.some((t) => t._id.equals(task._id))) {
      user.tasks.push(task);
      await user.save();
    }

    res.json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tarea" });
  }
});

// Lanzar dado por email/familiar
app.get("/task/random-by-email/:email", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No logueado" });

  try {
    const { email } = req.params;
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
    console.error(err);
    res.status(500).json({ error: "Error al obtener tarea" });
  }
});

// Obtener historial
app.get("/user/tasks/:email?", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No logueado" });

  try {
    let user;
    if (req.params.email) {
      user = await User.findOne({ email: req.params.email });
    } else {
      user = await User.findById(req.user.id);
    }
    if (!user) return res.json({ tasks: [] });

    res.json({ tasks: user.tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ tasks: [] });
  }
});

// Borrar historial (propio o de familiar)
app.post("/tasks/clear/:email?", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No logueado" });

  try {
    let user;
    if (req.params.email) {
      user = await User.findOne({ email: req.params.email });
    } else {
      user = await User.findById(req.user.id);
    }

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.tasks = [];
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al borrar historial" });
  }
});

// =======================
// Levantar servidor solo en local
// =======================
if (process.env.NODE_ENV !== "vercel") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
}

// =======================
// Exportar app para Vercel
// =======================
module.exports = app;
