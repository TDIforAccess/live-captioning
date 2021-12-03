import {createAction, handleActions} from "redux-actions";
import {ApplicationError, FDocumentShare, PayloadAction} from "types";
import {initialApplicationState} from "../../store/constants";
import {option} from "fp-ts";
import {FUserEditorSettings} from "../../../types/domains/userSettings";
import {DocumentError} from "../Document/documentReducer";


export interface EditorError extends ApplicationError {
  message: string;
}

export type EditorGlobalState = {
  userEditorSettingsSaveError?: EditorError;
  userEditorSettings: option.Option<FUserEditorSettings>;
  userEditorSettingsFetchError?: EditorError;
  userEditorFetchSettings: option.Option<FUserEditorSettings>;
  editorSettingsInitial: option.Option<FUserEditorSettings>;
  fetchDocumentPermissionError?: DocumentError;
  fetchDocumentPermission?: option.Option<FDocumentShare>;
};

export const UES_SAVE_FAILED = "UES_SAVE_FAILED";
export const UES_SAVE_SUCCESS = "UES_SAVE_SUCCESS";
export const userEditorSaveFailed = createAction<EditorError>(UES_SAVE_FAILED);
export const userEditorSettingsSaveSuccess = createAction<FUserEditorSettings>(UES_SAVE_SUCCESS);

export const UES_FETCH_FAILED = "UES_FETCH_FAILED";
export const UES_FETCH_SUCCESS = "UES_FETCH_SUCCESS";
export const userEditorFetchFailed = createAction<EditorError>(UES_FETCH_FAILED);
export const userEditorSettingsFetchSuccess = createAction<option.Option<FUserEditorSettings>>(UES_FETCH_SUCCESS);

export const FETCH_DOCUMENT_PERMISSION_ERROR = "FETCH_DOCUMENT_PERMISSION_ERROR";
export const fetchDocumentPermissionError = createAction<EditorError>(FETCH_DOCUMENT_PERMISSION_ERROR);

export const FETCH_DOCUMENT_PERMISSION = "FETCH_DOCUMENT_PERMISSION";
export const fetchDocumentPermission = createAction<option.Option<FDocumentShare>>(FETCH_DOCUMENT_PERMISSION);

export const editorReducer = handleActions<EditorGlobalState, EditorError | FUserEditorSettings | option.Option<FUserEditorSettings> | option.Option<FDocumentShare> >(
  {
    [FETCH_DOCUMENT_PERMISSION_ERROR]: (state: EditorGlobalState, {payload: error}: PayloadAction<EditorError>) => {
      return {
        ...state,
        fetchDocumentPermissionError: error
      };
    },
    [FETCH_DOCUMENT_PERMISSION]: (state: EditorGlobalState, {payload: fDocument}: PayloadAction<option.Option<FDocumentShare>>) => {
      return {
        ...state,
        fetchDocumentPermission: fDocument
      };
    },
    [UES_SAVE_FAILED]: (state: EditorGlobalState, {payload: error}: PayloadAction<EditorError>): EditorGlobalState => {
      return {
        ...state,
        userEditorSettingsSaveError: error
      };
    },
    [UES_SAVE_SUCCESS]: (state: EditorGlobalState, {payload: settings}: PayloadAction<FUserEditorSettings>): EditorGlobalState => {
      return {
        ...state,
        userEditorSettings: option.some(settings)
      };
    },
    [UES_FETCH_FAILED]: (state: EditorGlobalState, {payload: error}: PayloadAction<EditorError>): EditorGlobalState => {
      return {
        ...state,
        userEditorSettingsSaveError: error
      };
    },
    [UES_FETCH_SUCCESS]: (state: EditorGlobalState, {payload: settings}: PayloadAction<option.Option<FUserEditorSettings>>): EditorGlobalState => {
      return {
        ...state,
        editorSettingsInitial: settings
      };
    }
  },
  initialApplicationState.editorState
);
