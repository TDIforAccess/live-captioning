import {fireStore} from "./firebaseApp";
import {firestore} from "firebase";
import {either, option} from "fp-ts";
import {optionUtils, nullUtils, taskEitherUtils} from "../../../utils";
import {User} from "src/types/domains/user";
import {FDocument} from "../../../types/domains/document";
import {FMailingList} from "../../containers/MailingList/mailingListReducer";
import {FDocumentShare} from "types";
import {TaskEither} from "fp-ts/lib/TaskEither";

export const storeConstants = {
  user: {
    path: "user"
  },
  document: {
    path: "document"
  },
  documentShare: {
    path: "documentShare"
  },
  realTimeDocuments: {
    path: "realTimeDocuments"
  },
  mailingList: {
    path: "mailingList"
  },
  userEditorSettings: {
    path: "userEditorSettings"
  }
};

export type FireStoreException = {
  message: string;
};

/**
 * Fire Store Algebra defines a set of instructions that each store has to follow while implementing it
 * @document: This defines which collection the sore would fork upon
 * @create: This method takes a data to create and an option<Id> id is none<id> then is is auto created
 *          and if this is some<id> then that id is used.
 * @fetch: This method takes the id and fetches a single record.
 */

interface FireStoreAlgebra<T> {
  document: firestore.CollectionReference;
  create: <A>(data: A, id: option.Option<string>) => Promise<either.Either<FireStoreException, [T, string]>>;
  fetch: (id: string) => Promise<either.Either<FireStoreException, option.Option<T>>>;
}

/**
 * Predefined Fire Store Impl for fire store algebra
 */

export class FireStoreImpl<T> implements FireStoreAlgebra<T> {
  document: firestore.CollectionReference;

  constructor(path: string) {
    this.document = fireStore.collection(path);
  }

  prefixed = (str: string): string => {
    return `[${this.document}] ${str}`;
  }

  update = async (entity: T, id: string): Promise<either.Either<FireStoreException, T>> => {
    try {
      const docRef: firestore.DocumentReference = this.document.doc(id);
      await docRef.update(entity);
      const updatedDoc = await this.fetch(docRef.id);
      return updatedDoc.fold(
        (l: FireStoreException) => either.left<FireStoreException, T>(l),
        (a: option.Option<T>) => either.fromOption({
          message: "Document supposed to be found but was empty"
        })(a)
      );
    } catch (err) {
      console.error(this.prefixed(`Error creating document for id = ${id} with error  ${err.stack}`));
      return either.left<FireStoreException, T>({message: `Error creating document for id = ${id} with error ${err}`});
    }
  }

  createMany = async <A>(data: A[]): Promise<either.Either<FireStoreException, string[]>> => {
    try {
      const batch = fireStore.batch();
      const ids = data.map(v => {
        const docRef = this.document.doc();
        batch.set(docRef, v);
        return docRef.id;
      });
      await batch.commit();
      return either.right<FireStoreException, string[]>(ids);

    } catch (err) {
      console.error(this.prefixed(`Error creating documents with error  ${err.stack}`));
      return either.left<FireStoreException, string[]>({message: `Error creating documents with error ${err}`});
    }
  }

  create = async <A>(data: A, id: option.Option<string>): Promise<either.Either<FireStoreException, [T, string]>> => {
    try {
      const docRef: firestore.DocumentReference = id.fold(
        this.document.doc(),
        uid => this.document.doc(uid)
      );
      await docRef.set(data);
      const user = await this.fetch(docRef.id);
      return user.fold(
        (l: FireStoreException) => either.left<FireStoreException, [T, string]>(l),
        (a: option.Option<T>) => (either.fromOption<FireStoreException>({
          message: "User supposed to be found but was empty"
        })<T>(a)).map((r: T) => [r, docRef.id] as [T, string])
      );
    } catch (err) {
      console.error(this.prefixed(`Error creating document for id = ${id} with error  ${err.stack}`));
      return either.left<FireStoreException, [T, string]>({message: `Error creating document for id = ${id} with error ${err}`});
    }
  }

  fetchT = (id: string): TaskEither<FireStoreException, option.Option<T>> => {
    return taskEitherUtils.fromPromise(this.document.doc(id).get(), message => ({message: String(message)})).map(
      snapShot => {
        if (snapShot.exists) {
          return optionUtils.fromUndefinedA(snapShot.data() as T);
        } else {
          return option.none;
        }
      }
    );
  }

  fetch = async (id: string): Promise<either.Either<FireStoreException, option.Option<T>>> => {
    try {
      const dSnapshot: firestore.DocumentSnapshot = await this.document.doc(id).get();
      if (dSnapshot.exists) {
        // tslint:disable-next-line:no-unnecessary-type-assertion
        return either.right<FireStoreException, option.Option<T>>(optionUtils.fromUndefinedA(dSnapshot.data()) as option.Option<T>);
      } else {
        return either.right<FireStoreException, option.Option<T>>(option.none);
      }
    } catch (err) {
      console.error(this.prefixed(`Error getting documents for id = ${id} with error  ${err.stack}`));
      return either.left<FireStoreException, option.Option<T>>({message: `Error getting documents for id = ${id} with error ${err}`});
    }
  }

