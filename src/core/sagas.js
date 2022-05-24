import { call, put, delay, takeLeading, takeLatest } from 'redux-saga/effects';
import { sliceName as generalSliceName } from './reducer';
import { actionNames } from './constants';
import {
  idenaAuthTokenInit,
  getTokens,
  logout,
  getUsers,
  rpcGetBalance,
  getLastEpoch,
  getTransaction,
  getContract,
  getMultisigContract,
  postNewWallet,
  getWallets
} from './async';
import { getAuthLocalStorage, setAuthLocalStorage, removeAuthLocalStorage } from './utilities';
import { appConfigurations } from './../core/constants';
import { getMultisigPayload } from './../core/idenaUtilities';
import { Transaction } from './../core/transaction';

function* processLogin({ payload: idenaAuthToken }) {
  try {
    const { tokens, user } = yield call(idenaAuthTokenInit, idenaAuthToken);
    setAuthLocalStorage(JSON.stringify(tokens), JSON.stringify(user));
    yield put({ type: actionNames[generalSliceName].updateTokensSecured, payload: true });
  } catch (e) {
    console.error(e);
    yield put({ type: actionNames[generalSliceName].error, payload: 'Error logging in' });
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
    yield put({ type: actionNames[generalSliceName].error, payload: 'Error logging out' });
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
    const users = yield call(getUsers);
    if (!users) {
      throw new Error('Missing users data');
    }
    yield put({ type: actionNames[generalSliceName].updateData, payload: { users } });
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
    const balanceData = yield call(rpcGetBalance, user.address);
    const nonce = balanceData.nonce + 1;
    const epochData = yield call(getLastEpoch);
    const epoch = epochData.epoch;
    const multisigPayload = getMultisigPayload();
    const tx = new Transaction(nonce, epoch, 0xf, '', 5 * 10 ** 18, 0.1 * 10 ** 18, 0, multisigPayload.toBytes());
    const tx = new Transaction(nonce, epoch, 3, '0x0000000000000000000000000000000000000000', 1 * 10 ** 18, 2 * 10 ** 18, 0, getMultisigPayload());
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

    let contract;
    const iterations = 24;
    const delayPerIteration = 5000;
    for (let i = 0; i < iterations; i++) {
      const transactionData = yield call(getTransaction, tx);
      if (transactionData?.result?.blockHeight) {
        if (transactionData.result.type === 'DeployContract' && transactionData.result.from.toLowerCase() === user.address) {
          contract = transactionData.result.txReceipt.contractAddress.toLowerCase();
        }
        break;
      }
      if (i !== iterations - 1) {
        yield delay(delayPerIteration);
      }
    }

    if (!contract) {
      throw new Error('No contract found!');
    }

    const contractData = yield call(getContract, contract);
    if (contractData.address.toLowerCase() !== contract || contractData.type !== 'Multisig' || contractData.author.toLowerCase() !== user.address) {
      throw new Error('Data inconsistency with new contract');
    }

    const multisigContractData = yield call(getMultisigContract, contract);
    if (multisigContractData.maxVotes !== 0 || multisigContractData.maxVotes !== 0 || multisigContractData.signers.length !== 0) {
      throw new Error('Data inconsistency with new multisig contract');
    }

    const newWallet = yield call(postNewWallet, contract);
    yield put({ type: actionNames[generalSliceName].updateCreatingWallet, payload: newWallet });
  } catch (e) {
    console.error(e);
    yield put({ type: actionNames[generalSliceName].error, payload: 'Error creating wallet' });
  } finally {
    yield put({ type: actionNames[generalSliceName].updateLoader, payload: { loader: 'creatingWallet', loading: false } });
  }
}

function* getUserWallets(action) {
  try {
    const {
      payload: { user }
    } = action;

    const userWallets = yield call(getWallets, { author: user.address });
    const walletCreating = userWallets.find(wallet => !wallet.round);
    const walletsCreated = userWallets.filter(wallet => !!wallet.round);

    yield put({ type: actionNames[generalSliceName].updateWalletCreating, payload: walletCreating });
    yield put({ type: actionNames[generalSliceName].updateWalletsCreated, payload: walletsCreated });
  } catch (e) {
    console.error(e);
    yield put({ type: actionNames[generalSliceName].error, payload: 'Error getting user wallets' });
  }
}

function* appRootSaga() {
  yield takeLatest(actionNames.processLogin, processLogin);
  yield takeLatest(actionNames.processlogout, processlogout);
  yield takeLatest(actionNames.refreshTokens, refreshTokens);
  yield takeLatest(actionNames.getData, getData);
  yield takeLatest(actionNames.createMultisigWallet, createMultisigWallet);

  yield takeLeading(actionNames.getUserWallets, getUserWallets);
  yield takeLeading(actionNames.creatingMultisigWallet, creatingMultisigWallet);
}

export default appRootSaga;
