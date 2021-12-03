/* tslint:disable:cyclomatic-complexity */
import * as React from "react";
import * as styles from "./ActionButtons.scss";
import {Button, Modal, Tooltip, Popconfirm} from "antd";
import {InjectedTranslateProps, translate} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as R from "ramda";
import {DocumentShareContainer} from "../../containers/Document/DocumentShare/DocumentShareContainer";
import {DocumentToShare, Permission, FDocument} from "types";
import {AppRoutes} from "../../store";
import {WithAuthenticationState} from "src/app/containers/Authentication/withAuthentication";

export type ActionCallbacks = {
  onInviteSessionCreator?: (documentId: string) => void;
  onInviteSessionViewer?: (documentId: string) => void;
  onDownloadSession?: (document: FDocument) => () => void;
  onDeleteSession?: (document: FDocument) => () => void;
};

export type ActionButtonConfig = {
  actionButtonsVisible: ActionsButtons[];
};

export const enum ActionsButtons {
  EditSession,
  ShareReadSession,
  ShareWriteSession,
  DownloadSession,
  DeleteSession
}

export type ActionButtonsProps = ActionButtonConfig & WithAuthenticationState & InjectedTranslateProps & ActionCallbacks & {
  document: FDocument;
};

export type ActionButtonsState = {
  inviteSessionCreate: {
    visible: boolean;
  };
  inviteSessionViewer: {
    visible: boolean;
  };
};

// tslint:disable-next-line:class-name
class _ActionCreateButtons extends React.Component<ActionButtonsProps, ActionButtonsState> {
  constructor(props: ActionButtonsProps) {
    super(props);
    this.state = {
      inviteSessionCreate: {
        visible: false
      },
      inviteSessionViewer: {
        visible: false
      }
    };
  }

  onInviteSessionCreator = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.currentTarget.blur();
    return this.setState({
      inviteSessionCreate: {
        visible: true
      }
    });
  }
  onInviteSessionViewer = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.currentTarget.blur();
    return this.setState({
      inviteSessionViewer: {
        visible: true
      }
    });
  }

  handleCancel = (handle: string) => () => {
    this.setState((prevState: ActionButtonsState) => ({
      ...prevState,
      [handle]: {
        visible: false
      }
    }));
  }

  render() {
    const {t = R.identity, document, onDownloadSession, onDeleteSession} = this.props;
    const {user, documentId} = document;
    const documentToShareRead: DocumentToShare = {
      documentId,
      permission: Permission.Read
    };

    const documentToShareWrite: DocumentToShare = {
      documentId,
      permission: Permission.Write
    };
    const actionButtonSetting = this.props.actionButtonsVisible || [];
    const isActionPresent = (a: ActionsButtons) => R.contains(a, actionButtonSetting);
    return (
      <div style={{display: "inline"}}>
        {(R.isEmpty(actionButtonSetting) || isActionPresent(ActionsButtons.EditSession)) ?
          <Tooltip placement="topLeft"
                   title={t("tables.actionColumn.editSession")}
                   arrowPointAtCenter
          >
            <Button href={AppRoutes.editor({user, documentId})} className={styles.buttonPrimary}>
              <FontAwesomeIcon icon="file-code" style={{marginRight: 4}}/>
              <FontAwesomeIcon icon="pencil-alt"/>
            </Button>
          </Tooltip> : null
        }
        {R.isEmpty(actionButtonSetting) || isActionPresent(ActionsButtons.ShareReadSession) ?
          <div style={{display: "inline"}}> <Tooltip placement="topLeft"
                 title={t("tables.actionColumn.inviteEditor")}
                 arrowPointAtCenter
        >
          <Button onClick={this.onInviteSessionCreator} className={styles.buttonPrimary}>
            <FontAwesomeIcon icon="share-alt" style={{marginRight: 4}}/>
            <FontAwesomeIcon icon="pencil-alt"/>
          </Button>


        </Tooltip>

         <Modal
          footer={null}
          style={{top: 20}}
          visible={this.state.inviteSessionCreate.visible}
          onCancel={this.handleCancel("inviteSessionCreate")}
        >
          <DocumentShareContainer {...documentToShareWrite} {...this.props}/>
         </Modal> </div> : null }

        {(R.isEmpty(actionButtonSetting) || isActionPresent(ActionsButtons.ShareWriteSession)) ? <div style={{display: "inline"}}>
        <Tooltip placement="topLeft"
                 title={t("tables.actionColumn.inviteViewer")}
                 arrowPointAtCenter
        >
          <Button onClick={this.onInviteSessionViewer} className={styles.buttonPrimary}>
            <FontAwesomeIcon icon="share-alt" style={{marginRight: 4}}/>
            <FontAwesomeIcon icon="eye"/>
          </Button>
        </Tooltip>

        <Modal
          footer={null}
          style={{top: 20}}
          visible={this.state.inviteSessionViewer.visible}
          onCancel={this.handleCancel("inviteSessionViewer")}
        >
          <DocumentShareContainer {...documentToShareRead} {...this.props}/>
        </Modal> </div> : null }

        {(R.isEmpty(actionButtonSetting) || isActionPresent(ActionsButtons.DownloadSession)) ?
        <Tooltip placement="topLeft"
                 title={t("tables.actionColumn.downloadSession")}
                 arrowPointAtCenter
        >

          <Button onClick={onDownloadSession && onDownloadSession(document)} className={styles.buttonPrimary}>
            <FontAwesomeIcon icon="file-code" style={{marginRight: 4}}/>
            <FontAwesomeIcon icon="download"/>
          </Button>
        </Tooltip> : null }
        {(R.isEmpty(actionButtonSetting) || isActionPresent(ActionsButtons.DeleteSession)) ? <Popconfirm placement="top"
                    onConfirm={onDeleteSession && onDeleteSession(document)}
                    title={t("tables.actionColumn.deleteSession")}
                    okText={t("tables.dialogButton.okText")}
                    cancelText={t("tables.dialogButton.cancelText")}
                    arrowPointAtCenter
        >
          <Button className={styles.buttonDanger}>
            <FontAwesomeIcon icon="file-code" style={{marginRight: 4}}/>
            <FontAwesomeIcon icon="trash-alt"/>
          </Button>
        </Popconfirm> : null}
      </div>
    );
  }
}


export const ActionCreateButtons = translate()(_ActionCreateButtons);
export const generateActionCreateButtons = (authenticationState: WithAuthenticationState) =>
  (actionCallbacks?: ActionCallbacks, actionButtonsVisible: ActionsButtons[] = []) =>
    (document: FDocument): JSX.Element =>
      (
        <ActionCreateButtons
        actionButtonsVisible={actionButtonsVisible}
        document={document}
        {...authenticationState}
        {...actionCallbacks}/>
      );
