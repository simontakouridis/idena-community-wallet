import { all, call, put, delay, takeLeading, takeLatest } from 'redux-saga/effects';
import { sliceName as generalSliceName } from './reducer';
import { actionNames } from './constants';
import { toast } from 'react-toastify';
import {
  idenaAuthTokenInit,
  getTokens,
  logout,
  getUsers,
  getWallets,
  getProposals,
  getTransactions,
  getAddress,
  getTransaction,
  postNewDraftWallet,
  postNewSigner,
  getDraftWallets,
  deleteWallet,
  activateWallet,
  postNewProposal,
  editProposal,
  deleteProposal,
  getWalletDraftTransactions,
  getWalletTransactions,
  postNewTransaction,
  signDraftTransaction,
  executeDraftTransaction,
  deleteDraftTransaction
} from './api';
import { getAuthLocalStorage, setAuthLocalStorage, removeAuthLocalStorage } from './utilities';
import { appConfigurations } from './../core/constants';
import { deploy, add, send, push, terminate } from './idena';

function* processLogin({ payload: idenaAuthToken }) {
  try {
    const { tokens, user } = yield call(idenaAuthTokenInit, idenaAuthToken);
    setAuthLocalStorage(JSON.stringify(tokens), JSON.stringify(user));
    yield put({ type: actionNames[generalSliceName].updateTokensSecured, payload: true });
  } catch (e) {
    console.error(e);
    toast('Error logging in');
  }
}

function* processlogout() {
  try {
    const { tokens } = getAuthLocalStorage();
    removeAuthLocalStorage();
    if (!tokens?.refresh?.token) {
      throw new Error('Refresh Token missing with logout');
    }
    yield call(logout, tokens.refresh.token);
  } catch (e) {
    console.error(e);
    toast('Error logging out');
  } finally {
    yield put({ type: actionNames[generalSliceName].updateTokensSecured, payload: false });
    window.location.href = `${appConfigurations.localBaseUrl}`;
  }
}

function* refreshTokens() {
  try {
    const { tokens } = getAuthLocalStorage();
    if (!tokens?.refresh?.token) {
      throw new Error('Refresh Token missing with refresh');
    }
    const newTokens = yield call(getTokens, tokens.refresh.token);
    setAuthLocalStorage(JSON.stringify(newTokens), null);
  } catch (e) {
    removeAuthLocalStorage();
    yield put({ type: actionNames[generalSliceName].updateTokensSecured, payload: false });
    console.error(e);
  }
}

function* getData() {
  try {
    const [users, wallets, proposals, transactions] = yield all([
      call(getUsers, { role: 'admin', limit: 10000 }),
      call(getWallets, { limit: 10000, sortBy: 'round:desc' }),
      call(getProposals, { limit: 10000, sortBy: 'createdAt:desc' }),
      call(getTransactions, { limit: 10000, sortBy: 'createdAt:desc' })
    ]);

    if (!users) {
      throw new Error('Missing users data');
    }
    yield put({ type: actionNames[generalSliceName].updateData, payload: { users, wallets, proposals, transactions } });
  } catch (e) {
    console.error(e);
  }
}

function* createMultisigWallet(action) {
  try {
    const {
      payload: { user }
    } = action;
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'creatingWallet', loading: true } });
    yield call(deploy, 3, 5, 8, user.address);
  } catch (e) {
    console.error(e);
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'creatingWallet', loading: false } });
  }
}

function* creatingMultisigWallet(action) {
  try {
    const {
      payload: { tx, user }
    } = action;

    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'creatingWallet', loading: true } });
    const txReceipt = yield call(getNewTransactionReceipt, tx, 'DeployContract', user.address);
    const contract = txReceipt?.contractAddress.toLowerCase();

    if (!contract) {
      throw new Error('No contract found!');
    }

    yield call(postNewDraftWallet, contract);
    window.location.href = `${appConfigurations.localBaseUrl}/create-wallet`;
  } catch (e) {
    console.error(e);
    toast('Error creating draft wallet');
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'creatingWallet', loading: false } });
  }
}

function* getUserWallets(action) {
  try {
    const {
      payload: { user }
    } = action;
    const draftWallets = yield call(getDraftWallets, { author: user.address, limit: 10000 });
    const walletsCreated = yield call(getWallets, { author: user.address, limit: 10000 });

    yield put({ type: actionNames[generalSliceName].updateDraftWallet, payload: draftWallets?.[0] });
    yield put({ type: actionNames[generalSliceName].updateWalletsCreated, payload: walletsCreated });
  } catch (e) {
    console.error(e);
    toast('Error getting user wallets');
  }
}

