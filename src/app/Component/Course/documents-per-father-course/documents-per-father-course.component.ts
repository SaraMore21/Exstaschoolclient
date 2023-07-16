import { ExsistDocumentService } from './../../../Service/exsist-document.service';
import { FilesAzureService } from './../../../Service/files-azure.service';
import { SchoolService } from './../../../Service/school.service';
import { DocumentPerFatherCourseService } from './../../../Service/document-per-father-course.service';
import { DocumentsPerFatherCourse } from './../../../Class/documents-per-father-course';

import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import * as fileSaver from 'file-saver';
import { FatherCourseService } from 'src/app/Service/father-course.service';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';

@Component({
  selector: 'app-documents-per-father-course',
  templateUrl: './documents-per-father-course.component.html',
  styleUrls: ['./documents-per-father-course.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService]
})
export class DocumentsPerFatherCourseComponent implements OnInit {

  //החלונית של בחירת קובץ בודד
  @ViewChild('file') fileInput: ElementRef;
  //חלונית לבחיקת קבצים מרובים
  @ViewChild('file2') fileInput2: ElementRef;

  ListDocuments: any;// Array<DocumentsPerFatherCourse> = new Array<DocumentsPerFatherCourse>();
  FatherCourseId: number;
  fileD: File;
  CurrentDocumentsPerFatherCourse: DocumentsPerFatherCourse;
  //משתנה מסמל להצגת הקובץ באותו חלון
  visible = false;
  path: any;
  passport: DocumentsPerFatherCourse = new DocumentsPerFatherCourse();
  //מסמכים להעלות לתיקיה
  ListDocumentsPerFatherCourse: Array<DocumentsPerFatherCourse> = new Array<DocumentsPerFatherCourse>();
  //משתנה המונה את מספר הנסיונות העלאת קבצים כדי לדעת מתי הוא באחרון
  numSuccess: number = 0;
  CurrentDocument: DocumentsPerFatherCourse;
  IsFolder = false;
  ListFilesOnFolder: Array<DocumentsPerFatherCourse>;
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
  // ------------
  IsFieldDisplay = false;
  collapsed: boolean = false;

  constructor(private confirmationService: ConfirmationService, public DocumentPerFatherCourseService: DocumentPerFatherCourseService,
    public SchoolService: SchoolService, public FatherCourseService: FatherCourseService, private active: ActivatedRoute, public router: Router,
    private FilesAzureService: FilesAzureService, private ExsistDocumentService: ExsistDocumentService,
    public sanitizer: DomSanitizer, private ngxService: NgxUiLoaderService,
    private messageService: MessageService, public GenericFunctionService: GenericFunctionService) {
  }

  ngOnInit(): void {

    if (this.SchoolService.ListSchool == null || this.SchoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.active.params.subscribe(c => { this.FatherCourseId = c["id"] })
    this.active.params.subscribe(c => { this.SchoolId = c["schoolId"] })
    this.active.params.subscribe(c => { this.uniqueCodeID = c["uniqueCodeID"] })
    debugger;

    this.CurrentSchool = this.SchoolService.ListSchool.find(f => f.school.idschool == this.SchoolId)
    var CurrentFatherCourse = this.FatherCourseService.ListFatherCourse.find(f => f.idcourse == this.FatherCourseId);
    if (this.CurrentSchool.appYearbookPerSchools.find(f => f.idyearbookPerSchool == CurrentFatherCourse.yearbookId).yearbookId != this.SchoolService.SelectYearbook.idyearbook)
      this.GenericFunctionService.GoBackToLastPage();

    this.DocumentPerFatherCourseService.getLstDocumentPerFatherCourse(this.SchoolId, this.FatherCourseId)
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
  ChangeDoc(doc: DocumentsPerFatherCourse, IsMultiple: boolean = true, FolderLength: number = 0, IsChange: boolean = false, lengthFolder: number = 0) {
    debugger;
    this.FolderLength = FolderLength;
    this.IsChangeDoc = IsChange;
    this.CurrentDocumentsPerFatherCourse = new DocumentsPerFatherCourse();
    this.CurrentDocumentsPerFatherCourse = { ...doc };
    let event = new MouseEvent('click', { bubbles: false });
    if (IsMultiple)
      this.fileInput.nativeElement.dispatchEvent(event);
    else
      this.fileInput2.nativeElement.dispatchEvent(event);
    // if (FolderLength > 0 && this.CurrentDocumentsPerFatherCourse.folderName != null)
    //   this.CurrentDocumentsPerFatherCourse.name = this.CurrentDocumentsPerFatherCourse.folderName;
  }

  //הצגת קובץ
  DisplayDoc(doc: DocumentsPerFatherCourse) {
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
      this.ListDocumentsPerFatherCourse = new Array<DocumentsPerFatherCourse>();

      debugger;
      this.CurrentDocument = { ...this.CurrentDocumentsPerFatherCourse };
      let path = this.SchoolId + "-FatherCourses-" + this.FatherCourseId + '-';

      //נדרשים
      if (this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId != null && this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId > 0)
        path = path + 'r' + this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId + "&FileName=";
      //קיימים ולא דרושים
      else
        path = path + 'd' + this.CurrentDocumentsPerFatherCourse.exsistDocumentId + "&FileName=";

      for (let index = this.CurrentDocumentsPerFatherCourse.indexFolder; index < this.CurrentDocumentsPerFatherCourse.indexFolder + files.length; index++) {
        oldpath = this.CurrentDocumentsPerFatherCourse.path;
        pathDoc = path + index;
        this.fileD = files[index - this.CurrentDocumentsPerFatherCourse.indexFolder];

        this.FilesAzureService.uploadFileToAzure(this.fileD, pathDoc, this.SchoolId)
          .subscribe(
            d => {
              this.numSuccess++;
              this.CurrentDocument = { ...this.CurrentDocumentsPerFatherCourse };
              this.CurrentDocument.path = d;
              this.CurrentDocument.fatherCourseId = this.FatherCourseId;
              this.CurrentDocument.name = files[index - this.CurrentDocumentsPerFatherCourse.indexFolder].name;
              this.CurrentDocument.schoolId = this.SchoolId;

              // שמירת סוג הקובץ
              var index2 = files[index - this.CurrentDocumentsPerFatherCourse.indexFolder].name.lastIndexOf('.')
              if (index2 > -1) {
                this.type = files[index - this.CurrentDocumentsPerFatherCourse.indexFolder].name.substring(index2);
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerFatherCourse.indexFolder].name.substring(0, index2);

              }
              else {
                this.type = '';
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerFatherCourse.indexFolder].name;
              }
              this.CurrentDocument.type = this.type;

              if (this.IsChangeDoc == false) {
                this.CurrentDocument.dateCreated = new Date();
                this.CurrentDocument.userCreatedId = this.CurrentSchool.userId;
                this.CurrentDocument.iddocumentPerFatherCourse = 0;
              }
              else {
                this.CurrentDocument.dateUpdated = new Date();
                this.CurrentDocument.userUpdatedId = this.CurrentSchool.userId;
              }

              //מחיקת הקובץ הישן
              if (this.IsChangeDoc == true && oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
                this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
              }
              // this.CurrentDocument.requiredDocumentPerFatherCourseId = this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId;
              // this.CurrentDocument.folderId = this.CurrentDocumentsPerFatherCourse.folderId;
              // this.CurrentDocument.folderCreated = this.CurrentDocumentsPerFatherCourse.folderCreated;

              this.ListDocumentsPerFatherCourse.push(this.CurrentDocument);
              if (this.numSuccess == files.length && this.ListDocumentsPerFatherCourse.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0 && this.uniqueCodeID == 0) {
                    //שמירה ב-DB
                    this.DocumentPerFatherCourseService.UploadDocumentPerFatherCourse(this.SchoolId, this.FatherCourseId, this.ListDocumentsPerFatherCourse[0], 0, this.uniqueCodeID)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse == 0 || this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse == undefined)
                            &&
                            this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId != undefined &&
                            this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerFatherCourseId == this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerFatherCourse>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse == 0 || this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse == undefined)
                              && (this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId == undefined ||
                                this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId == 0)) {
                              let arr = new Array<DocumentsPerFatherCourse>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse != undefined && this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerFatherCourse == this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }

                          debugger;

                          this.CurrentDocumentsPerFatherCourse = new DocumentsPerFatherCourse();
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ הועלה בהצלחה' });
                          // var tt = [...this.ListDocuments]
                          // this.ListDocuments = null
                          // this.ListDocuments = [...tt.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];
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
                    nameFolder = this.CurrentDocumentsPerFatherCourse.folderName;
                    let CustomerId = this.SchoolService.CustomerId != null ? this.SchoolService.CustomerId : 0;
                    this.DocumentPerFatherCourseService.UploadFewDocumentsPerFatherCourse(this.SchoolId,
                      this.FatherCourseId, this.ListDocumentsPerFatherCourse, nameFolder, this.uniqueCodeID, this.SchoolService.userId, CustomerId)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId != null && this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId > 0 && this.ListDocuments[index3][0].requiredDocumentPerFatherCourseId == this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId)
                                || (this.CurrentDocumentsPerFatherCourse.exsistDocumentId != null && this.CurrentDocumentsPerFatherCourse.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerFatherCourse.exsistDocumentId))
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerFatherCourse == this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse);
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
                          this.CurrentDocumentsPerFatherCourse;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          // ------------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));

                          debugger

                        }
                        , e => {

                          this.CurrentDocumentsPerFatherCourse;
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
              if (this.numSuccess == files.length && this.ListDocumentsPerFatherCourse.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0 && this.uniqueCodeID == 0) {
                    //שמירה ב-DB
                    this.DocumentPerFatherCourseService.UploadDocumentPerFatherCourse(this.SchoolId, this.FatherCourseId, this.ListDocumentsPerFatherCourse[0], 0, this.uniqueCodeID)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse == 0 || this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse == undefined)
                            &&
                            this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId != undefined &&
                            this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerFatherCourseId == this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerFatherCourse>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse == 0 || this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse == undefined)
                              && (this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId == undefined ||
                                this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId == 0)) {
                              let arr = new Array<DocumentsPerFatherCourse>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse != undefined && this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerFatherCourse == this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }

                          debugger;

                          this.CurrentDocumentsPerFatherCourse = new DocumentsPerFatherCourse();
                          this.ngxService.stop();
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקובץ הועלה בהצלחה' });
                          // var tt = [...this.ListDocuments]
                          // this.ListDocuments = null
                          // this.ListDocuments = [...tt.sort((a, b) => (a[0].folderId > b[0].folderId ? -1 : 1))];
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
                    nameFolder = this.CurrentDocumentsPerFatherCourse.folderName;
                    let CustomerId = this.SchoolService.CustomerId != null ? this.SchoolService.CustomerId : 0;
                    this.DocumentPerFatherCourseService.UploadFewDocumentsPerFatherCourse(this.SchoolId,
                      this.FatherCourseId, this.ListDocumentsPerFatherCourse, nameFolder, this.uniqueCodeID, this.SchoolService.userId, CustomerId)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId != null && this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId > 0 && this.ListDocuments[index3][0].requiredDocumentPerFatherCourseId == this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId)
                                || (this.CurrentDocumentsPerFatherCourse.exsistDocumentId != null && this.CurrentDocumentsPerFatherCourse.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerFatherCourse.exsistDocumentId))
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerFatherCourse == this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse);
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
                          this.CurrentDocumentsPerFatherCourse;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          // ------------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));

                          debugger

                        }
                        , e => {

                          this.CurrentDocumentsPerFatherCourse;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

                        });
                  }
                }
              }
              else
                if (this.numSuccess == files.length && this.ListDocumentsPerFatherCourse.length == 0)
                  this.ngxService.stop();
              this.CurrentDocument = new DocumentsPerFatherCourse();
              this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.CurrentDocumentsPerFatherCourse.indexFolder].name + ' יש בעיה ', sticky: true });

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
  //     let path = this.SchoolId + "-FatherCourses-" + this.FatherCourseId + "&FileName=";

  //     // if (this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId != 0 && this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId != undefined) {
  //     //   if (this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse != undefined && this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse > 0) {
  //     //     path = path + 'r' + this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId;
  //     //   }
  //     //   else
  //     //     path = path + 'r' + this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId
  //     // }
  //     // else
  //     //   path = path + this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse;
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId + "&FileName=" + this.CurrentDocumentsPerFatherCourse.indexFolder;

  //     this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //       .subscribe(
  //         d => {
  //           debugger;
  //           oldpath = this.CurrentDocumentsPerFatherCourse.path;
  //           this.CurrentDocumentsPerFatherCourse.path = d;
  //           this.CurrentDocumentsPerFatherCourse.FatherCourseId = this.FatherCourseId;
  //           this.CurrentDocumentsPerFatherCourse.name = files[0].name;

  //           //אם זה מסמך מהנדרשים ועדיין לא קיים
  //           if (this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse == 0) {
  //             this.CurrentDocumentsPerFatherCourse.dateCreated = new Date();
  //             this.CurrentDocumentsPerFatherCourse.userCreated = this.CurrentSchool.userId;
  //             this.CurrentDocumentsPerFatherCourse.schoolId = this.SchoolId;
  //           }

  //           //למסמכים קיימים
  //           else {
  //             this.CurrentDocumentsPerFatherCourse.dateUpdated = new Date();
  //             this.CurrentDocumentsPerFatherCourse.userUpdated = this.CurrentSchool.userId;
  //           }

  //           //מחיקת הקובץ הישן מאזור
  //           if (oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
  //             this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
  //           }

  //           // שמירת סוג הקובץ
  //           var index = this.fileD.name.lastIndexOf('.')
  //           if (index > -1) {
  //             this.type = this.fileD.name.substring(index);
  //             this.CurrentDocumentsPerFatherCourse.name = this.fileD.name.substring(0, index);
  //           }
  //           else {
  //             this.type = '';
  //             this.CurrentDocumentsPerFatherCourse.name = this.fileD.name;
  //           }

  //           this.CurrentDocumentsPerFatherCourse.type = this.type;

  //           //שמירה ב-DB
  //           this.DocumentPerFatherCourseService.UploadDocumentPerFatherCourse(this.SchoolId, this.FatherCourseId, this.CurrentDocumentsPerFatherCourse, 0, this.uniqueCodeID)
  //             .subscribe(
  //               d => {
  //                 debugger;

  //                 //דרושים ועדיין לא קיימים
  //                 if (this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse == 0 &&
  //                   this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId != undefined &&
  //                   this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId > 0) {
  //                   let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerFatherCourseId == this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId);

  //                   if (y >= 0) {
  //                     let arr = new Array<DocumentsPerFatherCourse>();
  //                     arr.push(d);
  //                     this.ListDocuments[y] = arr;
  //                   }
  //                 }
  //                 else
  //                   //דרושים וקיימים
  //                   if (this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse > 0 &&
  //                     this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId != undefined &&
  //                     this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId > 0) {

  //                     debugger;
  //                     let y;
  //                     //קובץ בודד
  //                     if (!IsFolder) {
  //                       y = this.ListDocuments.findIndex(f => f[0].iddocumentPerFatherCourse == this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse);
  //                       if (y >= 0) {
  //                         let arr = new Array<DocumentsPerFatherCourse>();
  //                         arr.push(d);
  //                         this.ListDocuments[y] = arr;
  //                       }
  //                     }

  //                     //קובץ מתיקיה
  //                     else {
  //                       for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
  //                         if (this.ListDocuments[index2][0].folderId == this.CurrentDocumentsPerFatherCourse.folderId) {
  //                           y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerFatherCourse == this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse)
  //                           if (y >= 0) {
  //                             this.ListDocuments[index2][y] = d;
  //                             break;
  //                           }
  //                         }
  //                       }
  //                     }
  //                   }
  //                 debugger;

  //                 this.CurrentDocumentsPerFatherCourse = new DocumentsPerFatherCourse();
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
  //     this.ListDocumentsPerFatherCourse = new Array<DocumentsPerFatherCourse>();

  //     debugger;
  //     this.CurrentDocument = { ...this.CurrentDocumentsPerFatherCourse };
  //     for (let index = this.FolderLength; index < this.FolderLength + files.length; index++) {
  //       // debugger;
  //       oldpath = this.CurrentDocumentsPerFatherCourse.path;

  //       this.fileD = files[index - this.FolderLength];
  //       let path = this.SchoolId + "-FatherCourses-" + this.FatherCourseId;
  //       if (this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId != 0 && this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId != undefined)
  //         // if (this.FolderLength == 0 && this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse != 0 && this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse != undefined)
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId + "&FileName=" + index
  //       else
  //         path = path + '-' + this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse + "&FileName=" + index;

  //       this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //         .subscribe(
  //           d => {
  //             this.numSuccess++;
  //             this.CurrentDocument = { ...this.CurrentDocumentsPerFatherCourse };
  //             this.CurrentDocument.path = d;
  //             this.CurrentDocument.FatherCourseId = this.FatherCourseId;
  //             this.CurrentDocument.folderName = this.CurrentDocumentsPerFatherCourse.folderName;
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
  //             if (this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse == 0 || (this.CurrentDocumentsPerFatherCourse.folderId != undefined && this.CurrentDocumentsPerFatherCourse.folderId > 0)) {
  //               if (this.IsChangeDoc == false) {
  //                 this.CurrentDocument.dateCreated = new Date();
  //                 this.CurrentDocument.userCreated = this.CurrentSchool.userId;
  //               }
  //               else {
  //                 this.CurrentDocument.dateUpdated = new Date();
  //                 this.CurrentDocument.userUpdated = this.CurrentSchool.userId;
  //               }
  //               this.CurrentDocument.schoolId = this.SchoolId;
  //               this.CurrentDocument.requiredDocumentPerFatherCourseId = this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId;
  //               if (this.CurrentDocumentsPerFatherCourse.folderId != undefined && this.CurrentDocumentsPerFatherCourse.folderId > 0) {
  //                 this.CurrentDocument.folderId = this.CurrentDocumentsPerFatherCourse.folderId;
  //                 this.CurrentDocument.folderCreated = this.CurrentDocumentsPerFatherCourse.folderCreated;
  //                 if (this.IsChangeDoc == false)
  //                   this.CurrentDocument.iddocumentPerFatherCourse = 0;
  //               }
  //             }

  //             this.ListDocumentsPerFatherCourse.push(this.CurrentDocument);
  //             if (this.numSuccess == files.length && this.ListDocumentsPerFatherCourse.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerFatherCourse.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerFatherCourse.name;

  //               this.DocumentPerFatherCourseService.UploadFewDocumentsPerFatherCourse(this.SchoolId,
  //                 this.FatherCourseId, this.ListDocumentsPerFatherCourse, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerFatherCourseId == this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId)
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
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerFatherCourse == this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerFatherCourse;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerFatherCourse;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }
  //           }, er => {
  //             debugger;
  //             this.numSuccess++;
  //             if (this.numSuccess == files.length && this.ListDocumentsPerFatherCourse.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerFatherCourse.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerFatherCourse.name;

  //               this.DocumentPerFatherCourseService.UploadFewDocumentsPerFatherCourse(this.SchoolId,
  //                 this.FatherCourseId, this.ListDocumentsPerFatherCourse, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerFatherCourseId == this.CurrentDocumentsPerFatherCourse.requiredDocumentPerFatherCourseId)
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
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerFatherCourse == this.CurrentDocumentsPerFatherCourse.iddocumentPerFatherCourse);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerFatherCourse;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerFatherCourse;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }

  //             this.CurrentDocument = new DocumentsPerFatherCourse();
  //             this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.FolderLength].name + ' יש בעיה ', sticky: true });

  //           }
  //         )

  //     }
  //   }

  // }

  //הצגת קובץ בחלון חדש


  DisplayDocInNewWindow(doc: DocumentsPerFatherCourse) {

    window.open(doc.path);
  }

  //הורדת קובץ
  DownloadDoc(doc: DocumentsPerFatherCourse) {
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
  DownloadFewDoc(docs: DocumentsPerFatherCourse[]) {
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
  DeleteDoc(doc: DocumentsPerFatherCourse, IsFolder: boolean = false) {
    debugger;

    // ------------
    var path;
    path = doc.path;

    let uniqueCodeId;
    uniqueCodeId = doc.uniqueCodeId != null ? doc.uniqueCodeId : 0;
    this.DocumentPerFatherCourseService.DeleteDocumentPerFatherCourse(doc.iddocumentPerFatherCourse, this.FatherCourseId, uniqueCodeId).subscribe(s => {
      debugger;

      // אם זה מחיקת קובץ מתיקיה
      if (IsFolder) {
        let y;
        for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
          if (this.ListDocuments[index2][0].folderId == doc.folderId) {
            y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerFatherCourse == doc.iddocumentPerFatherCourse)
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
        if (doc.requiredDocumentPerFatherCourseId != undefined) {
          doc.dateUpdated = undefined;
          doc.iddocumentPerFatherCourse = 0;
          doc.path = undefined;
          doc.userUpdatedId = undefined;
          doc.userUpdatedId = undefined;
          doc.dateCreated = undefined;
          doc.name = s;
          doc.type = undefined;
          // ------------
          doc.folderId = null;
          doc.folderName = s;
          doc.indexFolder = 0;
          doc.uniqueCodeId = undefined;

        }

        else
          //   קבצים קיימים ולא דרושים
          if (doc.iddocumentPerFatherCourse > 0 && (doc.requiredDocumentPerFatherCourseId == undefined || doc.requiredDocumentPerFatherCourseId == 0)) {
            let x = this.ListDocuments.findIndex(f => f[0].iddocumentPerFatherCourse == doc.iddocumentPerFatherCourse);
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
  DeleteFewDoc(docs: DocumentsPerFatherCourse[]) {

    this.ngxService.start();

    debugger;
    console.log(docs[0].folderId);
    var unique = docs[0].uniqueCodeId;
    if (unique == null)
      unique = 0;

    let requiredDocumentPerFatherCourseId = docs[0].requiredDocumentPerFatherCourseId != undefined ? docs[0].requiredDocumentPerFatherCourseId : 0;
    //מחיקת הקבצים מהמסד נתונים
    this.DocumentPerFatherCourseService.DeleteFewDocumentPerFatherCourse(docs[0].folderId, requiredDocumentPerFatherCourseId, this.FatherCourseId, unique).subscribe(
      s => {
        debugger;

        for (let index = 0; index < this.ListDocuments.length; index++) {
          if (this.ListDocuments[index] == docs)
            if (s != undefined && s.requiredDocumentPerFatherCourseId > 0) {
              let x = new Array<DocumentsPerFatherCourse>();
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
  OpenFolder(docs: DocumentsPerFatherCourse[]) {
    this.ListFilesOnFolder = docs;
    this.IsFolder = true;
    this.IsEditName = false;
  }

  //דיאלוג לשאלה אם רוצה למחוק תיקיה
  confirmFolder(docs: DocumentsPerFatherCourse[]) {
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
  confirmDeleteFile(doc: DocumentsPerFatherCourse, IsFolder: boolean = false) {
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
  ChangeNameDoc(doc: DocumentsPerFatherCourse) {
    debugger;
    this.IsEditName = true;
    this.NameFile = doc.name;
    this.idfile = doc.iddocumentPerFatherCourse;
  }

  //שמירת ההחלפת שם לקובץ
  SaveNameFile(doc: DocumentsPerFatherCourse, FolderId: number = 0) {
    debugger;
    this.IsEditName = false;
    var uniqeId = doc.uniqueCodeId != null ? doc.uniqueCodeId : 0;
    this.DocumentPerFatherCourseService.SaveNameFile(this.idfile, this.NameFile, uniqeId).subscribe(
      da => {
        if (FolderId > 0) {
          for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
            if (this.ListDocuments[index2][0].folderId == FolderId) {
              let y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerFatherCourse == this.idfile)
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
            if (element[0].iddocumentPerFatherCourse == this.idfile) {
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
  isAllFilesOpenByThisUser(doc: DocumentsPerFatherCourse[]) {
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
  AddNewDocumentsPerFatherCourse() {
    debugger;
    this.CurrentDocumentsPerFatherCourse = new DocumentsPerFatherCourse();
    this.CurrentDocumentsPerFatherCourse.schoolId = this.SchoolId;
    this.CurrentDocumentsPerFatherCourse.fatherCourseId = this.FatherCourseId;
    this.CurrentDocumentsPerFatherCourse.indexFolder = 0;
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
          this.CurrentDocumentsPerFatherCourse.exsistDocumentId = data;
        this.CurrentDocumentsPerFatherCourse.folderName = this.CurrentDocumentsPerFatherCourse.name;

        this.uploadDocument(this.filesLst, true, false);

      },
      er => {
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
      }
    );
  }
}
