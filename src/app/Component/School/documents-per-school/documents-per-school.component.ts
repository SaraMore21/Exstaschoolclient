import { ExsistDocumentService } from './../../../Service/exsist-document.service';
import { GenericFunctionService } from './../../../Service/generic-function.service';
import { FilesAzureService } from './../../../Service/files-azure.service';
import { SchoolService } from './../../../Service/school.service';
import { DocumentPerSchoolService } from './../../../Service/document-per-school.service';
import { DocumentsPerSchool } from './../../../Class/documents-per-school';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';
import * as fileSaver from 'file-saver';

@Component({
  selector: 'app-documents-per-School',
  templateUrl: './documents-per-School.component.html',
  styleUrls: ['./documents-per-School.component.css'],
  providers: [ConfirmationService, MessageService],
  encapsulation: ViewEncapsulation.None
})

export class DocumentsPerSchoolComponent implements OnInit {

  //החלונית של בחירת קובץ בודד
  @ViewChild('file') fileInput: ElementRef;
  //חלונית לבחיקת קבצים מרובים
  @ViewChild('file2') fileInput2: ElementRef;

  ListDocuments: any;// Array<DocumentsPerSchool> = new Array<DocumentsPerSchool>();
  SchoolId: number;
  fileD: File;
  CurrentDocumentsPerSchool: DocumentsPerSchool;
  //משתנה מסמל להצגת הקובץ באותו חלון
  visible = false;
  path: any;
  passport: DocumentsPerSchool = new DocumentsPerSchool();
  //מסמכים להעלות לתיקיה
  ListDocumentsPerSchool: Array<DocumentsPerSchool> = new Array<DocumentsPerSchool>();
  //משתנה המונה את מספר הנסיונות העלאת קבצים כדי לדעת מתי הוא באחרון
  numSuccess: number = 0;
  CurrentDocument: DocumentsPerSchool;
  IsFolder = false;
  ListFilesOnFolder: Array<DocumentsPerSchool>;
  IsEditName: boolean = false;
  NameFile: string = "enter name";
  idfile: number = 0;
  FolderLength: number = 0;
  CurrentSchool: any;
  type: string = "";
  uniqueCodeID: number = 0;
  IsChangeDoc: boolean = false;
  displayDialog: boolean = false;
  filesLst: FileList;
  blockSpecial: RegExp = /^[^/^+^-^*^&^%^=]+$/
  // ------
  IsFieldDisplay = false;
  collapsed: boolean = false;
  constructor(private confirmationService: ConfirmationService, public DocumentPerSchoolService: DocumentPerSchoolService,
    public SchoolService: SchoolService, private active: ActivatedRoute, public router: Router,
    private FilesAzureService: FilesAzureService, private ExsistDocumentService: ExsistDocumentService,
    public sanitizer: DomSanitizer, private ngxService: NgxUiLoaderService,
    private messageService: MessageService, public GenericFunctionService: GenericFunctionService) {
  }

