import {ApplicationState, ApplicationStateDispatcher} from "types";
import {ProfileInfo, ProfileInfoDispatchProps, ProfileInfoStateProps} from "./ProfileInfoView";
import {containerUtils} from "../../../utils";
import {fetchUserInfo, updateUserInfo} from "./userSaga";
import {User} from "../../../types/domains/user";

export const profileInfoMapDispatchToProps = (dispatch: ApplicationStateDispatcher): ProfileInfoDispatchProps => ({
  fetchUserInfo: (userId: string) => dispatch(fetchUserInfo(userId)),
  updateUserInfo: (userData: User) => dispatch(updateUserInfo(userData))
});

const profileInfoMapStateToProps = (applicationState: ApplicationState): ProfileInfoStateProps => {
  return {
    firebaseUser: applicationState.userState.firebaseUser,
    userInfo: applicationState.userState.userInfo,
    userInfoFetchError: applicationState.userState.userInfoFetchError,
    userUpdateError: applicationState.userState.userUpdateError,
    userUpdated: applicationState.userState.userUpdateSuccess
  };
};

export const ProfileInfoContainer = containerUtils.connectTranslated(
  profileInfoMapStateToProps, profileInfoMapDispatchToProps)(ProfileInfo);