function* deleteDraftWallet(action) {
  try {
    const {
      payload: { draftWallet, user }
    } = action;
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'deletingWallet', loading: true } });
    yield call(deleteWallet, draftWallet);
    yield call(terminate, draftWallet.address, draftWallet.author, user.address);
  } catch (e) {
    console.error(e);
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'deletingWallet', loading: false } });
  }
}

function* activateDraftWallet(action) {
  try {
    const {
      payload: { draftWallet }
    } = action;
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'activatingWallet', loading: true } });
    yield call(activateWallet, draftWallet);
    window.location.href = `${appConfigurations.localBaseUrl}/create-wallet`;
  } catch (e) {
    console.error(e);
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'activatingWallet', loading: false } });
  }
}

function* addSignerToDraftWallet(action) {
  try {
    const {
      payload: { signer, user, draftWallet }
    } = action;
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'addingSigner', loading: true } });
    const newSignerStringified = JSON.stringify({ signer, contract: draftWallet.address });
    localStorage.setItem('newSigner', newSignerStringified);
    yield call(add, draftWallet.address, signer, user.address);
  } catch (e) {
    localStorage.removeItem('newSigner');
    console.error(e);
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'addingSigner', loading: false } });
  }
}

function* addingSignerToMultisigWallet(action) {
  try {
    const {
      payload: { tx, user }
    } = action;

    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'addingSigner', loading: true } });
    const txReceipt = yield call(getNewTransactionReceipt, tx, 'CallContract', user.address);
    const contract = txReceipt?.contractAddress.toLowerCase();
    const method = txReceipt?.method;
    const success = txReceipt?.success;

    if (!contract || method !== 'add' || !success) {
      throw new Error(`Something went wrong with adding signer. ${txReceipt?.errorMsg}`);
    }

    const newSignerLocal = localStorage.getItem('newSigner');
    const newSignerLocalParsed = JSON.parse(newSignerLocal);
    yield call(postNewSigner, newSignerLocalParsed.signer, contract);
    window.location.href = `${appConfigurations.localBaseUrl}/create-wallet`;
  } catch (e) {
    console.error(e);
    toast('Error adding signer');
  } finally {
    localStorage.removeItem('newSigner');
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'addingSigner', loading: false } });
  }
}

function* getNewTransactionReceipt(tx, txType, userAddress) {
  let txReceipt;
  const iterations = 24;
  const delayPerIteration = 5000;
  for (let i = 0; i < iterations; i++) {
    const transactionData = yield call(getTransaction, tx);
    if (transactionData?.result?.blockHeight) {
      if (transactionData.result.type === txType && transactionData.result.from.toLowerCase() === userAddress) {
        txReceipt = transactionData.result.txReceipt;
      }
      break;
    }
    if (i !== iterations - 1) {
      yield delay(delayPerIteration);
    }
  }
  return txReceipt;
}

function* createProposalSaga(action) {
  try {
    const {
      payload: { newEditedProposal }
    } = action;

    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'creatingEditingProposal', loading: true } });
    const requestBody = {
      title: newEditedProposal.title,
      ...(newEditedProposal.description && { description: newEditedProposal.description }),
      ...(newEditedProposal.oracle && { oracle: newEditedProposal.oracle })
    };
    yield call(postNewProposal, requestBody);
    window.location.href = `${appConfigurations.localBaseUrl}/proposals`;
  } catch (e) {
    console.error(e);
    toast('Error creating proposal');
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'creatingEditingProposal', loading: false } });
  }
}

function* editProposalSaga(action) {
  try {
    const {
      payload: { newEditedProposal }
    } = action;

    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'creatingEditingProposal', loading: true } });
    const requestBody = {
      ...(newEditedProposal.title && { title: newEditedProposal.title }),
      ...(newEditedProposal.description && { description: newEditedProposal.description }),
      ...(newEditedProposal.oracle && { oracle: newEditedProposal.oracle }),
      ...(newEditedProposal.acceptanceStatus && { acceptanceStatus: newEditedProposal.acceptanceStatus }),
      ...(newEditedProposal.fundingStatus && { fundingStatus: newEditedProposal.fundingStatus }),
      ...(newEditedProposal.transactions.length && { transactions: newEditedProposal.transactions })
    };

    yield call(editProposal, newEditedProposal.id, requestBody);
    window.location.href = `${appConfigurations.localBaseUrl}/proposals`;
  } catch (e) {
    console.error(e);
    toast('Error editing proposal');
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'creatingEditingProposal', loading: false } });
  }
}

