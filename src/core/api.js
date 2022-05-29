import axios from 'axios';
import { call } from 'redux-saga/effects';
import { appConfigurations } from './constants';

export function* idenaAuthTokenInit(idenaAuthToken) {
  const loginResponse = yield call(axios.post, `${appConfigurations.apiBaseUrl}/auth/login`, { idenaAuthToken });
  if (loginResponse?.status !== 200 || !loginResponse?.data?.tokens) {
    throw new Error('Error logging into api');
  }
  return loginResponse.data;
}

export function* logout(refreshToken) {
  const loginResponse = yield call(axios.post, `${appConfigurations.apiBaseUrl}/auth/logout`, { refreshToken });
  if (loginResponse?.status !== 204) {
    throw new Error('Error logging out of api');
  }
  return loginResponse.data.tokens;
}

export function* getTokens(refreshToken) {
  const loginResponse = yield call(axios.post, `${appConfigurations.apiBaseUrl}/auth/refresh-tokens`, { refreshToken });
  if (loginResponse?.status !== 200 || !loginResponse?.data?.access || !loginResponse?.data?.refresh) {
    throw new Error('Error logging into api');
  }
  return loginResponse.data;
}

export function* getUsers(params) {
  const loginResponse = yield call(axios.get, `${appConfigurations.apiBaseUrl}/users`, { params });
  if (loginResponse?.status !== 200 || !loginResponse?.data?.results) {
    throw new Error('Error getting users');
  }
  return loginResponse.data.results;
}

export function* getWallets(params) {
  const loginResponse = yield call(axios.get, `${appConfigurations.apiBaseUrl}/governance/wallets`, { params });
  if (loginResponse?.status !== 200 || !loginResponse?.data?.results) {
    throw new Error('Error getting wallets');
  }
  return loginResponse.data.results;
}

export function* getProposals(params) {
  const loginResponse = yield call(axios.get, `${appConfigurations.apiBaseUrl}/governance/proposals`, { params });
  if (loginResponse?.status !== 200 || !loginResponse?.data?.results) {
    throw new Error('Error getting proposals');
  }
  return loginResponse.data.results;
}

export function* getTransactions(params) {
  const loginResponse = yield call(axios.get, `${appConfigurations.apiBaseUrl}/governance/transactions`, { params });
  if (loginResponse?.status !== 200 || !loginResponse?.data?.results) {
    throw new Error('Error getting transactions');
  }
  return loginResponse.data.results;
}

export function* getAddress(address) {
  const response = yield call(axios.get, `${appConfigurations.idenaApiUrl}/Address/${address}`);
  if (response?.status !== 200 || (!response?.data?.result && !response?.data?.error)) {
    throw new Error('Error getting address data');
  }
  return response.data;
}

export function* rpcGetBalance(address) {
  const body = { jsonrpc: '2.0', key: appConfigurations.idenaRestrictedNodeKey, id: 1, method: 'dna_getBalance', params: [address] };
  const response = yield call(axios.post, appConfigurations.idenaRestrictedNodeUrl, body);
  if (response?.status !== 200 || !response?.data?.result) {
    throw new Error('Error getting rpc balance data');
  }
  return response.data.result;
}

export function* getLastEpoch() {
  const response = yield call(axios.get, `${appConfigurations.idenaApiUrl}/Epoch/Last`);
  if (response?.status !== 200 || !response?.data?.result) {
    throw new Error('Error getting last epoch');
  }
  return response.data.result;
}

export function* getTransaction(tx) {
  const response = yield call(axios.get, `${appConfigurations.idenaApiUrl}/Transaction/${tx}`);
  if (response?.status !== 200 || (!response?.data?.result && !response?.data?.error)) {
    throw new Error('Error getting address data');
  }
  return response.data;
}

export function* getContract(contract) {
  const response = yield call(axios.get, `${appConfigurations.idenaApiUrl}/Contract/${contract}`);
  if (response?.status !== 200 || !response?.data?.result) {
    throw new Error('Error getting contract data');
  }
  return response.data.result;
}

export function* getMultisigContract(contract) {
  const response = yield call(axios.get, `${appConfigurations.idenaApiUrl}/MultisigContract/${contract}`);
  if (response?.status !== 200 || !response?.data?.result) {
    throw new Error('Error getting multisig contract data');
  }
  return response.data.result;
}

export function* postNewDraftWallet(address) {
  const response = yield call(axios.post, `${appConfigurations.apiBaseUrl}/governance/create-draft-wallet`, { address });
  if (response?.status !== 201 || !response?.data) {
    throw new Error('Error posting new draft wallet');
  }
  return response.data;
}

export function* postNewSigner(signer, contract) {
  const response = yield call(axios.post, `${appConfigurations.apiBaseUrl}/governance/add-signer`, { signer, contract });
  if (response?.status !== 200 || !response?.data) {
    throw new Error('Error posting new signer');
  }
  return response.data;
}

export function* getDraftWallets(params) {
  const loginResponse = yield call(axios.get, `${appConfigurations.apiBaseUrl}/governance/draft-wallets`, { params });
  if (loginResponse?.status !== 200 || !loginResponse?.data?.results) {
    throw new Error('Error getting draft wallets');
  }
  return loginResponse.data.results;
}

export function* deleteWallet(draftWallet) {
  const loginResponse = yield call(axios.delete, `${appConfigurations.apiBaseUrl}/governance/draft-wallets/${draftWallet.id}`);
  if (loginResponse?.status !== 204) {
    throw new Error('Error deleting wallet');
  }
  return loginResponse.data.results;
}

export function* activateWallet(draftWallet) {
  const loginResponse = yield call(axios.patch, `${appConfigurations.apiBaseUrl}/governance/draft-wallets/${draftWallet.id}`);
  if (loginResponse?.status !== 200) {
    throw new Error('Error activating wallet');
  }
  return loginResponse.data.results;
}
