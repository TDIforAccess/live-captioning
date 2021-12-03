import {ForkEffect, takeLatest} from "redux-saga/effects";
import {LOGIN_USER, LOGOUT_USER} from "../containers/Authentication/authenticationReducers";
import {userLoginSaga, logoutSaga} from "../containers/Authentication/authenticationSaga";
import {PUT_USER_INFO, putUserInfoSaga} from "../containers/BasicInfomation/basicInformationSaga";
import {
  CREATE_DOCUMENT,
  createDocumentSaga, DELETE_DOCUMENT, deleteDocumentSaga, DOCUMENT_BY_ID, DOCUMENT_REF_BY_ID,
  documentsByIdSaga, documentsRefByIdSaga
} from "../containers/Document/documentSaga";
import {
  GET_MAILING_LIST,
  getMailingListByUser,
  POST_MAILING_LIST,
  postMailingListSaga,
  UPDATE_MAILING_LIST,
  updateMailingList,
  UPLOAD_MAILING_LIST,
  uploadMailingListSaga
} from "../containers/MailingList/mailingListSaga";
import {FETCH_USER_INFO, fetchUserInfoSaga, UPDATE_USER_INFO, updateUserInfoSaga} from "../containers/Profile/userSaga";
import {FETCH_DOCUMENTS_BY_USER, documentsByUserSaga} from "../containers/Dashboard/dashboardSaga";
import {DOCUMENT_SHARE_POST, documentSharePostSaga} from "../containers/Document/DocumentShare/documentShareSaga";
import {
  FETCH_EDITOR_SETTING,
  fetchEditorSettingsSaga,
  UPDATE_EDITOR_SETTING,
  updateEditorSettingsSaga,
  fetchDocumentPermissionsSaga,
  FETCH_DOCUMENT_PERMISSION_ACTION
} from "../containers/Editor/EditorSaga";


/*function* logger(action: any) {
  console.log("Action:", action, "state after:", yield select());
}*/

export function* rootSaga(): IterableIterator<ForkEffect> {
  // yield takeEvery("*", logger);
  yield takeLatest(LOGIN_USER, userLoginSaga);
  yield takeLatest(LOGOUT_USER, logoutSaga);
  yield takeLatest(PUT_USER_INFO, putUserInfoSaga);
  yield takeLatest(CREATE_DOCUMENT, createDocumentSaga);
  yield takeLatest(FETCH_DOCUMENTS_BY_USER, documentsByUserSaga);
  yield takeLatest(POST_MAILING_LIST, postMailingListSaga);
  yield takeLatest(GET_MAILING_LIST, getMailingListByUser);
  yield takeLatest(UPDATE_MAILING_LIST, updateMailingList);
  yield takeLatest(UPLOAD_MAILING_LIST, uploadMailingListSaga);
  yield takeLatest(DOCUMENT_BY_ID, documentsByIdSaga);
  yield takeLatest(FETCH_USER_INFO, fetchUserInfoSaga);
  yield takeLatest(UPDATE_USER_INFO, updateUserInfoSaga);
  yield takeLatest(DOCUMENT_SHARE_POST, documentSharePostSaga);
  yield takeLatest(DELETE_DOCUMENT, deleteDocumentSaga);
  yield takeLatest(DOCUMENT_REF_BY_ID, documentsRefByIdSaga);
  yield takeLatest(UPDATE_EDITOR_SETTING, updateEditorSettingsSaga);
  yield takeLatest(FETCH_EDITOR_SETTING, fetchEditorSettingsSaga);
  yield takeLatest(FETCH_DOCUMENT_PERMISSION_ACTION, fetchDocumentPermissionsSaga);
}
