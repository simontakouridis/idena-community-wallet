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
  rpcGetBalance,
  getLastEpoch,
  getTransaction,
  getMultisigContract,
  postNewDraftWallet,
  postNewSigner,
  getDraftWallets,
  deleteWallet,
  activateWallet,
  postNewProposal,
  editProposal,
  deleteProposal,
  getWalletTransactions
} from './api';
import { getAuthLocalStorage, setAuthLocalStorage, removeAuthLocalStorage } from './utilities';
import { appConfigurations } from './../core/constants';
import { getDeployMultisigPayload, getAddSignerPayload } from './../core/idenaUtilities';
import { Transaction } from './idenaTransaction';

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
      call(getUsers, { role: 'admin' }),
      call(getWallets),
      call(getProposals),
      call(getTransactions)
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
    const { nonce, epoch } = yield call(getNonceAndEpoch, user.address);
    const multisigPayload = getDeployMultisigPayload('5', '3');
    const tx = new Transaction(nonce, epoch, 0xf, '', 4 * 10 ** 18, 0.1 * 10 ** 18, 0, multisigPayload.toBytes());
    const unsignedRawTx = '0x' + tx.toHex();
    const params = new URLSearchParams({
      tx: unsignedRawTx,
      callback_format: 'html',
      callback_url: encodeURIComponent(`${appConfigurations.localBaseUrl}/create-wallet/creating`)
    });
    window.location.href = `${appConfigurations.idenaRawTxUrl}?` + params.toString();
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
    const txReceipt = yield call(getNewTransactionRecipt, tx, 'DeployContract', user.address);
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
    const draftWallets = yield call(getDraftWallets, { author: user.address });
    const walletsCreated = yield call(getWallets, { author: user.address });

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
      payload: { draftWallet }
    } = action;
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'deletingWallet', loading: true } });
    yield call(deleteWallet, draftWallet);
    yield put({ type: actionNames[generalSliceName].clearDraftWallet });
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
    const { nonce, epoch } = yield call(getNonceAndEpoch, user.address);
    const addSignerPayload = getAddSignerPayload(signer);
    const tx = new Transaction(nonce, epoch, 0x10, draftWallet.address, 4 * 10 ** 18, 0.1 * 10 ** 18, 0, addSignerPayload.toBytes());
    const unsignedRawTx = '0x' + tx.toHex();
    const params = new URLSearchParams({
      tx: unsignedRawTx,
      callback_format: 'html',
      callback_url: encodeURIComponent(`${appConfigurations.localBaseUrl}/create-wallet/adding`)
    });
    const newSignerStringified = JSON.stringify({ signer, contract: draftWallet.address });
    localStorage.setItem('newSigner', newSignerStringified);
    window.location.href = `${appConfigurations.idenaRawTxUrl}?` + params.toString();
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
    const txReceipt = yield call(getNewTransactionRecipt, tx, 'CallContract', user.address);
    const contract = txReceipt?.contractAddress.toLowerCase();
    const method = txReceipt?.method;

    if (!contract || method !== 'add') {
      throw new Error('Something went wrong with adding signer.');
    }
    const multisigContractData = yield call(getMultisigContract, contract);
    if (!multisigContractData?.signers) {
      throw new Error('Data inconsistency with new multisig contract');
    }
    const draftWallets = yield call(getDraftWallets, { address: contract });
    if (draftWallets?.length !== 1 || draftWallets[0].signers?.length + 1 !== multisigContractData?.signers.length) {
      throw new Error('Data inconsistency with draft wallet');
    }
    const remainingSigners = multisigContractData.signers.filter(signerA => !draftWallets[0].signers.find(signerB => signerB === signerA.address));
    if (remainingSigners.length !== 1) {
      throw new Error('More than one new signer detected');
    }

    const newSigner = remainingSigners[0].address;
    const newSignerLocal = localStorage.getItem('newSigner');
    const newSignerLocalParsed = newSignerLocal && JSON.parse(newSignerLocal);
    if (newSigner !== newSignerLocalParsed?.signer || contract !== newSignerLocalParsed?.contract) {
      throw new Error('Data inconsistency with new signer');
    }
    yield call(postNewSigner, newSigner, contract);
    window.location.href = `${appConfigurations.localBaseUrl}/create-wallet`;
  } catch (e) {
    console.error(e);
    toast('Error adding signer');
  } finally {
    localStorage.removeItem('newSigner');
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'addingSigner', loading: false } });
  }
}

function* getNonceAndEpoch(userAddress) {
  const balanceData = yield call(rpcGetBalance, userAddress);
  const nonce = balanceData.nonce + 1;
  const epochData = yield call(getLastEpoch);
  const epoch = epochData.epoch;

  return { nonce, epoch };
}

function* getNewTransactionRecipt(tx, txType, userAddress) {
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

function* getWalletTransactionsSaga(action) {
  try {
    const {
      payload: { walletId }
    } = action;
    const walletTransactions = yield call(getWalletTransactions, { wallet: walletId });

    yield put({ type: actionNames[generalSliceName].updateWalletTransactions, payload: { walletId, walletTransactions } });
  } catch (e) {
    console.error(e);
    toast('Error getting wallet transactions');
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
  yield takeLeading(actionNames.getWalletTransactions, getWalletTransactionsSaga);
}

export default appRootSaga;
