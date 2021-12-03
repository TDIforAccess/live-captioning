import {Button, Col, Row, message} from "antd";
import {WithAuthenticationState} from "../Authentication/withAuthentication";
import * as React from "react";
import {FDocument} from "types";
import {ActionCreateButtons, ActionsButtons} from "../../components/Table/ActionCreateButtons";
import * as styles from "../../components/Table/ActionButtons.scss";
import {downloadDocument} from "../../../utils";
import {InjectedTranslateProps, translate} from "react-i18next";
export type EditorOperationsStateProps = {};

export type EditorOperationsDispatchProps = {
  onDeleteSession: (documentId: FDocument) => void;
};

export type DocumentToOperateOn = {
  document: FDocument;
};

export type ElementToOperateOn = {
  codeMirror: any;
};

export type EditorOperationsProps = WithAuthenticationState &
  InjectedTranslateProps &
  DocumentToOperateOn &
  ElementToOperateOn &
  EditorOperationsDispatchProps &
  EditorOperationsStateProps;

export type EditorOperationsState = {
  toggleSpeak: boolean;
  speakSelectedText: string;
  speaking: boolean;
  pause: boolean;
  pauseSelectedText: string;
};

const synthA = window.speechSynthesis;
synthA.cancel();

// tslint:disable-next-line:class-name
class _EditorOperations extends React.Component<EditorOperationsProps,
  EditorOperationsState> {
  constructor(props: EditorOperationsProps) {
    super(props);
    this.state = {
      toggleSpeak: false,
      speakSelectedText: "editorOperations.speakSelected",
      pauseSelectedText: "editorOperations.stopSpeaking",
      speaking: false,
      pause: false
    };
  }

  onDeleteSession = (document: FDocument) => () => {
    const {onDeleteSession} = this.props;
    onDeleteSession(document);
    window.location.reload();
  }

  onDownloadSession = (fileName: string, text: string) => (documentF: FDocument) => () => {
    downloadDocument(fileName, text);
  }

  capitalizeSelection = () => {
    const capitalize = (w: string) => {
      const letters = w.split("");
      if (letters.length > 0) {
        letters[0] = letters[0].toUpperCase();
        return letters.join("");
      } else {
        return w;
      }
    };

    const selection = this.props.codeMirror.getSelection();
    if (selection === "") {
      message.error("Please select some text.");
      return;
    }
    const s = selection.split(". ")
      .map(capitalize)
      .join(". ")
      .split("? ")
      .map(capitalize)
      .join("? ")
      .split("! ")
      .map(capitalize)
      .join("! ");

    this.props.codeMirror.replaceSelection(s);
  }

  textToSpeechStart = () => {
    const text = this.props.codeMirror.getSelection();
    if (text === "") {
      message.error(this.props.t("editorOperations.errorNoSelection"));
      return;
    }
    if (this.state.toggleSpeak) {
      if (this.state.pause) {
        synthA.resume();
        this.setState({
          speakSelectedText: "editorOperations.pauseSpeaking",
          pause: false
        });
      } else {
        synthA.pause();
        this.setState({
          speakSelectedText: "editorOperations.resumeSpeaking",
          pause: true
        });
      }
    } else {
      const u = new SpeechSynthesisUtterance(text);
      u.onend = (event: any) => {
        this.setState({
          toggleSpeak: false,
          speakSelectedText: "editorOperations.speakSelected"
        });
        synthA.cancel();
      };

      synthA.speak(u);
      this.setState({
        toggleSpeak: true,
        speakSelectedText: "editorOperations.pauseSpeaking",
        speaking: true,
        pause: false
      });
    }

  }

  textToSpeechPause = () => {
    this.setState({
      toggleSpeak: false,
      speakSelectedText: "editorOperations.speakSelected",
      pause: true,
      pauseSelectedText: "editorOperations.stopSpeaking"
    });
    synthA.cancel();
  }


  render() {
    const {userId, document: {name: documentName}, codeMirror, authUser, isLoggedIn, t} = this.props;
    const {speakSelectedText, pauseSelectedText} = this.state;
    const documentText = codeMirror.getValue();
    const actionCallbacks = {onDeleteSession: this.onDeleteSession, onDownloadSession: this.onDownloadSession(documentName, documentText)};
    const actionsList = [ActionsButtons.ShareReadSession, ActionsButtons.ShareWriteSession, ActionsButtons.DownloadSession];
    return (
      <div>
        <Row gutter={24}>
          <Col xs={{span: 24}} lg={{span: 24}}>
            <ActionCreateButtons actionButtonsVisible={actionsList} document={this.props.document} {...{
              isLoggedIn,
              userId,
              authUser
            }} {...actionCallbacks}/>
            {this.props.children}
            <Button onClick={this.capitalizeSelection} className={styles.buttonPrimary}>
              {t("editorOperations.capitalize")}
            </Button>
            <Button onClick={this.textToSpeechStart} className={styles.buttonPrimary}>
              {t(speakSelectedText)}
            </Button>
            <Button onClick={this.textToSpeechPause} className={styles.buttonPrimary}>
              {t(pauseSelectedText)}
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export const EditorOperations = translate()(_EditorOperations);
