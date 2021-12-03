import {containerUtils} from "../../../../utils";
import {ApplicationState, ApplicationStateDispatcher, FDocumentShare} from "types";
import {DocumentShare, DocumentShareStateProps, DocumentShareDispatchProps} from "./DocumentShareView";
import {getMailingListByUserAction} from "../../MailingList/mailingListSaga";
import {documentSharePost} from "./documentShareSaga";

export const documentShareMapDispatchToProps = (dispatch: ApplicationStateDispatcher): DocumentShareDispatchProps => ({
  fetchMailingListByUser: (userId: string) => dispatch(getMailingListByUserAction(userId)),
  documentSharePost: (docs: FDocumentShare[]) => dispatch(documentSharePost(docs))
});

const documentShareMapStateToProps = (applicationState: ApplicationState): DocumentShareStateProps => {
  return {
    firebaseUser: applicationState.userState.firebaseUser,
    userMailingList: applicationState.mailingListState.userMailingLists,
    documentShareError: applicationState.documentShareState.documentShareError,
    documentShareSuccess: applicationState.documentShareState.documentShareSuccess
  };
};

export const DocumentShareContainer = containerUtils.connectTranslated(
  documentShareMapStateToProps, documentShareMapDispatchToProps)(DocumentShare);
