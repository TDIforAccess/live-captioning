import {connect} from "react-redux";
import {Editor, EditorDispatchProps, EditorStateProps} from "./Editor";
import {ApplicationState, ApplicationStateDispatcher} from "types";
import {fetchDocumentRef, fetchDocumentById} from "../Document/documentSaga";
import {fetchDocumentPermissionsAction} from "./EditorSaga";

export const editorMapDispatchToProps = (dispatch: ApplicationStateDispatcher): EditorDispatchProps => ({
  fetchDocumentRef: (documentId: string) => dispatch(fetchDocumentRef(documentId)),
  fetchDocument: (documentId: string) => dispatch(fetchDocumentById(documentId)),
  fetchDocumentPermission: (documentId: string, userId: string) => dispatch(fetchDocumentPermissionsAction({
    userId: userId,
    documentId: documentId
  }))
});

export const editorMapStateToProps = (state: ApplicationState): EditorStateProps => {
  return {
    documentRef: state.documentState.sessionEditor.documentRef,
    documentRefError: state.documentState.sessionEditor.documentRefError,
    firebaseUser: state.userState.firebaseUser,
    userInfo: state.userState.userInfo,
    sessionInfo: state.documentState.sessionInfoFetch,
    sessionInfoError: state.documentState.sessionInfoFetchError,
    documentFetchStatus: state.documentState.documentFetchStatus,
    fetchDocumentPermissionDocument: state.editorState.fetchDocumentPermission,
    fetchDocumentPermissionError: state.editorState.fetchDocumentPermissionError
  };
};

export const EditorContainer = connect(
  editorMapStateToProps, editorMapDispatchToProps)(Editor);
