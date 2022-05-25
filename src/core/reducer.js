import { createSlice } from '@reduxjs/toolkit';

export const sliceName = 'general';

const generalSlice = createSlice({
  name: sliceName,
  initialState: {
    tokensSecured: false,
    user: null,
    data: {},
    loaders: {
      creatingWallet: false
    },
    walletCreating: null,
    walletsCreated: []
  },
  reducers: {
    updateTokensSecured: (state, action) => {
      state.tokensSecured = action.payload;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
    updateData: (state, action) => {
      if (action.payload?.users) {
        state.data.users = action.payload.users;
      }
    },
    clearData: state => {
      state.data = {};
    },
    updateLoader: (state, action) => {
      state.loaders[action.payload.loader] = action.payload.loading;
    },
    updateWalletCreating: (state, action) => {
      state.walletCreating = action.payload;
    },
    updateWalletsCreated: (state, action) => {
      state.walletsCreated = action.payload;
    }
  }
});

const { actions, reducer } = generalSlice;

export const { updateTokensSecured, updateUser, updateData, clearData, updateLoader, updateWalletCreating, updateWalletsCreated } = actions;

export default reducer;
