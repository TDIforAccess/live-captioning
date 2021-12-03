import {Action, createAction} from "redux-actions";
import * as either from "fp-ts/lib/Either";
import {documentShareStore, documentStore, FireStoreException} from "../../../services/firebase/firestore";
import {call, Effect, put} from "redux-saga/effects";
import {FDocument, FDocumentShare, Permission} from "types";
import {documentShareError, documentShareSuccess} from "./documentShareReducer";
import * as R from "ramda";
import {EmailPayload, Subject, Template} from "../../../../../functions/src/types";
import {CloudFunctionException, sendMail} from "../../../services/firebase/functions";
import HttpsCallableResult = firebase.functions.HttpsCallableResult;

export const DOCUMENT_SHARE_POST = "DOCUMENT_SHARE_POST";
export const documentSharePost = createAction(DOCUMENT_SHARE_POST);

const sendInvitationPayload = (
  to: string[],
  {documentId, name, sessionStart, sessionLength, sessionTimeZone}: FDocument,
  permission: Permission, invitedBy: string
): EmailPayload => ({
  to,
  body: {
    kind: Template.invite,
    invitedBy,
    loginLink: "",
    sessionDetails: {
      name,
      permission,
      sessionTimeZone,
      sessionStart,
      sessionLength,
      shareLink: `${location.protocol}//${location.host}/editor/invitation/${documentId}`
    }
  },
  subject: Subject.invite
});

// @ToDo: We really need to do chaining of correct order of function calls. Currently, it is assumed everything works.
export function* documentSharePostSaga({payload: documentsShared}: Action<FDocumentShare[]>) {
  try {
    if (documentsShared) {
      const document: either.Either<FireStoreException, string[]> = yield call(documentShareStore.createMany, documentsShared);
      yield document.fold(
        e => put(documentShareError({
          message: e.message
        })) as Effect,
        (docs: string[]) => put(documentShareSuccess(docs)) as Effect
      );
      const {documentId, invitedBy, permission} = R.head(documentsShared) as FDocumentShare;
      const to = documentsShared.map(({email}) => email);
      const documentDetails = yield call(documentStore.fetchSimple, documentId);

      const callableResult: either.Either<CloudFunctionException, HttpsCallableResult> =
        yield call(sendMail, sendInvitationPayload(to, documentDetails, permission, invitedBy));

      callableResult.fold(
        e => console.error(e),
        (callableResult: HttpsCallableResult) => console.log(callableResult)
      );
    }
  } catch (e) {
    yield put(documentShareError({
      message: e.message
    })) as Effect;
  }
}
