import {FDocument} from "./document";

export type FDocumentShare = {
  documentId: string;
  fileId: string | null;
  email: string;
  invitedBy: string;
  permission: Permission;
  createdAt: Date;
  updatedAt: Date;
};


export const enum Permission {
  Read = "read",
  Write = "write"
}


export type DocumentToShare = {
  documentId: string;
  permission: Permission;
};

export type FDocumentDashboardShared = FDocument & {
  email: string;
  invitedBy: string;
  permission: Permission;
};
