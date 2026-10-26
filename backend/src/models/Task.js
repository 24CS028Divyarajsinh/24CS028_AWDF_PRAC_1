const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 1, maxlength: 160 },
  description: { type: String, default: '', trim: true, maxlength: 3000 },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  deadline: { type: Date, default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

taskSchema.pre('save', function trimTitle(next) {
  if (typeof this.title === 'string') this.title = this.title.trim();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
