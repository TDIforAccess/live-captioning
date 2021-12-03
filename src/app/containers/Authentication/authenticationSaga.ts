import {put, call, Effect} from "redux-saga/effects";
import {Action} from "redux-actions";
import {push} from "connected-react-router";
import * as R from "ramda";
import {firebaseAuth} from "../../services/firebase/firebaseApp";
import {FireStoreException, userStore} from "../../services/firebase/firestore";
import {loginFailed, loginSuccess, logoutUserStore} from "./authenticationReducers";
import {option, either} from "fp-ts";
import {User} from "../../../types/domains/user";

const redirectToDashboardOrBI = (location: string) => (r: option.Option<User>) => {
  if (location) {
    return put(push(location));
  } else {
    return r.fold(
      put(push("/basicInformation")) as Effect,
      (s) => put(push("/dashboard")) as Effect
    );
  }
};

export function* userLoginSaga(action: Action<{ userCredential: firebase.auth.UserCredential; location: string}>) {
  try {
    if (action.payload && action.payload.userCredential.user) {
      yield put(loginSuccess(action.payload.userCredential.user));
      const userInformation: either.Either<FireStoreException, option.Option<User>> = yield call(
        userStore.fetch, action.payload.userCredential.user.uid
      );
      yield userInformation.map(redirectToDashboardOrBI(action.payload.location)).fold(
        e => put(loginFailed({
          message: e.message
        })) as Effect,
        R.identity
      );
    }
  } catch (e) {
    console.error(`Exception while user login user info with error ${e.stack}`);
    yield put(loginFailed({
      message: e.message
    }));
  }
}

export function* logoutSaga(action: Action<null>) {
  try {
    yield call([firebaseAuth, firebaseAuth.signOut]);
    yield put(logoutUserStore());
    // TODO remove user info on logout
  } catch (e) {
    console.error(`Exception while user logout with error ${e}`);
    yield put(loginFailed({
      message: e.message
    }));
  }
}
