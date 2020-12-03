import { Component, OnInit,Input } from '@angular/core';
import { map } from 'rxjs/operators';

import { UploadFileService } from '../upload-file.service';

@Component({
  selector: 'list-upload',
  templateUrl: './list-upload.component.html',
  styleUrls: ['./list-upload.component.css']
})
export class ListUploadComponent implements OnInit {

  @Input() abhiJeet: number;

fileUploads: any[];
countFile : number;

  constructor(private uploadService: UploadFileService) { }

  ngOnInit() {
    console.log('this.abhiJeet qqq'+this.abhiJeet);
    
    // Use snapshotChanges().pipe(map()) to store the key
    this.uploadService.getFileUploads(6,this.abhiJeet).snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    ).subscribe(fileUploads => {
      this.fileUploads = fileUploads;
      this.countFile =this.fileUploads.length 
    });
  }
}
