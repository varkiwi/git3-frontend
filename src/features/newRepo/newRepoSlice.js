import { createSlice } from '@reduxjs/toolkit'

export const newRepoSlice = createSlice({
  name: 'newRepo',
  initialState: {
    value: false,
  },
  reducers: {
    setNewValue: (state, newValue) => {
      state.value = newValue.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setNewValue } = newRepoSlice.actions

export default newRepoSlice.reducer