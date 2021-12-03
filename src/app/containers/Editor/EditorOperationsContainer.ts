import {ApplicationState, ApplicationStateDispatcher, FDocument} from "types";
import {containerUtils} from "../../../utils";
import {EditorOperations, EditorOperationsDispatchProps, EditorOperationsStateProps} from "./EditorOperations";
import {deleteDocument} from "../Document/documentSaga";

export const sessionOperationsMapDispatchToProps = (dispatch: ApplicationStateDispatcher): EditorOperationsDispatchProps => ({
  onDeleteSession: (document: FDocument) => dispatch(deleteDocument(document))
});

const sessionOperationsMapStateToProps = (state: ApplicationState): EditorOperationsStateProps => {
  return {
    editorSaveError: state.editorState.userEditorSettingsSaveError,
    editorSettings: state.editorState.userEditorSettings,
    editorFetchError: state.editorState.userEditorSettingsFetchError,
    editorSettingsInitial: state.editorState.editorSettingsInitial
  };
};

export const SessionOperationsContainer = containerUtils.connectTranslated(sessionOperationsMapStateToProps, sessionOperationsMapDispatchToProps)(EditorOperations);
