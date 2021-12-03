import {containerUtils} from "../../../../utils";
import {ApplicationState, ApplicationStateDispatcher} from "types";
import {SessionInfo, SessionInfoDispatchProps, SessionInfoStateProps} from "./SessionInfoView";
import {fetchDocumentById} from "../documentSaga";

export const sessionInfoMapDispatchToProps = (dispatch: ApplicationStateDispatcher): SessionInfoDispatchProps => ({
  fetchDocumentById: (documentId: string) => dispatch(fetchDocumentById(documentId))
});

const sessionInfoMapStateToProps = (applicationState: ApplicationState): SessionInfoStateProps => {
  return {
    firebaseUser: applicationState.userState.firebaseUser,
    sessionInfo: applicationState.documentState.sessionInfoFetch,
    sessionInfoFetchError: applicationState.documentState.sessionInfoFetchError
  };
};

export const SessionInfoContainer = containerUtils.connectTranslated(
  sessionInfoMapStateToProps, sessionInfoMapDispatchToProps)(SessionInfo);
