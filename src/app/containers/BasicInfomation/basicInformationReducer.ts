import {createAction, handleActions} from "redux-actions";
import {ApplicationError, PayloadAction, UserGivenData} from "types";
import {initialApplicationState} from "../../store/constants";
import {option} from "fp-ts";


export interface BIFormError extends ApplicationError {
  message: string;
}

export type BIState = {
  userSaveError?: BIFormError;
  basicInformation: option.Option<UserGivenData>;
};

export const BI_POST_FAILED = "BI_POST_FAILED";
export const BI_POST_SUCCESS = "BI_POST_SUCCESS";
export const userPostFailure = createAction<BIFormError>(BI_POST_FAILED);
export const userPostSuccess = createAction<UserGivenData>(BI_POST_SUCCESS);

export const basicInformationReducer = handleActions<BIState, BIFormError | UserGivenData>(
  {
    [BI_POST_FAILED]: (state: BIState, {payload: error}: PayloadAction<BIFormError>): BIState => {
      return {
        ...state,
        userSaveError: error
      };
    },
    [BI_POST_SUCCESS]: (state: BIState, {payload: basicInformation}: PayloadAction<UserGivenData>): BIState => {
      return {
        ...state,
        basicInformation: option.some(basicInformation)
      };
    }
  },
  initialApplicationState.basicInformationState
);
