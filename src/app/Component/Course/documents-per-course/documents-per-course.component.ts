import { ExsistDocumentService } from './../../../Service/exsist-document.service';
import { FilesAzureService } from './../../../Service/files-azure.service';
import { SchoolService } from './../../../Service/school.service';
import { DocumentPerCourseService } from './../../../Service/document-per-Course.service';
import { DocumentsPerCourse } from './../../../Class/documents-per-Course';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import * as fileSaver from 'file-saver';
import { CourseService } from 'src/app/Service/course.service';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';


@Component({
  selector: 'app-documents-per-course',
  templateUrl: './documents-per-course.component.html',
  styleUrls: ['./documents-per-course.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService]
})

export class DocumentsPerCourseComponent implements OnInit {
  //החלונית של בחירת קובץ בודד
  @ViewChild('file') fileInput: ElementRef;
  //חלונית לבחיקת קבצים מרובים
  @ViewChild('file2') fileInput2: ElementRef;

  ListDocuments: any;// Array<DocumentsPerCourse> = new Array<DocumentsPerCourse>();
  CourseId: number;
  fileD: File;
  CurrentDocumentsPerCourse: DocumentsPerCourse;
  //משתנה מסמל להצגת הקובץ באותו חלון
  visible = false;
  path: any;
  //מסמכים להעלות לתיקיה
  ListDocumentsPerCourse: Array<DocumentsPerCourse> = new Array<DocumentsPerCourse>();
  //משתנה המונה את מספר הנסיונות העלאת קבצים כדי לדעת מתי הוא באחרון
  numSuccess: number = 0;
  CurrentDocument: DocumentsPerCourse;
  IsFolder = false;
  ListFilesOnFolder: Array<DocumentsPerCourse>;
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

  constructor(private confirmationService: ConfirmationService, public DocumentPerCourseService: DocumentPerCourseService,
    public SchoolService: SchoolService, public CourseService: CourseService, private active: ActivatedRoute, public router: Router,
    private FilesAzureService: FilesAzureService, private ExsistDocumentService: ExsistDocumentService,
    public sanitizer: DomSanitizer, private ngxService: NgxUiLoaderService,
    private messageService: MessageService, public GenericFunctionService: GenericFunctionService) {
  }

  ngOnInit(): void {

    if (this.SchoolService.ListSchool == null || this.SchoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.active.params.subscribe(c => { this.CourseId = c["id"] })
    this.active.params.subscribe(c => { this.SchoolId = c["schoolId"] })
    this.active.params.subscribe(c => { this.YearbookPerSchool = c["YearbookPerSchool"] })

    debugger;

    this.CurrentSchool = this.SchoolService.ListSchool.find(f => f.school.idschool == this.SchoolId)
    // var CurrentCourse = this.CourseService.ListCourse.find(f => f.idcourse == this.CourseId);
    if (this.CurrentSchool.appYearbookPerSchools.find(f => f.idyearbookPerSchool == this.YearbookPerSchool).yearbookId != this.SchoolService.SelectYearbook.idyearbook)
      this.GenericFunctionService.GoBackToLastPage();

    this.DocumentPerCourseService.getLstDocumentPerCourse(this.SchoolId, this.CourseId)
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
  ChangeDoc(doc: DocumentsPerCourse, IsMultiple: boolean = true, FolderLength: number = 0, IsChange: boolean = false, lengthFolder: number = 0) {
    debugger;
    this.FolderLength = FolderLength;
    this.IsChangeDoc = IsChange;
    this.CurrentDocumentsPerCourse = new DocumentsPerCourse();
    this.CurrentDocumentsPerCourse = { ...doc };
    let event = new MouseEvent('click', { bubbles: false });
    if (IsMultiple)
      this.fileInput.nativeElement.dispatchEvent(event);
    else
      this.fileInput2.nativeElement.dispatchEvent(event);
    // if (FolderLength > 0 && this.CurrentDocumentsPerCourse.folderName != null)
    //   this.CurrentDocumentsPerCourse.name = this.CurrentDocumentsPerCourse.folderName;
  }

  //הצגת קובץ
  DisplayDoc(doc: DocumentsPerCourse) {
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
      this.ListDocumentsPerCourse = new Array<DocumentsPerCourse>();

      debugger;
      this.CurrentDocument = { ...this.CurrentDocumentsPerCourse };
      let path = this.SchoolId + "-Courses-" + this.CourseId + '-';
      let flag: boolean = false
      //נדרשים
      if (this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId != null && this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId > 0) {
        path = path + 'r' + this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId + "&FileName=";
        flag = confirm("האם ברצונך להשאיר את השם של הקובץ כפי שמופיע באתר?")
      }
      //קיימים ולא דרושים
      else
        path = path + 'd' + this.CurrentDocumentsPerCourse.exsistDocumentId + "&FileName=";

      for (let index = this.CurrentDocumentsPerCourse.indexFolder; index < this.CurrentDocumentsPerCourse.indexFolder + files.length; index++) {
        oldpath = this.CurrentDocumentsPerCourse.path;
        pathDoc = path + index;
        this.fileD = files[index - this.CurrentDocumentsPerCourse.indexFolder];
        if (flag) {
          const newFile = new File([this.fileD], this.CurrentDocument.name, { type: this.fileD.type });
          this.fileD = newFile
        }

        this.FilesAzureService.uploadFileToAzure(this.fileD, pathDoc, this.SchoolId)
          .subscribe(
            d => {
              this.numSuccess++;
              this.CurrentDocument = { ...this.CurrentDocumentsPerCourse };
              this.CurrentDocument.path = d;
              this.CurrentDocument.courseId = this.CourseId;
              if (!flag)
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerCourse.indexFolder].name;
              this.CurrentDocument.schoolId = this.SchoolId;

              // שמירת סוג הקובץ
              var index2 = files[index - this.CurrentDocumentsPerCourse.indexFolder].name.lastIndexOf('.')
              if (index2 > -1) {
                this.type = files[index - this.CurrentDocumentsPerCourse.indexFolder].name.substring(index2);
                if (!flag)
                  this.CurrentDocument.name = files[index - this.CurrentDocumentsPerCourse.indexFolder].name.substring(0, index2);

              }
              else {
                this.type = '';
                if (!flag)
                  this.CurrentDocument.name = files[index - this.CurrentDocumentsPerCourse.indexFolder].name;
              }
              this.CurrentDocument.type = this.type;

              if (this.IsChangeDoc == false) {
                this.CurrentDocument.dateCreated = new Date();
                this.CurrentDocument.userCreatedId = this.CurrentSchool.userId;
                this.CurrentDocument.iddocumentPerCourse = 0;
              }
              else {
                this.CurrentDocument.dateUpdated = new Date();
                this.CurrentDocument.userUpdatedId = this.CurrentSchool.userId;
              }

              //מחיקת הקובץ הישן
              if (this.IsChangeDoc == true && oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
                this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
              }
              // this.CurrentDocument.requiredDocumentPerCourseId = this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId;
              // this.CurrentDocument.folderId = this.CurrentDocumentsPerCourse.folderId;
              // this.CurrentDocument.folderCreated = this.CurrentDocumentsPerCourse.folderCreated;

              this.ListDocumentsPerCourse.push(this.CurrentDocument);
              if (this.numSuccess == files.length && this.ListDocumentsPerCourse.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0) {
                    //שמירה ב-DB
                    this.DocumentPerCourseService.UploadDocumentPerCourse(this.SchoolId, this.CourseId, this.ListDocumentsPerCourse[0], 0)
                      .subscribe(
                        d => {
                          debugger;


                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerCourse.iddocumentPerCourse == 0 || this.CurrentDocumentsPerCourse.iddocumentPerCourse == undefined)
                            &&
                            this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId != undefined &&
                            this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerCourseId == this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerCourse>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerCourse.iddocumentPerCourse == 0 || this.CurrentDocumentsPerCourse.iddocumentPerCourse == undefined)
                              && (this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId == undefined ||
                                this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId == 0)) {
                              let arr = new Array<DocumentsPerCourse>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerCourse.iddocumentPerCourse != undefined && this.CurrentDocumentsPerCourse.iddocumentPerCourse > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerCourse == this.CurrentDocumentsPerCourse.iddocumentPerCourse);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }

                          this.CurrentDocumentsPerCourse = new DocumentsPerCourse();
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
                    nameFolder = this.CurrentDocumentsPerCourse.folderName;
                    this.DocumentPerCourseService.UploadFewDocumentsPerCourse(this.SchoolId,
                      this.CourseId, this.ListDocumentsPerCourse, nameFolder)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId != null && this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId > 0 && this.ListDocuments[index3][0].requiredDocumentPerCourseId == this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId)
                                || (this.CurrentDocumentsPerCourse.exsistDocumentId != null && this.CurrentDocumentsPerCourse.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerCourse.exsistDocumentId))
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerCourse == this.CurrentDocumentsPerCourse.iddocumentPerCourse);
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
                          this.CurrentDocumentsPerCourse;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger

                        }
                        , e => {

                          this.CurrentDocumentsPerCourse;
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
              if (this.numSuccess == files.length && this.ListDocumentsPerCourse.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0) {
                    //שמירה ב-DB
                    this.DocumentPerCourseService.UploadDocumentPerCourse(this.SchoolId, this.CourseId, this.ListDocumentsPerCourse[0], 0)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerCourse.iddocumentPerCourse == 0 || this.CurrentDocumentsPerCourse.iddocumentPerCourse == undefined)
                            &&
                            this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId != undefined &&
                            this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerCourseId == this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerCourse>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerCourse.iddocumentPerCourse == 0 || this.CurrentDocumentsPerCourse.iddocumentPerCourse == undefined)
                              && (this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId == undefined ||
                                this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId == 0)) {
                              let arr = new Array<DocumentsPerCourse>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerCourse.iddocumentPerCourse != undefined && this.CurrentDocumentsPerCourse.iddocumentPerCourse > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerCourse == this.CurrentDocumentsPerCourse.iddocumentPerCourse);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }

                          this.CurrentDocumentsPerCourse = new DocumentsPerCourse();
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
                    nameFolder = this.CurrentDocumentsPerCourse.folderName;
                    let CustomerId = this.SchoolService.CustomerId != null ? this.SchoolService.CustomerId : 0;
                    this.DocumentPerCourseService.UploadFewDocumentsPerCourse(this.SchoolId,
                      this.CourseId, this.ListDocumentsPerCourse, nameFolder)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId != null && this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId > 0 && this.ListDocuments[index3][0].requiredDocumentPerCourseId == this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId)
                                || (this.CurrentDocumentsPerCourse.exsistDocumentId != null && this.CurrentDocumentsPerCourse.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerCourse.exsistDocumentId))
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerCourse == this.CurrentDocumentsPerCourse.iddocumentPerCourse);
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
                          this.CurrentDocumentsPerCourse;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger

                        }
                        , e => {

                          this.CurrentDocumentsPerCourse;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

                        });
                  }
                }
              }

              else
                if (this.numSuccess == files.length && this.ListDocumentsPerCourse.length == 0)
                  this.ngxService.stop();
              this.CurrentDocument = new DocumentsPerCourse();
              this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.CurrentDocumentsPerCourse.indexFolder].name + ' יש בעיה ', sticky: true });

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
  //     let path = this.SchoolId + "-Courses-" + this.CourseId + "&FileName=";

  //     // if (this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId != 0 && this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId != undefined) {
  //     //   if (this.CurrentDocumentsPerCourse.iddocumentPerCourse != undefined && this.CurrentDocumentsPerCourse.iddocumentPerCourse > 0) {
  //     //     path = path + 'r' + this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId;
  //     //   }
  //     //   else
  //     //     path = path + 'r' + this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId
  //     // }
  //     // else
  //     //   path = path + this.CurrentDocumentsPerCourse.iddocumentPerCourse;
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId + "&FileName=" + this.CurrentDocumentsPerCourse.indexFolder;

  //     this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //       .subscribe(
  //         d => {
  //           debugger;
  //           oldpath = this.CurrentDocumentsPerCourse.path;
  //           this.CurrentDocumentsPerCourse.path = d;
  //           this.CurrentDocumentsPerCourse.CourseId = this.CourseId;
  //           this.CurrentDocumentsPerCourse.name = files[0].name;

  //           //אם זה מסמך מהנדרשים ועדיין לא קיים
  //           if (this.CurrentDocumentsPerCourse.iddocumentPerCourse == 0) {
  //             this.CurrentDocumentsPerCourse.dateCreated = new Date();
  //             this.CurrentDocumentsPerCourse.userCreated = this.CurrentSchool.userId;
  //             this.CurrentDocumentsPerCourse.schoolId = this.SchoolId;
  //           }

  //           //למסמכים קיימים
  //           else {
  //             this.CurrentDocumentsPerCourse.dateUpdated = new Date();
  //             this.CurrentDocumentsPerCourse.userUpdated = this.CurrentSchool.userId;
  //           }

  //           //מחיקת הקובץ הישן מאזור
  //           if (oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
  //             this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
  //           }

  //           // שמירת סוג הקובץ
  //           var index = this.fileD.name.lastIndexOf('.')
  //           if (index > -1) {
  //             this.type = this.fileD.name.substring(index);
  //             this.CurrentDocumentsPerCourse.name = this.fileD.name.substring(0, index);
  //           }
  //           else {
  //             this.type = '';
  //             this.CurrentDocumentsPerCourse.name = this.fileD.name;
  //           }

  //           this.CurrentDocumentsPerCourse.type = this.type;

  //           //שמירה ב-DB
  //           this.DocumentPerCourseService.UploadDocumentPerCourse(this.SchoolId, this.CourseId, this.CurrentDocumentsPerCourse, 0, this.uniqueCodeID)
  //             .subscribe(
  //               d => {
  //                 debugger;

  //                 //דרושים ועדיין לא קיימים
  //                 if (this.CurrentDocumentsPerCourse.iddocumentPerCourse == 0 &&
  //                   this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId != undefined &&
  //                   this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId > 0) {
  //                   let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerCourseId == this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId);

  //                   if (y >= 0) {
  //                     let arr = new Array<DocumentsPerCourse>();
  //                     arr.push(d);
  //                     this.ListDocuments[y] = arr;
  //                   }
  //                 }
  //                 else
  //                   //דרושים וקיימים
  //                   if (this.CurrentDocumentsPerCourse.iddocumentPerCourse > 0 &&
  //                     this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId != undefined &&
  //                     this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId > 0) {

  //                     debugger;
  //                     let y;
  //                     //קובץ בודד
  //                     if (!IsFolder) {
  //                       y = this.ListDocuments.findIndex(f => f[0].iddocumentPerCourse == this.CurrentDocumentsPerCourse.iddocumentPerCourse);
  //                       if (y >= 0) {
  //                         let arr = new Array<DocumentsPerCourse>();
  //                         arr.push(d);
  //                         this.ListDocuments[y] = arr;
  //                       }
  //                     }

  //                     //קובץ מתיקיה
  //                     else {
  //                       for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
  //                         if (this.ListDocuments[index2][0].folderId == this.CurrentDocumentsPerCourse.folderId) {
  //                           y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerCourse == this.CurrentDocumentsPerCourse.iddocumentPerCourse)
  //                           if (y >= 0) {
  //                             this.ListDocuments[index2][y] = d;
  //                             break;
  //                           }
  //                         }
  //                       }
  //                     }
  //                   }
  //                 debugger;

  //                 this.CurrentDocumentsPerCourse = new DocumentsPerCourse();
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
  //     this.ListDocumentsPerCourse = new Array<DocumentsPerCourse>();

  //     debugger;
  //     this.CurrentDocument = { ...this.CurrentDocumentsPerCourse };
  //     for (let index = this.FolderLength; index < this.FolderLength + files.length; index++) {
  //       // debugger;
  //       oldpath = this.CurrentDocumentsPerCourse.path;

  //       this.fileD = files[index - this.FolderLength];
  //       let path = this.SchoolId + "-Courses-" + this.CourseId;
  //       if (this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId != 0 && this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId != undefined)
  //         // if (this.FolderLength == 0 && this.CurrentDocumentsPerCourse.iddocumentPerCourse != 0 && this.CurrentDocumentsPerCourse.iddocumentPerCourse != undefined)
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId + "&FileName=" + index
  //       else
  //         path = path + '-' + this.CurrentDocumentsPerCourse.iddocumentPerCourse + "&FileName=" + index;

  //       this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //         .subscribe(
  //           d => {
  //             this.numSuccess++;
  //             this.CurrentDocument = { ...this.CurrentDocumentsPerCourse };
  //             this.CurrentDocument.path = d;
  //             this.CurrentDocument.CourseId = this.CourseId;
  //             this.CurrentDocument.folderName = this.CurrentDocumentsPerCourse.folderName;
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
  //             if (this.CurrentDocumentsPerCourse.iddocumentPerCourse == 0 || (this.CurrentDocumentsPerCourse.folderId != undefined && this.CurrentDocumentsPerCourse.folderId > 0)) {
  //               if (this.IsChangeDoc == false) {
  //                 this.CurrentDocument.dateCreated = new Date();
  //                 this.CurrentDocument.userCreated = this.CurrentSchool.userId;
  //               }
  //               else {
  //                 this.CurrentDocument.dateUpdated = new Date();
  //                 this.CurrentDocument.userUpdated = this.CurrentSchool.userId;
  //               }
  //               this.CurrentDocument.schoolId = this.SchoolId;
  //               this.CurrentDocument.requiredDocumentPerCourseId = this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId;
  //               if (this.CurrentDocumentsPerCourse.folderId != undefined && this.CurrentDocumentsPerCourse.folderId > 0) {
  //                 this.CurrentDocument.folderId = this.CurrentDocumentsPerCourse.folderId;
  //                 this.CurrentDocument.folderCreated = this.CurrentDocumentsPerCourse.folderCreated;
  //                 if (this.IsChangeDoc == false)
  //                   this.CurrentDocument.iddocumentPerCourse = 0;
  //               }
  //             }

  //             this.ListDocumentsPerCourse.push(this.CurrentDocument);
  //             if (this.numSuccess == files.length && this.ListDocumentsPerCourse.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerCourse.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerCourse.name;

  //               this.DocumentPerCourseService.UploadFewDocumentsPerCourse(this.SchoolId,
  //                 this.CourseId, this.ListDocumentsPerCourse, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerCourseId == this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId)
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
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerCourse == this.CurrentDocumentsPerCourse.iddocumentPerCourse);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerCourse;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerCourse;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }
  //           }, er => {
  //             debugger;
  //             this.numSuccess++;
  //             if (this.numSuccess == files.length && this.ListDocumentsPerCourse.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerCourse.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerCourse.name;

  //               this.DocumentPerCourseService.UploadFewDocumentsPerCourse(this.SchoolId,
  //                 this.CourseId, this.ListDocumentsPerCourse, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerCourseId == this.CurrentDocumentsPerCourse.requiredDocumentPerCourseId)
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
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerCourse == this.CurrentDocumentsPerCourse.iddocumentPerCourse);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerCourse;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerCourse;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }

  //             this.CurrentDocument = new DocumentsPerCourse();
  //             this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.FolderLength].name + ' יש בעיה ', sticky: true });

  //           }
  //         )

  //     }
  //   }

  // }

  //הצגת קובץ בחלון חדש


  DisplayDocInNewWindow(doc: DocumentsPerCourse) {

    window.open(doc.path);
  }

  //הורדת קובץ
  DownloadDoc(doc: DocumentsPerCourse) {
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

  //הורדת קבצים נבחרים 
  DownloadFewDoc(docs: DocumentsPerCourse[]) {
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
  DownloadallDoc(docs: DocumentsPerCourse[]) {
    docs.forEach(doc => {
      this.DownloadDoc(doc);
      debugger;
    })
  }

  //מחיקת קובץ
  DeleteDoc(doc: DocumentsPerCourse, IsFolder: boolean = false) {
    debugger;
    this.FilesAzureService.DeleteFileFromAzure(doc.path).subscribe(response => {
      debugger;

    }, error => {
      // this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

      debugger; console.log('Error delete the file')
    });

    this.DocumentPerCourseService.DeleteDocumentPerCourse(doc.iddocumentPerCourse, this.CourseId).subscribe(s => {
      debugger;

      // אם זה מחיקת קובץ מתיקיה
      if (IsFolder) {
        let y;
        for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
          if (this.ListDocuments[index2][0].folderId == doc.folderId) {
            y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerCourse == doc.iddocumentPerCourse)
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
        if (doc.requiredDocumentPerCourseId != undefined) {
          doc.dateUpdated = undefined;
          doc.iddocumentPerCourse = 0;
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
          if (doc.iddocumentPerCourse > 0 && (doc.requiredDocumentPerCourseId == undefined || doc.requiredDocumentPerCourseId == 0)) {
            let x = this.ListDocuments.findIndex(f => f[0].iddocumentPerCourse == doc.iddocumentPerCourse);
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
  DeleteFewDoc(docs: DocumentsPerCourse[]) {

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


    let requiredDocumentPerCourseId = docs[0].requiredDocumentPerCourseId != undefined ? docs[0].requiredDocumentPerCourseId : 0;
    //מחיקת הקבצים מהמסד נתונים
    this.DocumentPerCourseService.DeleteFewDocumentPerCourse(docs[0].folderId, requiredDocumentPerCourseId, this.CourseId).subscribe(
      s => {
        debugger;

        for (let index = 0; index < this.ListDocuments.length; index++) {
          if (this.ListDocuments[index] == docs)
            if (s != undefined && s.requiredDocumentPerCourseId > 0) {
              let x = new Array<DocumentsPerCourse>();
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
  OpenFolder(docs: DocumentsPerCourse[]) {
    this.ListFilesOnFolder = docs;
    this.IsFolder = true;
    this.IsEditName = false;
  }

  //דיאלוג לשאלה אם רוצה למחוק תיקיה
  confirmFolder(docs: DocumentsPerCourse[]) {
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
  confirmDeleteFile(doc: DocumentsPerCourse, IsFolder: boolean = false) {
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
  ChangeNameDoc(doc: DocumentsPerCourse) {
    this.IsEditName = true;
    this.NameFile = doc.name;
    this.idfile = doc.iddocumentPerCourse;
  }

  //שמירת ההחלפת שם לקובץ
  SaveNameFile(doc: DocumentsPerCourse, FolderId: number = 0) {
    debugger;
    this.IsEditName = false;
    this.DocumentPerCourseService.SaveNameFile(this.idfile, this.NameFile).subscribe(
      da => {
        if (FolderId > 0) {
          for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
            if (this.ListDocuments[index2][0].folderId == FolderId) {
              let y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerCourse == this.idfile)
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
            if (element[0].iddocumentPerCourse == this.idfile) {
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

  isAllFilesOpenByThisUser(doc: DocumentsPerCourse[]) {
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
  AddNewDocumentsPerCourse() {
    debugger;
    this.CurrentDocumentsPerCourse = new DocumentsPerCourse();
    this.CurrentDocumentsPerCourse.schoolId = this.SchoolId;
    this.CurrentDocumentsPerCourse.courseId = this.CourseId;
    this.CurrentDocumentsPerCourse.indexFolder = 0;
    this.displayDialog = true;
    this.filesLst = null;
  }
  onDrop(event: any) {
    debugger
    event.preventDefault();
    const files = event.dataTransfer.files;
    this.confirmationService.confirm({
      message: 'האם ברצונך להעלות את הקבצים שנבחרו למיקום זה?',
      header: 'אזהרה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: ' העלאה',
      rejectLabel: ' ביטול',
      accept: () => {
        this.CurrentDocumentsPerCourse = new DocumentsPerCourse();
        this.CurrentDocumentsPerCourse.schoolId = this.SchoolId;
        this.CurrentDocumentsPerCourse.courseId = this.CourseId;
        this.CurrentDocumentsPerCourse.indexFolder = 0;
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
      //filesLst- לסוג של ה slice משתמשים פה במערך נוסף כי א"א לעשות
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
          this.CurrentDocumentsPerCourse.exsistDocumentId = data;
        if (this.CurrentDocumentsPerCourse.name == undefined && this.filesLst != undefined && this.filesLst.length > 1) {
          let name = prompt("הכנס שם תיקיה", "לא נבחר שם")
          this.CurrentDocumentsPerCourse.name = name
        }
        this.CurrentDocumentsPerCourse.folderName = this.CurrentDocumentsPerCourse.name;
        this.uploadDocument(this.filesLst, true, false);
      },
      er => {
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
      }
    );
  }
}