  ngOnInit(): void {

    if (this.SchoolService.ListSchool == null || this.SchoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    // this.active.params.subscribe(c => { this.SchoolId = c["id"] })
    // this.active.params.subscribe(c => { this.uniqueCodeID = c["uniqueCodeID"] })
    debugger;

    if (this.SchoolService.ListSchool != null && this.SchoolService.ListSchool.length == 1) {
      this.CurrentSchool = this.SchoolService.ListSchool[0];
      this.ChangeSchool();
    }

    // this.CurrentSchool = this.SchoolService.ListSchool.find(f => f.school.idschool == this.SchoolId)
    // // var CurrentSchool = this.SchoolService.ListSchool.find(f => f.ids == this.SchoolId);
    // if (this.CurrentSchool.appYearbookPerSchools.find(f => f.idyearbookPerSchool == this.CurrentSchool.yearbookId).yearbookId != this.SchoolService.SelectYearbook.idyearbook)
    //   this.GenericFunctionService.GoBackToLastPage();

    // this.DocumentPerSchoolService.getLstDocumentPerSchool(this.SchoolId)
    //   .subscribe(d => {
    //     debugger; this.ListDocuments = d;

    //   },
    //     e => { })

  }

  ChangeSchool() {
    debugger
    this.SchoolId = this.CurrentSchool.school.idschool;
    this.uniqueCodeID = this.CurrentSchool.school.coordinationCode;
    this.getLstDocumentPerSchool();
  }

  getLstDocumentPerSchool() {
    this.DocumentPerSchoolService.getLstDocumentPerSchool(this.SchoolId)
      .subscribe(d => {
        debugger; this.ListDocuments = d;
        // this.ListDocuments= this.ListDocuments.sort((a, b) => (a.length < b.length ? -1 : 1));
        this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));

      },
        e => { })
  }
  //קבלת URL מאובטח
  GetSecureUrl(path: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(path);
  }

  //פתיחת סייר הקבצים לבחירת קובץ והצבת המסמך אותו רוצים להעלות
  ChangeDoc(doc: DocumentsPerSchool, IsMultiple: boolean = true, FolderLength: number = 0, IsChange: boolean = false, lengthFolder: number = 0) {
    debugger;
    this.FolderLength = FolderLength;
    this.IsChangeDoc = IsChange;
    this.CurrentDocumentsPerSchool = new DocumentsPerSchool();
    this.CurrentDocumentsPerSchool = { ...doc };
    let event = new MouseEvent('click', { bubbles: false });
    if (IsMultiple)
      this.fileInput.nativeElement.dispatchEvent(event);
    else
      this.fileInput2.nativeElement.dispatchEvent(event);
    // if (FolderLength > 0 && this.CurrentDocumentsPerSchool.folderName != null)
    //   this.CurrentDocumentsPerSchool.name = this.CurrentDocumentsPerSchool.folderName;
  }

  //הצגת קובץ
  DisplayDoc(doc: DocumentsPerSchool) {
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
      this.ListDocumentsPerSchool = new Array<DocumentsPerSchool>();

      debugger;
      this.CurrentDocument = { ...this.CurrentDocumentsPerSchool };
      let path = this.SchoolId + "-Schools-" + this.SchoolId + '-';

      //נדרשים
      if (this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId != null && this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId > 0)
        path = path + 'r' + this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId + "&FileName=";
      //קיימים ולא דרושים
      else
        path = path + 'd' + this.CurrentDocumentsPerSchool.exsistDocumentId + "&FileName=";

      for (let index = this.CurrentDocumentsPerSchool.indexFolder; index < this.CurrentDocumentsPerSchool.indexFolder + files.length; index++) {
        oldpath = this.CurrentDocumentsPerSchool.path;
        pathDoc = path + index;
        this.fileD = files[index - this.CurrentDocumentsPerSchool.indexFolder];

        this.FilesAzureService.uploadFileToAzure(this.fileD, pathDoc, this.SchoolId)
          .subscribe(
            d => {
              this.numSuccess++;
              this.CurrentDocument = { ...this.CurrentDocumentsPerSchool };
              this.CurrentDocument.path = d;
              this.CurrentDocument.name = files[index - this.CurrentDocumentsPerSchool.indexFolder].name;
              this.CurrentDocument.schoolId = this.SchoolId;

              // שמירת סוג הקובץ
              var index2 = files[index - this.CurrentDocumentsPerSchool.indexFolder].name.lastIndexOf('.')
              if (index2 > -1) {
                this.type = files[index - this.CurrentDocumentsPerSchool.indexFolder].name.substring(index2);
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerSchool.indexFolder].name.substring(0, index2);

              }
              else {
                this.type = '';
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerSchool.indexFolder].name;
              }
              this.CurrentDocument.type = this.type;

              if (this.IsChangeDoc == false) {
                this.CurrentDocument.dateCreated = new Date();
                this.CurrentDocument.userCreatedId = this.CurrentSchool.userId;
                this.CurrentDocument.iddocumentPerSchool = 0;
              }
              else {
                this.CurrentDocument.dateUpdated = new Date();
                this.CurrentDocument.userUpdatedId = this.CurrentSchool.userId;
              }

              //מחיקת הקובץ הישן
              if (this.IsChangeDoc == true && oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
                this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
              }
              // this.CurrentDocument.requiredDocumentPerSchoolId = this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId;
              // this.CurrentDocument.folderId = this.CurrentDocumentsPerSchool.folderId;
              // this.CurrentDocument.folderCreated = this.CurrentDocumentsPerSchool.folderCreated;

              this.ListDocumentsPerSchool.push(this.CurrentDocument);
              if (this.numSuccess == files.length && this.ListDocumentsPerSchool.length > 0) {
                {
                  // if (files.length == 1 && this.FolderLength == 0 && this.uniqueCodeID == 0) {
                  if (files.length == 1 && this.FolderLength == 0 && (this.ListDocumentsPerSchool[0].uniqueCodeId == null || this.ListDocumentsPerSchool[0].uniqueCodeId == 0)) {
                    //שמירה ב-DB
                    this.DocumentPerSchoolService.UploadDocumentPerSchool(this.SchoolId, this.ListDocumentsPerSchool[0], 0)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerSchool.iddocumentPerSchool == 0 || this.CurrentDocumentsPerSchool.iddocumentPerSchool == undefined)
                            &&
                            this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId != undefined &&
                            this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerSchoolId == this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerSchool>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                              // this.ListDocuments = [...this.ListDocuments.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];

                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerSchool.iddocumentPerSchool == 0 || this.CurrentDocumentsPerSchool.iddocumentPerSchool == undefined)
                              && (this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId == undefined ||
                                this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId == 0)) {
                              let arr = new Array<DocumentsPerSchool>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                              // this.ListDocuments = [...this.ListDocuments.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];

                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerSchool.iddocumentPerSchool != undefined && this.CurrentDocumentsPerSchool.iddocumentPerSchool > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerSchool == this.CurrentDocumentsPerSchool.iddocumentPerSchool);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                  // this.ListDocuments = [...this.ListDocuments.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];

                                }
                              }

                          debugger;

                          this.CurrentDocumentsPerSchool = new DocumentsPerSchool();
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ הועלה בהצלחה' });
                          var tt = [...this.ListDocuments]
                          this.ListDocuments = null
                          this.ListDocuments = [...tt.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];

                        }, er => {
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
                        });
                  }
                  else {
                    debugger
                    let nameFolder;
                    nameFolder = this.CurrentDocumentsPerSchool.folderName;
                    let CustomerId = this.SchoolService.CustomerId != null ? this.SchoolService.CustomerId : 0;
                    this.DocumentPerSchoolService.UploadFewDocumentsPerSchool(
                      this.SchoolId, this.ListDocumentsPerSchool, nameFolder, this.ListDocumentsPerSchool[0].uniqueCodeId, this.SchoolService.userId, CustomerId)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId != null && this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId > 0 && this.ListDocuments[index3][0].requiredDocumentPerSchoolId == this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId)
                                || (this.CurrentDocumentsPerSchool.exsistDocumentId != null && this.CurrentDocumentsPerSchool.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerSchool.exsistDocumentId))
                                // אם זה החלפה של קובץ בודד או העלאה של קובץ בודד תואם
                                if (this.ListDocuments[index3].length == 1) {
                                  debugger;
                                  this.ListDocuments[index3] = d;
                                  // this.ListDocuments = [...this.ListDocuments.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];

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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerSchool == this.CurrentDocumentsPerSchool.iddocumentPerSchool);
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
                            // this.ListDocuments = [...this.ListDocuments.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];

                          }
                          this.CurrentDocumentsPerSchool;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger
                          var tt = [...this.ListDocuments]
                          this.ListDocuments = null
                          this.ListDocuments = [...tt.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];

                        }
                        , e => {

                          this.CurrentDocumentsPerSchool;
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
              if (this.numSuccess == files.length && this.ListDocumentsPerSchool.length > 0) {
                {
                  // if (files.length == 1 && this.FolderLength == 0 && this.uniqueCodeID == 0) {
                  if (files.length == 1 && this.FolderLength == 0 && (this.ListDocumentsPerSchool[0].uniqueCodeId == null || this.ListDocumentsPerSchool[0].uniqueCodeId == 0)) {
                    //שמירה ב-DB
                    this.DocumentPerSchoolService.UploadDocumentPerSchool(this.SchoolId, this.ListDocumentsPerSchool[0], 0)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerSchool.iddocumentPerSchool == 0 || this.CurrentDocumentsPerSchool.iddocumentPerSchool == undefined)
                            &&
                            this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId != undefined &&
                            this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerSchoolId == this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerSchool>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                              // this.ListDocuments = [...this.ListDocuments.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];

                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerSchool.iddocumentPerSchool == 0 || this.CurrentDocumentsPerSchool.iddocumentPerSchool == undefined)
                              && (this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId == undefined ||
                                this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId == 0)) {
                              let arr = new Array<DocumentsPerSchool>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                              // this.ListDocuments = [...this.ListDocuments.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];

                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerSchool.iddocumentPerSchool != undefined && this.CurrentDocumentsPerSchool.iddocumentPerSchool > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerSchool == this.CurrentDocumentsPerSchool.iddocumentPerSchool);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                  // this.ListDocuments = [...this.ListDocuments.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];

                                }
                              }

                          debugger;

                          this.CurrentDocumentsPerSchool = new DocumentsPerSchool();
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ הועלה בהצלחה' });
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));

                        }, er => {
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
                        });
                  }
                  else {
                    debugger
                    let nameFolder;
                    nameFolder = this.CurrentDocumentsPerSchool.folderName;
                    let CustomerId = this.SchoolService.CustomerId != null ? this.SchoolService.CustomerId : 0;
                    this.DocumentPerSchoolService.UploadFewDocumentsPerSchool(
                      this.SchoolId, this.ListDocumentsPerSchool, nameFolder, this.ListDocumentsPerSchool[0].uniqueCodeId, this.SchoolService.userId, CustomerId)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId != null && this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId > 0 && this.ListDocuments[index3][0].requiredDocumentPerSchoolId == this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId)
                                || (this.CurrentDocumentsPerSchool.exsistDocumentId != null && this.CurrentDocumentsPerSchool.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerSchool.exsistDocumentId))
                                // אם זה החלפה של קובץ בודד או העלאה של קובץ בודד תואם
                                if (this.ListDocuments[index3].length == 1) {
                                  debugger;
                                  this.ListDocuments[index3] = d;
                                  // this.ListDocuments = [...this.ListDocuments.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];

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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerSchool == this.CurrentDocumentsPerSchool.iddocumentPerSchool);
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
                            // this.ListDocuments = [...this.ListDocuments.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];

                          }
                          this.CurrentDocumentsPerSchool;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));

                        }
                        , e => {

                          this.CurrentDocumentsPerSchool;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

                        });
                  }
                }
              }
              else
              debugger;
                if (this.numSuccess == files.length && this.ListDocumentsPerSchool.length == 0)
                  this.ngxService.stop();
              this.CurrentDocument = new DocumentsPerSchool();
              this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.CurrentDocumentsPerSchool.indexFolder].name + ' יש בעיה ', sticky: true });

            }
          )
      }
      this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));

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
  //     let path = this.SchoolId + "-Schools-" + this.SchoolId + "&FileName=";

  //     // if (this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId != 0 && this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId != undefined) {
  //     //   if (this.CurrentDocumentsPerSchool.iddocumentPerSchool != undefined && this.CurrentDocumentsPerSchool.iddocumentPerSchool > 0) {
  //     //     path = path + 'r' + this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId;
  //     //   }
  //     //   else
  //     //     path = path + 'r' + this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId
  //     // }
  //     // else
  //     //   path = path + this.CurrentDocumentsPerSchool.iddocumentPerSchool;
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId + "&FileName=" + this.CurrentDocumentsPerSchool.indexFolder;

  //     this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //       .subscribe(
  //         d => {
  //           debugger;
  //           oldpath = this.CurrentDocumentsPerSchool.path;
  //           this.CurrentDocumentsPerSchool.path = d;
  //           this.CurrentDocumentsPerSchool.SchoolId = this.SchoolId;
  //           this.CurrentDocumentsPerSchool.name = files[0].name;

  //           //אם זה מסמך מהנדרשים ועדיין לא קיים
  //           if (this.CurrentDocumentsPerSchool.iddocumentPerSchool == 0) {
  //             this.CurrentDocumentsPerSchool.dateCreated = new Date();
  //             this.CurrentDocumentsPerSchool.userCreated = this.CurrentSchool.userId;
  //             this.CurrentDocumentsPerSchool.schoolId = this.SchoolId;
  //           }

  //           //למסמכים קיימים
  //           else {
  //             this.CurrentDocumentsPerSchool.dateUpdated = new Date();
  //             this.CurrentDocumentsPerSchool.userUpdated = this.CurrentSchool.userId;
  //           }

  //           //מחיקת הקובץ הישן מאזור
  //           if (oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
  //             this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
  //           }

  //           // שמירת סוג הקובץ
  //           var index = this.fileD.name.lastIndexOf('.')
  //           if (index > -1) {
  //             this.type = this.fileD.name.substring(index);
  //             this.CurrentDocumentsPerSchool.name = this.fileD.name.substring(0, index);
  //           }
  //           else {
  //             this.type = '';
  //             this.CurrentDocumentsPerSchool.name = this.fileD.name;
  //           }

  //           this.CurrentDocumentsPerSchool.type = this.type;

  //           //שמירה ב-DB
  //           this.DocumentPerSchoolService.UploadDocumentPerSchool(this.SchoolId, this.SchoolId, this.CurrentDocumentsPerSchool, 0, this.uniqueCodeID)
  //             .subscribe(
  //               d => {
  //                 debugger;

  //                 //דרושים ועדיין לא קיימים
  //                 if (this.CurrentDocumentsPerSchool.iddocumentPerSchool == 0 &&
  //                   this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId != undefined &&
  //                   this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId > 0) {
  //                   let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerSchoolId == this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId);

  //                   if (y >= 0) {
  //                     let arr = new Array<DocumentsPerSchool>();
  //                     arr.push(d);
  //                     this.ListDocuments[y] = arr;
  //                   }
  //                 }
  //                 else
  //                   //דרושים וקיימים
  //                   if (this.CurrentDocumentsPerSchool.iddocumentPerSchool > 0 &&
  //                     this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId != undefined &&
  //                     this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId > 0) {

  //                     debugger;
  //                     let y;
  //                     //קובץ בודד
  //                     if (!IsFolder) {
  //                       y = this.ListDocuments.findIndex(f => f[0].iddocumentPerSchool == this.CurrentDocumentsPerSchool.iddocumentPerSchool);
  //                       if (y >= 0) {
  //                         let arr = new Array<DocumentsPerSchool>();
  //                         arr.push(d);
  //                         this.ListDocuments[y] = arr;
  //                       }
  //                     }

  //                     //קובץ מתיקיה
  //                     else {
  //                       for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
  //                         if (this.ListDocuments[index2][0].folderId == this.CurrentDocumentsPerSchool.folderId) {
  //                           y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerSchool == this.CurrentDocumentsPerSchool.iddocumentPerSchool)
  //                           if (y >= 0) {
  //                             this.ListDocuments[index2][y] = d;
  //                             break;
  //                           }
  //                         }
  //                       }
  //                     }
  //                   }
  //                 debugger;

  //                 this.CurrentDocumentsPerSchool = new DocumentsPerSchool();
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
  //     this.ListDocumentsPerSchool = new Array<DocumentsPerSchool>();

  //     debugger;
  //     this.CurrentDocument = { ...this.CurrentDocumentsPerSchool };
  //     for (let index = this.FolderLength; index < this.FolderLength + files.length; index++) {
  //       // debugger;
  //       oldpath = this.CurrentDocumentsPerSchool.path;

  //       this.fileD = files[index - this.FolderLength];
  //       let path = this.SchoolId + "-Schools-" + this.SchoolId;
  //       if (this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId != 0 && this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId != undefined)
  //         // if (this.FolderLength == 0 && this.CurrentDocumentsPerSchool.iddocumentPerSchool != 0 && this.CurrentDocumentsPerSchool.iddocumentPerSchool != undefined)
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId + "&FileName=" + index
  //       else
  //         path = path + '-' + this.CurrentDocumentsPerSchool.iddocumentPerSchool + "&FileName=" + index;

  //       this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //         .subscribe(
  //           d => {
  //             this.numSuccess++;
  //             this.CurrentDocument = { ...this.CurrentDocumentsPerSchool };
  //             this.CurrentDocument.path = d;
  //             this.CurrentDocument.SchoolId = this.SchoolId;
  //             this.CurrentDocument.folderName = this.CurrentDocumentsPerSchool.folderName;
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
  //             if (this.CurrentDocumentsPerSchool.iddocumentPerSchool == 0 || (this.CurrentDocumentsPerSchool.folderId != undefined && this.CurrentDocumentsPerSchool.folderId > 0)) {
  //               if (this.IsChangeDoc == false) {
  //                 this.CurrentDocument.dateCreated = new Date();
  //                 this.CurrentDocument.userCreated = this.CurrentSchool.userId;
  //               }
  //               else {
  //                 this.CurrentDocument.dateUpdated = new Date();
  //                 this.CurrentDocument.userUpdated = this.CurrentSchool.userId;
  //               }
  //               this.CurrentDocument.schoolId = this.SchoolId;
  //               this.CurrentDocument.requiredDocumentPerSchoolId = this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId;
  //               if (this.CurrentDocumentsPerSchool.folderId != undefined && this.CurrentDocumentsPerSchool.folderId > 0) {
  //                 this.CurrentDocument.folderId = this.CurrentDocumentsPerSchool.folderId;
  //                 this.CurrentDocument.folderCreated = this.CurrentDocumentsPerSchool.folderCreated;
  //                 if (this.IsChangeDoc == false)
  //                   this.CurrentDocument.iddocumentPerSchool = 0;
  //               }
  //             }

  //             this.ListDocumentsPerSchool.push(this.CurrentDocument);
  //             if (this.numSuccess == files.length && this.ListDocumentsPerSchool.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerSchool.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerSchool.name;

  //               this.DocumentPerSchoolService.UploadFewDocumentsPerSchool(this.SchoolId,
  //                 this.SchoolId, this.ListDocumentsPerSchool, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerSchoolId == this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId)
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
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerSchool == this.CurrentDocumentsPerSchool.iddocumentPerSchool);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerSchool;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerSchool;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }
  //           }, er => {
  //             debugger;
  //             this.numSuccess++;
  //             if (this.numSuccess == files.length && this.ListDocumentsPerSchool.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerSchool.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerSchool.name;

  //               this.DocumentPerSchoolService.UploadFewDocumentsPerSchool(this.SchoolId,
  //                 this.SchoolId, this.ListDocumentsPerSchool, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerSchoolId == this.CurrentDocumentsPerSchool.requiredDocumentPerSchoolId)
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
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerSchool == this.CurrentDocumentsPerSchool.iddocumentPerSchool);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerSchool;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerSchool;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }

  //             this.CurrentDocument = new DocumentsPerSchool();
  //             this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.FolderLength].name + ' יש בעיה ', sticky: true });

  //           }
  //         )

  //     }
  //   }

  // }

  //הצגת קובץ בחלון חדש


  DisplayDocInNewWindow(doc: DocumentsPerSchool) {

    window.open(doc.path);
  }

  //הורדת קובץ
  DownloadDoc(doc: DocumentsPerSchool) {
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
  DownloadFewDoc(docs: DocumentsPerSchool[]) {
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
  DeleteDoc(doc: DocumentsPerSchool, IsFolder: boolean = false) {
    debugger;

    let uniqueCodeId;
    uniqueCodeId = doc.uniqueCodeId != null ? doc.uniqueCodeId : 0;
    this.DocumentPerSchoolService.DeleteDocumentPerSchool(doc.iddocumentPerSchool, this.SchoolId, uniqueCodeId).subscribe(s => {
      debugger;
      var path;
      // ------
      path = doc.path;


      // אם זה מחיקת קובץ מתיקיה
      if (IsFolder) {
        let y;
        for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
          if (this.ListDocuments[index2][0].folderId == doc.folderId) {
            y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerSchool == doc.iddocumentPerSchool)
            if (y >= 0) {
              this.ListDocuments[index2].splice(y, 1);

              //באם מחקו קובץ מתיקיה ונשאר קובץ בודד
              if (this.ListDocuments[index2].length == 1) {
                // this.ListDocuments[index2][0].name = s;
                this.IsFolder = false;
                this.ListDocuments[index2][0].folderId = null;

              }
              break
            }
          }

        }
      }

      //אם זה קובץ מהדרושים
      else
        if (doc.requiredDocumentPerSchoolId != undefined) {

          doc.dateUpdated = undefined;
          doc.iddocumentPerSchool = 0;
          doc.path = undefined;
          doc.userUpdatedId = undefined;
          doc.userUpdatedId = undefined;
          doc.dateCreated = undefined;
          doc.name = s;
          doc.type = undefined;
          doc.folderId = null;
          doc.folderName = s;
          doc.indexFolder = 0;
          doc.uniqueCodeId = undefined;

        }

        else
          //   קבצים קיימים ולא דרושים
          if (doc.iddocumentPerSchool > 0 && (doc.requiredDocumentPerSchoolId == undefined || doc.requiredDocumentPerSchoolId == 0)) {
            let x = this.ListDocuments.findIndex(f => f[0].iddocumentPerSchool == doc.iddocumentPerSchool);
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
  DeleteFewDoc(docs: DocumentsPerSchool[]) {

    this.ngxService.start();
    // ------
    // var path : Array<string>= new Array<string>();
    debugger;
    console.log(docs[0].folderId);
    var unique = docs[0].uniqueCodeId;
    if (unique == null)
      unique = 0;

    let requiredDocumentPerSchoolId = docs[0].requiredDocumentPerSchoolId != undefined ? docs[0].requiredDocumentPerSchoolId : 0;
    //מחיקת הקבצים מהמסד נתונים
    this.DocumentPerSchoolService.DeleteFewDocumentPerSchool(docs[0].folderId, requiredDocumentPerSchoolId, this.SchoolId, unique).subscribe(
      s => {
        debugger;

        for (let index = 0; index < this.ListDocuments.length; index++) {
          if (this.ListDocuments[index] == docs)
            if (s != undefined && s.requiredDocumentPerSchoolId > 0) {
              let x = new Array<DocumentsPerSchool>();

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
  OpenFolder(docs: DocumentsPerSchool[]) {
    this.ListFilesOnFolder = docs;
    this.IsFolder = true;
    this.IsEditName = false;
  }

  //דיאלוג לשאלה אם רוצה למחוק תיקיה
  confirmFolder(docs: DocumentsPerSchool[]) {
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
  confirmDeleteFile(doc: DocumentsPerSchool, IsFolder: boolean = false) {
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
  ChangeNameDoc(doc: DocumentsPerSchool) {
    this.IsEditName = true;
    this.NameFile = doc.name;
    this.idfile = doc.iddocumentPerSchool;
  }

  //שמירת ההחלפת שם לקובץ
  SaveNameFile(doc: DocumentsPerSchool, FolderId: number = 0) {
    debugger;
    this.IsEditName = false;
    var uniqeId = doc.uniqueCodeId != null ? doc.uniqueCodeId : 0;
    this.DocumentPerSchoolService.SaveNameFile(this.idfile, this.NameFile, uniqeId).subscribe(
      da => {
        if (FolderId > 0) {
          for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
            if (this.ListDocuments[index2][0].folderId == FolderId) {
              let y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerSchool == this.idfile)
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
            if (element[0].iddocumentPerSchool == this.idfile) {
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
  //אם כן מחזיר -FALSE
  //אם לא מחזיר -TRUE
  isAllFilesOpenByThisUser(doc: DocumentsPerSchool[]) {
    let index = doc.findIndex(f => f.userCreatedId != this.SchoolService.ListSchool[0].userId)
    return (index != null && index > -1);
  }
debbuger;
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
  AddNewDocumentsPerSchool() {
    debugger;
    this.CurrentDocumentsPerSchool = new DocumentsPerSchool();
    this.CurrentDocumentsPerSchool.schoolId = this.SchoolId;
    this.CurrentDocumentsPerSchool.indexFolder = 0;
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
          this.CurrentDocumentsPerSchool.exsistDocumentId = data;
        this.CurrentDocumentsPerSchool.folderName = this.CurrentDocumentsPerSchool.name;

        this.uploadDocument(this.filesLst, true, false);

      },
      er => {
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
      }
    );
  }
}
