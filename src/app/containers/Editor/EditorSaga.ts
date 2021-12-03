import {Action, createAction} from "redux-actions";
import {FireStoreException} from "../../services/firebase/firestore";
import {either, option} from "fp-ts";
import {put, call, Effect} from "redux-saga/effects";
import {FUserEditorSettings} from "../../../types/domains/userSettings";
import {userEditorSettingsStore} from "../../services/firebase/firestore/UserEditorSettingsStore";
import {fetchDocumentPermissionError, fetchDocumentPermission, userEditorFetchFailed, userEditorSaveFailed, userEditorSettingsFetchSuccess, userEditorSettingsSaveSuccess} from "./EditorReducer";
import {FDocumentShare, FetchDocumentPermissions, PayloadAction} from "types";
import {documentShareStoreT} from "../../services/firebase/firestore/DocumetShareStore";

export const UPDATE_EDITOR_SETTING = "UPDATE_EDITOR_SETTING";
export const updateEditorSettingAction = createAction(UPDATE_EDITOR_SETTING);
export const FETCH_EDITOR_SETTING = "FETCH_EDITOR_SETTING";
export const fetchEditorSettingAction = createAction(FETCH_EDITOR_SETTING);
export const FETCH_DOCUMENT_PERMISSION_ACTION = "FETCH_DOCUMENT_PERMISSION_ACTION";
export const fetchDocumentPermissionsAction = createAction(FETCH_DOCUMENT_PERMISSION_ACTION);

export function* updateEditorSettingsSaga(action: Action<FUserEditorSettings>) {
  try {
    if (action.payload) {
      const promised = userEditorSettingsStore.createOrUpdate(action.payload).run();
      const userEditorSettings: either.Either<FireStoreException, option.Option<FUserEditorSettings>> = yield call(async () => promised, null);
      yield userEditorSettings.fold(
        e => {
          console.error("Error while updating settings", e);
          return put(userEditorSaveFailed({
            message: e.message
          })) as Effect;
        },
        (settings: option.Option<FUserEditorSettings>) => settings.fold(
          put(userEditorSaveFailed({
            message: "Settings not updated"
          })) as Effect,
          (a: FUserEditorSettings) => put(userEditorSettingsSaveSuccess(a))
        ));
    }
  } catch (e) {
    console.error("Error while updating settings", e);
    yield put(userEditorSaveFailed({
      message: e.message
    }));
  }
}

export function* fetchEditorSettingsSaga(action: Action<string>) {
  try {
    if (action.payload) {
      const promised = userEditorSettingsStore.fetchA(action.payload).run();
      const userEditorSettings: either.Either<FireStoreException, option.Option<FUserEditorSettings>> = yield call(async () => promised, null);
      yield userEditorSettings.fold(
        e => {
          return put(userEditorFetchFailed({
            message: e.message
          })) as Effect;
        },
        (settings: option.Option<FUserEditorSettings>) => put(userEditorSettingsFetchSuccess(settings)));
    }
  } catch (e) {
    console.error("Error while fetching settings", e);
    yield put(userEditorFetchFailed({
      message: e.message
    }));
  }
}

export function* fetchDocumentPermissionsSaga({payload: {documentId: documentId, userId: userId}}: PayloadAction<FetchDocumentPermissions>) {
  try {
    const promised = documentShareStoreT.fetchByEmailAndDocumentId(userId, documentId).run();
    const sharedDocument: either.Either<FireStoreException, option.Option<FDocumentShare>> = yield call(async () => promised, null);
    yield sharedDocument.fold(
      e => put(fetchDocumentPermissionError({
        message: e.message
      })) as Effect,
      (document: option.Option<FDocumentShare>) => put(fetchDocumentPermission(document))
    );
  } catch (e) {
    console.error(`Exception while fetching document permissions = '${documentId}' with error ${e.stack}`);
    yield put(fetchDocumentPermissionError({
      message: `Exception while fetching document permissions = '${documentId}' with error ${e}`
    }));
  }
}
