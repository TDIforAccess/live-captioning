import {Action, createAction} from "redux-actions";
import {User, UserGivenData} from "types";
import {FireStoreException, userStore} from "../../services/firebase/firestore";
import {either, option} from "fp-ts";
import {call, Effect, put} from "redux-saga/effects";
import {push} from "connected-react-router";
import {userPostFailure, userPostSuccess} from "./basicInformationReducer";
import {CloudFunctionException, sendMail} from "../../services/firebase/functions";
import {EmailPayload, Subject, Template} from "../../../../functions/src/types";
import HttpsCallableResult = firebase.functions.HttpsCallableResult;

export const PUT_USER_INFO = "PUT_USER_INFO";
export const putUserInfo = createAction<User>(PUT_USER_INFO);

const getEmailPayload = ({email = "support@YOUR_DOMAIN.com", firstName, lastName}: UserGivenData): EmailPayload => ({
  to: email,
  body: {
    kind: Template.signup,
    firstName,
    lastName,
    loginLink: `${location.protocol}//${location.host}`
  },
  subject: Subject.signup
});

export function* putUserInfoSaga({payload}: Action<User>) {
  try {
    if (payload) {
      const user: either.Either<FireStoreException, [User, string]> = yield call(userStore.create, payload, option.some(payload.uid));
      const effects: Effect[] = user.fold(
        e => [put(userPostFailure({
          message: e.message
        }))] as Effect[],
        (u: [User, string]) => [put(userPostSuccess(u[0].userGivenData)), put(push("/dashboard"))] as Effect[]
      );
      for (const c of effects) {
        yield c;
      }
      const callableResult: either.Either<CloudFunctionException, HttpsCallableResult> =
        yield call(sendMail, getEmailPayload(payload.userGivenData));

      callableResult.fold(
        e => console.error(e),
        (callableResult: HttpsCallableResult) => console.log(callableResult)
      );
    }
  } catch (e) {
    console.error(`Exception while updating user info with error ${e.stack}`);
    yield put(userPostFailure({
      message: e.message
    }));
  }
}
