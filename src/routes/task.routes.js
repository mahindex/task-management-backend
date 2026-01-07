import mongoose from 'mongoose';
import express from 'express';
import Task from '../models/Task.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'DONE'];

/* ================= ADMIN ROUTES ================= */

// Admin - Create task
router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json(task);
  })
);

// Admin - View all tasks
router.get(
  '/',
  authMiddleware,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name email');

    res.json(tasks);
  })
);

// Admin - Update task
router.put(
  '/:id',
  authMiddleware,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const allowedUpdates = [
      'title',
      'description',
      'priority',
      'deadline',
      'assignedTo',
      'status',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  })
);

// Admin - Delete task
router.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  })
);

/* ================= EMPLOYEE ROUTES ================= */

// Employee - My tasks
router.get(
  '/my',
  authMiddleware,
  requireRole('EMPLOYEE'),
  asyncHandler(async (req, res) => {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .select('-comments.author');

    res.json(tasks);
  })
);

// Employee - Update status
router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('EMPLOYEE'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    task.status = status;
    await task.save();

    res.json({ status: task.status });
  })
);

// Employee - Add comment
router.post(
  '/:id/comments',
  authMiddleware,
  requireRole('EMPLOYEE'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    task.comments.push({
      text,
      author: req.user.id,
    });

    await task.save();

    res.status(201).json({ message: 'Comment added successfully' });
  })
);

export default router;
