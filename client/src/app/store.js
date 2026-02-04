import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import taskReducer from '../features/tasks/taskSlice.js';
import aiReducer from '../features/ai/aiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});