import * as React from "react";
import * as styles from "./ActionButtons.scss";
import {InjectedTranslateProps, translate} from "react-i18next";
import {Button, Tooltip} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {AppRoutes} from "../../store";
import {FDocumentDashboardShared, Permission} from "../../../types";



type ActionShareTableProps = {currentUser: string} & InjectedTranslateProps & FDocumentDashboardShared;

const _ActionShareButtons: React.SFC<ActionShareTableProps> =
  ({documentId, permission, t, currentUser}: ActionShareTableProps) => {
    const user = currentUser;
    return (
      <div>
        {permission === Permission.Write && (
          <Tooltip placement="topLeft"
                   title={t("tables.actionColumn.editSession")}
                   arrowPointAtCenter
          >
            <Button href={AppRoutes.editor({user, documentId})} className={styles.buttonPrimary}>
              <FontAwesomeIcon icon="file-code" style={{marginRight: 4}}/>
              <FontAwesomeIcon icon="pencil-alt"/>
            </Button>
          </Tooltip>
        )}
        {permission === Permission.Read && (
          <Tooltip placement="topLeft"
                   title={t("tables.actionColumn.viewSession")}
                   arrowPointAtCenter
          >
            <Button href={AppRoutes.editor({user, documentId})} className={styles.buttonPrimary}>
              <FontAwesomeIcon icon="file-code" style={{marginRight: 4}}/>
              <FontAwesomeIcon icon="eye"/>
            </Button>
          </Tooltip>
        )}
      </div>
    );
  };


export const ActionShareButtons = translate()(_ActionShareButtons);
export const generateActionShareButtons = (currentUser: string) => (documentShared: FDocumentDashboardShared) => <ActionShareButtons {...{currentUser: currentUser}} {...documentShared}/>;
