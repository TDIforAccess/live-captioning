import * as functions from "firebase-functions";
import {CallableContext} from "firebase-functions/lib/providers/https";
import {sendEmail} from "./Mailgun";
import {HttpStatusCode} from "./HttpStatusCode";
import {Email} from "./Email";
import {EmailPayload} from "./types";

export const sendMailHTTP = functions.https.onRequest((request, response) => {
  const {to, subject, body} = request.body as EmailPayload;
  const email = new Email(to, subject, body);
  sendEmail(email.getEmailData()).then((result) => {
    response.status(HttpStatusCode.OK).send(result);
  }).catch((err) => {
    console.log(err);
    response.status(HttpStatusCode.BAD_REQUEST).send(err);
  });
});


export const sendMailCallable = functions.https.onCall(({to, subject, body}: EmailPayload, context: CallableContext) => {
  if (context.auth) {
    const email = new Email(to, subject, body);
    return sendEmail(email.getEmailData()).then((result) => {
      return {
        status: HttpStatusCode.OK,
        message: "Successfully sent the email."
      };
    }).catch((err) => {
      return {
        status: HttpStatusCode.BAD_REQUEST,
        message: "Failed to send email."
      };
    });
  } else {
    return {
      status: HttpStatusCode.UNAUTHORIZED,
      message: "You are not allowed to make this request"
    };
  }
});
