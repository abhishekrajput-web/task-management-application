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

  try {
    return JSON.parse(text);
  } catch {
    // continue
  }

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
        maxOutputTokens: 1000,
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
      source: 'gemini-2.0-flash',
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
      return { success: true, data: parsed, source: 'gemini-2.0-flash' };
    }

    return {
      success: true,
      data: null,
      suggestion: text,
      source: 'gemini-2.0-flash',
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
      return { success: true, data: parsed, source: 'gemini-2.0-flash' };
    }

    return {
      success: true,
      data: null,
      suggestion: text,
      source: 'gemini-2.0-flash',
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

// NEW: Brain Dump Parser
export const parseBrainDumpWithAI = async (text) => {
  try {
    const prompt = [
      'You are a task extraction AI. Parse this messy brain dump into structured tasks.',
      '',
      'Brain dump:',
      `"${text}"`,
      '',
      'Return STRICT JSON only (no markdown, no extra text):',
      '{',
      '  "tasks": [',
      '    {',
      '      "title": "string",',
      '      "description": "string or empty",',
      '      "priority": "Low" | "Medium" | "High",',
      '      "suggestedDueDate": "YYYY-MM-DD or null",',
      '      "estimateMinutes": number',
      '    }',
      '  ]',
      '}',
      '',
      'Rules:',
      '- Extract ALL actionable items',
      '- Infer priority from urgency words (ASAP, urgent, important = High)',
      '- Infer due dates from phrases like "tomorrow", "next week", "by Friday"',
      `- Today's date is ${new Date().toISOString().split('T')[0]}`,
    ].join('\n');

    const result = await callGemini(prompt);
    if (!result) {
      return {
        success: true,
        data: null,
        suggestion: 'AI not available right now. Please try again.',
        source: 'mock-ai',
      };
    }

    const parsed = tryParseJsonObject(result);

    if (parsed?.tasks) {
      return { success: true, data: parsed, source: 'gemini-2.0-flash' };
    }

    return { success: true, data: null, suggestion: result, source: 'gemini-2.0-flash' };
  } catch (error) {
    console.error('Brain Dump Parse Error:', error);
    return {
      success: false,
      message: 'Failed to parse brain dump',
      source: 'error',
    };
  }
};

// NEW: Energy-Based Suggestions
export const getEnergyBasedSuggestions = async (tasks, energyLevel) => {
  try {
    const taskData = tasks.map((task) => ({
      id: task._id,
      title: task.title,
      priority: task.priority,
      dueDate: new Date(task.dueDate).toISOString(),
      description: task.description || '',
    }));

    const prompt = [
      'You are a productivity coach that matches tasks to energy levels.',
      '',
      `User's current energy level: ${energyLevel.toUpperCase()}`,
      '',
      'Energy level meanings:',
      '- LOW: User is tired, suggest easy quick wins, simple tasks, organizing, reading',
      '- MEDIUM: User has moderate energy, suggest standard tasks, meetings prep, emails',
      '- HIGH: User is energized, suggest complex tasks, creative work, problem-solving',
      '',
      'Available tasks:',
      JSON.stringify(taskData, null, 2),
      '',
      'Return STRICT JSON only (no markdown):',
      '{',
      '  "recommendedTasks": [',
      '    {',
      '      "taskId": "string",',
      '      "title": "string",',
      '      "reason": "string (why this matches their energy)",',
      '      "estimatedFocus": "number (minutes)"',
      '    }',
      '  ],',
      '  "energyTip": "string (advice for their current energy state)",',
      '  "avoidTasks": ["task titles to avoid at this energy level"]',
      '}',
    ].join('\n');

    const result = await callGemini(prompt);
    if (!result) {
      return getDefaultEnergySuggestions(tasks, energyLevel);
    }

    const parsed = tryParseJsonObject(result);

    if (parsed?.recommendedTasks) {
      return { success: true, data: parsed, energyLevel, source: 'gemini-2.0-flash' };
    }

    return { success: true, data: null, suggestion: result, source: 'gemini-2.0-flash' };
  } catch (error) {
    console.error('Energy Suggestions Error:', error);
    return getDefaultEnergySuggestions(tasks, energyLevel);
  }
};

const getDefaultEnergySuggestions = (tasks, energyLevel) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  let recommendedTasks = [];
  let energyTip = '';
  let avoidTasks = [];

  if (energyLevel === 'low') {
    recommendedTasks = sortedTasks.filter(t => t.priority === 'Low').slice(0, 3);
    energyTip = 'Focus on quick wins and simple tasks. Take breaks every 25 minutes.';
    avoidTasks = sortedTasks.filter(t => t.priority === 'High').map(t => t.title).slice(0, 2);
  } else if (energyLevel === 'medium') {
    recommendedTasks = sortedTasks.filter(t => t.priority === 'Medium').slice(0, 3);
    energyTip = 'Good time for standard work. Consider tackling one challenging task.';
    avoidTasks = [];
  } else {
    recommendedTasks = sortedTasks.filter(t => t.priority === 'High').slice(0, 3);
    energyTip = 'Your energy is high! Tackle your most complex and important tasks now.';
    avoidTasks = sortedTasks.filter(t => t.priority === 'Low').map(t => t.title).slice(0, 2);
  }

  return {
    success: true,
    data: {
      recommendedTasks: recommendedTasks.map(t => ({
        taskId: t._id,
        title: t.title,
        reason: `Matches your ${energyLevel} energy level`,
        estimatedFocus: 30,
      })),
      energyTip,
      avoidTasks,
    },
    energyLevel,
    source: 'mock-ai',
  };
};

