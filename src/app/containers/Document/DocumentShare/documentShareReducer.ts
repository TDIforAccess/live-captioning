import {createAction, handleActions} from "redux-actions";
import {ApplicationError, PayloadAction} from "types";
import {initialApplicationState} from "../../../store/constants";

export interface DocumentShareError extends ApplicationError {
  message: string;
}

export type DocumentShareState = {
  documentShareError?: DocumentShareError;
  documentShareSuccess?: string[];
};


export const DOCUMENT_SHARE_SUCCESS = "DOCUMENT_SHARE_SUCCESS";
export const documentShareSuccess = createAction<string[]>(DOCUMENT_SHARE_SUCCESS);

export const DOCUMENT_SHARE_ERROR = "DOCUMENT_SHARE_ERROR";
export const documentShareError = createAction<DocumentShareError>(DOCUMENT_SHARE_ERROR);


export const documentsShareReducer = handleActions<DocumentShareState, string[] | DocumentShareError>(
  {
    [DOCUMENT_SHARE_SUCCESS]: (state: DocumentShareState, {payload: ids}: PayloadAction<string[]>): DocumentShareState => {
      return {
        ...state,
        documentShareSuccess: ids
      };
    },
    [DOCUMENT_SHARE_ERROR]: (state: DocumentShareState, {payload: error}: PayloadAction<DocumentShareError>): DocumentShareState => {
      return {
        ...state,
        documentShareError: error
      };
    }
  },
  initialApplicationState.documentShareState
);
