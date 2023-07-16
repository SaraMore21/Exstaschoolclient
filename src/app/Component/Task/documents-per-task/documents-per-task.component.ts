import { ExsistDocumentService } from './../../../Service/exsist-document.service';
import { GenericFunctionService } from './../../../Service/generic-function.service';
import { TaskService } from 'src/app/Service/task.service';
import { DocumentPerTaskService } from './../../../Service/document-per-task.service';
import { FilesAzureService } from './../../../Service/files-azure.service';
import { SchoolService } from './../../../Service/school.service';
import { DocumentsPerTask } from './../../../Class/documents-per-task';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import * as fileSaver from 'file-saver';

@Component({
  selector: 'app-documents-per-task',
  templateUrl: './documents-per-task.component.html',
  styleUrls: ['./documents-per-task.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService]
})

export class DocumentsPerTaskComponent implements OnInit {

  //החלונית של בחירת קובץ בודד
  @ViewChild('file') fileInput: ElementRef;
  //חלונית לבחיקת קבצים מרובים
  @ViewChild('file2') fileInput2: ElementRef;

  ListDocuments: any;// Array<DocumentsPerTask> = new Array<DocumentsPerTask>();
  TaskId: number;
  fileD: File;
  CurrentDocumentsPerTask: DocumentsPerTask;
  //משתנה מסמל להצגת הקובץ באותו חלון
  visible = false;
  path: any;
  passport: DocumentsPerTask = new DocumentsPerTask();
  //מסמכים להעלות לתיקיה
  ListDocumentsPerTask: Array<DocumentsPerTask> = new Array<DocumentsPerTask>();
  //משתנה המונה את מספר הנסיונות העלאת קבצים כדי לדעת מתי הוא באחרון
  numSuccess: number = 0;
  CurrentDocument: DocumentsPerTask;
  IsFolder = false;
  ListFilesOnFolder: Array<DocumentsPerTask>;
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
  // -----------------
  IsFieldDisplay = false;
  collapsed: boolean = false;
  constructor(private confirmationService: ConfirmationService, public DocumentPerTaskService: DocumentPerTaskService,
    public SchoolService: SchoolService, public TaskService: TaskService, private active: ActivatedRoute, public router: Router,
    private FilesAzureService: FilesAzureService, private ExsistDocumentService: ExsistDocumentService,
    public sanitizer: DomSanitizer, private ngxService: NgxUiLoaderService,
    private messageService: MessageService, public GenericFunctionService: GenericFunctionService) {
  }

  ngOnInit(): void {

    if (this.SchoolService.ListSchool == null || this.SchoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.active.params.subscribe(c => { this.TaskId = c["id"] })
    this.active.params.subscribe(c => { this.SchoolId = c["schoolId"] })
    this.active.params.subscribe(c => { this.uniqueCodeID = c["uniqueCodeID"] })
    debugger;

    this.CurrentSchool = this.SchoolService.ListSchool.find(f => f.school.idschool == this.SchoolId)
    var CurrentTask = this.TaskService.ListTask.find(f => f.idtask == this.TaskId);
    if (this.CurrentSchool.appYearbookPerSchools.find(f => f.idyearbookPerSchool == CurrentTask.yearBookId).yearbookId != this.SchoolService.SelectYearbook.idyearbook)
      this.GenericFunctionService.GoBackToLastPage();

    this.DocumentPerTaskService.getLstDocumentPerTask(this.SchoolId, this.TaskId)
      .subscribe(d => {
        debugger; this.ListDocuments = d;
        // -----------
        this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));
      },
        e => { })

  }

  //קבלת URL מאובטח
  GetSecureUrl(path: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(path);
  }

  //פתיחת סייר הקבצים לבחירת קובץ והצבת המסמך אותו רוצים להעלות
  ChangeDoc(doc: DocumentsPerTask, IsMultiple: boolean = true, FolderLength: number = 0, IsChange: boolean = false, lengthFolder: number = 0) {
    debugger;
    this.FolderLength = FolderLength;
    this.IsChangeDoc = IsChange;
    this.CurrentDocumentsPerTask = new DocumentsPerTask();
    this.CurrentDocumentsPerTask = { ...doc };
    let event = new MouseEvent('click', { bubbles: false });
    if (IsMultiple)
      this.fileInput.nativeElement.dispatchEvent(event);
    else
      this.fileInput2.nativeElement.dispatchEvent(event);
    // if (FolderLength > 0 && this.CurrentDocumentsPerTask.folderName != null)
    //   this.CurrentDocumentsPerTask.name = this.CurrentDocumentsPerTask.folderName;
  }

  //הצגת קובץ
  DisplayDoc(doc: DocumentsPerTask) {
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
      this.ListDocumentsPerTask = new Array<DocumentsPerTask>();

      debugger;
      this.CurrentDocument = { ...this.CurrentDocumentsPerTask };
      let path = this.SchoolId + "-Tasks-" + this.TaskId + '-';

      //נדרשים
      if (this.CurrentDocumentsPerTask.requiredDocumentPerTaskId != null && this.CurrentDocumentsPerTask.requiredDocumentPerTaskId > 0)
        path = path + 'r' + this.CurrentDocumentsPerTask.requiredDocumentPerTaskId + "&FileName=";
      //קיימים ולא דרושים
      else
        path = path + 'd' + this.CurrentDocumentsPerTask.exsistDocumentId + "&FileName=";

      for (let index = this.CurrentDocumentsPerTask.indexFolder; index < this.CurrentDocumentsPerTask.indexFolder + files.length; index++) {
        oldpath = this.CurrentDocumentsPerTask.path;
        pathDoc = path + index;
        this.fileD = files[index - this.CurrentDocumentsPerTask.indexFolder];

        this.FilesAzureService.uploadFileToAzure(this.fileD, pathDoc, this.SchoolId)
          .subscribe(
            d => {
              this.numSuccess++;
              this.CurrentDocument = { ...this.CurrentDocumentsPerTask };
              this.CurrentDocument.path = d;
              this.CurrentDocument.TaskId = this.TaskId;
              this.CurrentDocument.name = files[index - this.CurrentDocumentsPerTask.indexFolder].name;
              this.CurrentDocument.schoolId = this.SchoolId;

              // שמירת סוג הקובץ
              var index2 = files[index - this.CurrentDocumentsPerTask.indexFolder].name.lastIndexOf('.')
              if (index2 > -1) {
                this.type = files[index - this.CurrentDocumentsPerTask.indexFolder].name.substring(index2);
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerTask.indexFolder].name.substring(0, index2);

              }
              else {
                this.type = '';
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerTask.indexFolder].name;
              }
              this.CurrentDocument.type = this.type;

              if (this.IsChangeDoc == false) {
                this.CurrentDocument.dateCreated = new Date();
                this.CurrentDocument.userCreatedId = this.CurrentSchool.userId;
                this.CurrentDocument.iddocumentPerTask = 0;
              }
              else {
                this.CurrentDocument.dateUpdated = new Date();
                this.CurrentDocument.userUpdatedId = this.CurrentSchool.userId;
              }

              //מחיקת הקובץ הישן
              if (this.IsChangeDoc == true && oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
                this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
              }
              // this.CurrentDocument.requiredDocumentPerTaskId = this.CurrentDocumentsPerTask.requiredDocumentPerTaskId;
              // this.CurrentDocument.folderId = this.CurrentDocumentsPerTask.folderId;
              // this.CurrentDocument.folderCreated = this.CurrentDocumentsPerTask.folderCreated;

              this.ListDocumentsPerTask.push(this.CurrentDocument);
              if (this.numSuccess == files.length && this.ListDocumentsPerTask.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0 && this.uniqueCodeID == 0) {
                    //שמירה ב-DB
                    this.DocumentPerTaskService.UploadDocumentPerTask(this.SchoolId, this.TaskId, this.ListDocumentsPerTask[0], 0, this.uniqueCodeID)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerTask.iddocumentPerTask == 0 || this.CurrentDocumentsPerTask.iddocumentPerTask == undefined)
                            &&
                            this.CurrentDocumentsPerTask.requiredDocumentPerTaskId != undefined &&
                            this.CurrentDocumentsPerTask.requiredDocumentPerTaskId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerTaskId == this.CurrentDocumentsPerTask.requiredDocumentPerTaskId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerTask>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerTask.iddocumentPerTask == 0 || this.CurrentDocumentsPerTask.iddocumentPerTask == undefined)
                              && (this.CurrentDocumentsPerTask.requiredDocumentPerTaskId == undefined ||
                                this.CurrentDocumentsPerTask.requiredDocumentPerTaskId == 0)) {
                              let arr = new Array<DocumentsPerTask>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerTask.iddocumentPerTask != undefined && this.CurrentDocumentsPerTask.iddocumentPerTask > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerTask == this.CurrentDocumentsPerTask.iddocumentPerTask);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }


                          debugger;

                          this.CurrentDocumentsPerTask = new DocumentsPerTask();
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ הועלה בהצלחה' });
                          // ----------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));
                        }, er => {
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
                        });
                  }
                  else {
                    debugger
                    let nameFolder;
                    nameFolder = this.CurrentDocumentsPerTask.folderName;
                    let CustomerId = this.SchoolService.CustomerId != null ? this.SchoolService.CustomerId : 0;
                    this.DocumentPerTaskService.UploadFewDocumentsPerTask(this.SchoolId,
                      this.TaskId, this.ListDocumentsPerTask, nameFolder, this.uniqueCodeID, this.SchoolService.userId, CustomerId)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerTask.requiredDocumentPerTaskId != null && this.CurrentDocumentsPerTask.requiredDocumentPerTaskId > 0 && this.ListDocuments[index3][0].requiredDocumentPerTaskId == this.CurrentDocumentsPerTask.requiredDocumentPerTaskId)
                                || (this.CurrentDocumentsPerTask.exsistDocumentId != null && this.CurrentDocumentsPerTask.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerTask.exsistDocumentId))
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerTask == this.CurrentDocumentsPerTask.iddocumentPerTask);
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
                          this.CurrentDocumentsPerTask;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger
                          // ---------------------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));
                        }
                        , e => {

                          this.CurrentDocumentsPerTask;
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
              if (this.numSuccess == files.length && this.ListDocumentsPerTask.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0 && this.uniqueCodeID == 0) {
                    //שמירה ב-DB
                    this.DocumentPerTaskService.UploadDocumentPerTask(this.SchoolId, this.TaskId, this.ListDocumentsPerTask[0], 0, this.uniqueCodeID)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerTask.iddocumentPerTask == 0 || this.CurrentDocumentsPerTask.iddocumentPerTask == undefined)
                            &&
                            this.CurrentDocumentsPerTask.requiredDocumentPerTaskId != undefined &&
                            this.CurrentDocumentsPerTask.requiredDocumentPerTaskId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerTaskId == this.CurrentDocumentsPerTask.requiredDocumentPerTaskId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerTask>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerTask.iddocumentPerTask == 0 || this.CurrentDocumentsPerTask.iddocumentPerTask == undefined)
                              && (this.CurrentDocumentsPerTask.requiredDocumentPerTaskId == undefined ||
                                this.CurrentDocumentsPerTask.requiredDocumentPerTaskId == 0)) {
                              let arr = new Array<DocumentsPerTask>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerTask.iddocumentPerTask != undefined && this.CurrentDocumentsPerTask.iddocumentPerTask > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerTask == this.CurrentDocumentsPerTask.iddocumentPerTask);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }


                          debugger;

                          this.CurrentDocumentsPerTask = new DocumentsPerTask();
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ הועלה בהצלחה' });
                          // ----------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));
                        }, er => {
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
                        });
                  }
                  else {
                    debugger
                    let nameFolder;
                    nameFolder = this.CurrentDocumentsPerTask.folderName;
                    let CustomerId = this.SchoolService.CustomerId != null ? this.SchoolService.CustomerId : 0;
                    this.DocumentPerTaskService.UploadFewDocumentsPerTask(this.SchoolId,
                      this.TaskId, this.ListDocumentsPerTask, nameFolder, this.uniqueCodeID, this.SchoolService.userId, CustomerId)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerTask.requiredDocumentPerTaskId != null && this.CurrentDocumentsPerTask.requiredDocumentPerTaskId > 0 && this.ListDocuments[index3][0].requiredDocumentPerTaskId == this.CurrentDocumentsPerTask.requiredDocumentPerTaskId)
                                || (this.CurrentDocumentsPerTask.exsistDocumentId != null && this.CurrentDocumentsPerTask.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerTask.exsistDocumentId))
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerTask == this.CurrentDocumentsPerTask.iddocumentPerTask);
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
                          this.CurrentDocumentsPerTask;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger
                          // ---------------------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));
                        }
                        , e => {

                          this.CurrentDocumentsPerTask;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

                        });
                  }
                }
              }
              else
                if (this.numSuccess == files.length && this.ListDocumentsPerTask.length == 0)
                  this.ngxService.stop();
              this.CurrentDocument = new DocumentsPerTask();
              this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.CurrentDocumentsPerTask.indexFolder].name + ' יש בעיה ', sticky: true });

            }
          )
      }
    }

  }

  DisplayDocInNewWindow(doc: DocumentsPerTask) {

    window.open(doc.path);
  }

  //הורדת קובץ
  DownloadDoc(doc: DocumentsPerTask) {
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
  DownloadFewDoc(docs: DocumentsPerTask[]) {
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
  DeleteDoc(doc: DocumentsPerTask, IsFolder: boolean = false) {
    // ----------------
    var path;
    path = doc.path;
    debugger;

    let uniqueCodeId;
    uniqueCodeId = doc.uniqueCodeId != null ? doc.uniqueCodeId : 0;
    this.DocumentPerTaskService.DeleteDocumentPerTask(doc.iddocumentPerTask, this.TaskId, uniqueCodeId).subscribe(s => {
      debugger;

      // אם זה מחיקת קובץ מתיקיה
      if (IsFolder) {
        let y;
        for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
          if (this.ListDocuments[index2][0].folderId == doc.folderId) {
            y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerTask == doc.iddocumentPerTask)
            if (y >= 0) {
              this.ListDocuments[index2].splice(y, 1);

              //באם מחקו קובץ מתיקיה ונשאר קובץ בודד
              if (this.ListDocuments[index2].length == 1) {
                // this.ListDocuments[index2][0].name = s;
                this.IsFolder = false;
                // ------------------
                this.ListDocuments[index2][0].folderId = null;
              }
              break
            }
          }

        }
      }

      //אם זה קובץ מהדרושים
      else
        if (doc.requiredDocumentPerTaskId != undefined) {
          doc.dateUpdated = undefined;
          doc.iddocumentPerTask = 0;
          doc.path = undefined;
          doc.userUpdatedId = undefined;
          doc.userUpdatedId = undefined;
          doc.dateCreated = undefined;
          doc.name = s;
          doc.type = undefined;
          // -----------------
          doc.folderId = null;
          doc.folderName = s;
          doc.indexFolder = 0;
          doc.uniqueCodeId = undefined;

        }

        else
          //   קבצים קיימים ולא דרושים
          if (doc.iddocumentPerTask > 0 && (doc.requiredDocumentPerTaskId == undefined || doc.requiredDocumentPerTaskId == 0)) {
            let x = this.ListDocuments.findIndex(f => f[0].iddocumentPerTask == doc.iddocumentPerTask);
            if (x != undefined)
              this.ListDocuments.splice(x, 1);

          }
      this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ נמחק בהצלחה' });
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
  DeleteFewDoc(docs: DocumentsPerTask[]) {

    this.ngxService.start();

    debugger;
    console.log(docs[0].folderId);
    var unique = docs[0].uniqueCodeId;
    if (unique == null)
      unique = 0;

    let requiredDocumentPerTaskId = docs[0].requiredDocumentPerTaskId != undefined ? docs[0].requiredDocumentPerTaskId : 0;
    //מחיקת הקבצים מהמסד נתונים
    this.DocumentPerTaskService.DeleteFewDocumentPerTask(docs[0].folderId, requiredDocumentPerTaskId, this.TaskId, unique).subscribe(
      s => {
        debugger;

        for (let index = 0; index < this.ListDocuments.length; index++) {
          if (this.ListDocuments[index] == docs)
            if (s != undefined && s.requiredDocumentPerTaskId > 0) {
              let x = new Array<DocumentsPerTask>();
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
        // ------------------
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
  OpenFolder(docs: DocumentsPerTask[]) {
    this.ListFilesOnFolder = docs;
    this.IsFolder = true;
    this.IsEditName = false;
  }

  //דיאלוג לשאלה אם רוצה למחוק תיקיה
  confirmFolder(docs: DocumentsPerTask[]) {
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
  confirmDeleteFile(doc: DocumentsPerTask, IsFolder: boolean = false) {
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
  ChangeNameDoc(doc: DocumentsPerTask) {
    this.IsEditName = true;
    this.NameFile = doc.name;
    this.idfile = doc.iddocumentPerTask;
  }

  //שמירת ההחלפת שם לקובץ
  SaveNameFile(doc: DocumentsPerTask, FolderId: number = 0) {
    debugger;
    this.IsEditName = false;
    var uniqeId = doc.uniqueCodeId != null ? doc.uniqueCodeId : 0;
    this.DocumentPerTaskService.SaveNameFile(this.idfile, this.NameFile, uniqeId).subscribe(
      da => {
        if (FolderId > 0) {
          for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
            if (this.ListDocuments[index2][0].folderId == FolderId) {
              let y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerTask == this.idfile)
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
            if (element[0].iddocumentPerTask == this.idfile) {
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
  isAllFilesOpenByThisUser(doc: DocumentsPerTask[]) {
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
  AddNewDocumentsPerTask() {
    debugger;
    this.CurrentDocumentsPerTask = new DocumentsPerTask();
    this.CurrentDocumentsPerTask.schoolId = this.SchoolId;
    this.CurrentDocumentsPerTask.TaskId = this.TaskId;
    this.CurrentDocumentsPerTask.indexFolder = 0;
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
          this.CurrentDocumentsPerTask.exsistDocumentId = data;
        this.CurrentDocumentsPerTask.folderName = this.CurrentDocumentsPerTask.name;

        this.uploadDocument(this.filesLst, true, false);

      },
      er => {
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
      }
    );
  }

}
