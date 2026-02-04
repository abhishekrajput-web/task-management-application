import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const initialState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  filters: {
    status: '',
    priority: '',
    sortBy: 'createdAt',
    search: '',
  },
};



export const getTasks = createAsyncThunk(
  'tasks/getAll',
  async (filtersOverride = {}, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const baseFilters = state?.tasks?.filters || {};

      const merged = { ...baseFilters, ...(filtersOverride || {}) };

      // Remove empty values so query stays clean
      Object.keys(merged).forEach((k) => {
        if (merged[k] === '' || merged[k] === null || merged[k] === undefined) delete merged[k];
      });

      const queryParams = new URLSearchParams(merged).toString();
      const url = queryParams ? `/tasks?${queryParams}` : '/tasks';

      const response = await api.get(url);


      const tasks = response.data?.tasks ?? response.data?.data ?? [];

      return tasks;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData, thunkAPI) => {
    try {
      const response = await api.post('/tasks', taskData);
      toast.success('Task created successfully! ✅');
      // Support { task } or { data }
      return response.data?.task ?? response.data?.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, taskData }, thunkAPI) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      toast.success('Task updated successfully! ✏️');
      return response.data?.task ?? response.data?.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted successfully! 🗑️');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const toggleTask = createAsyncThunk(
  'tasks/toggle',
  async (id, thunkAPI) => {
    try {
      const response = await api.patch(`/tasks/${id}/toggle`);
      const task = response.data?.task ?? response.data?.data;
      const status = task?.status;

      toast.success(
        status === 'Completed'
          ? 'Task completed! Great job! 🎉'
          : 'Task marked as pending 📝'
      );

      return task;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        priority: '',
        sortBy: 'createdAt',
        search: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get tasks
      .addCase(getTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tasks = action.payload || [];
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload) state.tasks.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        if (!action.payload) return;
        state.tasks = state.tasks.map((task) =>
          task._id === action.payload._id ? action.payload : task
        );
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
      })
      // Toggle task
      .addCase(toggleTask.fulfilled, (state, action) => {
        if (!action.payload) return;
        state.tasks = state.tasks.map((task) =>
          task._id === action.payload._id ? action.payload : task
        );
      });
  },
});

export const { reset, setFilters, clearFilters } = taskSlice.actions;
export default taskSlice.reducer;