const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true }, // puede ser null
  displayName: String,
  email: { type: String, unique: true, required: true },
  photo: String,
  tasks: [
    {
      taskId: mongoose.Schema.Types.ObjectId,
      title: String,
      description: String,
    },
  ],
  assignedTasks: [
    {
      taskId: mongoose.Schema.Types.ObjectId,
      title: String,
      description: String,
    },
  ],
  family: [
    {
      email: String,
      name: String, // rol o nombre
    },
  ],
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
