import * as uuid from "uuid";

export type FDocument = {
  documentId: string;
  fileId: string | null;
  user: string;
  isDeleted: boolean;
  name: string;
  sessionEnd: string;
  sessionLength: number;
  sessionStart: string;
  sessionTimeZone: string;
  viewersNumber: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const dummyDocument = (uid: string): FDocument => {
  return {
    documentId: uuid.v4(),
    fileId: "foo",
    user: uid,
    isDeleted: false,
    name: "",
    sessionEnd: "dummy",
    sessionLength: 100,
    sessionStart: "dummy",
    viewersNumber: 100,
    sessionTimeZone: "Europe/Berlin",
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

