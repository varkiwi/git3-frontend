import { configureStore } from '@reduxjs/toolkit';
import newRepoReducer from '../features/newRepo/newRepoSlice';

export default configureStore({
  reducer: {
    newRepo: newRepoReducer
  },
})