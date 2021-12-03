import * as React from "react";
import {RouteComponentProps} from "react-router";
import {EditorRouteProps, FDocument, CommonStateProps} from "types";
import {option} from "fp-ts";
import {firestore} from "firebase";
import {DocumentError} from "../Document/documentReducer";
import {Col, Row, Collapse} from "antd";
import {EditorSettingContainer} from "./EditorSettingsContainer";
import {SessionOperationsContainer} from "./EditorOperationsContainer";
import {InjectedTranslateProps} from "react-i18next";
import {Link} from "react-router-dom";
import {realTimeDatabse} from "../../services/firebase/firebaseApp";

const Panel = Collapse.Panel;

export type EditorStateProps = {
  documentRef: option.Option<firestore.DocumentReference>;
  documentRefError: DocumentError | undefined;
  sessionInfo: option.Option<FDocument> | undefined;
  sessionInfoError: DocumentError | undefined;
};

export type EditorDispatchProps = {
  fetchDocumentRef: (documentId: string) => void;
  fetchDocument: (documentId: string) => void;
};

export type EditorProps = CommonStateProps & InjectedTranslateProps & EditorDispatchProps & EditorStateProps & RouteComponentProps<EditorRouteProps>;
export type EditorState = {
  codeMirror: any;
  firePadReady: boolean;
};

export class PublicEditor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);
    this.state = {
      codeMirror: null,
      firePadReady: false
    };
  }

  componentWillReceiveProps(nextProps: EditorProps) {
    const randomUser = Math.random().toString(36).substring(8);
    if (nextProps.sessionInfo) {
      nextProps.sessionInfo.map((docF: FDocument) => {
        if (!docF.isDeleted && docF.isPublic) {
          nextProps.documentRef.map((doc: firestore.DocumentReference) => {
            // @ts-ignore
            const codeMirror = CodeMirror(document.getElementById("firepad"), {
              lineWrapping: true,
              readOnly: true,
              styleSelectedText: true,
              autofocus: true
            });
            codeMirror.setSize("100%", "500px");
            this.setState({
              codeMirror: codeMirror
            });
            // @ts-ignore
            const firePad = Firepad.fromCodeMirror(realTimeDatabse.ref(doc.id), doc, codeMirror,
              {richTextToolbar: true, richTextShortcuts: true, userId: randomUser, realtimeUserId: randomUser, readOnly: true});
            firePad.on("ready", () => {
              this.setState({
                firePadReady: true
              });
              // @ts-ignore
              FirepadUserList.fromDiv(
                doc.collection("users"),
                document.getElementById("userlist"),
                document.getElementById("userListHeading"),
                randomUser,
                randomUser,
                "Anonymous"
              );
            });
          });
        }
      });
    }

  }

  componentDidMount() {
    const scriptUserList = document.createElement("script");
    scriptUserList.src = "/assets/js/firepad-userlist.js";
    scriptUserList.async = true;
    document.body.appendChild(scriptUserList);

    const script = document.createElement("script");
    script.src = "/assets/js/firepad.js";
    script.async = true;
    document.body.appendChild(script);


    const {documentId} = this.props.match.params;
    this.props.fetchDocumentRef(documentId);
    this.props.fetchDocument(documentId);
  }

  render() {
    const textArea = document.getElementsByClassName("CodeMirror").item(0);
    if (this.props.sessionInfo) {
      return this.props.sessionInfo.fold(
        null,
        (document: FDocument) => {
          if (document.isDeleted) {
            return (<div>The session is deleted please back to <Link to="/dashboard">Dashboard</Link>.</div>);
          } else if (!document.isPublic) {
            return (<div>The session is not public please contact admin. </div>);
          } else {
            return (
              <div>
                {// TODO need to check this part more clearly
                }
                {textArea && this.state.firePadReady ? <EditorSettingContainer {...this.props} {...{elem: textArea}} /> : null}
                {textArea && this.state.firePadReady ? <SessionOperationsContainer {...this.props} {...{document: document, codeMirror: this.state.codeMirror}} /> : null}
                <Row gutter={24}>
                  <Col xs={{span: 24, offset: 0}} lg={{span: 6, offset: 0}}>
                    <Collapse accordion>
                      <Panel header="Collaborators" key="1" forceRender={true}>
                        <Row gutter={24}>
                          <Col xs={{span: 24, offset: 0}} lg={{span: 24, offset: 0}}>
                            <div id="userListHeading"/>
                          </Col>
                          <Col xs={{span: 24, offset: 0}} lg={{span: 24, offset: 0}}>
                            <div id="userlist"/>
                          </Col>
                        </Row>
                      </Panel>
                    </Collapse>
                  </Col>
                  <Col xs={{span: 24, offset: 0}} lg={{span: 18, offset: 0}}>
                    <div id="firepad"/>
                  </Col>
                </Row>
              </div>);
          }
        });
    } else if (this.props.sessionInfoError) {
      return null;
    } else {
      return null;
    }
  }
}
