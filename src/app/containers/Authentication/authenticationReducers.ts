import {createAction, handleActions} from "redux-actions";
import {ApplicationError, PayloadAction} from "types";
import {UserState} from "../../../types/application";
import {initialApplicationState} from "../../store/constants";
import * as firebase from "firebase";
import {FirebaseUser, User} from "../../../types/domains/user";
import * as option from "fp-ts/lib/Option";



export const LOGIN_USER = "LOGIN_USER";
export const loginUser = createAction<{userCredential: firebase.auth.UserCredential; location: string}>(LOGIN_USER);

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const loginSuccess = createAction<FirebaseUser>(LOGIN_SUCCESS);

export const LOGOUT_USER = "LOGOUT_USER";
export const logoutUser = createAction(LOGOUT_USER);

export const LOGOUT_USER_STORE = "LOGOUT_USER_STORE";
export const logoutUserStore = createAction(LOGOUT_USER_STORE);

export const LOGIN_FAILED = "LOGIN_FAILED";

export interface LoginError extends ApplicationError {
  message: string;
}

export interface UserError extends ApplicationError {
  message: string;
}

export const loginFailed = createAction<LoginError>(LOGIN_FAILED);

export type LoginReducerInput = FirebaseUser | LoginError;

const USER_FETCH_FAILED = "USER_FETCH_FAILED";
const USER_FETCH_SUCCESS = "USER_FETCH_SUCCESS";
export const userFetchFailure = createAction<UserError>(USER_FETCH_FAILED);
export const userFetchSuccess = createAction<option.Option<User>>(USER_FETCH_SUCCESS);

const USER_UPDATE_FAILED = "USER_UPDATE_FAILED";
const USER_UPDATE_SUCCESS = "USER_UPDATE_SUCCESS";
export const userUpdateFailure = createAction<UserError>(USER_UPDATE_FAILED);
export const userUpdateSuccess = createAction<boolean>(USER_UPDATE_SUCCESS);


export const userReducer = handleActions<UserState, LoginReducerInput | option.Option<User> | boolean>(
  {
    [LOGIN_SUCCESS]: (state: UserState, {payload: user}: PayloadAction<FirebaseUser>): UserState => {
      return {
        ...state,
        firebaseUser: user
      };
    },
    [LOGIN_FAILED]: (state: UserState, {payload: loginError}: PayloadAction<LoginError>): UserState => {
      return {
        ...state,
        loginError: loginError
      };
    },
    [USER_FETCH_FAILED]: (state: UserState, {payload: error}: PayloadAction<UserError>): UserState => {
      return {
        ...state,
        userInfoFetchError: error
      };
    },
    [USER_FETCH_SUCCESS]: (state: UserState, {payload: userInfo}: PayloadAction<option.Option<User>>): UserState => {
      return {
        ...state,
        userInfo: userInfo
      };
    },
    [USER_UPDATE_FAILED]: (state: UserState, {payload: error}: PayloadAction<UserError>): UserState => {
      return {
        ...state,
        userUpdateError: error
      };
    },
    [USER_UPDATE_SUCCESS]: (state: UserState, {payload: isUpdated}: PayloadAction<boolean>): UserState => {
      return {
        ...state,
        userUpdateSuccess: isUpdated
      };
    },
    [LOGOUT_USER_STORE]: (state: UserState, _: PayloadAction<any>) => {
      const {firebaseUser, ...rest} = state;
      return {
        ...rest
      };
    }
  },
  initialApplicationState.userState
);
