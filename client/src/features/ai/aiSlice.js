import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  suggestion: null,
  brainDumpResult: null,
  energySuggestions: null,
  doItForMeResult: null,
  dailyReflection: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get AI suggestion (productivity assistant)
export const getAISuggestion = createAsyncThunk('ai/getSuggestion', async (_, thunkAPI) => {
  try {
    const res = await api.post('/ai/suggestion');
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Improve task
export const improveTask = createAsyncThunk('ai/improveTask', async (taskId, thunkAPI) => {
  try {
    const res = await api.post('/ai/improve', { taskId });
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Breakdown task
export const breakdownTask = createAsyncThunk('ai/breakdownTask', async (taskId, thunkAPI) => {
  try {
    const res = await api.post('/ai/breakdown', { taskId });
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// NEW: Parse Brain Dump
export const parseBrainDump = createAsyncThunk('ai/parseBrainDump', async (text, thunkAPI) => {
  try {
    const res = await api.post('/ai/parse-dump', { text });
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// NEW: Energy-Based Suggestions
export const getEnergySuggestions = createAsyncThunk('ai/energySuggestions', async (energyLevel, thunkAPI) => {
  try {
    const res = await api.post('/ai/energy-suggestions', { energyLevel });
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// NEW: Do It For Me
export const doItForMe = createAsyncThunk('ai/doItForMe', async (taskId, thunkAPI) => {
  try {
    const res = await api.post('/ai/do-it-for-me', { taskId });
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// NEW: Daily Reflection
export const getDailyReflection = createAsyncThunk('ai/dailyReflection', async (reflectionData, thunkAPI) => {
  try {
    const res = await api.post('/ai/daily-reflection', reflectionData);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearSuggestion: (state) => {
      state.suggestion = null;
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearBrainDump: (state) => {
      state.brainDumpResult = null;
    },
    clearEnergySuggestions: (state) => {
      state.energySuggestions = null;
    },
    clearDoItForMe: (state) => {
      state.doItForMeResult = null;
    },
    clearDailyReflection: (state) => {
      state.dailyReflection = null;
    },
    clearAll: (state) => {
      state.suggestion = null;
      state.brainDumpResult = null;
      state.energySuggestions = null;
      state.doItForMeResult = null;
      state.dailyReflection = null;
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAISuggestion.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAISuggestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.suggestion = action.payload;
      })
      .addCase(getAISuggestion.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(improveTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(improveTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.suggestion = action.payload;
      })
      .addCase(improveTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(breakdownTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(breakdownTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.suggestion = action.payload;
      })
      .addCase(breakdownTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Brain Dump
      .addCase(parseBrainDump.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(parseBrainDump.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.brainDumpResult = action.payload;
      })
      .addCase(parseBrainDump.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Energy Suggestions
      .addCase(getEnergySuggestions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEnergySuggestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.energySuggestions = action.payload;
      })
      .addCase(getEnergySuggestions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Do It For Me
      .addCase(doItForMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(doItForMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.doItForMeResult = action.payload;
      })
      .addCase(doItForMe.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Daily Reflection
      .addCase(getDailyReflection.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDailyReflection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.dailyReflection = action.payload;
      })
      .addCase(getDailyReflection.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { 
  clearSuggestion, 
  clearBrainDump, 
  clearEnergySuggestions, 
  clearDoItForMe, 
  clearDailyReflection,
  clearAll 
} = aiSlice.actions;
export default aiSlice.reducer;