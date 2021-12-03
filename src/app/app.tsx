import * as React from "react";
import {Provider} from "react-redux";
import {ConnectedRouter} from "connected-react-router";
import {Route, Switch} from "react-router-dom";
import {render} from "react-dom";
import * as qs from "query-string";
import {I18nextProvider} from "react-i18next";
import createBrowserHistory from "history/createBrowserHistory";
import registerServiceWorker from "./services/registerServiceWorker";
import {i18n} from "./i18n";
import {createStore, AppRoutes} from "./store";
import {DashboardContainer} from "./containers/Dashboard";
import {authorisationUtils} from "../utils";
import {BasicInformationContainer} from "./containers/BasicInfomation";
import {LoginFormContainer} from "./containers/Authentication/Login";
import {defaultLayout} from "./layouts/DefaultLayout";
import {DocumentCreateContainer} from "./containers/Document/DocumentCreateContainer";
import {navBarLayout} from "./layouts/NavBarLayout";
import {MailingListContainer} from "./containers/MailingList";
import * as R from "ramda";
import {library, dom} from "@fortawesome/fontawesome-svg-core";
import {
  faTachometerAlt,
  faUserEdit,
  faEnvelope,
  faListAlt,
  faFileCode,
  faPencilAlt,
  faShareAlt,
  faEye,
  faDownload,
  faTrashAlt, faSpinner, faBars, faUserAlt,
  faHandPointRight,
  faFileCsv
} from "@fortawesome/free-solid-svg-icons";
import {SessionInfoContainer} from "./containers/Document/SessionInfo/SessionInfoContainer";
import {ProfileInfoContainer} from "./containers/Profile/ProfileInfoContainer";
import {DocumentShareContainer} from "./containers/Document/DocumentShare/DocumentShareContainer";
import {EditorContainer} from "./containers/Editor/EditorContainer";
import {PublicEditorContainer} from "./containers/Editor/PublicEditorContainer";

library.add(
  faSpinner,
  faTachometerAlt,
  faUserEdit,
  faEnvelope,
  faListAlt,
  faFileCode,
  faPencilAlt,
  faShareAlt,
  faEye,
  faDownload,
  faTrashAlt,
  faBars,
  faUserAlt,
  faHandPointRight,
  faFileCsv
);

dom.watch();

const history = createBrowserHistory();
export const store = createStore(history);
const parsedQueryString = qs.parse(location.hash);
const locale = Array.isArray(parsedQueryString.locale) ? R.head(parsedQueryString.locale) : parsedQueryString.locale;
const {userAuthentication} = authorisationUtils;


// @ts-ignore
render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <I18nextProvider i18n={i18n(locale)}>
        <Switch>
          <Route path={AppRoutes.publicEditor({documentId: ":documentId"})} name="EditorPublic"
                 component={navBarLayout(PublicEditorContainer)}/>
          <Route path={AppRoutes.editor({user: ":user", documentId: ":documentId"})} name="Editor"
                 component={userAuthentication(navBarLayout(EditorContainer))}/>
          <Route path="/documentShare" name="BasicInformation"
                 component={userAuthentication(navBarLayout(DocumentShareContainer))}/>
          <Route path="/basicInformation" name="BasicInformation"
                   component={userAuthentication(defaultLayout(BasicInformationContainer))}/>
          <Route path="/document" name="DocumentCreate"
                   component={userAuthentication(navBarLayout(DocumentCreateContainer))}/>
          <Route path="/profile" name="Profile"
                   component={userAuthentication(navBarLayout(ProfileInfoContainer))}/>
          <Route path={AppRoutes.sessionInfo()} name="SessionInfo"
                   component={userAuthentication(navBarLayout(SessionInfoContainer))}/>
          <Route path="/dashboard" name="Dashboard"
                   component={userAuthentication(navBarLayout(DashboardContainer))}/>
          <Route path="/mailingList" name="MailingList"
                   component={userAuthentication(navBarLayout(MailingListContainer))}/>
          <Route path="/" name="Login Page"
                   component={userAuthentication(defaultLayout(LoginFormContainer))}/>
        </Switch>
      </I18nextProvider>
    </ConnectedRouter>
  </Provider>,
  document.getElementById("root")
);

registerServiceWorker();

