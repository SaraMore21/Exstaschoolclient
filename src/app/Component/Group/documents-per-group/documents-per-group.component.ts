import { ExsistDocumentService } from './../../../Service/exsist-document.service';
import { FilesAzureService } from './../../../Service/files-azure.service';
import { SchoolService } from './../../../Service/school.service';
import { DocumentPerGroupService } from './../../../Service/document-per-group.service';
import { DocumentsPerGroup } from './../../../Class/documents-per-group';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import * as fileSaver from 'file-saver';
import { GroupService } from 'src/app/Service/group.service';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';


@Component({
  selector: 'app-documents-per-Group',
  templateUrl: './documents-per-Group.component.html',
  styleUrls: ['./documents-per-Group.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService]
})

export class DocumentsPerGroupComponent implements OnInit {
  //החלונית של בחירת קובץ בודד
  @ViewChild('file') fileInput: ElementRef;
  //חלונית לבחיקת קבצים מרובים
  @ViewChild('file2') fileInput2: ElementRef;

  ListDocuments: any;// Array<DocumentsPerGroup> = new Array<DocumentsPerGroup>();
  GroupId: number;
  fileD: File;
  CurrentDocumentsPerGroup: DocumentsPerGroup;
  //משתנה מסמל להצגת הקובץ באותו חלון
  visible = false;
  path: any;
  //מסמכים להעלות לתיקיה
  ListDocumentsPerGroup: Array<DocumentsPerGroup> = new Array<DocumentsPerGroup>();
  //משתנה המונה את מספר הנסיונות העלאת קבצים כדי לדעת מתי הוא באחרון
  numSuccess: number = 0;
  CurrentDocument: DocumentsPerGroup;
  IsFolder = false;
  ListFilesOnFolder: Array<DocumentsPerGroup>;
  IsEditName: boolean = false;
  NameFile: string = "enter name";
  idfile: number = 0;
  FolderLength: number = 0;
  CurrentSchool: any;
  type: string = "";
  SchoolId: number;
  IsChangeDoc: boolean = false;
  displayDialog: boolean = false;
  filesLst: FileList;
  //URL - התווים שלא נותן למלא בשם של התיקיה החדשה שפותחים- כרגע לא נותן סלש כי נהפך לעוד משתנה ב
  blockSpecial: RegExp = /^[^/^+^-^*^&^%^=]+$/
  YearbookPerSchool: number = 0;
  // ------------
  IsFieldDisplay = false;
  collapsed: boolean = false;

  constructor(private confirmationService: ConfirmationService, public DocumentPerGroupService: DocumentPerGroupService,
    public SchoolService: SchoolService, public GroupService: GroupService, private active: ActivatedRoute, public router: Router,
    private FilesAzureService: FilesAzureService, private ExsistDocumentService: ExsistDocumentService,
    public sanitizer: DomSanitizer, private ngxService: NgxUiLoaderService,
    private messageService: MessageService, public GenericFunctionService: GenericFunctionService) {
  }

  ngOnInit(): void {

    if (this.SchoolService.ListSchool == null || this.SchoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.active.params.subscribe(c => { this.GroupId = c["id"] })
    this.active.params.subscribe(c => { this.SchoolId = c["schoolId"] })
    this.active.params.subscribe(c => { this.YearbookPerSchool = c["YearbookPerSchool"] })

    debugger;

    this.CurrentSchool = this.SchoolService.ListSchool.find(f => f.school.idschool == this.SchoolId)
    // var CurrentGroup = this.GroupService.ListGroup.find(f => f.idGroup == this.GroupId);
    if (this.YearbookPerSchool != this.SchoolService.SelectYearbook.idyearbook)
      this.GenericFunctionService.GoBackToLastPage();

    this.DocumentPerGroupService.getLstDocumentPerGroup(this.SchoolId, this.GroupId)
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
  ChangeDoc(doc: DocumentsPerGroup, IsMultiple: boolean = true, FolderLength: number = 0, IsChange: boolean = false, lengthFolder: number = 0) {
    debugger;
    this.FolderLength = FolderLength;
    this.IsChangeDoc = IsChange;
    this.CurrentDocumentsPerGroup = new DocumentsPerGroup();
    this.CurrentDocumentsPerGroup = { ...doc };
    let event = new MouseEvent('click', { bubbles: false });
    if (IsMultiple)
      this.fileInput.nativeElement.dispatchEvent(event);
    else
      this.fileInput2.nativeElement.dispatchEvent(event);
    // if (FolderLength > 0 && this.CurrentDocumentsPerGroup.folderName != null)
    //   this.CurrentDocumentsPerGroup.name = this.CurrentDocumentsPerGroup.folderName;
  }

  //הצגת קובץ
  DisplayDoc(doc: DocumentsPerGroup) {
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
      this.ListDocumentsPerGroup = new Array<DocumentsPerGroup>();

      debugger;
      this.CurrentDocument = { ...this.CurrentDocumentsPerGroup };
      let path = this.SchoolId + "-Groups-" + this.GroupId + '-';

      //נדרשים
      if (this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId != null && this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId > 0)
        path = path + 'r' + this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId + "&FileName=";
      //קיימים ולא דרושים
      else
        path = path + 'd' + this.CurrentDocumentsPerGroup.exsistDocumentId + "&FileName=";

      for (let index = this.CurrentDocumentsPerGroup.indexFolder; index < this.CurrentDocumentsPerGroup.indexFolder + files.length; index++) {
        oldpath = this.CurrentDocumentsPerGroup.path;
        pathDoc = path + index;
        this.fileD = files[index - this.CurrentDocumentsPerGroup.indexFolder];

        this.FilesAzureService.uploadFileToAzure(this.fileD, pathDoc, this.SchoolId)
          .subscribe(
            d => {
              this.numSuccess++;
              this.CurrentDocument = { ...this.CurrentDocumentsPerGroup };
              this.CurrentDocument.path = d;
              this.CurrentDocument.GroupId = this.GroupId;
              this.CurrentDocument.name = files[index - this.CurrentDocumentsPerGroup.indexFolder].name;
              this.CurrentDocument.schoolId = this.SchoolId;

              // שמירת סוג הקובץ
              var index2 = files[index - this.CurrentDocumentsPerGroup.indexFolder].name.lastIndexOf('.')
              if (index2 > -1) {
                this.type = files[index - this.CurrentDocumentsPerGroup.indexFolder].name.substring(index2);
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerGroup.indexFolder].name.substring(0, index2);

              }
              else {
                this.type = '';
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerGroup.indexFolder].name;
              }
              this.CurrentDocument.type = this.type;

              if (this.IsChangeDoc == false) {
                this.CurrentDocument.dateCreated = new Date();
                this.CurrentDocument.userCreatedId = this.CurrentSchool.userId;
                this.CurrentDocument.iddocumentPerGroup = 0;
              }
              else {
                this.CurrentDocument.dateUpdated = new Date();
                this.CurrentDocument.userUpdatedId = this.CurrentSchool.userId;
              }

              //מחיקת הקובץ הישן
              if (this.IsChangeDoc == true && oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
                this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
              }
              // this.CurrentDocument.requiredDocumentPerGroupId = this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId;
              // this.CurrentDocument.folderId = this.CurrentDocumentsPerGroup.folderId;
              // this.CurrentDocument.folderCreated = this.CurrentDocumentsPerGroup.folderCreated;

              this.ListDocumentsPerGroup.push(this.CurrentDocument);
              if (this.numSuccess == files.length && this.ListDocumentsPerGroup.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0) {
                    //שמירה ב-DB
                    this.DocumentPerGroupService.UploadDocumentPerGroup(this.SchoolId, this.GroupId, this.ListDocumentsPerGroup[0], 0)
                      .subscribe(
                        d => {
                          debugger;


                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerGroup.iddocumentPerGroup == 0 || this.CurrentDocumentsPerGroup.iddocumentPerGroup == undefined)
                            &&
                            this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId != undefined &&
                            this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerGroupId == this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerGroup>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerGroup.iddocumentPerGroup == 0 || this.CurrentDocumentsPerGroup.iddocumentPerGroup == undefined)
                              && (this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId == undefined ||
                                this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId == 0)) {
                              let arr = new Array<DocumentsPerGroup>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerGroup.iddocumentPerGroup != undefined && this.CurrentDocumentsPerGroup.iddocumentPerGroup > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerGroup == this.CurrentDocumentsPerGroup.iddocumentPerGroup);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }

                          this.CurrentDocumentsPerGroup = new DocumentsPerGroup();
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
                    nameFolder = this.CurrentDocumentsPerGroup.folderName;
                    this.DocumentPerGroupService.UploadFewDocumentsPerGroup(this.SchoolId,
                      this.GroupId, this.ListDocumentsPerGroup, nameFolder)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId != null && this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId > 0 && this.ListDocuments[index3][0].requiredDocumentPerGroupId == this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId)
                                || (this.CurrentDocumentsPerGroup.exsistDocumentId != null && this.CurrentDocumentsPerGroup.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerGroup.exsistDocumentId))
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerGroup == this.CurrentDocumentsPerGroup.iddocumentPerGroup);
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
                          this.CurrentDocumentsPerGroup;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger
                          // ------------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));

                        }
                        , e => {

                          this.CurrentDocumentsPerGroup;
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
              if (this.numSuccess == files.length && this.ListDocumentsPerGroup.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0) {
                    //שמירה ב-DB
                    this.DocumentPerGroupService.UploadDocumentPerGroup(this.SchoolId, this.GroupId, this.ListDocumentsPerGroup[0], 0)
                      .subscribe(
                        d => {
                          debugger;


                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerGroup.iddocumentPerGroup == 0 || this.CurrentDocumentsPerGroup.iddocumentPerGroup == undefined)
                            &&
                            this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId != undefined &&
                            this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerGroupId == this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerGroup>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerGroup.iddocumentPerGroup == 0 || this.CurrentDocumentsPerGroup.iddocumentPerGroup == undefined)
                              && (this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId == undefined ||
                                this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId == 0)) {
                              let arr = new Array<DocumentsPerGroup>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerGroup.iddocumentPerGroup != undefined && this.CurrentDocumentsPerGroup.iddocumentPerGroup > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerGroup == this.CurrentDocumentsPerGroup.iddocumentPerGroup);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }

                          this.CurrentDocumentsPerGroup = new DocumentsPerGroup();
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
                    nameFolder = this.CurrentDocumentsPerGroup.folderName;
                    this.DocumentPerGroupService.UploadFewDocumentsPerGroup(this.SchoolId,
                      this.GroupId, this.ListDocumentsPerGroup, nameFolder)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId != null && this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId > 0 && this.ListDocuments[index3][0].requiredDocumentPerGroupId == this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId)
                                || (this.CurrentDocumentsPerGroup.exsistDocumentId != null && this.CurrentDocumentsPerGroup.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerGroup.exsistDocumentId))
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerGroup == this.CurrentDocumentsPerGroup.iddocumentPerGroup);
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
                          this.CurrentDocumentsPerGroup;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger
                          // ------------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));

                        }
                        , e => {

                          this.CurrentDocumentsPerGroup;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

                        });
                  }
                }
              }
              else
                if (this.numSuccess == files.length && this.ListDocumentsPerGroup.length == 0)
                  this.ngxService.stop();
              this.CurrentDocument = new DocumentsPerGroup();
              this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.CurrentDocumentsPerGroup.indexFolder].name + ' יש בעיה ', sticky: true });

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
  //     let path = this.SchoolId + "-Groups-" + this.GroupId + "&FileName=";

  //     // if (this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId != 0 && this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId != undefined) {
  //     //   if (this.CurrentDocumentsPerGroup.iddocumentPerGroup != undefined && this.CurrentDocumentsPerGroup.iddocumentPerGroup > 0) {
  //     //     path = path + 'r' + this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId;
  //     //   }
  //     //   else
  //     //     path = path + 'r' + this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId
  //     // }
  //     // else
  //     //   path = path + this.CurrentDocumentsPerGroup.iddocumentPerGroup;
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId + "&FileName=" + this.CurrentDocumentsPerGroup.indexFolder;

  //     this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //       .subscribe(
  //         d => {
  //           debugger;
  //           oldpath = this.CurrentDocumentsPerGroup.path;
  //           this.CurrentDocumentsPerGroup.path = d;
  //           this.CurrentDocumentsPerGroup.GroupId = this.GroupId;
  //           this.CurrentDocumentsPerGroup.name = files[0].name;

  //           //אם זה מסמך מהנדרשים ועדיין לא קיים
  //           if (this.CurrentDocumentsPerGroup.iddocumentPerGroup == 0) {
  //             this.CurrentDocumentsPerGroup.dateCreated = new Date();
  //             this.CurrentDocumentsPerGroup.userCreated = this.CurrentSchool.userId;
  //             this.CurrentDocumentsPerGroup.schoolId = this.SchoolId;
  //           }

  //           //למסמכים קיימים
  //           else {
  //             this.CurrentDocumentsPerGroup.dateUpdated = new Date();
  //             this.CurrentDocumentsPerGroup.userUpdated = this.CurrentSchool.userId;
  //           }

  //           //מחיקת הקובץ הישן מאזור
  //           if (oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
  //             this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
  //           }

  //           // שמירת סוג הקובץ
  //           var index = this.fileD.name.lastIndexOf('.')
  //           if (index > -1) {
  //             this.type = this.fileD.name.substring(index);
  //             this.CurrentDocumentsPerGroup.name = this.fileD.name.substring(0, index);
  //           }
  //           else {
  //             this.type = '';
  //             this.CurrentDocumentsPerGroup.name = this.fileD.name;
  //           }

  //           this.CurrentDocumentsPerGroup.type = this.type;

  //           //שמירה ב-DB
  //           this.DocumentPerGroupService.UploadDocumentPerGroup(this.SchoolId, this.GroupId, this.CurrentDocumentsPerGroup, 0, this.uniqueCodeID)
  //             .subscribe(
  //               d => {
  //                 debugger;

  //                 //דרושים ועדיין לא קיימים
  //                 if (this.CurrentDocumentsPerGroup.iddocumentPerGroup == 0 &&
  //                   this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId != undefined &&
  //                   this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId > 0) {
  //                   let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerGroupId == this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId);

  //                   if (y >= 0) {
  //                     let arr = new Array<DocumentsPerGroup>();
  //                     arr.push(d);
  //                     this.ListDocuments[y] = arr;
  //                   }
  //                 }
  //                 else
  //                   //דרושים וקיימים
  //                   if (this.CurrentDocumentsPerGroup.iddocumentPerGroup > 0 &&
  //                     this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId != undefined &&
  //                     this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId > 0) {

  //                     debugger;
  //                     let y;
  //                     //קובץ בודד
  //                     if (!IsFolder) {
  //                       y = this.ListDocuments.findIndex(f => f[0].iddocumentPerGroup == this.CurrentDocumentsPerGroup.iddocumentPerGroup);
  //                       if (y >= 0) {
  //                         let arr = new Array<DocumentsPerGroup>();
  //                         arr.push(d);
  //                         this.ListDocuments[y] = arr;
  //                       }
  //                     }

  //                     //קובץ מתיקיה
  //                     else {
  //                       for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
  //                         if (this.ListDocuments[index2][0].folderId == this.CurrentDocumentsPerGroup.folderId) {
  //                           y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerGroup == this.CurrentDocumentsPerGroup.iddocumentPerGroup)
  //                           if (y >= 0) {
  //                             this.ListDocuments[index2][y] = d;
  //                             break;
  //                           }
  //                         }
  //                       }
  //                     }
  //                   }
  //                 debugger;

  //                 this.CurrentDocumentsPerGroup = new DocumentsPerGroup();
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
  //     this.ListDocumentsPerGroup = new Array<DocumentsPerGroup>();

  //     debugger;
  //     this.CurrentDocument = { ...this.CurrentDocumentsPerGroup };
  //     for (let index = this.FolderLength; index < this.FolderLength + files.length; index++) {
  //       // debugger;
  //       oldpath = this.CurrentDocumentsPerGroup.path;

  //       this.fileD = files[index - this.FolderLength];
  //       let path = this.SchoolId + "-Groups-" + this.GroupId;
  //       if (this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId != 0 && this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId != undefined)
  //         // if (this.FolderLength == 0 && this.CurrentDocumentsPerGroup.iddocumentPerGroup != 0 && this.CurrentDocumentsPerGroup.iddocumentPerGroup != undefined)
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId + "&FileName=" + index
  //       else
  //         path = path + '-' + this.CurrentDocumentsPerGroup.iddocumentPerGroup + "&FileName=" + index;

  //       this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //         .subscribe(
  //           d => {
  //             this.numSuccess++;
  //             this.CurrentDocument = { ...this.CurrentDocumentsPerGroup };
  //             this.CurrentDocument.path = d;
  //             this.CurrentDocument.GroupId = this.GroupId;
  //             this.CurrentDocument.folderName = this.CurrentDocumentsPerGroup.folderName;
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
  //             if (this.CurrentDocumentsPerGroup.iddocumentPerGroup == 0 || (this.CurrentDocumentsPerGroup.folderId != undefined && this.CurrentDocumentsPerGroup.folderId > 0)) {
  //               if (this.IsChangeDoc == false) {
  //                 this.CurrentDocument.dateCreated = new Date();
  //                 this.CurrentDocument.userCreated = this.CurrentSchool.userId;
  //               }
  //               else {
  //                 this.CurrentDocument.dateUpdated = new Date();
  //                 this.CurrentDocument.userUpdated = this.CurrentSchool.userId;
  //               }
  //               this.CurrentDocument.schoolId = this.SchoolId;
  //               this.CurrentDocument.requiredDocumentPerGroupId = this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId;
  //               if (this.CurrentDocumentsPerGroup.folderId != undefined && this.CurrentDocumentsPerGroup.folderId > 0) {
  //                 this.CurrentDocument.folderId = this.CurrentDocumentsPerGroup.folderId;
  //                 this.CurrentDocument.folderCreated = this.CurrentDocumentsPerGroup.folderCreated;
  //                 if (this.IsChangeDoc == false)
  //                   this.CurrentDocument.iddocumentPerGroup = 0;
  //               }
  //             }

  //             this.ListDocumentsPerGroup.push(this.CurrentDocument);
  //             if (this.numSuccess == files.length && this.ListDocumentsPerGroup.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerGroup.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerGroup.name;

  //               this.DocumentPerGroupService.UploadFewDocumentsPerGroup(this.SchoolId,
  //                 this.GroupId, this.ListDocumentsPerGroup, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerGroupId == this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId)
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
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerGroup == this.CurrentDocumentsPerGroup.iddocumentPerGroup);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerGroup;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerGroup;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }
  //           }, er => {
  //             debugger;
  //             this.numSuccess++;
  //             if (this.numSuccess == files.length && this.ListDocumentsPerGroup.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerGroup.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerGroup.name;

  //               this.DocumentPerGroupService.UploadFewDocumentsPerGroup(this.SchoolId,
  //                 this.GroupId, this.ListDocumentsPerGroup, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerGroupId == this.CurrentDocumentsPerGroup.requiredDocumentPerGroupId)
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
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerGroup == this.CurrentDocumentsPerGroup.iddocumentPerGroup);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerGroup;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerGroup;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }

  //             this.CurrentDocument = new DocumentsPerGroup();
  //             this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.FolderLength].name + ' יש בעיה ', sticky: true });

  //           }
  //         )

  //     }
  //   }

  // }

  //הצגת קובץ בחלון חדש


  DisplayDocInNewWindow(doc: DocumentsPerGroup) {

    window.open(doc.path);
  }

  //הורדת קובץ
  DownloadDoc(doc: DocumentsPerGroup) {
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
  DownloadFewDoc(docs: DocumentsPerGroup[]) {
    docs.forEach(doc => {

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

  //מחיקת קובץ
  DeleteDoc(doc: DocumentsPerGroup, IsFolder: boolean = false) {
    // ------------
    var path;
    path = doc.path;
    debugger;


    this.DocumentPerGroupService.DeleteDocumentPerGroup(doc.iddocumentPerGroup, this.GroupId).subscribe(s => {
      debugger;

      // אם זה מחיקת קובץ מתיקיה
      if (IsFolder) {
        let y;
        for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
          if (this.ListDocuments[index2][0].folderId == doc.folderId) {
            y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerGroup == doc.iddocumentPerGroup)
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
        if (doc.requiredDocumentPerGroupId != undefined) {
          doc.dateUpdated = undefined;
          doc.iddocumentPerGroup = 0;
          doc.path = undefined;
          doc.userUpdatedId = undefined;
          doc.userUpdatedId = undefined;
          doc.dateCreated = undefined;
          doc.name = s;
          doc.type = undefined;
          doc.folderId = undefined;
          doc.folderName = s;
          doc.indexFolder = 0;

        }

        else
          //   קבצים קיימים ולא דרושים
          if (doc.iddocumentPerGroup > 0 && (doc.requiredDocumentPerGroupId == undefined || doc.requiredDocumentPerGroupId == 0)) {
            let x = this.ListDocuments.findIndex(f => f[0].iddocumentPerGroup == doc.iddocumentPerGroup);
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
  DeleteFewDoc(docs: DocumentsPerGroup[]) {

    this.ngxService.start();

    debugger;


    let requiredDocumentPerGroupId = docs[0].requiredDocumentPerGroupId != undefined ? docs[0].requiredDocumentPerGroupId : 0;
    //מחיקת הקבצים מהמסד נתונים
    this.DocumentPerGroupService.DeleteFewDocumentPerGroup(docs[0].folderId, requiredDocumentPerGroupId, this.GroupId).subscribe(
      s => {
        debugger;

        for (let index = 0; index < this.ListDocuments.length; index++) {
          if (this.ListDocuments[index] == docs)
            if (s != undefined && s.requiredDocumentPerGroupId > 0) {
              let x = new Array<DocumentsPerGroup>();
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
  OpenFolder(docs: DocumentsPerGroup[]) {
    this.ListFilesOnFolder = docs;
    this.IsFolder = true;
    this.IsEditName = false;
  }

  //דיאלוג לשאלה אם רוצה למחוק תיקיה
  confirmFolder(docs: DocumentsPerGroup[]) {
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

  //דיאלוג לשאלה אם רוצה למחוק קובץ
  confirmDeleteFile(doc: DocumentsPerGroup, IsFolder: boolean = false) {
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
  ChangeNameDoc(doc: DocumentsPerGroup) {
    this.IsEditName = true;
    this.NameFile = doc.name;
    this.idfile = doc.iddocumentPerGroup;
  }

  //שמירת ההחלפת שם לקובץ
  SaveNameFile(doc: DocumentsPerGroup, FolderId: number = 0) {
    debugger;
    this.IsEditName = false;
    this.DocumentPerGroupService.SaveNameFile(this.idfile, this.NameFile).subscribe(
      da => {
        if (FolderId > 0) {
          for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
            if (this.ListDocuments[index2][0].folderId == FolderId) {
              let y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerGroup == this.idfile)
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
            if (element[0].iddocumentPerGroup == this.idfile) {
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

  isAllFilesOpenByThisUser(doc: DocumentsPerGroup[]) {
    let index = doc.findIndex(f => f.userCreatedId != this.SchoolService.ListSchool[0].userId)
    return (index != null && index > -1);
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
  AddNewDocumentsPerGroup() {
    debugger;
    this.CurrentDocumentsPerGroup = new DocumentsPerGroup();
    this.CurrentDocumentsPerGroup.schoolId = this.SchoolId;
    this.CurrentDocumentsPerGroup.GroupId = this.GroupId;
    this.CurrentDocumentsPerGroup.indexFolder = 0;
    this.displayDialog = true;
    this.filesLst = null;
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
          this.CurrentDocumentsPerGroup.exsistDocumentId = data;
        this.CurrentDocumentsPerGroup.folderName = this.CurrentDocumentsPerGroup.name;
        this.uploadDocument(this.filesLst, true, false);
      },
      er => {
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
      }
    );
  }
}