function* deleteProposalSaga(action) {
  try {
    const {
      payload: { proposalId }
    } = action;
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'deletingProposal', loading: true } });
    yield call(deleteProposal, proposalId);
    window.location.href = `${appConfigurations.localBaseUrl}/proposals`;
  } catch (e) {
    console.error(e);
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'deletingProposal', loading: false } });
  }
}

function* getWalletDraftTransactionsSaga(action) {
  try {
    const {
      payload: { walletId }
    } = action;
    const walletDraftTransactionsData = yield call(getWalletDraftTransactions, { wallet: walletId, limit: 10000 });
    const walletDraftTransaction = walletDraftTransactionsData?.[0];
    if (!walletDraftTransaction) {
      return;
    }

    yield put({ type: actionNames[generalSliceName].updateWalletDraftTransactions, payload: { walletId, walletDraftTransaction } });
  } catch (e) {
    console.error(e);
    toast('Error getting wallet draft transaction');
  }
}

function* getWalletTransactionsSaga(action) {
  try {
    const {
      payload: { walletId }
    } = action;
    const walletTransactions = yield call(getWalletTransactions, { wallet: walletId, limit: 10000, sortBy: 'createdAt:desc' });

    yield put({ type: actionNames[generalSliceName].updateWalletTransactions, payload: { walletId, walletTransactions } });
  } catch (e) {
    console.error(e);
    toast('Error getting wallet transactions');
  }
}

function* createDraftTransactionSaga(action) {
  try {
    const {
      payload: { wallet, newTransaction }
    } = action;
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'creatingTransaction', loading: true } });

    yield call(postNewTransaction, {
      title: newTransaction.title,
      category: newTransaction.category,
      ...(newTransaction.category === 'fundProposal' && { proposal: newTransaction.proposal }),
      ...(newTransaction.category === 'other' && { categoryOtherDescription: newTransaction.otherDescription }),
      wallet: wallet.id,
      recipient: newTransaction.recipient,
      amount: +parseFloat(newTransaction.amount).toFixed(8)
    });
    location.reload();
  } catch (e) {
    console.error(e);
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'creatingTransaction', loading: false } });
  }
}

function* signDraftTransactionSaga(action) {
  try {
    const {
      payload: { user, wallet, draftTransaction }
    } = action;
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'signingTransaction', loading: true } });
    yield call(send, wallet.address, draftTransaction.recipient, draftTransaction.amount, user.address, wallet.id);
  } catch (e) {
    console.error(e);
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'signingTransaction', loading: false } });
  }
}

function* signingDraftTransactionSaga(action) {
  try {
    const {
      payload: { tx, user, wallet, draftTransaction }
    } = action;

    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'signingTransaction', loading: true } });
    const txReceipt = yield call(getNewTransactionReceipt, tx, 'CallContract', user.address);
    const contract = txReceipt?.contractAddress.toLowerCase();
    const method = txReceipt?.method;
    const success = txReceipt?.success;

    if (!contract || method !== 'send' || !success) {
      throw new Error(`Something went wrong with signing transaction. ${txReceipt?.errorMsg}`);
    }

    yield call(signDraftTransaction, { transaction: draftTransaction.id });
    window.location.href = `${appConfigurations.localBaseUrl}/wallet/${wallet.id}/create-transaction`;
  } catch (e) {
    console.error(e);
    toast('Error signing transaction');
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'signingTransaction', loading: false } });
  }
}

function* executeDraftTransactionSaga(action) {
  try {
    const {
      payload: { user, wallet, draftTransaction }
    } = action;
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'executingTransaction', loading: true } });
    yield call(push, wallet.address, draftTransaction.recipient, draftTransaction.amount, user.address, wallet.id);
  } catch (e) {
    console.error(e);
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'executingTransaction', loading: false } });
  }
}

function* executingDraftTransactionSaga(action) {
  try {
    const {
      payload: { tx, user, wallet, draftTransaction }
    } = action;

    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'executingTransaction', loading: true } });
    const txReceipt = yield call(getNewTransactionReceipt, tx, 'CallContract', user.address);
    const contract = txReceipt?.contractAddress.toLowerCase();
    const method = txReceipt?.method;
    const success = txReceipt?.success;

    if (!contract || method !== 'push' || !success) {
      throw new Error(`Something went wrong with executing transaction. ${txReceipt?.errorMsg}`);
    }

    yield call(executeDraftTransaction, draftTransaction.id, { tx });
    window.location.href = `${appConfigurations.localBaseUrl}/wallet/${wallet.id}/transactions`;
  } catch (e) {
    console.error(e);
    toast('Error executing transaction');
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'executingTransaction', loading: false } });
  }
}

