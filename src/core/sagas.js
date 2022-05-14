import { call, put, takeLatest } from 'redux-saga/effects';
import { sliceName as generalSliceName } from './reducer';
import { actionNames } from './constants';
import { idenaAuthTokenInit, getTokens, logout } from './async';
import { getAuthLocalStorage, setAuthLocalStorage } from './utilities';

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
    if (!tokens?.refresh?.token) {
      throw new Error('Refresh Token missing with logout');
    }
    yield call(logout, tokens.refresh.token);
    setAuthLocalStorage('', '');
    yield put({ type: actionNames[generalSliceName].updateTokensSecured, payload: false });
  } catch (e) {
    console.error(e);
    yield put({ type: actionNames[generalSliceName].error, payload: 'Error logging out' });
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
    console.error(e);
  }
}

function* appRootSaga() {
  yield takeLatest(actionNames.processLogin, processLogin);
  yield takeLatest(actionNames.processlogout, processlogout);
  yield takeLatest(actionNames.refreshTokens, refreshTokens);
}

export default appRootSaga;
