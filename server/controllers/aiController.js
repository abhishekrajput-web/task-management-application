import Task from '../models/Task.js';
import {
  getProductivitySuggestion,
  improveTaskWithAI,
  breakdownTaskWithAI,
  parseBrainDumpWithAI,
  getEnergyBasedSuggestions,
  doTaskForMe,
  getDailyReflection,
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

// NEW: Brain Dump Parser
export const parseBrainDump = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    const result = await parseBrainDumpWithAI(text);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Brain Dump Parse Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to parse brain dump',
      error: error.message,
    });
  }
};

// NEW: Energy-Based Suggestions
export const energySuggestions = async (req, res) => {
  try {
    const { energyLevel } = req.body; // 'low', 'medium', 'high'
    if (!energyLevel) {
      return res.status(400).json({ success: false, message: 'Energy level is required' });
    }

    const tasks = await Task.find({ userId: req.user.id, status: 'Pending' }).sort({ dueDate: 1 });
    const result = await getEnergyBasedSuggestions(tasks, energyLevel);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Energy Suggestions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get energy-based suggestions',
      error: error.message,
    });
  }
};

// NEW: Do It For Me
export const doItForMe = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return res.status(400).json({ success: false, message: 'taskId is required' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const result = await doTaskForMe(task);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Do It For Me Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete task with AI',
      error: error.message,
    });
  }
};

// NEW: Daily Reflection
export const dailyReflection = async (req, res) => {
  try {
    const { completedToday, blockers, productivityRating } = req.body;
    
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const result = await getDailyReflection(tasks, { completedToday, blockers, productivityRating });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Daily Reflection Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get daily reflection',
      error: error.message,
    });
  }
};