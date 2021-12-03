import {ApplicationState, ApplicationStateDispatcher} from "types";
import {EditorSetting, EditorSettingDispatchProps, EditorSettingStateProps} from "./EditorSettings";
import {containerUtils} from "../../../utils";
import {FUserEditorSettings} from "../../../types/domains/userSettings";
import {fetchEditorSettingAction, updateEditorSettingAction} from "./EditorSaga";

export const editorSettingMapDispatchToProps = (dispatch: ApplicationStateDispatcher): EditorSettingDispatchProps => ({
  updateUserSettings: (settings: FUserEditorSettings) => dispatch(updateEditorSettingAction(settings)),
  fetchUserSettings: (user: string) => dispatch(fetchEditorSettingAction(user))
});

const editorSettingMapStateToProps = (state: ApplicationState): EditorSettingStateProps => {
  return {
    editorSaveError: state.editorState.userEditorSettingsSaveError,
    editorSettings: state.editorState.userEditorSettings,
    editorFetchError: state.editorState.userEditorSettingsFetchError,
    editorSettingsInitial: state.editorState.editorSettingsInitial
  };
};

export const EditorSettingContainer = containerUtils.connectTranslated(editorSettingMapStateToProps, editorSettingMapDispatchToProps)(EditorSetting);
