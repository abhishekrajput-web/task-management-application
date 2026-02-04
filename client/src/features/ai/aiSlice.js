import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  suggestion: null,
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
      });
  },
});

export const { clearSuggestion } = aiSlice.actions;
export default aiSlice.reducer;