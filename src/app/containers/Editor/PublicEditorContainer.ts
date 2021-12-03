import {connect} from "react-redux";
import {PublicEditor} from "./PublicEditor";
import {editorMapDispatchToProps, editorMapStateToProps} from "./EditorContainer";

export const PublicEditorContainer = connect(
  editorMapStateToProps, editorMapDispatchToProps)(PublicEditor);
