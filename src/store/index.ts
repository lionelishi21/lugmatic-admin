import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Uses localStorage for web
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import artistReducer from './slices/artistSlice';
import giftReducer from './slices/giftSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth reducer
};

const rootReducer = combineReducers({
  auth: authReducer,
  artist: artistReducer,
  gift: giftReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 