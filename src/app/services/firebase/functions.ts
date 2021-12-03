import {cloudFunctions} from "./firebaseApp";
import {either} from "fp-ts";
import {EmailPayload} from "../../../../functions/src/types";
import HttpsCallableResult = firebase.functions.HttpsCallableResult;

const sendMailCallable = cloudFunctions.httpsCallable("sendMailCallable");

export type CloudFunctionException = {
  message: string;
};

export const sendMail = async (emailPayload: EmailPayload): Promise<either.Either<CloudFunctionException, HttpsCallableResult>> => {
  try {
    return either.right<CloudFunctionException, HttpsCallableResult>(await sendMailCallable(emailPayload));
  } catch (e) {
    return either.left<CloudFunctionException, HttpsCallableResult>({message: "Failed to send email"});
  }
};
