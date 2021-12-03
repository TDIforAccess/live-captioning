import {BasicInformationForm, BasicInformationFormDispatchToProps, BasicInformationFormStateProps} from "./BasicInformationForm";
import {containerUtils} from "../../../utils";
import {ApplicationState, ApplicationStateDispatcher, User} from "types";
import {putUserInfo} from "./basicInformationSaga";

const BasicInformationMapDispatchToProps = (dispatch: ApplicationStateDispatcher): BasicInformationFormDispatchToProps => ({
  saveUserInfo: (user: User) => dispatch(putUserInfo(user))
});

const BasicInformationMapStateToProps = (applicationState: ApplicationState): BasicInformationFormStateProps => ({
  firebaseUser: applicationState.userState.firebaseUser
});

export const BasicInformationContainer = containerUtils.connectTranslated(BasicInformationMapStateToProps, BasicInformationMapDispatchToProps)(BasicInformationForm);
