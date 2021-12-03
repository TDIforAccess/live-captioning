import * as firebase from "firebase";
import {store} from "../../app";
import {
  loginFailed,
  loginUser
} from "../../containers/Authentication/authenticationReducers";

import * as firebaseui from "firebaseui";

export const authenticationUIConfig = (fromUrl: string) => {
  return {
    signInFlow: "popup",
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        scopes: [
          "profile",
          "email"
        ]
      },
      {
        provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        scopes: [
          "public_profile",
          "email",
          "user_birthday"
        ]
      },
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      {
        provider: firebase.auth.GithubAuthProvider.PROVIDER_ID,
        scopes: [
          "repo"
        ]
      },
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        // Whether the display name should be displayed in Sign Up page.
        requireDisplayName: true
      }
    ],
    callbacks: {
      // Login success handler
      signInSuccessWithAuthResult: (authResult: firebase.auth.UserCredential) => {
        store.dispatch(loginUser({userCredential: authResult, location: fromUrl}));
        return false;
      },
      signInFailure: async (error: any) => {
        console.error(`[socialLogin] exception while doing social login with error ${error.stack}`);
        store.dispatch(loginFailed({
          message: error.message
        }));
        return Promise.resolve();
      }
    }
  };
};
