import {
  MailingListData
} from "./UploadMailingList";
import {ApplicationState, ApplicationStateDispatcher} from "types";
import {
  postMailingList,
  getMailingListByUserAction,
  updateMailingListAction
} from "./mailingListSaga";

import {
  UpdateMailingList,
  UpdateMailingListDispatchProps,
  UpdateMailingListStateProps
} from "./UpdateMailingList";
import {FMailingList} from "./mailingListReducer";
import {containerUtils} from "../../../utils";

export const modifyMailingListMapDispatchToProps = (dispatch: ApplicationStateDispatcher): UpdateMailingListDispatchProps => ({
  createMailingList: (mailingList: MailingListData) => dispatch(postMailingList(mailingList)),
  fetchMailingListByUser: (userId: string) => dispatch(getMailingListByUserAction(userId)),
  updateMailingList: (mList: FMailingList) => dispatch(updateMailingListAction(mList))
});

const modifyMailingListMapStateToProps = (applicationState: ApplicationState): UpdateMailingListStateProps => {
  return {
    firebaseUser: applicationState.userState.firebaseUser,
    userMailingList: applicationState.mailingListState.userMailingLists,
    mailingListFetchError: applicationState.mailingListState.mailingListFetchError,
    mailingListUpdateError: applicationState.mailingListState.mailingListUpdateError,
    mailingListUpdated: applicationState.mailingListState.mailingListUpdated
  };
};

export const UpdateMailingListContainer = containerUtils.connectTranslated(modifyMailingListMapStateToProps, modifyMailingListMapDispatchToProps)(UpdateMailingList);
