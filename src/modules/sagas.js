import { put, takeEvery, fork, all, call } from 'redux-saga/effects';
import { actions } from 'modules/app';
import * as api from 'utils/api';

// Sagas
function* fetchRequests(action) {
  try {
    const data = yield call(api.fetchRequests, action.payload.url);
    yield put(actions.receiveRequests(data));
  } catch (err) {
    console.log(err);
  }
}

function* watchRequestRequests() {
  yield takeEvery(actions.REQUESTS_REQUEST, fetchRequests);
}

// Root saga
export default function* rootSaga() {
  yield all([fork(watchRequestRequests)]);
}
