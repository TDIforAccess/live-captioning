import {FUserEditorSettings} from "../../../../types/domains/userSettings";
import {TaskEither} from "fp-ts/lib/TaskEither";
import {chain, option, taskEither} from "fp-ts";
import {firestore} from "firebase";
import {optionUtils, taskEitherUtils} from "../../../../utils";
import {FireStoreException, storeConstants, FireStoreImpl} from "../firestore";

class UserEditorSettingsStore extends FireStoreImpl<FUserEditorSettings> {
  fetchA = (id: string): TaskEither<FireStoreException, option.Option<FUserEditorSettings>> => {
    const query: TaskEither<FireStoreException, firestore.DocumentSnapshot> = taskEitherUtils
      .fromPromise(
        this.document.doc(id).get(),
          message => ({message: String(message)})
      );

    return query.map(snapShot => {
      if (snapShot.exists) {
        return optionUtils.fromUndefinedA(snapShot.data() as FUserEditorSettings);
      } else {
        return option.none;
      }
    });
  }

  createOrUpdate = (data: FUserEditorSettings): TaskEither<FireStoreException, option.Option<FUserEditorSettings>> => {
    const docRef: firestore.DocumentReference = this.document.doc(data.user);
    const u: TaskEither<FireStoreException, TaskEither<FireStoreException, option.Option<FUserEditorSettings>>> = this.fetchA(data.user).map(snapShot => {
      if (snapShot.isSome()) {
        // update
        return taskEitherUtils.fromPromise(docRef.update(data), message => ({message: `error while updating document ${String(message)}`}));
      } else {
        // create
        return taskEitherUtils.fromPromise(docRef.set(data), message => ({message: `error while creating document ${String(message)}`}));
      }
    }).map(_ => this.fetchA(data.user));

    return chain.flatten(taskEither.taskEither)(u);
  }
}

export const userEditorSettingsStore = new UserEditorSettingsStore(storeConstants.userEditorSettings.path);
