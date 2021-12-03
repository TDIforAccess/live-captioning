import {Action, createAction} from "redux-actions";
import {FireStoreException, mailingListStore} from "../../services/firebase/firestore";
import {either, option} from "fp-ts";
import {put, call, Effect} from "redux-saga/effects";
import {MailingListData} from "./UploadMailingList";
import {
  FMailingList, mICreateFailure, mICreateSuccess,
  mIFetchSuccess,
  mIUploadFailure,
  mIUploadSuccess,
  mIUpdateFailure, mIUpdateSuccess
} from "./mailingListReducer";

export const POST_MAILING_LIST = "POST_MAILING_LIST";
export const postMailingList = createAction(POST_MAILING_LIST);

export const GET_MAILING_LIST = "GET_MAILING_LIST";
export const getMailingListByUserAction = createAction(GET_MAILING_LIST);

export const UPDATE_MAILING_LIST = "UPDATE_MAILING_LIST";
export const updateMailingListAction = createAction(UPDATE_MAILING_LIST);

export const UPLOAD_MAILING_LIST = "UPLOAD_MAILING_LIST";
export const uploadMailingListAction = createAction(UPLOAD_MAILING_LIST);


export function* getMailingListByUser(action: Action<string>) {
  try {
    if (action.payload) {
      const mailingList: either.Either<FireStoreException, FMailingList[]> = yield call(mailingListStore.fetchByUser, action.payload);
      yield mailingList.fold(
        e => put(mIUploadFailure({
          message: e.message
        })) as Effect,
        (list: FMailingList[]) => put(mIFetchSuccess(list))
      );
    }
  } catch (e) {
    yield put(mIUploadFailure({
      message: e.message
    }));
  }
}

export function* updateMailingList(action: Action<FMailingList>) {
  try {
    if (action.payload) {
      const mailingList: either.Either<FireStoreException, FMailingList> = yield call(mailingListStore.update, action.payload, action.payload.id);
      yield mailingList.fold(
        e => put(mIUpdateFailure({
          message: e.message
        })) as Effect,
        (list: FMailingList) => put(mIUpdateSuccess(list))
      );
    }
  } catch (e) {
    yield put(mIUpdateFailure({
      message: e.message
    }));
  }
}


export function* uploadMailingListSaga(action: Action<FMailingList>) {
  try {
    if (action.payload) {
      const mailingListCreated: either.Either<FireStoreException, [MailingListData, string]> = yield call(mailingListStore.create, action.payload, option.some(action.payload.id));
      yield mailingListCreated.fold(
        e => put(mIUploadFailure({
          message: e.message
        })) as Effect,
        (u: [FMailingList, string]) => put(mIUploadSuccess(u[0]))
      );
    }
  } catch (e) {
    console.error(`Exception while updating mailing list with error ${e.stack}`);
    yield put(mIUploadFailure({
      message: e.message
    }));
  }
}

export function* postMailingListSaga(action: Action<FMailingList>) {
  try {
    if (action.payload) {
      const mailingListCreated: either.Either<FireStoreException, [MailingListData, string]> = yield call(mailingListStore.create, action.payload, option.some(action.payload.id));
      yield mailingListCreated.fold(
        e => put(mICreateFailure({
          message: e.message
        })) as Effect,
        (u: [FMailingList, string]) => put(mICreateSuccess(u[0]))
      );
    }
  } catch (e) {
    console.error(`Exception while updating mailing list with error ${e.stack}`);
    yield put(mICreateFailure({
      message: e.message
    }));
  }
}
