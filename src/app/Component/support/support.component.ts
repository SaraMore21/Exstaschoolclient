import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SupportComponent implements OnInit {

  constructor(public sanitizer: DomSanitizer) { }
  src: any;
  visible: boolean = false;
  AddGroup: any;
  AddStudent: any;
  AddUser: any;
  UserManual: any;
  HowTobegin:any;
  WhatToDo:any;
  ngOnInit(): void {
    debugger;
    this.AddGroup = this.sanitizer.bypassSecurityTrustResourceUrl(" https://storagefilesmore21.blob.core.windows.net/upload-container/video/AddGroup.mp4?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D")
    // this.src = this.sanitizer.bypassSecurityTrustResourceUrl("https://storagefilesmore21.blob.core.windows.net/upload-container/1.mp4?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D")
    this.AddStudent = this.sanitizer.bypassSecurityTrustResourceUrl(" https://storagefilesmore21.blob.core.windows.net/upload-container/video/AddStudent.mp4?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D")
    this.UserManual = this.sanitizer.bypassSecurityTrustResourceUrl(" https://storagefilesmore21.blob.core.windows.net/upload-container/video/UserManual.pdf?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D")
    this.AddUser = this.sanitizer.bypassSecurityTrustResourceUrl(" https://storagefilesmore21.blob.core.windows.net/upload-container/video/AddUser.mp4?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D")
    // this.src = this.sanitizer.bypassSecurityTrustResourceUrl(" https://drive.google.com/file/d/1QrckerCfTmAe1ZLgglMOJlrgSpUXjz7z/view?usp=sharing")
    this.HowTobegin = this.sanitizer.bypassSecurityTrustResourceUrl(" https://storagefilesmore21.blob.core.windows.net/upload-container/video/HowTobegin.pdf?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D")
    this.WhatToDo = this.sanitizer.bypassSecurityTrustResourceUrl(" https://storagefilesmore21.blob.core.windows.net/upload-container/video/WhatToDo.pdf?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D")

  }


  DiaplayVidio(NameFile: string) {
    debugger;
    this.visible = true;
    if (NameFile == "UserManual"||NameFile=="HowTobegin"||NameFile=="WhatToDo")
      this.src = this.sanitizer.bypassSecurityTrustResourceUrl(`https://storagefilesmore21.blob.core.windows.net/upload-container/video/${NameFile}.pdf?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D`)
    else
      this.src = this.sanitizer.bypassSecurityTrustResourceUrl(`https://storagefilesmore21.blob.core.windows.net/upload-container/video/${NameFile}.mp4?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D`)

    // this.src = this.sanitizer.bypassSecurityTrustResourceUrl("https://storagefilesmore21.blob.core.windows.net/upload-container/1.mp4?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D")
  }
}
