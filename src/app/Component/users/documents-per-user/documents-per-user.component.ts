import { ExsistDocumentService } from './../../../Service/exsist-document.service';
import { FilesAzureService } from './../../../Service/files-azure.service';
import { SchoolService } from './../../../Service/school.service';
import { DocumentPerUserService } from './../../../Service/document-per-user.service';
import { DocumentsPerUser } from './../../../Class/documents-per-user';

import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import * as fileSaver from 'file-saver';
import { UserService } from 'src/app/Service/user.service';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';

@Component({
  selector: 'app-documents-per-user',
  templateUrl: './documents-per-user.component.html',
  styleUrls: ['./documents-per-user.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService]
})

export class DocumentsPerUserComponent implements OnInit {

  //החלונית של בחירת קובץ בודד
  @ViewChild('file') fileInput: ElementRef;
  //חלונית לבחיקת קבצים מרובים
  @ViewChild('file2') fileInput2: ElementRef;

  ListDocuments: any;// Array<DocumentsPerUser> = new Array<DocumentsPerUser>();
  UserPerSchoolId: number;
  fileD: File;
  CurrentDocumentsPerUser: DocumentsPerUser;
  //משתנה מסמל להצגת הקובץ באותו חלון
  visible = false;
  path: any;
  passport: DocumentsPerUser = new DocumentsPerUser();
  //מסמכים להעלות לתיקיה
  ListDocumentsPerUser: Array<DocumentsPerUser> = new Array<DocumentsPerUser>();
  //משתנה המונה את מספר הנסיונות העלאת קבצים כדי לדעת מתי הוא באחרון
  numSuccess: number = 0;
  CurrentDocument: DocumentsPerUser;
  IsFolder = false;
  ListFilesOnFolder: Array<DocumentsPerUser>;
  IsEditName: boolean = false;
  NameFile: string = "enter name";
  idfile: number = 0;
  FolderLength: number = 0;
  CurrentSchool: any;
  type: string = "";
  SchoolId: number;
  uniqueCodeID: number = 0;
  IsChangeDoc: boolean = false;
  displayDialog: boolean = false;
  filesLst: FileList;
  blockSpecial: RegExp = /^[^/^+^-^*^&^%^=]+$/
  YearBookId: number = 0;
  // ------------
  IsFieldDisplay = false;
  collapsed: boolean = false;

  constructor(private confirmationService: ConfirmationService, public DocumentPerUserService: DocumentPerUserService,
    public SchoolService: SchoolService, public UserService: UserService, private active: ActivatedRoute, public router: Router,
    private FilesAzureService: FilesAzureService, private ExsistDocumentService: ExsistDocumentService,
    public sanitizer: DomSanitizer, private ngxService: NgxUiLoaderService,
    private messageService: MessageService, public GenericFunctionService: GenericFunctionService) {
  }

  ngOnInit(): void {

    if (this.SchoolService.ListSchool == null || this.SchoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.active.params.subscribe(c => { this.UserPerSchoolId = c["id"] })
    this.active.params.subscribe(c => { this.SchoolId = c["schoolId"] })
    this.active.params.subscribe(c => { this.uniqueCodeID = c["uniqueCodeID"] })
    this.active.params.subscribe(c => { this.YearBookId = c["YearbookID"] })

    debugger;

    this.CurrentSchool = this.SchoolService.ListSchool.find(f => f.school.idschool == this.SchoolId)
    if (this.YearBookId != this.SchoolService.SelectYearbook.idyearbook)
      this.GenericFunctionService.GoBackToLastPage();

    this.DocumentPerUserService.getLstDocumentPerUser(this.SchoolId, this.UserPerSchoolId)
      .subscribe(d => {
        debugger; this.ListDocuments = d;
        // ------------
        this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));

      },
        e => { })

  }

  //קבלת URL מאובטח
  GetSecureUrl(path: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(path);
  }

  //פתיחת סייר הקבצים לבחירת קובץ והצבת המסמך אותו רוצים להעלות
  ChangeDoc(doc: DocumentsPerUser, IsMultiple: boolean = true, FolderLength: number = 0, IsChange: boolean = false, lengthFolder: number = 0) {
    debugger;
    this.FolderLength = FolderLength;
    this.IsChangeDoc = IsChange;
    this.CurrentDocumentsPerUser = new DocumentsPerUser();
    this.CurrentDocumentsPerUser = { ...doc };
    let event = new MouseEvent('click', { bubbles: false });
    if (IsMultiple)
      this.fileInput.nativeElement.dispatchEvent(event);
    else
      this.fileInput2.nativeElement.dispatchEvent(event);
    // if (FolderLength > 0 && this.CurrentDocumentsPerUser.folderName != null)
    //   this.CurrentDocumentsPerUser.name = this.CurrentDocumentsPerUser.folderName;
  }

  //הצגת קובץ
  DisplayDoc(doc: DocumentsPerUser) {
    debugger;
    // options.clearCache.all = 1
    // options.clearCache.system = 1
    this.path = undefined;
    this.path = this.GetSecureUrl(doc.path);
    this.visible = undefined
    this.visible = true
  }

  //העלאת קבצים והחלפת קבצים
  uploadDocument(files: FileList, IsFolder: boolean = false, isRequired = true) {
    debugger;
    this.ngxService.start();
    debugger
    let oldpath;
    let pathDoc;
    //אם לא נבחר קובץ
    if (files == undefined || files.length == 0) {
      this.ngxService.stop();
      this.messageService.add({ key: 'tc', severity: 'error', summary: '', detail: 'לא נבחר קובץ' });
      return;
    }

    //העלאת קבצים
    else {
      this.numSuccess = 0;
      this.ListDocumentsPerUser = new Array<DocumentsPerUser>();

      debugger;
      this.CurrentDocument = { ...this.CurrentDocumentsPerUser };
      let path = this.SchoolId + "-Users-" + this.UserPerSchoolId + '-';
      let flag: boolean = false
      //נדרשים
      if (this.CurrentDocumentsPerUser.requiredDocumentPerUserId != null && this.CurrentDocumentsPerUser.requiredDocumentPerUserId > 0) {
        path = path + 'r' + this.CurrentDocumentsPerUser.requiredDocumentPerUserId + "&FileName=";
        flag = confirm("האם ברצונך להשאיר את השם של הקובץ כפי שמופיע באתר?")
      }
      //קיימים ולא דרושים
      else
        path = path + 'd' + this.CurrentDocumentsPerUser.exsistDocumentId + "&FileName=";

      for (let index = this.CurrentDocumentsPerUser.indexFolder; index < this.CurrentDocumentsPerUser.indexFolder + files.length; index++) {
        oldpath = this.CurrentDocumentsPerUser.path;
        pathDoc = path + index;
        this.fileD = files[index - this.CurrentDocumentsPerUser.indexFolder];
        if (flag) {
          const newFile = new File([this.fileD], this.CurrentDocument.name, { type: this.fileD.type });
          this.fileD = newFile
        }

        this.FilesAzureService.uploadFileToAzure(this.fileD, pathDoc, this.SchoolId)
          .subscribe(
            d => {
              this.numSuccess++;
              this.CurrentDocument = { ...this.CurrentDocumentsPerUser };
              this.CurrentDocument.path = d;
              this.CurrentDocument.UserId = this.UserPerSchoolId;
              if (!flag)
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerUser.indexFolder].name;
              this.CurrentDocument.schoolId = this.SchoolId;

              // שמירת סוג הקובץ
              var index2 = files[index - this.CurrentDocumentsPerUser.indexFolder].name.lastIndexOf('.')
              if (index2 > -1) {
                this.type = files[index - this.CurrentDocumentsPerUser.indexFolder].name.substring(index2);
                if (!flag)
                  this.CurrentDocument.name = files[index - this.CurrentDocumentsPerUser.indexFolder].name.substring(0, index2);

              }
              else {
                this.type = '';
                if (!flag)
                  this.CurrentDocument.name = files[index - this.CurrentDocumentsPerUser.indexFolder].name;
              }
              this.CurrentDocument.type = this.type;

              if (this.IsChangeDoc == false) {
                this.CurrentDocument.dateCreated = new Date();
                this.CurrentDocument.userCreatedId = this.CurrentSchool.userId;
                this.CurrentDocument.iddocumentPerUser = 0;
              }
              else {
                this.CurrentDocument.dateUpdated = new Date();
                this.CurrentDocument.userUpdatedId = this.CurrentSchool.userId;
              }

              //מחיקת הקובץ הישן
              if (this.IsChangeDoc == true && oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
                this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
              }
              // this.CurrentDocument.requiredDocumentPerUserId = this.CurrentDocumentsPerUser.requiredDocumentPerUserId;
              // this.CurrentDocument.folderId = this.CurrentDocumentsPerUser.folderId;
              // this.CurrentDocument.folderCreated = this.CurrentDocumentsPerUser.folderCreated;

              this.ListDocumentsPerUser.push(this.CurrentDocument);
              if (this.numSuccess == files.length && this.ListDocumentsPerUser.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0 && this.uniqueCodeID == 0) {
                    //שמירה ב-DB
                    this.DocumentPerUserService.UploadDocumentPerUser(this.SchoolId, this.UserPerSchoolId, this.ListDocumentsPerUser[0], 0, this.uniqueCodeID)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerUser.iddocumentPerUser == 0 || this.CurrentDocumentsPerUser.iddocumentPerUser == undefined)
                            &&
                            this.CurrentDocumentsPerUser.requiredDocumentPerUserId != undefined &&
                            this.CurrentDocumentsPerUser.requiredDocumentPerUserId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerUserId == this.CurrentDocumentsPerUser.requiredDocumentPerUserId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerUser>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerUser.iddocumentPerUser == 0 || this.CurrentDocumentsPerUser.iddocumentPerUser == undefined)
                              && (this.CurrentDocumentsPerUser.requiredDocumentPerUserId == undefined ||
                                this.CurrentDocumentsPerUser.requiredDocumentPerUserId == 0)) {
                              let arr = new Array<DocumentsPerUser>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerUser.iddocumentPerUser != undefined && this.CurrentDocumentsPerUser.iddocumentPerUser > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerUser == this.CurrentDocumentsPerUser.iddocumentPerUser);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }

                          debugger;

                          this.CurrentDocumentsPerUser = new DocumentsPerUser();
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ הועלה בהצלחה' });
                          // ------------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));
                        }, er => {
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
                        });
                  }
                  else {
                    debugger
                    let nameFolder;
                    nameFolder = this.CurrentDocumentsPerUser.folderName;
                    let CustomerId = this.SchoolService.CustomerId != null ? this.SchoolService.CustomerId : 0;
                    this.DocumentPerUserService.UploadFewDocumentsPerUser(this.SchoolId,
                      this.UserPerSchoolId, this.ListDocumentsPerUser, nameFolder, this.uniqueCodeID, this.SchoolService.userId, CustomerId)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerUser.requiredDocumentPerUserId != null && this.CurrentDocumentsPerUser.requiredDocumentPerUserId > 0 && this.ListDocuments[index3][0].requiredDocumentPerUserId == this.CurrentDocumentsPerUser.requiredDocumentPerUserId)
                                || (this.CurrentDocumentsPerUser.exsistDocumentId != null && this.CurrentDocumentsPerUser.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerUser.exsistDocumentId))
                                // אם זה החלפה של קובץ בודד או העלאה של קובץ בודד תואם
                                if (this.ListDocuments[index3].length == 1) {
                                  debugger;
                                  this.ListDocuments[index3] = d;
                                }
                                else {
                                  //הוספת קבצים לתיקיה קיימת
                                  if (this.IsChangeDoc == false) {
                                    this.ListDocuments[index3].forEach(f => {
                                      f.indexFolder = d[0].indexFolder;
                                    })
                                    this.ListDocuments[index3] = this.ListDocuments[index3].concat(d);
                                  }
                                  // החלפה של קובץ מתיקיה
                                  else {
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerUser == this.CurrentDocumentsPerUser.iddocumentPerUser);
                                    if (y >= 0)
                                      this.ListDocuments[index3][y] = d[0];
                                    this.ListDocuments[index3].forEach(f => {
                                      f.indexFolder = d[0].indexFolder;
                                    })
                                  }

                                }
                            }
                          }
                          //העלאה ראשונית של קובץ/ים חדש שהוא לא מהדרושים
                          else {
                            this.displayDialog = false;
                            this.ListDocuments.push(d);
                          }
                          this.CurrentDocumentsPerUser;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger
                          // ------------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));

                        }
                        , e => {

                          this.CurrentDocumentsPerUser;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

                        });
                  }
                }
              }

            }, er => {
              debugger;
              this.numSuccess++;
              if (this.numSuccess == files.length && this.ListDocumentsPerUser.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0 && this.uniqueCodeID == 0) {
                    //שמירה ב-DB
                    this.DocumentPerUserService.UploadDocumentPerUser(this.SchoolId, this.UserPerSchoolId, this.ListDocumentsPerUser[0], 0, this.uniqueCodeID)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerUser.iddocumentPerUser == 0 || this.CurrentDocumentsPerUser.iddocumentPerUser == undefined)
                            &&
                            this.CurrentDocumentsPerUser.requiredDocumentPerUserId != undefined &&
                            this.CurrentDocumentsPerUser.requiredDocumentPerUserId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerUserId == this.CurrentDocumentsPerUser.requiredDocumentPerUserId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerUser>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerUser.iddocumentPerUser == 0 || this.CurrentDocumentsPerUser.iddocumentPerUser == undefined)
                              && (this.CurrentDocumentsPerUser.requiredDocumentPerUserId == undefined ||
                                this.CurrentDocumentsPerUser.requiredDocumentPerUserId == 0)) {
                              let arr = new Array<DocumentsPerUser>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerUser.iddocumentPerUser != undefined && this.CurrentDocumentsPerUser.iddocumentPerUser > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerUser == this.CurrentDocumentsPerUser.iddocumentPerUser);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }

                          debugger;

                          this.CurrentDocumentsPerUser = new DocumentsPerUser();
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ הועלה בהצלחה' });
                          // ------------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));
                        }, er => {
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
                        });
                  }
                  else {
                    debugger
                    let nameFolder;
                    nameFolder = this.CurrentDocumentsPerUser.folderName;
                    let CustomerId = this.SchoolService.CustomerId != null ? this.SchoolService.CustomerId : 0;
                    this.DocumentPerUserService.UploadFewDocumentsPerUser(this.SchoolId,
                      this.UserPerSchoolId, this.ListDocumentsPerUser, nameFolder, this.uniqueCodeID, this.SchoolService.userId, CustomerId)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerUser.requiredDocumentPerUserId != null && this.CurrentDocumentsPerUser.requiredDocumentPerUserId > 0 && this.ListDocuments[index3][0].requiredDocumentPerUserId == this.CurrentDocumentsPerUser.requiredDocumentPerUserId)
                                || (this.CurrentDocumentsPerUser.exsistDocumentId != null && this.CurrentDocumentsPerUser.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerUser.exsistDocumentId))
                                // אם זה החלפה של קובץ בודד או העלאה של קובץ בודד תואם
                                if (this.ListDocuments[index3].length == 1) {
                                  debugger;
                                  this.ListDocuments[index3] = d;
                                }
                                else {
                                  //הוספת קבצים לתיקיה קיימת
                                  if (this.IsChangeDoc == false) {
                                    this.ListDocuments[index3].forEach(f => {
                                      f.indexFolder = d[0].indexFolder;
                                    })
                                    this.ListDocuments[index3] = this.ListDocuments[index3].concat(d);
                                  }
                                  // החלפה של קובץ מתיקיה
                                  else {
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerUser == this.CurrentDocumentsPerUser.iddocumentPerUser);
                                    if (y >= 0)
                                      this.ListDocuments[index3][y] = d[0];
                                    this.ListDocuments[index3].forEach(f => {
                                      f.indexFolder = d[0].indexFolder;
                                    })
                                  }

                                }
                            }
                          }
                          //העלאה ראשונית של קובץ/ים חדש שהוא לא מהדרושים
                          else {
                            this.displayDialog = false;
                            this.ListDocuments.push(d);
                          }
                          this.CurrentDocumentsPerUser;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger
                          // ------------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));

                        }
                        , e => {

                          this.CurrentDocumentsPerUser;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

                        });
                  }
                }
              }
              else
                if (this.numSuccess == files.length && this.ListDocumentsPerUser.length == 0)
                  this.ngxService.stop();
              this.CurrentDocument = new DocumentsPerUser();
              this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.CurrentDocumentsPerUser.indexFolder].name + ' יש בעיה ', sticky: true });

            }
          )
      }
    }

  }


  // //העלאת קבצים והחלפת קבצים
  // uploadDocument(files: FileList, IsFolder: boolean = false) {
  //   this.ngxService.start();
  //   debugger
  //   let oldpath;

  //   //אם לא נבחר קובץ
  //   if (files == undefined || files.length == 0) {
  //     this.ngxService.stop();
  //     this.messageService.add({ key: 'tc', severity: 'error', summary: '', detail: 'לא נבחר קובץ' });
  //     return;
  //   }

  //   //העלאה של קובץ בודד /החלפה של קובץ בודד או מתיקיה
  //   else if (files.length == 1 && this.FolderLength == 0 && this.uniqueCodeID == 0) {
  //     this.fileD = files[0];
  //     let path = this.SchoolId + "-Users-" + this.UserId + "&FileName=";

  //     // if (this.CurrentDocumentsPerUser.requiredDocumentPerUserId != 0 && this.CurrentDocumentsPerUser.requiredDocumentPerUserId != undefined) {
  //     //   if (this.CurrentDocumentsPerUser.iddocumentPerUser != undefined && this.CurrentDocumentsPerUser.iddocumentPerUser > 0) {
  //     //     path = path + 'r' + this.CurrentDocumentsPerUser.requiredDocumentPerUserId;
  //     //   }
  //     //   else
  //     //     path = path + 'r' + this.CurrentDocumentsPerUser.requiredDocumentPerUserId
  //     // }
  //     // else
  //     //   path = path + this.CurrentDocumentsPerUser.iddocumentPerUser;
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerUser.requiredDocumentPerUserId + "&FileName=" + this.CurrentDocumentsPerUser.indexFolder;

  //     this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //       .subscribe(
  //         d => {
  //           debugger;
  //           oldpath = this.CurrentDocumentsPerUser.path;
  //           this.CurrentDocumentsPerUser.path = d;
  //           this.CurrentDocumentsPerUser.UserId = this.UserId;
  //           this.CurrentDocumentsPerUser.name = files[0].name;

  //           //אם זה מסמך מהנדרשים ועדיין לא קיים
  //           if (this.CurrentDocumentsPerUser.iddocumentPerUser == 0) {
  //             this.CurrentDocumentsPerUser.dateCreated = new Date();
  //             this.CurrentDocumentsPerUser.userCreated = this.CurrentSchool.userId;
  //             this.CurrentDocumentsPerUser.schoolId = this.SchoolId;
  //           }

  //           //למסמכים קיימים
  //           else {
  //             this.CurrentDocumentsPerUser.dateUpdated = new Date();
  //             this.CurrentDocumentsPerUser.userUpdated = this.CurrentSchool.userId;
  //           }

  //           //מחיקת הקובץ הישן מאזור
  //           if (oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
  //             this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
  //           }

  //           // שמירת סוג הקובץ
  //           var index = this.fileD.name.lastIndexOf('.')
  //           if (index > -1) {
  //             this.type = this.fileD.name.substring(index);
  //             this.CurrentDocumentsPerUser.name = this.fileD.name.substring(0, index);
  //           }
  //           else {
  //             this.type = '';
  //             this.CurrentDocumentsPerUser.name = this.fileD.name;
  //           }

  //           this.CurrentDocumentsPerUser.type = this.type;

  //           //שמירה ב-DB
  //           this.DocumentPerUserService.UploadDocumentPerUser(this.SchoolId, this.UserId, this.CurrentDocumentsPerUser, 0, this.uniqueCodeID)
  //             .subscribe(
  //               d => {
  //                 debugger;

  //                 //דרושים ועדיין לא קיימים
  //                 if (this.CurrentDocumentsPerUser.iddocumentPerUser == 0 &&
  //                   this.CurrentDocumentsPerUser.requiredDocumentPerUserId != undefined &&
  //                   this.CurrentDocumentsPerUser.requiredDocumentPerUserId > 0) {
  //                   let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerUserId == this.CurrentDocumentsPerUser.requiredDocumentPerUserId);

  //                   if (y >= 0) {
  //                     let arr = new Array<DocumentsPerUser>();
  //                     arr.push(d);
  //                     this.ListDocuments[y] = arr;
  //                   }
  //                 }
  //                 else
  //                   //דרושים וקיימים
  //                   if (this.CurrentDocumentsPerUser.iddocumentPerUser > 0 &&
  //                     this.CurrentDocumentsPerUser.requiredDocumentPerUserId != undefined &&
  //                     this.CurrentDocumentsPerUser.requiredDocumentPerUserId > 0) {

  //                     debugger;
  //                     let y;
  //                     //קובץ בודד
  //                     if (!IsFolder) {
  //                       y = this.ListDocuments.findIndex(f => f[0].iddocumentPerUser == this.CurrentDocumentsPerUser.iddocumentPerUser);
  //                       if (y >= 0) {
  //                         let arr = new Array<DocumentsPerUser>();
  //                         arr.push(d);
  //                         this.ListDocuments[y] = arr;
  //                       }
  //                     }

  //                     //קובץ מתיקיה
  //                     else {
  //                       for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
  //                         if (this.ListDocuments[index2][0].folderId == this.CurrentDocumentsPerUser.folderId) {
  //                           y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerUser == this.CurrentDocumentsPerUser.iddocumentPerUser)
  //                           if (y >= 0) {
  //                             this.ListDocuments[index2][y] = d;
  //                             break;
  //                           }
  //                         }
  //                       }
  //                     }
  //                   }
  //                 debugger;

  //                 this.CurrentDocumentsPerUser = new DocumentsPerUser();
  //                 this.ngxService.stop();
  //                 this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ הועלה בהצלחה' });

  //               }, er => {
  //                 this.ngxService.stop();
  //                 this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
  //               });
  //         }, er => {
  //           this.ngxService.stop();
  //           this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //           debugger
  //         })
  //   }

  //   //העלאת קבצים רבים - תיקיה
  //   else if (files.length > 1 || this.FolderLength > 0 || this.uniqueCodeID > 0) {
  //     this.numSuccess = 0;
  //     this.ListDocumentsPerUser = new Array<DocumentsPerUser>();

  //     debugger;
  //     this.CurrentDocument = { ...this.CurrentDocumentsPerUser };
  //     for (let index = this.FolderLength; index < this.FolderLength + files.length; index++) {
  //       // debugger;
  //       oldpath = this.CurrentDocumentsPerUser.path;

  //       this.fileD = files[index - this.FolderLength];
  //       let path = this.SchoolId + "-Users-" + this.UserId;
  //       if (this.CurrentDocumentsPerUser.requiredDocumentPerUserId != 0 && this.CurrentDocumentsPerUser.requiredDocumentPerUserId != undefined)
  //         // if (this.FolderLength == 0 && this.CurrentDocumentsPerUser.iddocumentPerUser != 0 && this.CurrentDocumentsPerUser.iddocumentPerUser != undefined)
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerUser.requiredDocumentPerUserId + "&FileName=" + index
  //       else
  //         path = path + '-' + this.CurrentDocumentsPerUser.iddocumentPerUser + "&FileName=" + index;

  //       this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //         .subscribe(
  //           d => {
  //             this.numSuccess++;
  //             this.CurrentDocument = { ...this.CurrentDocumentsPerUser };
  //             this.CurrentDocument.path = d;
  //             this.CurrentDocument.UserId = this.UserId;
  //             this.CurrentDocument.folderName = this.CurrentDocumentsPerUser.folderName;
  //             this.CurrentDocument.name = files[index - this.FolderLength].name;

  //             if (oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure && this.IsChangeDoc == true) {
  //               this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
  //             }
  //             // שמירת סוג הקובץ
  //             var index2 = files[index - this.FolderLength].name.lastIndexOf('.')
  //             if (index2 > -1) {
  //               this.type = files[index - this.FolderLength].name.substring(index2);
  //               this.CurrentDocument.name = files[index - this.FolderLength].name.substring(0, index2);

  //             }
  //             else {
  //               this.type = '';
  //               this.CurrentDocument.name = files[index - this.FolderLength].name;
  //             }

  //             this.CurrentDocument.type = this.type;
  //             debugger;
  //             //אם זה מסמך מהנדרשים ועדיין לא קיים או שזה הוספת קבצים לתיקיה קיימת
  //             if (this.CurrentDocumentsPerUser.iddocumentPerUser == 0 || (this.CurrentDocumentsPerUser.folderId != undefined && this.CurrentDocumentsPerUser.folderId > 0)) {
  //               if (this.IsChangeDoc == false) {
  //                 this.CurrentDocument.dateCreated = new Date();
  //                 this.CurrentDocument.userCreated = this.CurrentSchool.userId;
  //               }
  //               else {
  //                 this.CurrentDocument.dateUpdated = new Date();
  //                 this.CurrentDocument.userUpdated = this.CurrentSchool.userId;
  //               }
  //               this.CurrentDocument.schoolId = this.SchoolId;
  //               this.CurrentDocument.requiredDocumentPerUserId = this.CurrentDocumentsPerUser.requiredDocumentPerUserId;
  //               if (this.CurrentDocumentsPerUser.folderId != undefined && this.CurrentDocumentsPerUser.folderId > 0) {
  //                 this.CurrentDocument.folderId = this.CurrentDocumentsPerUser.folderId;
  //                 this.CurrentDocument.folderCreated = this.CurrentDocumentsPerUser.folderCreated;
  //                 if (this.IsChangeDoc == false)
  //                   this.CurrentDocument.iddocumentPerUser = 0;
  //               }
  //             }

  //             this.ListDocumentsPerUser.push(this.CurrentDocument);
  //             if (this.numSuccess == files.length && this.ListDocumentsPerUser.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerUser.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerUser.name;

  //               this.DocumentPerUserService.UploadFewDocumentsPerUser(this.SchoolId,
  //                 this.UserId, this.ListDocumentsPerUser, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerUserId == this.CurrentDocumentsPerUser.requiredDocumentPerUserId)
  //                         // אם זה החלפה של קובץ בודד תואם או הוספת קובץ בודד תואם
  //                         if (this.ListDocuments[index3].length == 1) {
  //                           debugger;
  //                           this.ListDocuments[index3] = d;
  //                         }
  //                         else {
  //                           //הוספת קבצים לתיקיה קיימת
  //                           if (this.IsChangeDoc == false)
  //                             this.ListDocuments[index3] = this.ListDocuments[index3].concat(d);
  //                           // החלפה של קובץ מתיקיה תואמת
  //                           else {
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerUser == this.CurrentDocumentsPerUser.iddocumentPerUser);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerUser;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerUser;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }
  //           }, er => {
  //             debugger;
  //             this.numSuccess++;
  //             if (this.numSuccess == files.length && this.ListDocumentsPerUser.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerUser.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerUser.name;

  //               this.DocumentPerUserService.UploadFewDocumentsPerUser(this.SchoolId,
  //                 this.UserId, this.ListDocumentsPerUser, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerUserId == this.CurrentDocumentsPerUser.requiredDocumentPerUserId)
  //                         // אם זה החלפה של קובץ בודד תואם או הוספת קובץ בודד תואם
  //                         if (this.ListDocuments[index3].length == 1) {
  //                           debugger;
  //                           this.ListDocuments[index3] = d;
  //                         }
  //                         else {
  //                           //הוספת קבצים לתיקיה קיימת
  //                           if (this.IsChangeDoc == false)
  //                             this.ListDocuments[index3] = this.ListDocuments[index3].concat(d);
  //                           // החלפה של קובץ מתיקיה תואמת
  //                           else {
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerUser == this.CurrentDocumentsPerUser.iddocumentPerUser);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerUser;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerUser;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }

  //             this.CurrentDocument = new DocumentsPerUser();
  //             this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.FolderLength].name + ' יש בעיה ', sticky: true });

  //           }
  //         )

  //     }
  //   }

  // }

  //הצגת קובץ בחלון חדש


  DisplayDocInNewWindow(doc: DocumentsPerUser) {

    window.open(doc.path);
  }

  //הורדת קובץ
  DownloadDoc(doc: DocumentsPerUser) {
    debugger;
    this.FilesAzureService.DownloadFileFromAzure(doc.path).subscribe(response => {
      debugger;
      let blob: any = new Blob([response], { type: response + '; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);


      let result = response.type.substring(response.type.indexOf('/') + 1);

      if (doc.type != null && doc.type != '')
        fileSaver.saveAs(blob, doc.name + doc.type);
      else
        fileSaver.saveAs(blob, doc.name + '.' + result);


    }, error => {


      this.DisplayDocInNewWindow(doc);
      debugger; console.log('Error downloading the file')
    });

  }

  //הורדת כל הקבצים מתיקיה
  DownloadFewDoc(docs: DocumentsPerUser[]) {
    docs.forEach(doc => {
      if (doc.isSelected)
        this.DownloadDoc(doc);
      debugger;
      // this.FilesAzureService.DownloadFileFromAzure(doc.path).subscribe(response => {
      //   debugger;
      //   let blob: any = new Blob([response], { type: response + '; charset=utf-8' });
      //   const url = window.URL.createObjectURL(blob);
      //   //window.open(url);
      //   //window.location.href = response.url;

      //   let result = response.type.substring(response.type.indexOf('/') + 1);
      //   if (result.indexOf('.') > 0)
      //     this.DisplayDocInNewWindow(doc);
      //   else {
      //     let date = new Date();
      //     fileSaver.saveAs(blob, 'file.' + result);
      //     // fileSaver.saveAs(blob, date.getFullYear()+'-'+date.getMonth()+'-'+date.getDay()+'.' + result);
      //   }
      // }, error => {
      //   this.DisplayDocInNewWindow(doc);
      //   debugger; console.log('Error downloading the file')
      // });
    })
  }
  // הורדת כל התיקייה
  DownloadallDoc(docs: DocumentsPerUser[]) {
    docs.forEach(doc => {
      this.DownloadDoc(doc);
      debugger;
    })
  }
  //מחיקת קובץ
  DeleteDoc(doc: DocumentsPerUser, IsFolder: boolean = false) {
    debugger;

    // ------------
    var path;
    path = doc.path;


    let uniqueCodeId;
    uniqueCodeId = doc.uniqueCodeId != null ? doc.uniqueCodeId : 0;
    this.DocumentPerUserService.DeleteDocumentPerUser(doc.iddocumentPerUser, this.UserPerSchoolId, uniqueCodeId).subscribe(s => {
      debugger;

      // אם זה מחיקת קובץ מתיקיה
      if (IsFolder) {
        let y;
        for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
          if (this.ListDocuments[index2][0].folderId == doc.folderId) {
            y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerUser == doc.iddocumentPerUser)
            if (y >= 0) {
              this.ListDocuments[index2].splice(y, 1);

              //באם מחקו קובץ מתיקיה ונשאר קובץ בודד
              if (this.ListDocuments[index2].length == 1) {
                // this.ListDocuments[index2][0].name = s;
                this.IsFolder = false;
                // ------------
                this.ListDocuments[index2][0].folderId = null;
              }
              break
            }
          }

        }
      }

      //אם זה קובץ מהדרושים
      else
        if (doc.requiredDocumentPerUserId != undefined) {
          doc.dateUpdated = undefined;
          doc.iddocumentPerUser = 0;
          // ------------
          doc.folderId = null;
          doc.userUpdatedId = undefined;
          doc.userUpdatedId = undefined;
          doc.dateCreated = undefined;
          doc.name = s;
          doc.type = undefined;
          doc.folderId = undefined;
          doc.folderName = s;
          doc.indexFolder = 0;
          doc.uniqueCodeId = undefined;

        }

        else
          //   קבצים קיימים ולא דרושים
          if (doc.iddocumentPerUser > 0 && (doc.requiredDocumentPerUserId == undefined || doc.requiredDocumentPerUserId == 0)) {
            let x = this.ListDocuments.findIndex(f => f[0].iddocumentPerUser == doc.iddocumentPerUser);
            if (x != undefined)
              this.ListDocuments.splice(x, 1);

          }
      this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ נמחק בהצלחה' });
      // ------------
      this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));
      this.FilesAzureService.DeleteFileFromAzure(path).subscribe(response => {
        debugger;

      }, error => {
        // this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

        debugger; console.log('Error delete the file')
      });
    }
      , er => {
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

        debugger
      });
  }

  //מחיקת כל הקבצים מתיקיה
  DeleteFewDoc(docs: DocumentsPerUser[]) {

    this.ngxService.start();

    debugger;
    console.log(docs[0].folderId);
    var unique = docs[0].uniqueCodeId;
    if (unique == null)
      unique = 0;

    let requiredDocumentPerUserId = docs[0].requiredDocumentPerUserId != undefined ? docs[0].requiredDocumentPerUserId : 0;
    //מחיקת הקבצים מהמסד נתונים
    this.DocumentPerUserService.DeleteFewDocumentPerUser(docs[0].folderId, requiredDocumentPerUserId, this.UserPerSchoolId, unique).subscribe(
      s => {
        debugger;

        for (let index = 0; index < this.ListDocuments.length; index++) {
          if (this.ListDocuments[index] == docs)
            if (s != undefined && s.requiredDocumentPerUserId > 0) {
              let x = new Array<DocumentsPerUser>();
              x.push(s);
              this.ListDocuments[index] = null;
              this.ListDocuments[index] = x;
              break;
            }
            else {
              this.ListDocuments.splice(index, 1);
              break;
            }
        }
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים נמחקו בהצלחה' });
        // ------------
        this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));
        //מחיקת הקבצים מאזור
        docs.forEach(doc => {
          debugger;
          this.FilesAzureService.DeleteFileFromAzure(doc.path).subscribe(response => {
            debugger;

          }, error => {

          });


        })
      }
      , er => {
        debugger;
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
      });
  }

  //פתיחת תיקיה והצגת הקבצים שבתוכה
  OpenFolder(docs: DocumentsPerUser[]) {
    this.ListFilesOnFolder = docs;
    this.IsFolder = true;
    this.IsEditName = false;
  }

  //דיאלוג לשאלה אם רוצה למחוק תיקיה
  confirmFolder(docs: DocumentsPerUser[]) {
    this.confirmationService.confirm({
      message: 'האם הינך בטוח/ה כי ברצונך למחוק תיקיה זו לצמיתות?',
      header: 'אזהרה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: ' מחק',
      rejectLabel: ' ביטול',
      accept: () => {
        this.DeleteFewDoc(docs);
      },
      reject: (type) => {
        switch (type) {
          case ConfirmEventType.REJECT || ConfirmEventType.CANCEL:
            this.messageService.add({ severity: 'error', summary: 'בוטל', detail: 'המחיקה בוטלה' });
            break;

        }
      }
    });
  }

  confirmFiles(docs: DocumentsPerUser[], IsFolder: boolean = true) {
    let count = 0
    docs.forEach(doc => {
      if (doc.isSelected) {
        count++
      }
    })
    if (count > 0) {
      this.confirmationService.confirm({
        message: 'האם הינך בטוח/ה כי ברצונך למחוק קבצים אלו לצמיתות?',
        header: 'אזהרה',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: ' מחק',
        rejectLabel: ' ביטול',
        accept: () => {
          if (count == docs.length)
            this.DeleteFewDoc(docs)
          else
            docs.forEach(doc => {
              if (doc.isSelected)
                this.DeleteDoc(doc, IsFolder);
            }
            )

        },
        reject: (type) => {
          debugger;
          switch (type) {
            case ConfirmEventType.REJECT || ConfirmEventType.CANCEL:
              this.messageService.add({ severity: 'error', summary: 'בוטל', detail: 'המחיקה בוטלה' });
              break;

          }
        }
      });
    }
    else
      this.messageService.add({ severity: 'error', summary: 'אין אפשרות למחוק', detail: ' לא נבחרו קבצים' });
  }




  //דיאלוג לשאלה אם רוצה למחוק קובץ
  confirmDeleteFile(doc: DocumentsPerUser, IsFolder: boolean = false) {
    this.confirmationService.confirm({
      message: 'האם הינך בטוח/ה כי ברצונך למחוק קובץ זה לצמיתות?',
      header: 'אזהרה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: ' מחק',
      rejectLabel: ' ביטול',
      accept: () => {
        this.DeleteDoc(doc, IsFolder);
      },
      reject: (type) => {
        debugger;
        switch (type) {
          case ConfirmEventType.REJECT || ConfirmEventType.CANCEL:
            this.messageService.add({ severity: 'error', summary: 'בוטל', detail: 'המחיקה בוטלה' });
            break;

        }
      }
    });
  }

  //פתיחת עריכת שם לקובץ
  ChangeNameDoc(doc: DocumentsPerUser) {
    this.IsEditName = true;
    this.NameFile = doc.name;
    this.idfile = doc.iddocumentPerUser;
  }

  //שמירת ההחלפת שם לקובץ
  SaveNameFile(doc: DocumentsPerUser, FolderId: number = 0) {
    debugger;
    this.IsEditName = false;
    var uniqeId = doc.uniqueCodeId != null ? doc.uniqueCodeId : 0;
    this.DocumentPerUserService.SaveNameFile(this.idfile, this.NameFile, uniqeId).subscribe(
      da => {
        if (FolderId > 0) {
          for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
            if (this.ListDocuments[index2][0].folderId == FolderId) {
              let y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerUser == this.idfile)
              if (y >= 0) {
                this.ListDocuments[index2][y].name = this.NameFile;
                this.messageService.add({ key: 'tc', severity: 'info', sticky: true, summary: '', detail: 'שם הקובץ הוחלף בהצלחה' });
              }
              break
            }
          }

        }
        else {
          this.ListDocuments.forEach(element => {
            debugger;
            if (element[0].iddocumentPerUser == this.idfile) {
              element[0].name = this.NameFile;
              this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'שם הקובץ הוחלף בהצלחה' });
            }
          });
        }
        this.idfile = 0;
        this.NameFile = "enter name";
      },
      er => {
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

      });
  }

  //בדיקה האם כל הקבצים בתיקיה נפתחו ע"י המשתמש הנוכחי
  isAllFilesOpenByThisUser(doc: DocumentsPerUser[]) {
    if (doc.length == 0)
      return true
    let index = doc.findIndex(f => f.userCreatedId != this.SchoolService.ListSchool[0].userId)
    return (index != null && index > -1);
  }
  isFilesSelected(doc: DocumentsPerUser[]) {
    let flag = false;
    doc.forEach(d => {
      if (d.isSelected)
        flag = true;
    })
    return !flag
  }
  isFilesSelectedOpenByThisUser(doc: DocumentsPerUser[]) {
    let selectedDocs = new Array<DocumentsPerUser>()
    doc.forEach(
      d => {
        if (d.isSelected)
          selectedDocs.push(d)
      }
    )
    return this.isAllFilesOpenByThisUser(selectedDocs)
  }

  chooseAll(docs: DocumentsPerUser[], event: any) {

    if (event.checked)
      docs.forEach(
        doc =>
          doc.isSelected = true
      )
    else

      docs.forEach(
        doc =>
          doc.isSelected = false
      )

  }

  largeFileUpload(event: any) {
    debugger;
    let fileList: FileList = event.target.files;
    if (fileList.length != 0) {
      this.FilesAzureService.fileUpload(fileList[0], "Test_ABC", fileList[0].name).then(addFileToFolder => {
        console.log("Large File Uploaded Successfully");
      }).catch(error => {
        console.log("Error while uploading" + error);
      });
    }
  }

  //הוספת מסמך חדש - לא דרוש
  AddNewDocumentsPerUser() {
    debugger;
    this.CurrentDocumentsPerUser = new DocumentsPerUser();
    this.CurrentDocumentsPerUser.schoolId = this.SchoolId;
    this.CurrentDocumentsPerUser.UserId = this.UserPerSchoolId;
    this.CurrentDocumentsPerUser.indexFolder = 0;
    this.displayDialog = true;
    this.filesLst = null;
  }


  onDrop(event: any) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    this.confirmationService.confirm({
      message: 'האם ברצונך להעלות את הקבצים שנבחרו למיקום זה?',
      header: 'אזהרה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: ' העלאה',
      rejectLabel: ' ביטול',
      accept: () => {
        this.CurrentDocumentsPerUser = new DocumentsPerUser();
    this.CurrentDocumentsPerUser.schoolId = this.SchoolId;
    this.CurrentDocumentsPerUser.UserId = this.UserPerSchoolId;
    this.CurrentDocumentsPerUser.indexFolder = 0;
        this.filesLst = null;
        
        
        this.setFiles(files);
        this.GetIdExsistDocument()
      },
      reject: (type) => {
        
      }
    });
  }

  onDragOver(event: any) {
    event.preventDefault();
  }

  //מחיקת קובץ מהרשימה שרוצים להעלות בתוך קובץ חדש ולא דרוש
  deleteCurrentFile(files: FileList, i: number) {
    debugger;
    if (i > -1) {
      //filesLst- לסוג של ה splice משתמשים פה במערך נוסף כי א"א לעשות
      var array = this.filesLst = Array.prototype.slice.call(this.filesLst);
      array.splice(i, 1)
      // this.filesLst= array;
    }
  }

  //הצבת המסמכים שרוצים להעלות
  setFiles(files: FileList) {
    debugger
    if (files != undefined && files.length > 0)
      this.filesLst = files;
  }

  //פתיחת מסמך קיים ולא דרוש חדש
  GetIdExsistDocument() {
    this.ngxService.start();
    this.ExsistDocumentService.AddAndGetTheNextExsistDocument(this.SchoolId, this.CurrentSchool.userId).subscribe(
      data => {
        if (data != undefined && data > 0)
          this.CurrentDocumentsPerUser.exsistDocumentId = data;
        if (this.CurrentDocumentsPerUser.name == undefined && this.filesLst != undefined && this.filesLst.length > 1) {
          let name = prompt("הכנס שם תיקיה", "לא נבחר שם")
          this.CurrentDocumentsPerUser.name = name;
        }
        this.CurrentDocumentsPerUser.folderName = this.CurrentDocumentsPerUser.name;
        this.uploadDocument(this.filesLst, true, false);

      },
      er => {
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
      }
    );
  }

}