// NEW: Do It For Me
export const doTaskForMe = async (task) => {
  try {
    const prompt = [
      'You are an AI assistant that helps complete tasks.',
      'Based on the task below, generate the actual content/output that would complete this task.',
      '',
      'Task:',
      `Title: ${task.title}`,
      `Description: ${task.description || '(none)'}`,
      '',
      'Instructions:',
      '- If it\'s "Write email to..." → generate the email',
      '- If it\'s "Create agenda for..." → generate the agenda',
      '- If it\'s "Research..." → provide a summary of key findings',
      '- If it\'s "Draft..." → write the draft',
      '- If it\'s "Plan..." → create a step-by-step plan',
      '- For other tasks → provide helpful content to complete it',
      '',
      'Return STRICT JSON only (no markdown):',
      '{',
      '  "taskType": "email" | "agenda" | "research" | "draft" | "plan" | "other",',
      '  "generatedContent": "string (the actual output/content)",',
      '  "summary": "string (brief description of what was generated)",',
      '  "nextSteps": ["string (what user should do next)"]',
      '}',
    ].join('\n');

    const result = await callGemini(prompt);
    if (!result) {
      return {
        success: true,
        data: null,
        suggestion: 'AI not available right now. Please try again.',
        source: 'mock-ai',
      };
    }

    const parsed = tryParseJsonObject(result);

    if (parsed?.generatedContent) {
      return { success: true, data: parsed, taskTitle: task.title, source: 'gemini-2.0-flash' };
    }

    return { success: true, data: null, suggestion: result, source: 'gemini-2.0-flash' };
  } catch (error) {
    console.error('Do It For Me Error:', error);
    return {
      success: true,
      data: null,
      suggestion: 'AI not available right now. Please try again.',
      source: 'mock-ai',
    };
  }
};

// NEW: Daily Reflection
export const getDailyReflection = async (tasks, reflectionData) => {
  try {
    const completedToday = tasks.filter(t => 
      t.status === 'Completed' && 
      new Date(t.updatedAt).toDateString() === new Date().toDateString()
    );
    
    const pendingTasks = tasks.filter(t => t.status === 'Pending');
    const overdueTasks = pendingTasks.filter(t => new Date(t.dueDate) < new Date());

    const prompt = [
      'You are a productivity coach providing end-of-day reflection and insights.',
      '',
      'Today\'s Data:',
      `- Tasks completed today: ${completedToday.length}`,
      `- Tasks still pending: ${pendingTasks.length}`,
      `- Overdue tasks: ${overdueTasks.length}`,
      `- User said they completed: ${reflectionData.completedToday || 'not specified'}`,
      `- Blockers mentioned: ${reflectionData.blockers || 'none'}`,
      `- Self-rated productivity (1-5): ${reflectionData.productivityRating || 'not rated'}`,
      '',
      'Completed tasks today:',
      completedToday.map(t => `- ${t.title}`).join('\n') || '(none)',
      '',
      'Return STRICT JSON only (no markdown):',
      '{',
      '  "dailySummary": "string (2-3 sentence summary of today)",',
      '  "wins": ["string (positive things accomplished)"],',
      '  "improvements": ["string (areas to improve)"],',
      '  "tomorrowFocus": ["string (what to focus on tomorrow)"],',
      '  "motivationalMessage": "string (encouraging message)",',
      '  "productivityScore": number (0-100 based on analysis),',
      '  "patterns": ["string (behavioral patterns noticed)"]',
      '}',
    ].join('\n');

    const result = await callGemini(prompt);
    if (!result) {
      return getDefaultReflection(tasks, reflectionData);
    }

    const parsed = tryParseJsonObject(result);

    if (parsed?.dailySummary) {
      return { 
        success: true, 
        data: parsed, 
        stats: {
          completedToday: completedToday.length,
          pending: pendingTasks.length,
          overdue: overdueTasks.length,
        },
        source: 'gemini-2.0-flash' 
      };
    }

    return { success: true, data: null, suggestion: result, source: 'gemini-2.0-flash' };
  } catch (error) {
    console.error('Daily Reflection Error:', error);
    return getDefaultReflection(tasks, reflectionData);
  }
};

const getDefaultReflection = (tasks, reflectionData) => {
  const completedToday = tasks.filter(t => 
    t.status === 'Completed' && 
    new Date(t.updatedAt).toDateString() === new Date().toDateString()
  );
  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const overdueTasks = pendingTasks.filter(t => new Date(t.dueDate) < new Date());

  const score = Math.min(100, Math.max(0, 
    (completedToday.length * 20) - (overdueTasks.length * 10) + 
    ((reflectionData.productivityRating || 3) * 10)
  ));

  return {
    success: true,
    data: {
      dailySummary: `You completed ${completedToday.length} tasks today with ${pendingTasks.length} still pending.`,
      wins: completedToday.length > 0 
        ? [`Completed ${completedToday.length} task(s)`, 'Showed up and worked on your goals']
        : ['Showed up and checked your tasks'],
      improvements: overdueTasks.length > 0 
        ? [`Address ${overdueTasks.length} overdue task(s)`, 'Consider breaking large tasks into smaller ones']
        : ['Keep maintaining your current momentum'],
      tomorrowFocus: pendingTasks.slice(0, 3).map(t => t.title),
      motivationalMessage: completedToday.length > 0 
        ? 'Great job today! Every completed task is progress. Keep it up! 🎉'
        : 'Tomorrow is a new opportunity. Start with one small task and build momentum! 💪',
      productivityScore: score,
      patterns: ['Daily reflection helps build self-awareness'],
    },
    stats: {
      completedToday: completedToday.length,
      pending: pendingTasks.length,
      overdue: overdueTasks.length,
    },
    source: 'mock-ai',
  };
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