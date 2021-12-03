import {option, task, taskEither} from "fp-ts";
import {FireStoreException, FireStoreImpl, storeConstants, userStore} from "../firestore";
import {TaskEither} from "fp-ts/lib/TaskEither";
import {taskEitherUtils} from "../../../../utils";
import {FDocumentShare, User} from "types";

class DocumentShareStore extends FireStoreImpl<FDocumentShare> {
  fetchByEmail = (email: string): TaskEither<FireStoreException, FDocumentShare[]> => {
    return taskEitherUtils.fromFireStorePromise(this.document.where("email", "==", email).get()).map(
      query => query.docs.map(r => r.data()) as FDocumentShare[]
    );
  }

  fetchByEmailAndDocumentId = (userId: string, documentId: string): TaskEither<FireStoreException, option.Option<FDocumentShare>> => {
    const fetchShareDocument = (email: string) => taskEitherUtils.fromFireStorePromise(
      this.document.where("email", "==", email).where("documentId", "==", documentId).limit(1).get())
      .map(querSnap => {
        const data = querSnap.docs.map(r => r.data()) as FDocumentShare[];

        if (data.length === 1) {
          return option.some(querSnap.docs[0].data() as FDocumentShare);
        } else {
          return option.none;
        }
      });

    const user: TaskEither<FireStoreException, option.Option<User>> = userStore.fetchT(userId);

    return user.chain(
      user => user.fold(
        taskEither.left(task.delay(0, {message: `No user found for user id = ${userId}`})),
        (userData: User) => fetchShareDocument(userData.userGivenData.email)
      )
    );
  }
}

export const documentShareStoreT = new DocumentShareStore(storeConstants.documentShare.path);
