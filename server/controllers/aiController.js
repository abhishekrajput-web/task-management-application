import Task from '../models/Task.js';
import {
  getProductivitySuggestion,
  improveTaskWithAI,
  breakdownTaskWithAI,
} from '../services/geminiServices.js';


export const getSuggestion = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const result = await getProductivitySuggestion(tasks);
    return res.status(200).json(result);
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get AI suggestion',
      error: error.message,
    });
  }
};


export const improveTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return res.status(400).json({ success: false, message: 'taskId is required' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const result = await improveTaskWithAI(task);
    return res.status(200).json(result);
  } catch (error) {
    console.error('AI Improve Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to improve task',
      error: error.message,
    });
  }
};

export const breakdownTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return res.status(400).json({ success: false, message: 'taskId is required' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const result = await breakdownTaskWithAI(task);
    return res.status(200).json(result);
  } catch (error) {
    console.error('AI Breakdown Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to breakdown task',
      error: error.message,
    });
  }
};