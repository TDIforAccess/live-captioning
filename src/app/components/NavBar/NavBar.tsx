import {Menu} from "antd";
import * as React from "react";
import {InjectedTranslateProps, translate} from "react-i18next";
import * as styles from "./NavBar.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Link} from "react-router-dom";

type NavBarProps = InjectedTranslateProps & {
  path: string;
};

// Disabling this rule in this file as we know that text comes from translation is different.
// tslint:disable:react-a11y-anchors
const _NavBar: React.SFC<NavBarProps> = ({t, path}: NavBarProps) => (
    <Menu
      theme="light"
      mode="horizontal"
      selectedKeys={[path]}
      className={styles.navMenu}
    >
        <Menu.Item key="/dashboard">
          <Link to="/dashboard" >
            <FontAwesomeIcon icon="tachometer-alt"/> {t("navbar.dashboard")}
          </Link>
        </Menu.Item>
      <Menu.Item key="/document">
        <Link to="/document">
          <FontAwesomeIcon icon="list-alt" /> {t("navbar.createSession")}
        </Link>
      </Menu.Item>
      <Menu.Item key="/mailingList">
        <Link to="/mailingList">
          <FontAwesomeIcon icon="envelope" /> {t("navbar.mailLists")}
        </Link>
      </Menu.Item>
      <Menu.Item key="/profile">
        <Link to="/profile">
          <FontAwesomeIcon icon="user-edit" /> {t("navbar.profile")}
        </Link>
      </Menu.Item>
    </Menu>
);

export const NavBar = translate()(_NavBar);


