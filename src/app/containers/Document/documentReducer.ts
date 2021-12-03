import {createAction, handleActions} from "redux-actions";
import {ApplicationError, DashboardDocumentsStatus, FDocumentDashboardShared, FetchDocumentsPayload, PayloadAction, FDocument} from "types";
import {initialApplicationState} from "../../store/constants";
import * as R from "ramda";
import {optionUtils} from "../../../utils";
import * as option from "fp-ts/lib/Option";
import {firestore} from "firebase";

export interface DocumentError extends ApplicationError {
  message: string;
}

type SessionEditor = {
  documentRef: option.Option<firestore.DocumentReference>;
  documentRefError?: DocumentError;
};

export type DocumentsState = {
  userDocuments?: FDocument[];
  sharedDocuments?: FDocumentDashboardShared[];
  documentFetchError?: DocumentError;
  documentCreated?: FDocument;
  documentCreateError?: DocumentError;
  sessionInfoFetch?: option.Option<FDocument>;
  sessionInfoFetchError?: DocumentError;
  documentFetchStatus?: DashboardDocumentsStatus;
  sessionEditor: SessionEditor;
};

export const DOCUMENT_REF_FETCH_ERROR = "DOCUMENT_REF_FETCH_ERROR";
export const documentRefFetchError = createAction<DocumentError>(DOCUMENT_REF_FETCH_ERROR);

export const DOCUMENT_REF_FETCH = "DOCUMENT_REF_FETCH";
export const documentRefFetch = createAction<option.Option<firestore.DocumentReference>>(DOCUMENT_REF_FETCH);


export const SESSION_INFO_FETCH_ERROR = "SESSION_INFO_FETCH_ERROR";
export const sessionInfoFetchError = createAction<DocumentError>(SESSION_INFO_FETCH_ERROR);

export const SESSION_INFO_FETCH = "SESSION_INFO_FETCH";
export const sessionInfoFetch = createAction<option.Option<FDocument>>(SESSION_INFO_FETCH);

export const DOCUMENT_USER_FETCH_ERROR = "DOCUMENT_USER_FETCH_ERROR";
export const documentsByUserFetchError = createAction<DocumentError>(DOCUMENT_USER_FETCH_ERROR);

export const DOCUMENT_USER_FETCH_SUCCESS = "DOCUMENT_USER_FETCH_SUCCESS";
export const documentsByUserFetchSuccess = createAction<FetchDocumentsPayload>(DOCUMENT_USER_FETCH_SUCCESS);

export const DOCUMENT_CREATE_ERROR = "DOCUMENT_CREATE_ERROR";
export const documentCreateError = createAction<DocumentError>(DOCUMENT_CREATE_ERROR);

export const DOCUMENT_CREATED = "DOCUMENT_CREATED";
export const documentCreateSuccess = createAction<FDocument>(DOCUMENT_CREATED);

export const DOCUMENT_DASHBOARD_STATUS = "DOCUMENT_DASHBOARD_STATUS";
export const documentDashboardStatus = createAction<DashboardDocumentsStatus>(DOCUMENT_DASHBOARD_STATUS);

export const DELETE_DOCUMENT_SUCCESS = "DELETE_DOCUMENT_SUCCESS";
export const deleteDocumentSuccess = createAction<option.Option<FDocument>>(DELETE_DOCUMENT_SUCCESS);

export const DELETE_DOCUMENT_ERROR = "DELETE_DOCUMENT_ERROR";
export const deleteDocumentError = createAction<FDocument>(DELETE_DOCUMENT_ERROR);

export const documentsReducer = handleActions<DocumentsState,
  FetchDocumentsPayload | DocumentError | FDocument | DashboardDocumentsStatus | option.Option<FDocument> | option.Option<firestore.DocumentReference>>(
  {
    [DOCUMENT_REF_FETCH]: (state: DocumentsState, {payload: documentRef}: PayloadAction<option.Option<firestore.DocumentReference>>): DocumentsState => {
      return {
        ...state,
        sessionEditor: {
          documentRef: documentRef
        }
      };
    },
    [DOCUMENT_REF_FETCH_ERROR]: (state: DocumentsState, {payload: error}: PayloadAction<DocumentError>) => {
      return {
        ...state,
        sessionEditor: {
          documentRefError: error,
          documentRef: option.none
        }
      };
    },
    [DOCUMENT_DASHBOARD_STATUS]: (state: DocumentsState, {payload: documentFetchStatus}: PayloadAction<DashboardDocumentsStatus>) => {
      return {
        ...state,
        documentFetchStatus
      };
    },
    [DOCUMENT_USER_FETCH_SUCCESS]: (state: DocumentsState, {payload: {userDocuments, sharedDocuments}}: PayloadAction<FetchDocumentsPayload>): DocumentsState => {
      return {
        ...state,
        userDocuments: R.unionWith(
          R.eqBy(R.prop("documentId")),
          optionUtils.fromUndefinedA(state.userDocuments).getOrElse([]), userDocuments
        ),
        sharedDocuments: R.unionWith(
          R.eqBy(R.prop("documentId")),
          optionUtils.fromUndefinedA(state.sharedDocuments).getOrElse([]), sharedDocuments
        ),
        documentFetchStatus: DashboardDocumentsStatus.SUCCESS
      };
    },
    [DELETE_DOCUMENT_ERROR]: (state: DocumentsState, {payload: document}: PayloadAction<FDocument>) => {
      return {
        ...state,
        documentFetchStatus: DashboardDocumentsStatus.DELETE_FAILED
      };
    },
    [DELETE_DOCUMENT_SUCCESS]: (state: DocumentsState, {payload: {documentId: deletedDocumentId}}: PayloadAction<FDocument>) => {
      const {userDocuments = []} = state;
      return {
        ...state,
        userDocuments: userDocuments.filter(({documentId}) => documentId !== deletedDocumentId),
        documentFetchStatus: DashboardDocumentsStatus.DELETE_SUCCESS
      };
    },
    [SESSION_INFO_FETCH_ERROR]: (state: DocumentsState, {payload: error}: PayloadAction<DocumentError>): DocumentsState => {
      return {
        ...state,
        sessionInfoFetchError: error
      };
    },
    [DOCUMENT_USER_FETCH_ERROR]: (state: DocumentsState, {payload: error}: PayloadAction<DocumentError>): DocumentsState => {
      return {
        ...state,
        documentFetchError: error,
        documentFetchStatus: DashboardDocumentsStatus.FAILED
      };
    },
    [DOCUMENT_CREATE_ERROR]: (state: DocumentsState, {payload: error}: PayloadAction<DocumentError>): DocumentsState => {
      return {
        ...state,
        documentCreateError: error
      };
    },
    [SESSION_INFO_FETCH]: (state: DocumentsState, {payload: document}: PayloadAction<option.Option<FDocument>>): DocumentsState => {
      return {
        ...state,
        sessionInfoFetch: document
      };
    },
    [DOCUMENT_CREATED]: (state: DocumentsState, {payload: document}: PayloadAction<FDocument>): DocumentsState => {
      return {
        ...state,
        documentCreated: document
      };
    }
  },
  initialApplicationState.documentState
);
