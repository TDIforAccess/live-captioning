import {createAction, handleActions} from "redux-actions";
import {ApplicationError, PayloadAction} from "types";
import {initialApplicationState} from "../../store/constants";
import * as R from "ramda";
import {Emails} from "./UploadMailingList";
import {optionUtils} from "../../../utils";


export interface MailingListError extends ApplicationError {
  message: string;
}

export type FMailingList = {
  listName: string;
  emailList: Emails[];
  userId: string;
  id: string;
};

export type MIState = {
  mailingListCreateError?: MailingListError;
  mailingListFetchError?: MailingListError;
  mailingListUpdateError?: MailingListError;
  mailingListUploadError?: MailingListError;
  mailingListCreated?: FMailingList;
  mailingListUploaded?: FMailingList;
  userMailingLists?: FMailingList[];
  mailingListUpdated?: FMailingList;
};

export const MI_FETCH_SUCCESS = "MI_FETCH_SUCCESS";
export const MI_UPLOAD_FAILED = "MI_UPLOAD_FAILED";
export const MI_UPLOAD_SUCCESS = "MI_UPLOAD_SUCCESS";
export const MI_UPDATE_FAILED = "MI_UPDATE_FAILED";
export const MI_UPDATE_SUCCESS = "MI_UPDATE_SUCCESS";
export const MI_CREATE_FAILED = "MI_CREATE_FAILED";
export const MI_CREATE_SUCCESS = "MI_CREATE_SUCCESS";
export const mIUploadFailure = createAction<MailingListError>(MI_UPLOAD_FAILED);
export const mIUploadSuccess = createAction<FMailingList>(MI_UPLOAD_SUCCESS);
export const mICreateFailure = createAction<MailingListError>(MI_CREATE_FAILED);
export const mICreateSuccess = createAction<FMailingList>(MI_CREATE_SUCCESS);
export const mIFetchSuccess = createAction<FMailingList[]>(MI_FETCH_SUCCESS);
export const mIUpdateSuccess = createAction<FMailingList>(MI_UPDATE_SUCCESS);
export const mIUpdateFailure = createAction<MailingListError>(MI_UPDATE_FAILED);


const updateORInsert = (baseArray: FMailingList[]) => (object: FMailingList) => {
  const objToChange = R.findIndex(R.propEq("id", object.id))(baseArray);

  if (objToChange === -1) {
    return R.prepend(object, baseArray);
  } else {
    return R.update(objToChange, object, baseArray);
  }
};

export const mailingListReducer = handleActions<MIState, MailingListError | FMailingList | FMailingList[]>(
  {
    [MI_UPLOAD_FAILED]: (state: MIState, {payload: error}: PayloadAction<MailingListError>): MIState => {
      return {
        ...state,
        mailingListUploadError: error
      };
    },
    [MI_UPLOAD_SUCCESS]: (state: MIState, {payload: mailingList}: PayloadAction<FMailingList>): MIState => {
      return {
        ...state,
        mailingListUploaded: mailingList,
        userMailingLists: updateORInsert(optionUtils.fromUndefinedA(state.userMailingLists).getOrElse([]))(mailingList)
      };
    },
    [MI_CREATE_FAILED]: (state: MIState, {payload: error}: PayloadAction<MailingListError>): MIState => {
      return {
        ...state,
        mailingListCreateError: error
      };
    },
    [MI_CREATE_SUCCESS]: (state: MIState, {payload: mailingList}: PayloadAction<FMailingList>): MIState => {
      return {
        ...state,
        mailingListCreated: mailingList,
        userMailingLists: updateORInsert(optionUtils.fromUndefinedA(state.userMailingLists).getOrElse([]))(mailingList)
      };
    },
    [MI_FETCH_SUCCESS]: (state: MIState, {payload: mailingList}: PayloadAction<FMailingList[]>): MIState => {
      return {
        ...state,
        userMailingLists: mailingList
      };
    },
    [MI_UPDATE_FAILED]: (state: MIState, {payload: error}: PayloadAction<MailingListError>): MIState => {
      return {
        ...state,
        mailingListUpdateError: error
      };
    },
    [MI_UPDATE_SUCCESS]: (state: MIState, {payload: mailingList}: PayloadAction<FMailingList>): MIState => {
      return {
        ...state,
        mailingListUpdated: mailingList,
        userMailingLists: updateORInsert(optionUtils.fromUndefinedA(state.userMailingLists).getOrElse([]))(mailingList)
      };
    }
  },
  initialApplicationState.mailingListState
);
