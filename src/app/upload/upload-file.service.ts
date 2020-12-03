import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { AngularFirestore } from 'angularfire2/firestore';

import { FileUpload } from './fileupload';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  private basePath = '/uploads';
private abhiJeet:number;
  constructor(private db: AngularFireDatabase,public db1: AngularFirestore,) { }

  pushFileToStorage(abhiJeet: number,fileUpload: FileUpload, progress: { percentage: number }) {
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(`${this.basePath}/${fileUpload.file.name}`).put(fileUpload.file);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        // in progress
        const snap = snapshot as firebase.storage.UploadTaskSnapshot;
        progress.percentage = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
      },
      (error) => {
        // fail
        console.log(error);
      },
      () => {
        // success
        uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
          console.log('File available at', downloadURL);
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
          this.saveFileData(fileUpload,abhiJeet);
        });
      }
    );
  }

  private saveFileData(fileUpload: FileUpload,abhiJeet:number) {
    this.abhiJeet = abhiJeet;
    console.log('fileup '+fileUpload.url +' name '+fileUpload.name);
    const data = {
      url:fileUpload.url,
      name: fileUpload.name
      
    }
    //this.db1.collection('fileupload').add(data);

    //this.db.collection('photos').add( { path, size: snap.totalBytes })
    this.db.list(`${this.basePath}/`+abhiJeet).push(fileUpload);
  }

  getFileUploads(numberItems,abhijeet): AngularFireList<FileUpload> {

    console.log('this.abhiJeet '+abhijeet);
    return this.db.list(this.basePath+'/'+abhijeet, ref =>
      ref.limitToLast(numberItems));
  }

  deleteFileUpload(fileUpload: FileUpload) {
    this.deleteFileDatabase(fileUpload.key)
      .then(() => {
        this.deleteFileStorage(fileUpload.name);
      })
      .catch(error => console.log(error));
  }

  private deleteFileDatabase(key: string) {
    return this.db.list(`${this.basePath}/`).remove(key);
  }

  private deleteFileStorage(name: string) {
    const storageRef = firebase.storage().ref();
    storageRef.child(`${this.basePath}/${name}`).delete();
  }
}
