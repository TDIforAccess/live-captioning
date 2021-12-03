import {isEmpty, isNil} from "ramda";
import {Emails} from "./UploadMailingList";
import {TranslationFunction} from "i18next";

export const isValidEmail = (email: string) =>
  // https://www.w3.org/TR/html5/sec-forms.html#email-state-typeemail
  !isNil(email.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/) && email.match(/^[a-z0-9]/ig));

export const emailTagsValidator = (value: string, cb: (error?: Error) => void, emailList: Emails[], t: TranslationFunction) => {
  if (isEmpty(value) || isNil(value)) {
    return cb(new Error(t("createMailingList.message.emailTags")));
  } else if (!isValidEmail(value)) {
    return cb(new Error(t("createMailingList.message.invalidEmail")));
  } else if (emailList.some(({email}) => email === value)) {
    return cb(new Error(t("createMailingList.message.duplicateEmail")));
  } else {
    return cb();
  }
};

export const emailTagsValidatorV2 = (value: string, cb: (error?: Error) => void, emailList: string[], t: TranslationFunction) => {
  if (isEmpty(value) || isNil(value)) {
    return cb(new Error(t("createMailingList.message.emailTags")));
  } else if (!isValidEmail(value)) {
    return cb(new Error(t("createMailingList.message.invalidEmail")));
  } else if (emailList.some((email) => email === value)) {
    return cb(new Error(t("createMailingList.message.duplicateEmail")));
  } else {
    return cb();
  }
};