function* manuallyExecuteDraftTransactionSaga(action) {
  try {
    const {
      payload: { tx, wallet, draftTransaction }
    } = action;

    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'manuallyExecutingTransaction', loading: true } });

    const transactionData = yield call(getTransaction, tx);
    const txReceipt = transactionData?.result?.txReceipt;
    const contract = txReceipt?.contractAddress.toLowerCase();
    const method = txReceipt?.method;
    const success = txReceipt?.success;

    if (!contract || method !== 'push' || !success) {
      throw new Error(`Something went wrong with manually executing transaction. ${txReceipt?.errorMsg}`);
    }

    yield call(executeDraftTransaction, draftTransaction.id, { tx });

    window.location.href = `${appConfigurations.localBaseUrl}/wallet/${wallet.id}/transactions`;
  } catch (e) {
    console.error(e);
    toast('Error executing manual transaction');
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'manuallyExecutingTransaction', loading: false } });
  }
}

function* deleteDraftTransactionSaga(action) {
  try {
    const {
      payload: { draftTransaction }
    } = action;
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'deletingTransaction', loading: true } });
    yield call(deleteDraftTransaction, draftTransaction.id);
    location.reload();
  } catch (e) {
    console.error(e);
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'deletingTransaction', loading: false } });
  }
}

function* getAddressDetailsSaga(action) {
  try {
    const {
      payload: { address }
    } = action;
    const addressData = yield call(getAddress, address);
    if (addressData.error) {
      throw new Error(`error getting address data: ${addressData.error}`);
    }
    yield put({ type: actionNames[generalSliceName].updateAddressDetails, payload: { address, details: addressData.result } });
  } catch (e) {
    console.error(e);
  }
}

function* terminateMultisigWalletSaga(action) {
  try {
    const {
      payload: { wallet, user }
    } = action;
    yield call(terminate, wallet.address, wallet.author, user.address);
  } catch (e) {
    console.error(e);
  }
}

function* appRootSaga() {
  yield takeLatest(actionNames.processLogin, processLogin);
  yield takeLatest(actionNames.processlogout, processlogout);
  yield takeLatest(actionNames.refreshTokens, refreshTokens);
  yield takeLeading(actionNames.getData, getData);
  yield takeLeading(actionNames.createMultisigWallet, createMultisigWallet);
  yield takeLeading(actionNames.getUserWallets, getUserWallets);
  yield takeLeading(actionNames.creatingMultisigWallet, creatingMultisigWallet);
  yield takeLeading(actionNames.deleteDraftWallet, deleteDraftWallet);
  yield takeLeading(actionNames.activateDraftWallet, activateDraftWallet);
  yield takeLeading(actionNames.addSignerToDraftWallet, addSignerToDraftWallet);
  yield takeLeading(actionNames.addingSignerToMultisigWallet, addingSignerToMultisigWallet);
  yield takeLeading(actionNames.createProposal, createProposalSaga);
  yield takeLeading(actionNames.editProposal, editProposalSaga);
  yield takeLeading(actionNames.deleteProposal, deleteProposalSaga);
  yield takeLeading(actionNames.getWalletDraftTransactions, getWalletDraftTransactionsSaga);
  yield takeLeading(actionNames.getWalletTransactions, getWalletTransactionsSaga);
  yield takeLeading(actionNames.createDraftTransaction, createDraftTransactionSaga);
  yield takeLeading(actionNames.signDraftTransaction, signDraftTransactionSaga);
  yield takeLeading(actionNames.signingDraftTransaction, signingDraftTransactionSaga);
  yield takeLeading(actionNames.executeDraftTransaction, executeDraftTransactionSaga);
  yield takeLeading(actionNames.executingDraftTransaction, executingDraftTransactionSaga);
  yield takeLeading(actionNames.manuallyExecuteDraftTransaction, manuallyExecuteDraftTransactionSaga);
  yield takeLeading(actionNames.deleteDraftTransaction, deleteDraftTransactionSaga);
  yield takeLeading(actionNames.getAddressDetails, getAddressDetailsSaga);
  yield takeLeading(actionNames.terminateMultisigWallet, terminateMultisigWalletSaga);
}

export default appRootSaga;
