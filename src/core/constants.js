/* eslint-disable no-undef */
import { sliceName as generalSliceName } from './reducer';

/**
 * App configurations
 */
export const appConfigurations = {
  localBaseUrl: process.env.REACT_APP_LOCAL_BASE_URL || 'http://localhost:3000',
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  idenaSignInUrl: process.env.REACT_APP_IDENA_SIGN_IN_URL || 'https://app.idena.io/dna/signin',
  idenaRawTxUrl: process.env.REACT_APP_IDENA_RAW_TX_URL || 'https://app.idena.io/dna/raw',
  idenaApiUrl: process.env.REACT_APP_IDENA_API_URL || 'https://api.idena.io/api',
  refreshExpirationDays: process.env.REACT_APP_JWT_REFRESH_EXPIRATION_DAYS || 30,
  refreshTokensMinutes: process.env.REACT_APP_JWT_REFRESH_MINUTES || 10,
  localStorageTokensKey: 'tokens',
  localStorageUserKey: 'user'
};

/**
 * Action Names
 */
export const actionNames = {
  // App level
  processLogin: 'processLogin',
  processlogout: 'processlogout',
  refreshTokens: 'refreshTokens',
  getData: 'getData',
  createMultisigWallet: 'createMultisigWallet',
  creatingMultisigWallet: 'creatingMultisigWallet',
  getUserWallets: 'getUserWallets',
  // General Slice
  [generalSliceName]: {
    updateTokensSecured: generalSliceName + '/updateTokensSecured',
    updateUser: generalSliceName + '/updateUser',
    error: generalSliceName + '/error',
    updateData: generalSliceName + '/updateData',
    clearData: generalSliceName + '/clearData',
    updateLoader: generalSliceName + '/updateLoader',
    updateWalletCreating: generalSliceName + '/updateWalletCreating',
    updateWalletsCreated: generalSliceName + '/updateWalletsCreated'
  }
};
