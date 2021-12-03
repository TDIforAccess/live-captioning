export type UserDetails = {
  kind: Template.signup;
  firstName: string;
  lastName: string;
  loginLink: string;
};

export type InvitationDetails = {
  kind: Template.invite;
  invitedBy: string;
  loginLink: string;
  sessionDetails: {
    name: string;
    permission: string;
    sessionStart: string;
    sessionTimeZone: string;
    sessionLength: number;
    shareLink: string;
  };
};

export type EmailBodyType = UserDetails | InvitationDetails;

export const enum Template {
  invite = "invite",
  signup = "signup"
}

export const enum Subject {
  invite = "Invitation for Live Captioning Session",
  signup = "Welcome to Live Captioning"
}

export type EmailPayload = {
  to: string | string[];
  body: EmailBodyType;
  subject: Subject;
};
