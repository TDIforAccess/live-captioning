import {EmailBodyType, InvitationDetails, Template, UserDetails} from "./types";
import {HTML_PAGE, INVITATION_EMAIL, WELCOME_EMAIL} from "./constants";
import * as Mailgun from "mailgun-js";

export class Email {
  from: string;
  to: string | string[];
  html: string;
  subject: string;
  invitedBy: string;

  constructor(to: string | string[], subject: string, body: EmailBodyType) {
    this.to = to;
    this.html = this.generateHtml(body);
    this.subject = subject;
  }

  getEmailData(): Mailgun.messages.SendData {
    return {
      from: this.from,
      to: this.to,
      subject: this.subject,
      html: this.html
    };
  }

  private fillInvitationData = (invitationDetails: InvitationDetails) => {
    return HTML_PAGE(INVITATION_EMAIL(invitationDetails));
  };

  private fillSignUpData = (userDetails: UserDetails) => {
    return HTML_PAGE(WELCOME_EMAIL(userDetails));
  };

  private generateHtml(body: EmailBodyType) {
    switch (body.kind) {
      case Template.invite:
        return this.fillInvitationData(body);
      case Template.signup:
        return this.fillSignUpData(body);
      default:
        console.info("[Email][generateHtml]: no template found");
        throw(new Error("TemplateNotFoundException"));
    }
  }
}
