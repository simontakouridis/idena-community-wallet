import { put, takeLatest } from 'redux-saga/effects';
import { actionNames } from './reducers';

function* fetchUser() {
  try {
    yield put({ type: actionNames.increment, user: {} });
  } catch (e) {
    yield put({ type: actionNames.decrement, message: e.message });
  }
}

function* appRootSaga() {
  yield takeLatest(actionNames.incrementByAmount, fetchUser);
}

export default appRootSaga;
