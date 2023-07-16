import { ExsistDocumentService } from './../../../Service/exsist-document.service';
import { FilesAzureService } from './../../../Service/files-azure.service';
import { SchoolService } from './../../../Service/school.service';
import { DocumentPerTaskExsistService } from './../../../Service/document-per-task-exsist.service';
import { DocumentsPerTaskExsist } from './../../../Class/documents-per-task-exsist';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import * as fileSaver from 'file-saver';
import { TaskExsistService } from 'src/app/Service/task-exsist.service';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';

@Component({
  selector: 'app-documents-per-task-exsist',
  templateUrl: './documents-per-task-exsist.component.html',
  styleUrls: ['./documents-per-task-exsist.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService]
})

export class DocumentsPerTaskExsistComponent implements OnInit {

  //החלונית של בחירת קובץ בודד
  @ViewChild('file') fileInput: ElementRef;
  //חלונית לבחיקת קבצים מרובים
  @ViewChild('file2') fileInput2: ElementRef;

  ListDocuments: any;// Array<DocumentsPerTaskExsist> = new Array<DocumentsPerTaskExsist>();
  TaskExsistId: number;
  fileD: File;
  CurrentDocumentsPerTaskExsist: DocumentsPerTaskExsist;
  //משתנה מסמל להצגת הקובץ באותו חלון
  visible = false;
  path: any;
  //מסמכים להעלות לתיקיה
  ListDocumentsPerTaskExsist: Array<DocumentsPerTaskExsist> = new Array<DocumentsPerTaskExsist>();
  //משתנה המונה את מספר הנסיונות העלאת קבצים כדי לדעת מתי הוא באחרון
  numSuccess: number = 0;
  CurrentDocument: DocumentsPerTaskExsist;
  IsFolder = false;
  ListFilesOnFolder: Array<DocumentsPerTaskExsist>;
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

  constructor(private confirmationService: ConfirmationService, public DocumentPerTaskExsistService: DocumentPerTaskExsistService,
    public SchoolService: SchoolService, public TaskExsistService: TaskExsistService, private active: ActivatedRoute, public router: Router,
    private FilesAzureService: FilesAzureService, private ExsistDocumentService: ExsistDocumentService,
    public sanitizer: DomSanitizer, private ngxService: NgxUiLoaderService,
    private messageService: MessageService, public GenericFunctionService: GenericFunctionService) {
  }

  ngOnInit(): void {

    if (this.SchoolService.ListSchool == null || this.SchoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.active.params.subscribe(c => { this.TaskExsistId = c["id"] })
    this.active.params.subscribe(c => { this.SchoolId = c["schoolId"] })
    this.active.params.subscribe(c => { this.YearbookPerSchool = c["YearbookPerSchool"] })

    debugger;

    this.CurrentSchool = this.SchoolService.ListSchool.find(f => f.school.idschool == this.SchoolId)
    // var CurrentTaskExsist = this.TaskExsistService.ListTaskExsist.find(f => f.idTaskExsist == this.TaskExsistId);
    if (this.CurrentSchool.appYearbookPerSchools.find(f => f.idyearbookPerSchool == this.YearbookPerSchool).yearbookId != this.SchoolService.SelectYearbook.idyearbook)
      this.GenericFunctionService.GoBackToLastPage();

    this.DocumentPerTaskExsistService.getLstDocumentPerTaskExsist(this.SchoolId, this.TaskExsistId)
      .subscribe(d => {
        debugger; this.ListDocuments = d;
      },
        e => { })
  }

  //קבלת URL מאובטח
  GetSecureUrl(path: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(path);
  }

  //פתיחת סייר הקבצים לבחירת קובץ והצבת המסמך אותו רוצים להעלות
  ChangeDoc(doc: DocumentsPerTaskExsist, IsMultiple: boolean = true, FolderLength: number = 0, IsChange: boolean = false, lengthFolder: number = 0) {
    debugger;
    this.FolderLength = FolderLength;
    this.IsChangeDoc = IsChange;
    this.CurrentDocumentsPerTaskExsist = new DocumentsPerTaskExsist();
    this.CurrentDocumentsPerTaskExsist = { ...doc };
    let event = new MouseEvent('click', { bubbles: false });
    if (IsMultiple)
      this.fileInput.nativeElement.dispatchEvent(event);
    else
      this.fileInput2.nativeElement.dispatchEvent(event);
    // if (FolderLength > 0 && this.CurrentDocumentsPerTaskExsist.folderName != null)
    //   this.CurrentDocumentsPerTaskExsist.name = this.CurrentDocumentsPerTaskExsist.folderName;
  }

  //הצגת קובץ
  DisplayDoc(doc: DocumentsPerTaskExsist) {
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
      this.ListDocumentsPerTaskExsist = new Array<DocumentsPerTaskExsist>();

      debugger;
      this.CurrentDocument = { ...this.CurrentDocumentsPerTaskExsist };
      let path = this.SchoolId + "-TaskExsists-" + this.TaskExsistId + '-';

      //נדרשים
      if (this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId != null && this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId > 0)
        path = path + 'r' + this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId + "&FileName=";
      //קיימים ולא דרושים
      else
        path = path + 'd' + this.CurrentDocumentsPerTaskExsist.exsistDocumentId + "&FileName=";

      for (let index = this.CurrentDocumentsPerTaskExsist.indexFolder; index < this.CurrentDocumentsPerTaskExsist.indexFolder + files.length; index++) {
        oldpath = this.CurrentDocumentsPerTaskExsist.path;
        pathDoc = path + index;
        this.fileD = files[index - this.CurrentDocumentsPerTaskExsist.indexFolder];

        this.FilesAzureService.uploadFileToAzure(this.fileD, pathDoc, this.SchoolId)
          .subscribe(
            d => {
              this.numSuccess++;
              this.CurrentDocument = { ...this.CurrentDocumentsPerTaskExsist };
              this.CurrentDocument.path = d;
              this.CurrentDocument.TaskExsistId = this.TaskExsistId;
              this.CurrentDocument.name = files[index - this.CurrentDocumentsPerTaskExsist.indexFolder].name;
              this.CurrentDocument.schoolId = this.SchoolId;

              // שמירת סוג הקובץ
              var index2 = files[index - this.CurrentDocumentsPerTaskExsist.indexFolder].name.lastIndexOf('.')
              if (index2 > -1) {
                this.type = files[index - this.CurrentDocumentsPerTaskExsist.indexFolder].name.substring(index2);
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerTaskExsist.indexFolder].name.substring(0, index2);

              }
              else {
                this.type = '';
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerTaskExsist.indexFolder].name;
              }
              this.CurrentDocument.type = this.type;

              if (this.IsChangeDoc == false) {
                this.CurrentDocument.dateCreated = new Date();
                this.CurrentDocument.userCreatedId = this.CurrentSchool.userId;
                this.CurrentDocument.iddocumentPerTaskExsist = 0;
              }
              else {
                this.CurrentDocument.dateUpdated = new Date();
                this.CurrentDocument.userUpdatedId = this.CurrentSchool.userId;
              }

              //מחיקת הקובץ הישן
              if (this.IsChangeDoc == true && oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
                this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
              }
              // this.CurrentDocument.requiredDocumentPerTaskExsistId = this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId;
              // this.CurrentDocument.folderId = this.CurrentDocumentsPerTaskExsist.folderId;
              // this.CurrentDocument.folderCreated = this.CurrentDocumentsPerTaskExsist.folderCreated;

              this.ListDocumentsPerTaskExsist.push(this.CurrentDocument);
              if (this.numSuccess == files.length && this.ListDocumentsPerTaskExsist.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0) {
                    //שמירה ב-DB
                    this.DocumentPerTaskExsistService.UploadDocumentPerTaskExsist(this.SchoolId, this.TaskExsistId, this.ListDocumentsPerTaskExsist[0], 0)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist == 0 || this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist == undefined)
                            &&
                            this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId != undefined &&
                            this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerTaskExsistId == this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerTaskExsist>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist == 0 || this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist == undefined)
                              && (this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId == undefined ||
                                this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId == 0)) {
                              let arr = new Array<DocumentsPerTaskExsist>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist != undefined && this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerTaskExsist == this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }

                          debugger;

                          this.CurrentDocumentsPerTaskExsist = new DocumentsPerTaskExsist();
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ הועלה בהצלחה' });

                        }, er => {
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
                        });
                  }
                  else {
                    debugger
                    let nameFolder;
                    nameFolder = this.CurrentDocumentsPerTaskExsist.folderName;
                    this.DocumentPerTaskExsistService.UploadFewDocumentsPerTaskExsist(this.SchoolId,
                      this.TaskExsistId, this.ListDocumentsPerTaskExsist, nameFolder)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId != null && this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId > 0 && this.ListDocuments[index3][0].requiredDocumentPerTaskExsistId == this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId)
                                || (this.CurrentDocumentsPerTaskExsist.exsistDocumentId != null && this.CurrentDocumentsPerTaskExsist.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerTaskExsist.exsistDocumentId))
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerTaskExsist == this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist);
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
                          this.CurrentDocumentsPerTaskExsist;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger

                        }
                        , e => {

                          this.CurrentDocumentsPerTaskExsist;
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
              if (this.numSuccess == files.length && this.ListDocumentsPerTaskExsist.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0) {
                    //שמירה ב-DB
                    this.DocumentPerTaskExsistService.UploadDocumentPerTaskExsist(this.SchoolId, this.TaskExsistId, this.ListDocumentsPerTaskExsist[0], 0)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist == 0 || this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist == undefined)
                            &&
                            this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId != undefined &&
                            this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerTaskExsistId == this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerTaskExsist>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist == 0 || this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist == undefined)
                              && (this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId == undefined ||
                                this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId == 0)) {
                              let arr = new Array<DocumentsPerTaskExsist>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist != undefined && this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerTaskExsist == this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }

                          debugger;

                          this.CurrentDocumentsPerTaskExsist = new DocumentsPerTaskExsist();
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ הועלה בהצלחה' });

                        }, er => {
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
                        });
                  }
                  else {
                    debugger
                    let nameFolder;
                    nameFolder = this.CurrentDocumentsPerTaskExsist.folderName;
                    this.DocumentPerTaskExsistService.UploadFewDocumentsPerTaskExsist(this.SchoolId,
                      this.TaskExsistId, this.ListDocumentsPerTaskExsist, nameFolder)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId != null && this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId > 0 && this.ListDocuments[index3][0].requiredDocumentPerTaskExsistId == this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId)
                                || (this.CurrentDocumentsPerTaskExsist.exsistDocumentId != null && this.CurrentDocumentsPerTaskExsist.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerTaskExsist.exsistDocumentId))
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerTaskExsist == this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist);
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
                          this.CurrentDocumentsPerTaskExsist;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger

                        }
                        , e => {

                          this.CurrentDocumentsPerTaskExsist;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

                        });
                  }
                }
              }
              else
              if (this.numSuccess == files.length && this.ListDocumentsPerTaskExsist.length == 0)
              this.ngxService.stop();
              this.CurrentDocument = new DocumentsPerTaskExsist();
              this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.CurrentDocumentsPerTaskExsist.indexFolder].name + ' יש בעיה ', sticky: true });

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
  //     let path = this.SchoolId + "-TaskExsists-" + this.TaskExsistId + "&FileName=";

  //     // if (this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId != 0 && this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId != undefined) {
  //     //   if (this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist != undefined && this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist > 0) {
  //     //     path = path + 'r' + this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId;
  //     //   }
  //     //   else
  //     //     path = path + 'r' + this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId
  //     // }
  //     // else
  //     //   path = path + this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist;
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId + "&FileName=" + this.CurrentDocumentsPerTaskExsist.indexFolder;

  //     this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //       .subscribe(
  //         d => {
  //           debugger;
  //           oldpath = this.CurrentDocumentsPerTaskExsist.path;
  //           this.CurrentDocumentsPerTaskExsist.path = d;
  //           this.CurrentDocumentsPerTaskExsist.TaskExsistId = this.TaskExsistId;
  //           this.CurrentDocumentsPerTaskExsist.name = files[0].name;

  //           //אם זה מסמך מהנדרשים ועדיין לא קיים
  //           if (this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist == 0) {
  //             this.CurrentDocumentsPerTaskExsist.dateCreated = new Date();
  //             this.CurrentDocumentsPerTaskExsist.userCreated = this.CurrentSchool.userId;
  //             this.CurrentDocumentsPerTaskExsist.schoolId = this.SchoolId;
  //           }

  //           //למסמכים קיימים
  //           else {
  //             this.CurrentDocumentsPerTaskExsist.dateUpdated = new Date();
  //             this.CurrentDocumentsPerTaskExsist.userUpdated = this.CurrentSchool.userId;
  //           }

  //           //מחיקת הקובץ הישן מאזור
  //           if (oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
  //             this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
  //           }

  //           // שמירת סוג הקובץ
  //           var index = this.fileD.name.lastIndexOf('.')
  //           if (index > -1) {
  //             this.type = this.fileD.name.substring(index);
  //             this.CurrentDocumentsPerTaskExsist.name = this.fileD.name.substring(0, index);
  //           }
  //           else {
  //             this.type = '';
  //             this.CurrentDocumentsPerTaskExsist.name = this.fileD.name;
  //           }

  //           this.CurrentDocumentsPerTaskExsist.type = this.type;

  //           //שמירה ב-DB
  //           this.DocumentPerTaskExsistService.UploadDocumentPerTaskExsist(this.SchoolId, this.TaskExsistId, this.CurrentDocumentsPerTaskExsist, 0, this.uniqueCodeID)
  //             .subscribe(
  //               d => {
  //                 debugger;

  //                 //דרושים ועדיין לא קיימים
  //                 if (this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist == 0 &&
  //                   this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId != undefined &&
  //                   this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId > 0) {
  //                   let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerTaskExsistId == this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId);

  //                   if (y >= 0) {
  //                     let arr = new Array<DocumentsPerTaskExsist>();
  //                     arr.push(d);
  //                     this.ListDocuments[y] = arr;
  //                   }
  //                 }
  //                 else
  //                   //דרושים וקיימים
  //                   if (this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist > 0 &&
  //                     this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId != undefined &&
  //                     this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId > 0) {

  //                     debugger;
  //                     let y;
  //                     //קובץ בודד
  //                     if (!IsFolder) {
  //                       y = this.ListDocuments.findIndex(f => f[0].iddocumentPerTaskExsist == this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist);
  //                       if (y >= 0) {
  //                         let arr = new Array<DocumentsPerTaskExsist>();
  //                         arr.push(d);
  //                         this.ListDocuments[y] = arr;
  //                       }
  //                     }

  //                     //קובץ מתיקיה
  //                     else {
  //                       for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
  //                         if (this.ListDocuments[index2][0].folderId == this.CurrentDocumentsPerTaskExsist.folderId) {
  //                           y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerTaskExsist == this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist)
  //                           if (y >= 0) {
  //                             this.ListDocuments[index2][y] = d;
  //                             break;
  //                           }
  //                         }
  //                       }
  //                     }
  //                   }
  //                 debugger;

  //                 this.CurrentDocumentsPerTaskExsist = new DocumentsPerTaskExsist();
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
  //     this.ListDocumentsPerTaskExsist = new Array<DocumentsPerTaskExsist>();

  //     debugger;
  //     this.CurrentDocument = { ...this.CurrentDocumentsPerTaskExsist };
  //     for (let index = this.FolderLength; index < this.FolderLength + files.length; index++) {
  //       // debugger;
  //       oldpath = this.CurrentDocumentsPerTaskExsist.path;

  //       this.fileD = files[index - this.FolderLength];
  //       let path = this.SchoolId + "-TaskExsists-" + this.TaskExsistId;
  //       if (this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId != 0 && this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId != undefined)
  //         // if (this.FolderLength == 0 && this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist != 0 && this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist != undefined)
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId + "&FileName=" + index
  //       else
  //         path = path + '-' + this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist + "&FileName=" + index;

  //       this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //         .subscribe(
  //           d => {
  //             this.numSuccess++;
  //             this.CurrentDocument = { ...this.CurrentDocumentsPerTaskExsist };
  //             this.CurrentDocument.path = d;
  //             this.CurrentDocument.TaskExsistId = this.TaskExsistId;
  //             this.CurrentDocument.folderName = this.CurrentDocumentsPerTaskExsist.folderName;
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
  //             if (this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist == 0 || (this.CurrentDocumentsPerTaskExsist.folderId != undefined && this.CurrentDocumentsPerTaskExsist.folderId > 0)) {
  //               if (this.IsChangeDoc == false) {
  //                 this.CurrentDocument.dateCreated = new Date();
  //                 this.CurrentDocument.userCreated = this.CurrentSchool.userId;
  //               }
  //               else {
  //                 this.CurrentDocument.dateUpdated = new Date();
  //                 this.CurrentDocument.userUpdated = this.CurrentSchool.userId;
  //               }
  //               this.CurrentDocument.schoolId = this.SchoolId;
  //               this.CurrentDocument.requiredDocumentPerTaskExsistId = this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId;
  //               if (this.CurrentDocumentsPerTaskExsist.folderId != undefined && this.CurrentDocumentsPerTaskExsist.folderId > 0) {
  //                 this.CurrentDocument.folderId = this.CurrentDocumentsPerTaskExsist.folderId;
  //                 this.CurrentDocument.folderCreated = this.CurrentDocumentsPerTaskExsist.folderCreated;
  //                 if (this.IsChangeDoc == false)
  //                   this.CurrentDocument.iddocumentPerTaskExsist = 0;
  //               }
  //             }

  //             this.ListDocumentsPerTaskExsist.push(this.CurrentDocument);
  //             if (this.numSuccess == files.length && this.ListDocumentsPerTaskExsist.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerTaskExsist.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerTaskExsist.name;

  //               this.DocumentPerTaskExsistService.UploadFewDocumentsPerTaskExsist(this.SchoolId,
  //                 this.TaskExsistId, this.ListDocumentsPerTaskExsist, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerTaskExsistId == this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId)
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
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerTaskExsist == this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerTaskExsist;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerTaskExsist;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }
  //           }, er => {
  //             debugger;
  //             this.numSuccess++;
  //             if (this.numSuccess == files.length && this.ListDocumentsPerTaskExsist.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerTaskExsist.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerTaskExsist.name;

  //               this.DocumentPerTaskExsistService.UploadFewDocumentsPerTaskExsist(this.SchoolId,
  //                 this.TaskExsistId, this.ListDocumentsPerTaskExsist, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerTaskExsistId == this.CurrentDocumentsPerTaskExsist.requiredDocumentPerTaskExsistId)
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
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerTaskExsist == this.CurrentDocumentsPerTaskExsist.iddocumentPerTaskExsist);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerTaskExsist;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerTaskExsist;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }

  //             this.CurrentDocument = new DocumentsPerTaskExsist();
  //             this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.FolderLength].name + ' יש בעיה ', sticky: true });

  //           }
  //         )

  //     }
  //   }

  // }

  //הצגת קובץ בחלון חדש


  DisplayDocInNewWindow(doc: DocumentsPerTaskExsist) {

    window.open(doc.path);
  }

  //הורדת קובץ
  DownloadDoc(doc: DocumentsPerTaskExsist) {
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
  DownloadFewDoc(docs: DocumentsPerTaskExsist[]) {
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
  DeleteDoc(doc: DocumentsPerTaskExsist, IsFolder: boolean = false) {
    debugger;
    this.FilesAzureService.DeleteFileFromAzure(doc.path).subscribe(response => {
      debugger;

    }, error => {
      // this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

      debugger; console.log('Error delete the file')
    });

    this.DocumentPerTaskExsistService.DeleteDocumentPerTaskExsist(doc.iddocumentPerTaskExsist, this.TaskExsistId).subscribe(s => {
      debugger;

      // אם זה מחיקת קובץ מתיקיה
      if (IsFolder) {
        let y;
        for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
          if (this.ListDocuments[index2][0].folderId == doc.folderId) {
            y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerTaskExsist == doc.iddocumentPerTaskExsist)
            if (y >= 0) {
              this.ListDocuments[index2].splice(y, 1);

              //באם מחקו קובץ מתיקיה ונשאר קובץ בודד
              if (this.ListDocuments[index2].length == 1) {
                // this.ListDocuments[index2][0].name = s;
                this.IsFolder = false;
              }
              break
            }
          }

        }
      }

      //אם זה קובץ מהדרושים
      else
        if (doc.requiredDocumentPerTaskExsistId != undefined) {
          doc.dateUpdated = undefined;
          doc.iddocumentPerTaskExsist = 0;
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
          if (doc.iddocumentPerTaskExsist > 0 && (doc.requiredDocumentPerTaskExsistId == undefined || doc.requiredDocumentPerTaskExsistId == 0)) {
            let x = this.ListDocuments.findIndex(f => f[0].iddocumentPerTaskExsist == doc.iddocumentPerTaskExsist);
            if (x != undefined)
              this.ListDocuments.splice(x, 1);

          }
      this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ נמחק בהצלחה' });

    }
      , er => {
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

        debugger
      });
  }

  //מחיקת כל הקבצים מתיקיה
  DeleteFewDoc(docs: DocumentsPerTaskExsist[]) {

    this.ngxService.start();
    //מחיקת הקבצים מאזור
    docs.forEach(doc => {
      debugger;
      this.FilesAzureService.DeleteFileFromAzure(doc.path).subscribe(response => {
        debugger;

      }, error => {

      });


    })
    debugger;


    let requiredDocumentPerTaskExsistId = docs[0].requiredDocumentPerTaskExsistId != undefined ? docs[0].requiredDocumentPerTaskExsistId : 0;
    //מחיקת הקבצים מהמסד נתונים
    this.DocumentPerTaskExsistService.DeleteFewDocumentPerTaskExsist(docs[0].folderId, requiredDocumentPerTaskExsistId, this.TaskExsistId).subscribe(
      s => {
        debugger;

        for (let index = 0; index < this.ListDocuments.length; index++) {
          if (this.ListDocuments[index] == docs)
            if (s != undefined && s.requiredDocumentPerTaskExsistId > 0) {
              let x = new Array<DocumentsPerTaskExsist>();
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

      }
      , er => {
        debugger;
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
      });
  }

  //פתיחת תיקיה והצגת הקבצים שבתוכה
  OpenFolder(docs: DocumentsPerTaskExsist[]) {
    this.ListFilesOnFolder = docs;
    this.IsFolder = true;
    this.IsEditName = false;
  }

  //דיאלוג לשאלה אם רוצה למחוק תיקיה
  confirmFolder(docs: DocumentsPerTaskExsist[]) {
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
  confirmDeleteFile(doc: DocumentsPerTaskExsist, IsFolder: boolean = false) {
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
  ChangeNameDoc(doc: DocumentsPerTaskExsist) {
    this.IsEditName = true;
    this.NameFile = doc.name;
    this.idfile = doc.iddocumentPerTaskExsist;
  }

  //שמירת ההחלפת שם לקובץ
  SaveNameFile(doc: DocumentsPerTaskExsist, FolderId: number = 0) {
    debugger;
    this.IsEditName = false;
    this.DocumentPerTaskExsistService.SaveNameFile(this.idfile, this.NameFile).subscribe(
      da => {
        if (FolderId > 0) {
          for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
            if (this.ListDocuments[index2][0].folderId == FolderId) {
              let y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerTaskExsist == this.idfile)
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
            if (element[0].iddocumentPerTaskExsist == this.idfile) {
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

  isAllFilesOpenByThisUser(doc: DocumentsPerTaskExsist[]) {
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
  AddNewDocumentsPerTaskExsist() {
    debugger;
    this.CurrentDocumentsPerTaskExsist = new DocumentsPerTaskExsist();
    this.CurrentDocumentsPerTaskExsist.schoolId = this.SchoolId;
    this.CurrentDocumentsPerTaskExsist.TaskExsistId = this.TaskExsistId;
    this.CurrentDocumentsPerTaskExsist.indexFolder = 0;
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
          this.CurrentDocumentsPerTaskExsist.exsistDocumentId = data;
        this.CurrentDocumentsPerTaskExsist.folderName = this.CurrentDocumentsPerTaskExsist.name;
        this.uploadDocument(this.filesLst, true, false);
      },
      er => {
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
      }
    );
  }
}
