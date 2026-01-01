const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: String,
});

// Evita OverwriteModelError
module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);
