import {containerUtils} from "../../../utils";
import {ApplicationState, ApplicationStateDispatcher} from "types";
import {
  DocumentCreateFormStateProps,
  DocumentCreateFormDispatchProps,
  DocumentCreateForm
} from "./DocumentCreateForm";
import {FDocument} from "../../../types/domains/document";
import {createDocumentAction} from "./documentSaga";

export const documentCreateMapDispatchToProps = (dispatch: ApplicationStateDispatcher): DocumentCreateFormDispatchProps => ({
  documentCreate: (document: FDocument) => dispatch(createDocumentAction(document))
});

const documentCreateMapStateToProps = (applicationState: ApplicationState): DocumentCreateFormStateProps => {
  return {
    firebaseUser: applicationState.userState.firebaseUser,
    documentCreated: applicationState.documentState.documentCreated
  };
};

export const DocumentCreateContainer = containerUtils.connectTranslated(
  documentCreateMapStateToProps, documentCreateMapDispatchToProps)(DocumentCreateForm);
