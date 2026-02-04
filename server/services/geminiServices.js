import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = 'gemini-2.5-flash';

const buildPromptFromTasks = (tasks) => {
  const taskData = tasks.map((task) => ({
    title: task.title,
    priority: task.priority,
    status: task.status,
    dueDate: new Date(task.dueDate).toISOString(),
    isOverdue: new Date(task.dueDate) < new Date() && task.status === 'Pending',
  }));

  return [
    'You are a productivity assistant.',
    'Analyze these tasks and provide actionable advice.',
    '',
    `Tasks JSON:\n${JSON.stringify(taskData, null, 2)}`,
    '',
    'Return:',
    '1) Which task to work on FIRST and WHY (priority, due date, overdue)',
    '2) A brief productivity tip (2–3 sentences)',
    '3) A time management suggestion',
    '',
    'Format: bullet points. Be concise and actionable.',
  ].join('\n');
};

const tryParseJsonObject = (text) => {
  if (!text || typeof text !== 'string') return null;

  // 1) direct parse
  try {
    return JSON.parse(text);
  } catch {
    // continue
  }

  // 2) extract first {...} block
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const sliced = text.slice(start, end + 1);
    try {
      return JSON.parse(sliced);
    } catch {
      return null;
    }
  }

  return null;
};

const extractGeminiText = (result) => {
  const t1 = result?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join('');
  if (typeof t1 === 'string' && t1.trim()) return t1.trim();

  if (typeof result?.text === 'string' && result.text.trim()) return result.text.trim();

  return null;
};

const callGemini = async (prompt) => {
  const apiKey = process.env.GOOGLE_GEMINI_API;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600,
      },
    });

    return extractGeminiText(result);
  } catch (err) {
    console.error('Gemini Error:', err?.message || err);
    return null;
  }
};

export const getProductivitySuggestion = async (tasks) => {
  try {
    const prompt = buildPromptFromTasks(tasks);

    const text = await callGemini(prompt);
    if (!text) return getMockSuggestion(tasks);

    return {
      success: true,
      suggestion: text,
      source: 'gemini-2.5-flash',
      taskCount: tasks.length,
    };
  } catch (error) {
    console.error('Gemini Error:', error);
    return getMockSuggestion(tasks);
  }
};


export const improveTaskWithAI = async (task) => {
  try {
    const prompt = [
      'You are an expert task assistant.',
      'Your job: rewrite the task title to be clearer, suggest better priority, and estimate time.',
      '',
      'Task:',
      `Title: ${task.title}`,
      `Description: ${task.description || '(none)'}`,
      `Priority: ${task.priority}`,
      `DueDate: ${task.dueDate ? new Date(task.dueDate).toISOString() : '(none)'}`,
      `Status: ${task.status}`,
      '',
      'Return STRICT JSON only (no markdown, no extra text) with exactly this shape:',
      '{',
      '  "improvedTitle": "string",',
      '  "suggestedPriority": "Low" | "Medium" | "High",',
      '  "timeEstimateMinutes": number,',
      '  "reason": "string"',
      '}',
    ].join('\n');

    const text = await callGemini(prompt);
    if (!text) {
      return {
        success: true,
        data: null,
        suggestion: 'AI not available right now. Please try again.',
        source: 'mock-ai',
      };
    }

    const parsed = tryParseJsonObject(text);

    if (parsed && parsed.improvedTitle) {
      return { success: true, data: parsed, source: 'gemini-2.5-flash' };
    }

    return {
      success: true,
      data: null,
      suggestion: text,
      source: 'gemini-2.5-flash',
    };
  } catch (error) {
    console.error('Improve Task AI Error:', error);
    return {
      success: true,
      data: null,
      suggestion: 'AI not available right now. Please try again.',
      source: 'mock-ai',
    };
  }
};


export const breakdownTaskWithAI = async (task) => {
  try {
    const prompt = [
      'You are a task breakdown assistant.',
      'Break the task into 5–10 small actionable subtasks that take 15–45 minutes each.',
      '',
      'Task:',
      `Title: ${task.title}`,
      `Description: ${task.description || '(none)'}`,
      `DueDate: ${task.dueDate ? new Date(task.dueDate).toISOString() : '(none)'}`,
      '',
      'Return STRICT JSON only (no markdown, no extra text) with exactly this shape:',
      '{ "subtasks": [{ "title": "string", "estimateMinutes": number }] }',
    ].join('\n');

    const text = await callGemini(prompt);
    if (!text) {
      return {
        success: true,
        data: null,
        suggestion: 'AI not available right now. Please try again.',
        source: 'mock-ai',
      };
    }

    const parsed = tryParseJsonObject(text);

    if (parsed && Array.isArray(parsed.subtasks)) {
      return { success: true, data: parsed, source: 'gemini-2.5-flash' };
    }

    return {
      success: true,
      data: null,
      suggestion: text,
      source: 'gemini-2.5-flash',
    };
  } catch (error) {
    console.error('Breakdown Task AI Error:', error);
    return {
      success: true,
      data: null,
      suggestion: 'AI not available right now. Please try again.',
      source: 'mock-ai',
    };
  }
};


