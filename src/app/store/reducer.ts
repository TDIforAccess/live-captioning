import {combineReducers} from "redux";
import {ApplicationState} from "types";
import {userReducer} from "../containers/Authentication/authenticationReducers";
import {
  basicInformationReducer
} from "../containers/BasicInfomation/basicInformationReducer";
import {documentsReducer} from "../containers/Document/documentReducer";
import {mailingListReducer} from "../containers/MailingList/mailingListReducer";
import {documentsShareReducer} from "../containers/Document/DocumentShare/documentShareReducer";
import {editorReducer} from "../containers/Editor/EditorReducer";

export const applicationStateReducer = combineReducers<ApplicationState>({
  userState: userReducer,
  basicInformationState: basicInformationReducer,
  documentState: documentsReducer,
  mailingListState: mailingListReducer,
  documentShareState: documentsShareReducer,
  editorState: editorReducer
});
