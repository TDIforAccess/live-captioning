import {ApplicationState, EditorRouteProps} from "types";
import {option} from "fp-ts";

export const initialApplicationState: ApplicationState = {
  userState: {},
  basicInformationState: {
    basicInformation: option.none
  },
  documentState: {
    sessionEditor: {
      documentRef: option.none
    }
  },
  mailingListState: {},
  documentShareState: {},
  editorState: {
    userEditorSettings: option.none,
    userEditorFetchSettings: option.none,
    editorSettingsInitial: option.none
  }
};

export const TABLE_PAGINATION_CONFIG = [5, 10, 25, 50, 100];


export const AppRoutes = {
  editor: ({user, documentId}: EditorRouteProps) => `/editor/${user}/${documentId}`,
  publicEditor: ({documentId}: {documentId: string}) => `/editor/public/${documentId}`,
  sessionInfo: (sessionId = ":sessionId") => `/session/info/${sessionId}`
};