const getMockSuggestion = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return {
      success: true,
      suggestion: `🎯 **No Tasks Yet**

• Start by creating your first task to get organized
• Break down large goals into smaller, actionable tasks
• Use priorities to focus on what matters most

💡 **Productivity Tip**: Start with the most important task each morning when your energy is highest.`,
      source: 'mock-ai',
      taskCount: 0,
    };
  }

  
  const pendingTasks = tasks.filter((t) => t.status === 'Pending');
  const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'High');
  const mediumPriorityTasks = pendingTasks.filter((t) => t.priority === 'Medium');
  const lowPriorityTasks = pendingTasks.filter((t) => t.priority === 'Low');
  const overdueTasks = pendingTasks.filter((t) => new Date(t.dueDate) < new Date());
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  let suggestion = '🎯 **AI Productivity Analysis**\n\n';


  if (overdueTasks.length > 0) {
    const urgentTask = overdueTasks.sort((a, b) => {
  
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })[0];

    suggestion += `⚠️ **URGENT: Work on "${urgentTask.title}" FIRST**\n`;
    suggestion += `• Reason: This task is overdue and needs immediate attention\n`;
    suggestion += `• Priority: ${urgentTask.priority}\n`;
    suggestion += `• Was due: ${new Date(urgentTask.dueDate).toLocaleDateString()}\n\n`;
  } else if (highPriorityTasks.length > 0) {
    const nextTask = highPriorityTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
    suggestion += `🎯 **Start with "${nextTask.title}"**\n`;
    suggestion += `• Reason: High priority with upcoming deadline\n`;
    suggestion += `• Due: ${new Date(nextTask.dueDate).toLocaleDateString()}\n\n`;
  } else if (mediumPriorityTasks.length > 0) {
    const nextTask = mediumPriorityTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
    suggestion += `✅ **Focus on "${nextTask.title}"**\n`;
    suggestion += `• Reason: Earliest deadline among medium priority tasks\n`;
    suggestion += `• Due: ${new Date(nextTask.dueDate).toLocaleDateString()}\n\n`;
  } else if (lowPriorityTasks.length > 0) {
    const nextTask = lowPriorityTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
    suggestion += `📝 **Consider "${nextTask.title}"**\n`;
    suggestion += `• Reason: Low priority but approaching deadline\n`;
    suggestion += `• Due: ${new Date(nextTask.dueDate).toLocaleDateString()}\n\n`;
  }


  suggestion += `💡 **Productivity Tips:**\n`;

  if (pendingTasks.length > 0) {
    suggestion += `• You have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''} - focus on completion, not perfection\n`;
  }

  if (highPriorityTasks.length > 3) {
    suggestion += `• You have ${highPriorityTasks.length} high-priority tasks - consider if all are truly urgent\n`;
  }

  if (overdueTasks.length > 0) {
    suggestion += `• ⚠️ ${overdueTasks.length} task${overdueTasks.length > 1 ? 's are' : ' is'} overdue - prioritize these immediately\n`;
  }

  suggestion += `• Use time-blocking: dedicate 25-minute focused sessions (Pomodoro technique)\n`;
  suggestion += `• Complete one task fully before starting another to maintain momentum\n\n`;


  const completionRate = tasks.length > 0 ? ((completedTasks.length / tasks.length) * 100).toFixed(0) : 0;

  suggestion += `📊 **Your Progress:**\n`;
  suggestion += `• Total Tasks: ${tasks.length}\n`;
  suggestion += `• Completed: ${completedTasks.length} (${completionRate}%)\n`;
  suggestion += `• Pending: ${pendingTasks.length}\n`;

  if (overdueTasks.length > 0) {
    suggestion += `• ⚠️ Overdue: ${overdueTasks.length}\n`;
  }

  suggestion += `\n`;


  if (completionRate >= 70) {
    suggestion += `🎉 **Great job!** You're completing most of your tasks. Keep up the momentum!\n`;
  } else if (completionRate >= 40) {
    suggestion += `💪 **Good progress!** You're on the right track. Stay focused!\n`;
  } else if (completedTasks.length > 0) {
    suggestion += `🌱 **Getting started!** Every completed task is a step forward. Keep going!\n`;
  }

  return {
    success: true,
    suggestion,
    source: 'mock-ai',
    taskCount: tasks.length,
  };
};