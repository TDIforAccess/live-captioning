import * as Redux from "redux";
import {Action} from "redux-actions";
import {BIState} from "../app/containers/BasicInfomation/basicInformationReducer";
import {FirebaseUser, User} from "./domains/user";
import {LoginError, UserError} from "../app/containers/Authentication/authenticationReducers";
import {DocumentsState} from "../app/containers/Document/documentReducer";
import {MIState} from "../app/containers/MailingList/mailingListReducer";
import {InjectedTranslateProps} from "react-i18next";
import {WithAuthenticationState} from "../app/containers/Authentication/withAuthentication";
import {FormComponentProps} from "antd/lib/form";
import * as option from "fp-ts/lib/Option";
import {DocumentShareState} from "../app/containers/Document/DocumentShare/documentShareReducer";
import {FDocument, FDocumentDashboardShared} from "types";
import {EditorGlobalState} from "../app/containers/Editor/EditorReducer";


export type CommonStateProps = WithAuthenticationState & InjectedTranslateProps;
export type CommonFormStateProps = FormComponentProps & WithAuthenticationState & InjectedTranslateProps;

export type UserState = {
  firebaseUser?: FirebaseUser;
  userInfo?: option.Option<User>;
  userInfoFetchError?: UserError;
  loginError?: LoginError;
  userUpdateError?: UserError;
  userUpdateSuccess?: boolean;
};
export type ApplicationState = Readonly<{
  userState: UserState;
  basicInformationState: BIState;
  documentState: DocumentsState;
  mailingListState: MIState;
  documentShareState: DocumentShareState;
  editorState: EditorGlobalState;
}>;

export type Store = Redux.Store<ApplicationState>;

export interface PayloadAction<T> extends Action<T> {
  payload: T;
}

export interface ApplicationStateDispatcher extends Redux.Dispatch<ApplicationState> {
  (action: any): ApplicationState;
}


export interface ApplicationError {
  message: string;
}

export type CountryUnit = {
  name: string;
  code: string;
};

export type StateUnit = {
  name: string;
  abbreviation: string;
};

export interface CustomRouteProps {
  component: any;
  path?: string;
  exact?: boolean;
  name?: string;
}

export const enum DashboardDocumentsStatus {
  PROGRESS = "progress",
  FAILED = "failed",
  SUCCESS = "success",
  DELETE_PROGRESS = "deleteProgress",
  DELETE_FAILED = "deleteFailed",
  DELETE_SUCCESS = "deleteSuccess"
}

export type EditorRouteProps = {
  user: string;
  documentId: string;
};

export type FetchDocumentsPayload = {
  userDocuments: FDocument[];
  sharedDocuments: FDocumentDashboardShared[];
};

export type FetchByUserPayload = {
  userId: string;
  email: string;
};

export type FetchDocumentPermissions = {
  userId: string;
  documentId: string;
};


export const enum MailingListCreator {
  upload = "upload",
  create = "create"
}
