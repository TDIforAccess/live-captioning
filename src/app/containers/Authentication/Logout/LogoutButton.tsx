import * as React from "react";
import {identity} from "ramda";
import {Button, Tooltip} from "antd";
import {InjectedTranslateProps} from "react-i18next";
import {FirebaseUser} from "../../../../types/domains/user";

export type LogoutButtonDispatchProps = {
  logoutUser: () => void;
};
export type LogoutButtonStateProps = {
  firebaseUser?: FirebaseUser;
};

export type LogoutButtonProps =
  LogoutButtonDispatchProps & InjectedTranslateProps & LogoutButtonStateProps;

export class Logout extends React.Component<LogoutButtonProps> {
  constructor(props: LogoutButtonProps) {
    super(props);
    this.logoutUser = this.logoutUser.bind(this);
  }

  logoutUser() {
    this.props.logoutUser();
  }

  render() {
    const {firebaseUser, t = identity} = this.props;
    if (firebaseUser) {
      return (
        <Tooltip placement="left" title={t("navbar.logout")} arrowPointAtCenter>
          <Button size={"large"} type="danger" icon="poweroff" onClick={this.logoutUser} className="login-form-button"/>
        </Tooltip>
      );
    } else {
      return null;
    }

  }
}

export const LogoutButton = Logout;
