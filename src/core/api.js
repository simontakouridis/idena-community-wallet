import axios from 'axios';
import { call } from 'redux-saga/effects';
import { appConfigurations } from './constants';

export function* idenaAuthTokenInit(idenaAuthToken) {
  const response = yield call(axios.post, `${appConfigurations.apiBaseUrl}/auth/login`, { idenaAuthToken });
  if (response?.status !== 200 || !response?.data?.tokens) {
    throw new Error('Error logging into api');
  }
  return response.data;
}

export function* logout(refreshToken) {
  const response = yield call(axios.post, `${appConfigurations.apiBaseUrl}/auth/logout`, { refreshToken });
  if (response?.status !== 204) {
    throw new Error('Error logging out of api');
  }
  return response.data.tokens;
}

export function* getTokens(refreshToken) {
  const response = yield call(axios.post, `${appConfigurations.apiBaseUrl}/auth/refresh-tokens`, { refreshToken });
  if (response?.status !== 200 || !response?.data?.access || !response?.data?.refresh) {
    throw new Error('Error logging into api');
  }
  return response.data;
}

export function* getUsers(params) {
  const response = yield call(axios.get, `${appConfigurations.apiBaseUrl}/users`, { params });
  if (response?.status !== 200 || !response?.data?.results) {
    throw new Error('Error getting users');
  }
  return response.data.results;
}

export function* getWallets(params) {
  const response = yield call(axios.get, `${appConfigurations.apiBaseUrl}/governance/wallets`, { params });
  if (response?.status !== 200 || !response?.data?.results) {
    throw new Error('Error getting wallets');
  }
  return response.data.results;
}

export function* getProposals(params) {
  const response = yield call(axios.get, `${appConfigurations.apiBaseUrl}/governance/proposals`, { params });
  if (response?.status !== 200 || !response?.data?.results) {
    throw new Error('Error getting proposals');
  }
  return response.data.results;
}

export function* getTransactions(params) {
  const response = yield call(axios.get, `${appConfigurations.apiBaseUrl}/governance/transactions`, { params });
  if (response?.status !== 200 || !response?.data?.results) {
    throw new Error('Error getting transactions');
  }
  return response.data.results;
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
    throw new Error('Error getting transaction data');
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
  const response = yield call(axios.get, `${appConfigurations.apiBaseUrl}/governance/draft-wallets`, { params });
  if (response?.status !== 200 || !response?.data?.results) {
    throw new Error('Error getting draft wallets');
  }
  return response.data.results;
}

export function* deleteWallet(draftWallet) {
  const response = yield call(axios.delete, `${appConfigurations.apiBaseUrl}/governance/draft-wallets/${draftWallet.id}`);
  if (response?.status !== 204) {
    throw new Error('Error deleting wallet');
  }
}

export function* activateWallet(draftWallet) {
  const response = yield call(axios.patch, `${appConfigurations.apiBaseUrl}/governance/draft-wallets/${draftWallet.id}`);
  if (response?.status !== 200) {
    throw new Error('Error activating wallet');
  }
  return response.data.results;
}

export function* postNewProposal(body) {
  const response = yield call(axios.post, `${appConfigurations.apiBaseUrl}/governance/create-proposal`, body);
  if (response?.status !== 201 || !response?.data) {
    throw new Error('Error posting new proposal');
  }
  return response.data;
}

export function* editProposal(proposalId, body) {
  const response = yield call(axios.put, `${appConfigurations.apiBaseUrl}/governance/proposals/${proposalId}`, body);
  if (response?.status !== 200 || !response?.data) {
    throw new Error('Error editing proposal');
  }
  return response.data;
}

export function* deleteProposal(proposalId) {
  const response = yield call(axios.delete, `${appConfigurations.apiBaseUrl}/governance/proposals/${proposalId}`);
  if (response?.status !== 204) {
    throw new Error('Error deleting proposal');
  }
}

export function* getWalletDraftTransactions(params) {
  const response = yield call(axios.get, `${appConfigurations.apiBaseUrl}/governance/draft-transactions`, { params });
  if (response?.status !== 200 || !response?.data?.results) {
    throw new Error('Error getting wallet draft transactions');
  }
  return response.data.results;
}

export function* getWalletTransactions(params) {
  const response = yield call(axios.get, `${appConfigurations.apiBaseUrl}/governance/transactions`, { params });
  if (response?.status !== 200 || !response?.data?.results) {
    throw new Error('Error getting wallet transactions');
  }
  return response.data.results;
}

export function* postNewTransaction(body) {
  const response = yield call(axios.post, `${appConfigurations.apiBaseUrl}/governance/create-draft-transaction`, body);
  if (response?.status !== 201 || !response?.data) {
    throw new Error('Error posting new draft transaction');
  }
  return response.data;
}

export function* signDraftTransaction(body) {
  const response = yield call(axios.post, `${appConfigurations.apiBaseUrl}/governance/sign-draft-transaction`, body);
  if (response?.status !== 200) {
    throw new Error('Error signing transaction');
  }
}

export function* executeDraftTransaction(draftTransactionId, body) {
  const response = yield call(axios.patch, `${appConfigurations.apiBaseUrl}/governance/draft-transactions/${draftTransactionId}`, body);
  if (response?.status !== 200) {
    throw new Error('Error executing transaction');
  }
}

export function* deleteDraftTransaction(draftTransactionId) {
  const response = yield call(axios.delete, `${appConfigurations.apiBaseUrl}/governance/draft-transactions/${draftTransactionId}`);
  if (response?.status !== 204) {
    throw new Error('Error deleting transaction');
  }
}
