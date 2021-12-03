import {
  connect,
  MapDispatchToPropsFactory,
  MapDispatchToPropsFunction,
  MapStateToPropsParam
} from "react-redux";
import {translate} from "react-i18next";
import {isNil, compose} from "ramda";
import {option, taskEither} from "fp-ts";

import withAuthentication from "./app/containers/Authentication/withAuthentication";
import {TaskEither} from "fp-ts/lib/TaskEither";
import * as React from "react";
import {OptionProps} from "antd/lib/select";
import {FireStoreException} from "./app/services/firebase/firestore";

declare type ComposedComponent = (s: React.ComponentClass | React.SFC) => React.ComponentClass | React.SFC;

export const containerUtils = {
  connectTranslated: <TStateProps, TDispatchProps, TOwnProps, State, >(
    mapStatesToProp: MapStateToPropsParam<TStateProps, TOwnProps, State> | null,
    mapDispatchToProps: TDispatchProps | MapDispatchToPropsFactory<TDispatchProps, TOwnProps> | MapDispatchToPropsFunction<TDispatchProps, TOwnProps>): ComposedComponent => {
    return compose(
      connect(mapStatesToProp, mapDispatchToProps),
      translate()
    );
  }
};


export const optionUtils = {
  fromUndefinedA: <A>(a: A | undefined): option.Option<A> => a ? option.some(a) : option.none
};

export const authorisationUtils = {
  userAuthentication: withAuthentication
};

export const nullUtils = {
  fromNullToUndefined: <A>(s: A | null): A | undefined => isNil(s) ? undefined : s
};

export const stringUtils = {
  fromNullToUndefined: (s: string | null): string | undefined => isNil(s) ? undefined : s
};

export const taskEitherUtils = {
  fromPromise: <E, A>(p: Promise<A>, onReject: (m: string) => E): TaskEither<E, A> => taskEither.tryCatch(async () => p, message => onReject(String(message))),
  fromFireStorePromise: <A>(p: Promise<A>): TaskEither<FireStoreException, A> => taskEither.tryCatch(async () => p, message => ({message: String(message)}))
};

export const selectFilterHelper = (input: string, option: React.ReactElement<OptionProps>) =>
  (option.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0;

export const UNITED_STATES = "United States";

export const downloadDocument = (name: string, text: string) => {
  const element = document.createElement("a");
  element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
  element.setAttribute("download", name);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};
