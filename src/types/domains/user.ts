import * as firebase from "firebase";

export type FirebaseUser = firebase.User;

export const enum Roles {
  creater = "creater",
  reader = "reader"
}

export type User = {
  uid: string;
  role: Roles;
  userGivenData: UserGivenData;
};

export type UserGivenData = {
  firstName: string;
  lastName: string;
  contactNumber: string;
  companyName: string;
  email: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zipCode: string;
  businessPhoneNumber: string;
};

export const userHelpers = {
  dummy: (uid: string): User => {
    return {
      uid: uid,
      role: Roles.creater,
      userGivenData: {
        email: "asdadasd",
        firstName: "foo",
        lastName: "bar",
        contactNumber: "dummy",
        companyName: "dummy",
        address: "dummy",
        country: "dummy",
        city: "dummy",
        state: "dummy",
        zipCode: "dummy",
        businessPhoneNumber: "dummy"
      }
    };
  }
};
