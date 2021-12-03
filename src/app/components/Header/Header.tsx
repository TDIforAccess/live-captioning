import * as React from "react";
import {Layout, Row, Col, Avatar} from "antd";
import {InjectedTranslateProps, translate} from "react-i18next";
import * as styles from "./Header.scss";
import {WithAuthenticationState} from "../../containers/Authentication/withAuthentication";
import {stringUtils} from "../../../utils";
import {LogoutButtonContainer} from "../../containers/Authentication/Logout";

type HeaderProps = InjectedTranslateProps & WithAuthenticationState;

const _Header: React.SFC<HeaderProps> = ({t, authUser}: HeaderProps) => {
  const photoUrl = authUser ? stringUtils.fromNullToUndefined(authUser.photoURL) : undefined;
  return (
    <Layout.Header className={styles.header}>
      <Row gutter={8} justify={"end"}>
        <Col span={8}>
          <a className={styles.logo} href="/dashboard">YOUR_APP_NAME</a>
        </Col>
        <Col span={16}>
          <div style={{float: "right"}}>
            <LogoutButtonContainer/>
          </div>
          {authUser && <Avatar shape={"square"} size={40} src={photoUrl} icon={photoUrl ? undefined : "user"} style={{
            float: "right",
            margin: "2px"
          }}/>}
        </Col>
      </Row>
    </Layout.Header>
  );
};

export const Header = translate()(_Header);

const _EmptyHeader: React.SFC<HeaderProps> = ({t}: HeaderProps) => {
  return (
    <Layout.Header className={styles.header}>
      <Row gutter={8} justify={"end"}>
        <Col span={8}>
          <a className={styles.logo} href="/dashboard">Live Captioning</a>
        </Col>
      </Row>
    </Layout.Header>
  );
};

export const EmptyHeader = translate()(_EmptyHeader);
