import {Action, createAction} from "redux-actions";
import * as either from "fp-ts/lib/Either";
import {documentStore, FireStoreException, realTimeDocumentStore} from "../../services/firebase/firestore";
import {call, Effect, put} from "redux-saga/effects";
import {FDocument} from "../../../types/domains/document";
import {option} from "fp-ts";
import {
  deleteDocumentError,
  deleteDocumentSuccess,
  documentCreateError,
  documentCreateSuccess,
  documentDashboardStatus,
  sessionInfoFetch,
  sessionInfoFetchError,
  documentRefFetch,
  documentRefFetchError
} from "./documentReducer";
import {DashboardDocumentsStatus, PayloadAction} from "types";
import {firestore} from "firebase";

export const CREATE_DOCUMENT = "CREATE_DOCUMENT";
export const createDocumentAction = createAction(CREATE_DOCUMENT);
export const DOCUMENT_BY_ID = "DOCUMENT_BY_ID";
export const fetchDocumentById = createAction(DOCUMENT_BY_ID);
export const DOWNLOAD_DOCUMENT = "DOWNLOAD_DOCUMENT";
export const downloadDocumentById = createAction<string>(DOWNLOAD_DOCUMENT);
export const DELETE_DOCUMENT = "DELETE_DOCUMENT";
export const deleteDocument = createAction<FDocument>(DELETE_DOCUMENT);
export const DOCUMENT_REF_BY_ID = "DOCUMENT_REF_BY_ID";
export const fetchDocumentRef = createAction<string>(DOCUMENT_REF_BY_ID);


export function* documentsRefByIdSaga(action: Action<string>) {
  try {
    if (action.payload) {
      const documents: either.Either<FireStoreException, option.Option<firestore.DocumentReference>> = yield call(realTimeDocumentStore.fetchDocReference, action.payload);
      yield documents.fold(
        e => put(documentRefFetchError({
          message: e.message
        })) as Effect,
        (doc: option.Option<firestore.DocumentReference>) => put(documentRefFetch(doc))
      );
    } else {
      yield put(documentRefFetchError({
        message: `Id not defined ${action.payload}`
      }));
    }
  } catch (e) {
    console.error(`Exception while fetching session info for id = '${action.payload}' with error ${e.stack}`);
    yield put(documentRefFetchError({
      message: e.message
    }));
  }
}

export function* createDocumentSaga(action: Action<FDocument>) {
  try {
    if (action.payload) {
      const document: either.Either<FireStoreException, [FDocument, string]> = yield call(documentStore.create, action.payload, option.some(action.payload.documentId));
      yield document.fold(
        e => put(documentCreateError({
          message: e.message
        })) as Effect,
        (doc: [FDocument, string]) => put(documentCreateSuccess(doc[0])) as Effect
      );
    }
  } catch (e) {
    yield put(documentCreateError({
      message: e.message
    })) as Effect;
  }
}

export function* documentsByIdSaga(action: Action<string>) {
  try {
    if (action.payload) {
      const documents: either.Either<FireStoreException, option.Option<FDocument>> = yield call(documentStore.fetch, action.payload);
      yield documents.fold(
        e => put(sessionInfoFetchError({
          message: e.message
        })) as Effect,
        (doc: option.Option<FDocument>) => put(sessionInfoFetch(doc))
      );
    } else {
      yield put(sessionInfoFetchError({
        message: `Id not defined ${action.payload}`
      }));
    }
  } catch (e) {
    console.error(`Exception while fetching session info for id = '${action.payload}' with error ${e.stack}`);
    yield put(sessionInfoFetchError({
      message: e.message
    }));
  }
}


export function* deleteDocumentSaga({payload: document}: PayloadAction<FDocument>) {
  yield put(documentDashboardStatus(DashboardDocumentsStatus.DELETE_PROGRESS));
  try {
    const deletedDocument: either.Either<FireStoreException, option.Option<FDocument>> =
      yield call(documentStore.update, {...document, isDeleted: true}, document.documentId);

    yield deletedDocument.fold(
      e => put(deleteDocumentError(document)) as Effect,
      (doc: option.Option<FDocument>) => put(deleteDocumentSuccess(doc))
    );

  } catch (e) {
    console.error(`Exception while deleting session info for id = '${document}' with error ${e.stack}`);
    yield put(deleteDocumentError(document));
  }
}
