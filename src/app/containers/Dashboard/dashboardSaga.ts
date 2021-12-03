import {createAction} from "redux-actions";
import * as either from "fp-ts/lib/Either";
import {documentShareStore, documentStore, FireStoreException} from "../../services/firebase/firestore";
import {DashboardDocumentsStatus, FDocument, FDocumentDashboardShared, FDocumentShare, FetchByUserPayload, PayloadAction} from "types";
import {call, Effect, put} from "redux-saga/effects";
import {documentDashboardStatus, documentsByUserFetchError, documentsByUserFetchSuccess} from "../Document/documentReducer";

export const FETCH_DOCUMENTS_BY_USER = "FETCH_DOCUMENTS_BY_USER";
export const fetchDocumentsByUser = createAction<FetchByUserPayload>(FETCH_DOCUMENTS_BY_USER);

const fetchAllDocuments = async (sharedDocs: FDocumentDashboardShared[]) =>
  Promise.all(sharedDocs.map(async ({documentId, email, permission, invitedBy}) => {
    const doc = await documentStore.fetchSimple(documentId);
    return {...doc, email, permission, invitedBy};
  }));

export function* documentsByUserSaga({payload: {userId, email}}: PayloadAction<FetchByUserPayload>) {
  yield put(documentDashboardStatus(DashboardDocumentsStatus.PROGRESS));
  try {
    const documents: either.Either<FireStoreException, FDocument[]> = yield call(documentStore.fetchByUser, userId);
    const sharedList: either.Either<FireStoreException, FDocumentShare[]> = yield call(documentShareStore.fetchByEmail, email);

    const sharedDocuments = yield sharedList.fold(
      e => put(documentsByUserFetchError({
        message: e.message
      })) as Effect,
      (sharedDocs: FDocumentShare[]) => call(fetchAllDocuments, sharedDocs)
    );

    yield documents.fold(
      e => put(documentsByUserFetchError({
        message: e.message
      })) as Effect,
      (userDocuments: FDocument[]) => put(documentsByUserFetchSuccess({userDocuments, sharedDocuments})) as Effect
    );

  } catch (e) {
    console.error(`Exception while fetching documents for user ${e.stack}`);
    yield put(documentsByUserFetchError({
      message: e.message
    }));
  }
}
