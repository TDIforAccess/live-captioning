import {LogoutButton, LogoutButtonDispatchProps, LogoutButtonStateProps} from "./LogoutButton";
import {ApplicationState, ApplicationStateDispatcher} from "types";
import {containerUtils} from "../../../../utils";
import {logoutUser} from "../authenticationReducers";

export const mapDispatchToProps = (dispatch: ApplicationStateDispatcher): LogoutButtonDispatchProps => ({
  logoutUser: () => dispatch(logoutUser())
});

export const mapStateToProps = (state: ApplicationState): LogoutButtonStateProps => ({
  firebaseUser: state.userState.firebaseUser
});

export const LogoutButtonContainer = containerUtils.connectTranslated(
  mapStateToProps, mapDispatchToProps)(LogoutButton);
