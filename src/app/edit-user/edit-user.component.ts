import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { AvatarDialogComponent } from "../avatar-dialog/avatar-dialog.component";
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'Rxjs';
import { finalize,tap } from 'rxjs/operators';
//import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from 'angularfire2/firestore';


@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  task: AngularFireUploadTask;
  initialCount: number = 193;
  reviewName:string;
  // Progress monitoring
  percentage: Observable<number>;

  snapshot: Observable<any>;

  // Download URL
  downloadURL: Observable<string>;

  // State for dropzone CSS toggling
  isHovering: boolean;

  exampleForm: FormGroup;

  commentForm: FormGroup;
  item: any;
  itemsV : any;
  public items: Array<any>;
  isLoggedIn = true;
  count:number;

  validation_messages = {
   'name': [
     { type: 'required', message: 'Name is required.' }
   ],
   'surname': [
     { type: 'required', message: 'Surname is required.' }
   ],
   'age': [
     { type: 'required', message: 'Age is required.' },
   ]
 };

  constructor(
    public storage: AngularFireStorage,
    public db: AngularFirestore,
    public firebaseService: FirebaseService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    public dialog: MatDialog
    
  ) { }

  ngOnInit() {
    this.route.data.subscribe(routeData => {
      let data = routeData['data'];
      if (data) {
        this.item = data.payload.data();
        this.item.id = data.payload.id;
        this.createForm();
        this.createCommentForm();
        this.initialCount = data.payload.id;
      }
    })
    this.getComment();
    
    this.reviewName ="abhijeet";
    this.isLoggedIn = false;
    this.itemsV = Array.from({length: 30}).map((_, i) => `Item #${i}`);
    
  }

  getComment(){
    this.firebaseService.fetchComment(this.item.id)
    .subscribe(result => {
      this.items = result;   
      this.count =this.items.length;
       
    })
  }
  createForm() {
    this.exampleForm = this.fb.group({
      name: [this.item.name, Validators.required],
      surname: [this.item.surname, Validators.required],
      age: [this.item.age, Validators.required]
    });
  }

  createCommentForm() {
    this.commentForm = this.fb.group({
      reviewername: [this.item.reviewername],
      comment: [this.item.comment],      
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(AvatarDialogComponent, {
      height: '400px',
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.item.avatar = result.link;
      }
    });
  }


  onSubmitComments(value){
    const data = {comments:value};
    console.log('comment '+data);

    this.firebaseService.updateComment(this.item.id, value)
    .then(
      res => {
        this.router.navigate(['/home']);
      }
    )
  }
  onSubmit(value){
    value.avatar = this.item.avatar;
    value.age = Number(value.age);
    this.firebaseService.updateUser(this.item.id, value)
    .then(
      res => {
        this.router.navigate(['/home']);
      }
    )
  }

  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
  }
  startUpload(event: FileList) {
    // The File object
    const file = event.item(0)

    // Client-side validation example
//    if (file.type.split('/')[0] !== 'image') { 
  //    console.error('unsupported file type :( ')
    //  return;
    //}

    // The storage path
    const filename =file.name;
    
    //${Date.now()}_${this.file.name};
    //const path = "test/"+filename;
    //const path = 'test'/${Date.now()}_${file.name};
    const path = `test/${Date.now()}_${file.name}`;
    const fileRef = this.storage.ref(path);
    // Totally optional metadata
    const customMetadata = { app: 'AiroliPathshala' };

    // The main task
    this.task = this.storage.upload(path, file, { customMetadata })

    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.snapshot   = this.task.snapshotChanges();
      // The file's download URL
      this.downloadURL = fileRef.getDownloadURL();
      
      this.snapshot = this.task.snapshotChanges().pipe(
            
            tap(snap => {
              finalize(() => this.downloadURL = this.storage.ref(path).getDownloadURL());
              if (snap.bytesTransferred === snap.totalBytes) {
                // Update firestore on completion
                
                this.db.collection('photos').add( { path, size: snap.totalBytes })
              }
            })
          )
        


  }
  delete(){
    this.firebaseService.deleteUser(this.item.id)
    .then(
      res => {
        this.router.navigate(['/home']);
      },
      err => {
        console.log(err);
      }
    )
  }

  cancel(){
    this.router.navigate(['/home']);
  }

}
