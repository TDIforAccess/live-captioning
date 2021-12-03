import {DashboardDispatchProps, DashboardStateProps, Dashboard} from "./Dashboard";
import {containerUtils} from "../../../utils";
import {ApplicationState, ApplicationStateDispatcher, FDocument, FetchByUserPayload} from "types";
import {fetchDocumentsByUser} from "./dashboardSaga";
import {deleteDocument} from "../Document/documentSaga";

const mapDispatchToProps = (dispatch: ApplicationStateDispatcher): DashboardDispatchProps => ({
  fetchDocuments: (user: FetchByUserPayload) => dispatch(fetchDocumentsByUser(user)),
  onDeleteSession: (document: FDocument) => dispatch(deleteDocument(document))
});

const mapStateToProps = (state: ApplicationState): DashboardStateProps => ({
  userDocuments: state.documentState.userDocuments ? state.documentState.userDocuments : [],
  sharedDocuments: state.documentState.sharedDocuments ? state.documentState.sharedDocuments : [],
  documentFetchStatus: state.documentState.documentFetchStatus
});

export const DashboardContainer =
  containerUtils.connectTranslated(mapStateToProps, mapDispatchToProps)(Dashboard);
