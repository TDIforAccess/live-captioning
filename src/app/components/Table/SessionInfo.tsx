import * as React from "react";
import {InjectedTranslateProps, translate} from "react-i18next";
import * as styles from "./SessionInfo.scss";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {identity} from "lodash";
import * as moment from "moment";
import {AppRoutes} from "../../store";

export type SessionInfoProps = InjectedTranslateProps & {
  name: string;
  documentId: string;
  editShareCount: number;
  viewShareCount: number;
  createdAt: Date;
};

const _SessionInfo: React.SFC<SessionInfoProps> =
  ({name, editShareCount = 10, viewShareCount = 10, createdAt, t = identity, documentId}: SessionInfoProps) => {
    return (
      <>
        <div className={styles.sessionTitle}>
          <Link to={AppRoutes.sessionInfo(documentId)} className={styles.sessionTitle}>
            <FontAwesomeIcon icon="hand-point-right" style={{marginRight: 8}}/>{name}
          </Link>
        </div>
{/*
        <div className={styles.sessionInfo}>
          <span>{t("tables.sessionColumn.shares")}:</span>
          <span><FontAwesomeIcon icon="eye" style={{marginRight: 4}}/>{viewShareCount}</span>
          <span><FontAwesomeIcon icon="pencil-alt" style={{marginRight: 4}}/>{editShareCount}</span>
        </div>
*/}
        <div className={styles.sessionInfo}>
          <span>{t("tables.sessionColumn.createdAt")}:</span>
          <span>{moment(createdAt).format("Do, MMM YYYY")}</span>
        </div>
      </>
    );
  };

export const SessionInfo = translate()(_SessionInfo);

