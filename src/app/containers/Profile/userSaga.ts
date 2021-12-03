import {Action, createAction} from "redux-actions";
import {User} from "../../../types/domains/user";
import {FireStoreException, userStore} from "../../services/firebase/firestore";
import {either, option} from "fp-ts";
import {put, call, Effect} from "redux-saga/effects";
import {userFetchFailure, userFetchSuccess, userUpdateFailure, userUpdateSuccess} from "../Authentication/authenticationReducers";

export const FETCH_USER_INFO = "FETCH_USER_INFO";
export const fetchUserInfo = createAction(FETCH_USER_INFO);

export function* fetchUserInfoSaga(action: Action<string>) {
  try {
    if (action.payload) {
      const user: either.Either<FireStoreException, option.Option<User>> = yield call(userStore.fetch, action.payload);
      yield user.fold(
        e => put(userFetchFailure({
          message: e.message
        })) as Effect,
        (u: option.Option<User>) => put(userFetchSuccess(u))
      );
    }
  } catch (e) {
    console.error(`Exception while fetching user info with error ${e.stack}`);
    yield put(userFetchFailure({
      message: e.message
    }));
  }
}

export const UPDATE_USER_INFO = "UPDATE_USER_INFO";
export const updateUserInfo = createAction(UPDATE_USER_INFO);

export function* updateUserInfoSaga(action: Action<User>) {
  try {
    if (action.payload) {
      const user: either.Either<FireStoreException, User> = yield call(userStore.update, action.payload, action.payload.uid);
      const effects: Effect[] = user.fold(
        e => [put(userUpdateFailure({
          message: e.message
        }))] as Effect[],
        (u: User) => [put(userUpdateSuccess(true)), put(userFetchSuccess(option.some(u)))]
      );

      for (const c of effects) {
        yield c;
      }
    }
  } catch (e) {
    console.error(`Exception while fetching user info with error ${e.stack}`);
    yield put(userFetchFailure({
      message: e.message
    }));
  }
}
