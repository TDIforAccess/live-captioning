import * as React from "react";
import * as firebase from "firebase";
import {connect} from "react-redux";
import {ApplicationStateDispatcher} from "types";
import {firebaseAuth} from "../../services/firebase/firebaseApp";
import {loginSuccess} from "./authenticationReducers";
import {push} from "connected-react-router";
import {RouteComponentProps} from "react-router";

export type WithAuthenticationDispatcher = {
  reviveUser: (userInfo: firebase.User) => void;
  redirectToRoot: (redirectTo: string) => void;

};

export type WithAuthenticationState = {
  isLoggedIn: boolean;
  userId: string | null;
  authUser: firebase.User | null;
};

export type WithAuthenticationProps = WithAuthenticationDispatcher & RouteComponentProps;


const withAuthentication = (Component: any) => {
  class WithAuthentication extends React.Component<WithAuthenticationProps, WithAuthenticationState> {
    constructor(props: WithAuthenticationProps) {
      super(props);
      this.state = {
        isLoggedIn: false,
        userId: null,
        authUser: null
      };
    }
    componentDidMount() {
      firebaseAuth.onAuthStateChanged((authUser: firebase.User | null) => {
        if (authUser) {
          this.setState({
            isLoggedIn: true,
            userId: authUser.uid,
            authUser: authUser
          });
          this.props.reviveUser(authUser);
        } else {
          this.setState({
            isLoggedIn: true
          });
          this.props.redirectToRoot(this.props.location.pathname);
        }
      });
    }

    render() {
      return (this.state.isLoggedIn ? <Component {...this.state} {...this.props}/> : null);
    }
  }


  const mapDispatchToProps = (dispatch: ApplicationStateDispatcher): WithAuthenticationDispatcher => ({
    reviveUser: (userInfo: firebase.User) => dispatch(loginSuccess(userInfo)),
    redirectToRoot: (redirectTo: string) => {
      if (!(redirectTo === "/")) {
        dispatch(push(`/?r=${redirectTo}`));
      }
    }
  });

  return connect(null, mapDispatchToProps)(WithAuthentication);
};

export default withAuthentication;
