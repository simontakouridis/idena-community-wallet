import { createSlice } from '@reduxjs/toolkit';

export const sliceName = 'general';

const generalSlice = createSlice({
  name: sliceName,
  initialState: {
    tokensSecured: false,
    user: null,
    error: ''
  },
  reducers: {
    updateTokensSecured: (state, action) => {
      state.tokensSecured = action.payload;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
    error: (state, action) => {
      state.error = action.payload;
    }
  }
});

const { actions, reducer } = generalSlice;

export const { updateTokensSecured, updateUser, error } = actions;

export default reducer;
