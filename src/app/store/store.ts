import {History} from "history";
import {routerMiddleware, connectRouter} from "connected-react-router";
import * as Redux from "redux";
import {composeWithDevTools} from "redux-devtools-extension/logOnlyInProduction";
import createSagaMiddleware from "redux-saga";
import {rootSaga} from "./sagas";
import {applicationStateReducer} from "./reducer";

import {Store, ApplicationState} from "types";
import {initialApplicationState} from "./constants";

/**
 * allows usage of ReduxDevTools only in dev environment, not in production
 * @see https://github.com/zalmoxisus/redux-devtools-extension#13-use-redux-devtools-extension-package-from-npm */ // tslint:disable-line:max-line-length
const composeEnhancers = composeWithDevTools({
  // options like actionSanitizer, stateSanitizer
});


/**
 * Create the redux store
 */
export function createStore(history: History): Store {
  const sagaMiddleware = createSagaMiddleware();
  const store = Redux.createStore<ApplicationState>(
    connectRouter(history)(applicationStateReducer),
    initialApplicationState,
    composeEnhancers(
      Redux.applyMiddleware(
        sagaMiddleware,
        routerMiddleware(history)
      )
    )
  );

  if (module.hot) {
    module.hot.accept("./reducer", () => {
      const appReducer = require("./reducer") as typeof applicationStateReducer;
      store.replaceReducer(connectRouter(history)(appReducer));
    });
  }
  sagaMiddleware.run(rootSaga);
  return store;
}
