import * as React from "react";
import {Card, Col, message, Row} from "antd";
import {InjectedTranslateProps, translate} from "react-i18next";
import {WithAuthenticationState} from "../Authentication/withAuthentication";
import {FDocument, FDocumentDashboardShared, DashboardDocumentsStatus, FetchByUserPayload} from "types";
import {SessionInfo} from "../../components";
import {DashboardTable} from "./DashboardTable";
import {generateActionCreateButtons} from "../../components/Table/ActionCreateButtons";
import {generateActionShareButtons} from "../../components/Table/ActionShareButtons";
import {fireStore, realTimeDatabse} from "../../services/firebase/firebaseApp";
import {downloadDocument} from "../../../utils";

export type DashboardDispatchProps = {
  fetchDocuments: (user: FetchByUserPayload) => void;
  onDeleteSession: (documentId: FDocument) => void;
};

export type DashboardStateProps = {
  userDocuments: FDocument[];
  sharedDocuments: FDocumentDashboardShared[];
  documentFetchStatus?: DashboardDocumentsStatus;
};

export type DashboardProps = InjectedTranslateProps &
  DashboardDispatchProps &
  DashboardStateProps &
  WithAuthenticationState;

const showName = ({name, createdAt, documentId}: FDocument) =>
  <SessionInfo name={name} editShareCount={10} viewShareCount={10} createdAt={createdAt} documentId={documentId}/>;

// tslint:disable-next-line:class-name
class _Dashboard extends React.Component<DashboardProps> {
  constructor(props: DashboardProps) {
    super(props);
  }

  componentDidMount(): void {
    const script = document.createElement("script");
    script.src = "/assets/js/firepad.js";
    script.async = true;
    document.body.appendChild(script);

    const userId: string = this.props.userId ? this.props.userId : "";
    const email = this.props.authUser && this.props.authUser.email ? this.props.authUser.email : "";
    if (userId) {
      this.props.fetchDocuments({userId, email});
    } else {
      return;
    }
  }

  onDeleteSession = (document: FDocument) => () => {
    const {onDeleteSession} = this.props;
    onDeleteSession(document);
  }

  onDownloadSession = (documentF: FDocument) => () => {
    // @ts-ignore
    Firepad.firepadDocument(documentF.fileId, documentF.user, fireStore, realTimeDatabse.ref(documentF.fileId)).then(text => {
      downloadDocument(documentF.name, text);
    }).catch((e: any) => {
      message.error(`Error while downloading document with error = ${e}`);
    });
  }

  componentDidUpdate({documentFetchStatus: prevDocumentFetchStatus}: Readonly<DashboardProps>, _: Readonly<{}>): void {
    if (prevDocumentFetchStatus === DashboardDocumentsStatus.DELETE_PROGRESS) {
      const {documentFetchStatus, t} = this.props;
      if (documentFetchStatus === DashboardDocumentsStatus.DELETE_SUCCESS) {
        message.success(t("tables.deleteSuccess"));
      } else {
        message.error(t("tables.deleteFailed"));
      }
    }
  }

  render() {
    const {userId, t, userDocuments, documentFetchStatus, sharedDocuments} = this.props;
    if (userId) {
      return (
        <Row gutter={24}>
          <Col xs={{span: 24, offset: 0}} lg={{span: 12, offset: 0}}>
            <Card title={t("tables.creatorTable")}>
              <DashboardTable
                documents={userDocuments}
                documentFetchStatus={documentFetchStatus}
                nameColumn={showName}
                actionButton={generateActionCreateButtons({
                  isLoggedIn: this.props.isLoggedIn,
                  userId: this.props.userId,
                  authUser: this.props.authUser
                })({onDeleteSession: this.onDeleteSession, onDownloadSession: this.onDownloadSession})}
                t={t}/>
            </Card>
          </Col>
          <Col xs={{span: 24, offset: 0}} lg={{span: 12, offset: 0}}>
            <Card title={t("tables.shareTable")}>
              <DashboardTable
                documents={sharedDocuments}
                documentFetchStatus={documentFetchStatus}
                nameColumn={showName}
                actionButton={generateActionShareButtons(userId)}
                t={t}/>
            </Card>
          </Col>
        </Row>
      );
    } else {
      return null;
    }
  }
}

export const Dashboard = translate()(_Dashboard);
