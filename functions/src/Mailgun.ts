import * as Mailgun from "mailgun-js";

const constructorParams = {
  apiKey: "YOUR_MAIL_GUN_API_KEY",
  domain: "YOUR_TRANSACTION_EMAIL_DOMAIN"
};

const FROM =  "YOUR_SENDER_EMAIL_ADDRESS";

export const sendEmail = async (sendData: Mailgun.messages.SendData) => {
  const mailgun = new Mailgun(constructorParams);
  return await mailgun
    .messages()
    .send({...sendData, from: FROM});
};
