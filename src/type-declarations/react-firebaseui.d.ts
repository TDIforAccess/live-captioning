declare module "react-firebaseui" {
  // ToDo: Expand the types for uiConfig & firebaseAuth
  type StyledFirebaseAuthProps = {
    uiConfig: any;
    firebaseAuth: any;
  };
  export const StyledFirebaseAuth: React.ComponentClass<StyledFirebaseAuthProps>;
}