  fetchDocReference = async (id: string): Promise<either.Either<FireStoreException, option.Option<firestore.DocumentReference>>> => {
    try {
      const dSnapshot: firestore.DocumentSnapshot = await this.document.doc(id).get();
      if (dSnapshot.exists) {
        // tslint:disable-next-line:no-unnecessary-type-assertion
        return either.right<FireStoreException, option.Option<firestore.DocumentReference>>(option.some(dSnapshot.ref));
      } else {
        return either.right<FireStoreException, option.Option<firestore.DocumentReference>>(option.none);
      }
    } catch (err) {
      console.error(this.prefixed(`Error getting document ref for id = ${id} with error  ${err.stack}`));
      return either.left<FireStoreException, option.Option<firestore.DocumentReference>>({message: `Error getting documents for id = ${id} with error ${err}`});
    }
  }

  fetchSimple = async (id: string): Promise<T> => {
    const dSnapshot: firestore.DocumentSnapshot = await this.document.doc(id).get();
    return dSnapshot.data() as T;
  }
}

class DocumentStore<T> extends FireStoreImpl<T> {
  fetchByUser = async (userId: string): Promise<either.Either<FireStoreException, T[]>> => {
    try {
      // We always fetch documents, which are not deleted.
      const query: firestore.QuerySnapshot = await this.document.where("user", "==", userId).where("isDeleted", "==", false).get();
      return either.right<FireStoreException, T[]>(query.docs.map(r => r.data()) as T[]);
    } catch (err) {
      console.error(this.prefixed(`Error getting documents for id = ${userId} with error  ${err.stack}`));
      return either.left<FireStoreException, T[]>({message: `Error getting session document for user = ${userId} with error ${err}`});
    }
  }
}


class MailingListStore<T> extends FireStoreImpl<T> {
  fetchByUser = async (userId: string): Promise<either.Either<FireStoreException, T[]>> => {
    try {
      const query: firestore.QuerySnapshot = await this.document.where("userId", "==", userId).get();
      return either.right<FireStoreException, T[]>(query.docs.map(r => r.data()) as T[]);
    } catch (err) {
      console.error(this.prefixed(`Error getting mailingList for user = ${userId} with error  ${err.stack}`));
      return either.left<FireStoreException, T[]>({message: `Error getting mailingList for user = ${userId} with error ${err}`});
    }
  }
}

class DocumentShareStore<T> extends FireStoreImpl<T> {
  fetchByEmail = async (email: string): Promise<either.Either<FireStoreException, T[]>> => {
    try {
      const query: firestore.QuerySnapshot = await this.document.where("email", "==", email).get();
      return either.right<FireStoreException, T[]>(query.docs.map(r => r.data()) as T[]);
    } catch (err) {
      console.error(this.prefixed(`Error getting shared docs for email = ${email} with error  ${err.stack}`));
      return either.left<FireStoreException, T[]>({message: `Error getting mailingList for user = ${email} with error ${err}`});
    }
  }
}

// TODO right now shape is not known so empty
type RealTimeDocument = {};

export const documentStore = new DocumentStore<FDocument>(storeConstants.document.path);

class RealTimeDocumentStore<T> extends FireStoreImpl<T> {
  documentRef: firestore.DocumentReference = this.document.doc();

  fetchDocReference = async (id: string): Promise<either.Either<FireStoreException, option.Option<firestore.DocumentReference>>> => {
    try {
      const realtimeDocumentId: either.Either<FireStoreException, option.Option<Promise<firestore.DocumentSnapshot>>> = await documentStore.fetch(id)
        .then(d => d.map((a: option.Option<FDocument>) => a.map(async (d: FDocument) => {
          return this.document.doc(nullUtils.fromNullToUndefined(d.fileId)).get();
        })));

      return realtimeDocumentId.fold(
        async l => Promise.reject(l),
        (r: option.Option<Promise<firestore.DocumentSnapshot>>) => r.fold(
          Promise.resolve(either.right<FireStoreException, option.Option<firestore.DocumentReference>>(option.none)),
          async (rm: Promise<firestore.DocumentSnapshot>) => rm.then((dSnapshot: firestore.DocumentSnapshot) => {
            if (dSnapshot.exists) {
              return either.right<FireStoreException, option.Option<firestore.DocumentReference>>(option.some(dSnapshot.ref));
            } else {
              return either.right<FireStoreException, option.Option<firestore.DocumentReference>>(option.none);
            }
          })));
    } catch (err) {
      console.error(this.prefixed(`Error getting document ref for id = ${id} with error  ${err.stack}`));
      return either.left<FireStoreException, option.Option<firestore.DocumentReference>>({message: `Error getting documents for id = ${id} with error ${err}`});
    }
  }
}


export const realTimeDocumentStore = new RealTimeDocumentStore<RealTimeDocument>(storeConstants.realTimeDocuments.path);
export const documentShareStore = new DocumentShareStore<FDocumentShare>(storeConstants.documentShare.path);
export const userStore = new FireStoreImpl<User>(storeConstants.user.path);
export const mailingListStore = new MailingListStore<FMailingList>(storeConstants.mailingList.path);
