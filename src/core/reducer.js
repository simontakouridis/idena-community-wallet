import { createSlice } from '@reduxjs/toolkit';

export const sliceName = 'general';

const generalSlice = createSlice({
  name: sliceName,
  initialState: {
    tokensSecured: false,
    user: null,
    data: {
      users: [],
      wallets: [],
      proposals: [],
      transactions: []
    },
    loaders: {
      creatingWallet: false,
      deletingWallet: false,
      addingSigner: false,
      activatingWallet: false,
      creatingEditingProposal: false,
      deletingProposal: false,
      creatingTransaction: false,
      signingTransaction: false,
      deletingTransaction: false,
      executingTransaction: false
    },
    draftWallet: null,
    walletsCreated: [],
    walletDraftTransactions: {},
    walletTransactions: {}
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
        state.data.wallets = action.payload.wallets.sort((a, b) => {
          return b.round - a.round;
        });
        state.data.proposals = action.payload.proposals;
        state.data.transactions = action.payload.transactions;
      }
    },
    clearData: state => {
      state.data = {};
    },
    updateLoader: (state, action) => {
      state.loaders[action.payload.loader] = action.payload.loading;
    },
    updateDraftWallet: (state, action) => {
      state.draftWallet = action.payload;
    },
    clearDraftWallet: state => {
      state.draftWallet = null;
    },
    updateWalletsCreated: (state, action) => {
      state.walletsCreated = action.payload;
    },
    addNewSignerToDraftWallet: (state, action) => {
      state.draftWallet?.signers?.push(action.payload);
    },
    updateWalletDraftTransactions: (state, action) => {
      state.walletDraftTransactions[action.payload.walletId] = action.payload.walletDraftTransaction;
    },
    updateWalletTransactions: (state, action) => {
      state.walletTransactions[action.payload.walletId] = action.payload.walletTransactions;
    }
  }
});

const { actions, reducer } = generalSlice;

export const {
  updateTokensSecured,
  updateUser,
  updateData,
  clearData,
  updateLoader,
  updateDraftWallet,
  clearDraftWallet,
  updateWalletsCreated,
  addNewSignerToDraftWallet,
  updateWalletDraftTransactions,
  updateWalletTransactions
} = actions;

export default reducer;
