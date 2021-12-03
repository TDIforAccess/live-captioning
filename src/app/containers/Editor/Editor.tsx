import * as React from "react";
import {RouteComponentProps} from "react-router";
import {DashboardDocumentsStatus, EditorRouteProps, FDocument, FDocumentShare, FirebaseUser, User, CommonStateProps} from "types";
import {option} from "fp-ts";
import {firestore} from "firebase";
import {DocumentError} from "../Document/documentReducer";
import {Col, Row, Collapse} from "antd";
import {EditorSettingContainer} from "./EditorSettingsContainer";
import {SessionOperationsContainer} from "./EditorOperationsContainer";
import {InjectedTranslateProps} from "react-i18next";
import {Link} from "react-router-dom";
import {EditorError} from "./EditorReducer";
import {realTimeDatabse} from "../../services/firebase/firebaseApp";
import {banners} from "./banners";

const Panel = Collapse.Panel;

export type EditorStateProps = {
  documentRef: option.Option<firestore.DocumentReference>;
  documentRefError: DocumentError | undefined;
  firebaseUser: FirebaseUser | undefined;
  userInfo: option.Option<User> | undefined;
  sessionInfo: option.Option<FDocument> | undefined;
  sessionInfoError: DocumentError | undefined;
  documentFetchStatus?: DashboardDocumentsStatus;
  fetchDocumentPermissionDocument: option.Option<FDocumentShare> | undefined;
  fetchDocumentPermissionError: EditorError | undefined;
};

export type EditorDispatchProps = {
  fetchDocumentRef: (documentId: string) => void;
  fetchDocument: (documentId: string) => void;
  fetchDocumentPermission: (documentId: string, userId: string) => void;
};

export type EditorProps = CommonStateProps & InjectedTranslateProps & EditorDispatchProps & EditorStateProps & RouteComponentProps<EditorRouteProps>;
export type EditorState = {
  codeMirror: any;
  firePadReady: boolean;
};

export class Editor extends React.Component<EditorProps, EditorState> {
  private initializing = false;
  constructor(props: EditorProps) {
    super(props);
    this.state = {
      codeMirror: null,
      firePadReady: false
    };
  }

  componentWillReceiveProps(nextProps: EditorProps) {
    if (nextProps.sessionInfo && !this.initializing) {
      nextProps.sessionInfo.map((docF: FDocument) => {
        if (!docF.isDeleted) {
          const {firebaseUser} = this.props;
          if (firebaseUser) {
            nextProps.documentRef.map((doc: firestore.DocumentReference) => {
              if (!nextProps.fetchDocumentPermissionError && nextProps.fetchDocumentPermissionDocument) {
                nextProps.fetchDocumentPermissionDocument.foldL(() => {
                  this.initializing = true;
                  // @ts-ignore
                  const codeMirror = CodeMirror(document.getElementById("firepad"), {
                    lineWrapping: true,
                    readOnly: false,
                    styleSelectedText: true,
                    autofocus: true
                  });
                  codeMirror.setSize("100%", "450px");
                  this.setState({
                    codeMirror: codeMirror
                  });
                  // @ts-ignore
                  const firePad = Firepad.fromCodeMirror(realTimeDatabse.ref(doc.id), doc, codeMirror,
                    {richTextToolbar: true, richTextShortcuts: true, userId: firebaseUser.uid, realtimeUserId: firebaseUser.uid, readOnly: false});
                  firePad.on("ready", () => {
                    this.initializing = false;
                    this.setState({
                      firePadReady: true
                    });
                    // @ts-ignore
                    FirepadUserList.fromDiv(
                      realTimeDatabse.ref(doc.id).child("users"),
                      document.getElementById("userlist"),
                      document.getElementById("userListHeading"),
                      firebaseUser.uid,
                      firebaseUser.uid,
                      firebaseUser.displayName
                    );
                  });
                }, (fDocShare: FDocumentShare) => {
                  // @ts-ignore
                  const codeMirror = CodeMirror(document.getElementById("firepad"), {
                    lineWrapping: true,
                    readOnly: fDocShare.permission === "read",
                    styleSelectedText: true,
                    autofocus: true
                  });
                  codeMirror.setSize("100%", "450px");
                  this.setState({
                    codeMirror: codeMirror
                  });
                  // @ts-ignore
                  const firePad = Firepad.fromCodeMirror(realTimeDatabse.ref(doc.id), doc, codeMirror,
                    {richTextToolbar: true, richTextShortcuts: true, userId: firebaseUser.uid, realtimeUserId: firebaseUser.uid, readOnly: fDocShare.permission === "read"});
                  firePad.on("ready", () => {
                    this.setState({
                      firePadReady: true
                    });
                    // @ts-ignore
                    FirepadUserList.fromDiv(
                      realTimeDatabse.ref(doc.id).child("users"),
                      document.getElementById("userlist"),
                      document.getElementById("userListHeading"),
                      firebaseUser.uid,
                      firebaseUser.uid,
                      firebaseUser.displayName
                    );
                  });
                });
              }
            });
          }
        }
      });
    }

  }

  componentDidMount() {
    // @ToDo: @Sahil: Please explain why it was done this way? any special reasons?
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

    if (this.props.userId) {
      this.props.fetchDocumentPermission(documentId, this.props.userId);
    } else {
      console.error("User not found.");
      return;
    }
  }

  render() {
    const textArea = document.getElementsByClassName("CodeMirror").item(0);

    if (this.props.sessionInfo) {
      return this.props.sessionInfo.fold(
        null,
        (document: FDocument) => {
          const bannerIndex = parseInt(document.documentId.slice(-2), 16) % 3;
          if (document.isDeleted) {
            return (<div>The session is deleted please back to <Link to="/dashboard">Dashboard</Link>.</div>);
          } else {
            return (
              <div>
                {// TODO need to check this part more clearly
                }
                {textArea && this.state.firePadReady ? (
                  <SessionOperationsContainer {...this.props}
                                              {...{document: document, codeMirror: this.state.codeMirror}}>
                    <EditorSettingContainer {...this.props} {...{elem: textArea}} />
                  </SessionOperationsContainer>
                ) : null}
                <Row gutter={24}>
                  <Col xs={{span: 24, offset: 0}} lg={{span: 18, offset: 0}}>
                    <div id="firepad"/>
                    <img alt="Sponsor banner" src={banners[bannerIndex]} width="100%"/>
                  </Col>
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
