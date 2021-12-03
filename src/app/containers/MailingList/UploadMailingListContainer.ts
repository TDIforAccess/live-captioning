import {
  MailingListData,
  UploadMailingList,
  UploadMailingListDispatchProps,
  UploadMailingListStateProps
} from "./UploadMailingList";
import {ApplicationState, ApplicationStateDispatcher} from "types";
import {uploadMailingListAction} from "./mailingListSaga";
import {containerUtils} from "../../../utils";

export const uploadMailingListMapDispatchToProps = (dispatch: ApplicationStateDispatcher): UploadMailingListDispatchProps => ({
  createMailingList: (mailingList: MailingListData) => dispatch(uploadMailingListAction(mailingList))
});

const uploadMailingListMapStateToProps = (applicationState: ApplicationState): UploadMailingListStateProps => {
  return {
    firebaseUser: applicationState.userState.firebaseUser,
    userMailingList: applicationState.mailingListState.userMailingLists,
    mailingListUploaded: applicationState.mailingListState.mailingListUploaded,
    mailingListUploadError: applicationState.mailingListState.mailingListUploadError
  };
};

export const UploadMailingListContainer = containerUtils.connectTranslated(uploadMailingListMapStateToProps, uploadMailingListMapDispatchToProps)(UploadMailingList);
