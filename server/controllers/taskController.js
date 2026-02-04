import Task from '../models/Task.js';


export const getTasks = async (req, res) => {
  try {
    const { status, priority, sortBy, search } = req.query;

    const filter = { userId: req.user.id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (search && String(search).trim()) {
      const q = String(search).trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'dueDate') sort = { dueDate: 1 };
    if (sortBy === 'createdAt') sort = { createdAt: -1 };

    const tasks = await Task.find(filter).sort(sort);

    return res.status(200).json({ success: true, data: tasks, count: tasks.length });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get tasks' });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ message: 'Server error fetching task' });
  }
};


export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;

   
    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Please provide title and due date' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      priority: priority || 'Medium',
      dueDate,
      status: status || 'Pending',
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
};


export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

   
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const { title, description, priority, dueDate, status } = req.body;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, priority, dueDate, status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

  
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};


export const toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

   
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
    await task.save();

    res.status(200).json({
      success: true,
      message: `Task marked as ${task.status}`,
      task,
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ message: 'Server error toggling task status' });
  }
};