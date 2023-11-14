import { StudentService } from 'src/app/Service/student.service';
import { DocumentPerStudentService } from './../../../Service/document-per-student.service';
import { DocumentsPerStudent } from './../../../Class/documents-per-student';
import { ExsistDocumentService } from './../../../Service/exsist-document.service';
import { FilesAzureService } from './../../../Service/files-azure.service';
import { SchoolService } from './../../../Service/school.service';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import * as fileSaver from 'file-saver';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';
import { debug } from 'console';

@Component({
  selector: 'app-documents-per-student',
  templateUrl: './documents-per-student.component.html',
  styleUrls: ['./documents-per-student.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService]

})
export class DocumentsPerStudentComponent implements OnInit {

  //החלונית של בחירת קובץ בודד
  @ViewChild('file') fileInput: ElementRef;
  //חלונית לבחירת קבצים מרובים
  @ViewChild('file2') fileInput2: ElementRef;
  //חלונית לבחירת תמונת פספורט
  @ViewChild('filePassport') filePassport: ElementRef;

  ListDocuments: any;// Array<DocumentsPerStudent> = new Array<DocumentsPerStudent>();
  StudentId: number;
  fileD: File;
  CurrentDocumentsPerStudent: DocumentsPerStudent;
  //משתנה מסמל להצגת הקובץ באותו חלון
  visible = false;
  path: any;
  //מסמכים להעלות לתיקיה
  ListDocumentsPerStudent: Array<DocumentsPerStudent> = new Array<DocumentsPerStudent>();
  //משתנה המונה את מספר הנסיונות העלאת קבצים כדי לדעת מתי הוא באחרון
  numSuccess: number = 0;
  CurrentDocument: DocumentsPerStudent;
  IsFolder = false;
  ListFilesOnFolder: Array<DocumentsPerStudent>;
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
  passport: DocumentsPerStudent = new DocumentsPerStudent();
  // ------------
  IsFieldDisplay = false;
  collapsed: boolean = false;
  constructor(private confirmationService: ConfirmationService, public DocumentPerStudentService: DocumentPerStudentService,
    public SchoolService: SchoolService, public StudentService: StudentService, private active: ActivatedRoute, public router: Router,
    private FilesAzureService: FilesAzureService, private ExsistDocumentService: ExsistDocumentService,
    public sanitizer: DomSanitizer, private ngxService: NgxUiLoaderService,
    private messageService: MessageService, public GenericFunctionService: GenericFunctionService) {
  }

  ngOnInit(): void {

    if (this.SchoolService.ListSchool == null || this.SchoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.active.params.subscribe(c => { this.StudentId = c["id"] })
    this.active.params.subscribe(c => { this.SchoolId = c["schoolId"] })
    this.active.params.subscribe(c => { this.YearbookPerSchool = c["YearbookPerSchool"] })

    debugger;

    this.CurrentSchool = this.SchoolService.ListSchool.find(f => f.school.idschool == this.SchoolId)
    // var CurrentStudent = this.StudentService.ListStudent.find(f => f.idStudent == this.StudentId);
    if (this.YearbookPerSchool != this.SchoolService.SelectYearbook.idyearbook)
      this.GenericFunctionService.GoBackToLastPage();

    this.DocumentPerStudentService.getLstDocumentPerStudent(this.SchoolId, this.StudentId)
      .subscribe(d => {
        debugger; this.ListDocuments = d;
        if (this.StudentService.CurrentStudent != undefined && this.StudentService.CurrentStudent.passportPicture != undefined && this.StudentService.CurrentStudent.passportPicture != '')
          this.passport = (new DocumentsPerStudent(-1, 'תמונת פספורט', this.StudentService.CurrentStudent.passportPicture, 0, 0, 0, this.StudentService.CurrentStudent.userCreatedId, new Date(), 0, new Date(), 2))
        else
          this.passport = (new DocumentsPerStudent(-1, 'תמונת פספורט', undefined, 0, 0, 0, 0, new Date(), 0, new Date(), 2))

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
  ChangeDoc(doc: DocumentsPerStudent, IsMultiple: boolean = true, FolderLength: number = 0, IsChange: boolean = false, lengthFolder: number = 0) {
    debugger;
    this.FolderLength = FolderLength;
    this.IsChangeDoc = IsChange;
    this.CurrentDocumentsPerStudent = new DocumentsPerStudent();
    this.CurrentDocumentsPerStudent = { ...doc };
    let event = new MouseEvent('click', { bubbles: false });
    if (IsMultiple)
      this.fileInput.nativeElement.dispatchEvent(event);
    else
      this.fileInput2.nativeElement.dispatchEvent(event);
    // if (FolderLength > 0 && this.CurrentDocumentsPerStudent.folderName != null)
    //   this.CurrentDocumentsPerStudent.name = this.CurrentDocumentsPerStudent.folderName;
  }

  //פתיחת סייר הקבצים לבחירת קובץ לתמונת פספורט
  ChangeDocPassport(doc: DocumentsPerStudent) {
    debugger;
    this.CurrentDocumentsPerStudent = new DocumentsPerStudent();
    this.CurrentDocumentsPerStudent = { ...doc };
    let event = new MouseEvent('click', { bubbles: false });
    this.filePassport.nativeElement.dispatchEvent(event);
  }

  //הצגת קובץ
  DisplayDoc(doc: DocumentsPerStudent) {
    debugger;
    // options.clearCache.all = 1
    // options.clearCache.system = 1
    this.path = undefined;
    this.path = this.GetSecureUrl(doc.path);
    this.visible = undefined
    this.visible = true
  }

  //העלאת קובץ לתמונת פספורט
  UploadPassportPicture(files: FileList) {
    debugger;
    this.ngxService.start();

    if (files.length > 0) {
      this.fileD = files[0];
      let path =
        this.SchoolId +
        "-Students-" +
        this.StudentId +
        "&FileName=passport";
      this.FilesAzureService.uploadFileToAzure(
        this.fileD,
        path,
        this.SchoolId
      ).subscribe(
        (d) => {
          debugger;
          this.StudentService.CurrentStudent.passportPicture = d
          this.StudentService
            .UpdateProfilePathToStudent(
              this.SchoolId,
              this.StudentId,

              //d,
              this.CurrentSchool.userId
            )
            .subscribe(
              (da) => {
                debugger;
                this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'תמונת הפספורט הועלתה בהצלחה' });
                this.ngxService.stop();

                // this.passport.path = da;
                this.passport.userCreatedId = this.CurrentSchool.userId;
              },
              (er) => {
                this.ngxService.stop();
                this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

                debugger;
              }
            );
        },
        (er) => {
          debugger;
          this.ngxService.stop();
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

        }
      );
    }


  }


  //העלאת קובץ לתמונת פספורט
  DeletePassportPicture() {
    this.ngxService.start();
    this.StudentService
      .UpdateProfilePathToStudent(
        this.SchoolId,
        this.StudentId,
        //null,
        this.CurrentSchool.userId
      )
      .subscribe(
        (da) => {
          debugger;
          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'תמונת הפספורט נמחקה בהצלחה' });
          this.ngxService.stop();
          this.FilesAzureService.DeleteFileFromAzure(
            this.passport.path
          ).subscribe(
            (d) => {
              debugger;

            },
            (er) => {

            }
          );
          this.passport.path = null;
        },
        (er) => {
          this.ngxService.stop();
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
          let y = this.StudentService.ListStudent.findIndex(f => f.idstudent == this.StudentId);
          if (y > -1) {
            this.StudentService.ListStudent[y].passportPicture = null;
          }
          debugger;
        }
      );



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
      this.ListDocumentsPerStudent = new Array<DocumentsPerStudent>();

      debugger;
      this.CurrentDocument = { ...this.CurrentDocumentsPerStudent };
      let path = this.SchoolId + "-Students-" + this.StudentId + '-';
      let flag:boolean=false
      //נדרשים
      if (this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != null && this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId > 0)
    {
        path = path + 'r' + this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId + "&FileName=";
         flag= confirm("האם ברצונך להשאיר את השם של הקובץ כפי שמופיע באתר?")
    }
      //קיימים ולא דרושים
      else
        path = path + 'd' + this.CurrentDocumentsPerStudent.exsistDocumentId + "&FileName=";

      for (let index = this.CurrentDocumentsPerStudent.indexFolder; index < this.CurrentDocumentsPerStudent.indexFolder + files.length; index++) {
        oldpath = this.CurrentDocumentsPerStudent.path;
        pathDoc = path + index;
        this.fileD = files[index - this.CurrentDocumentsPerStudent.indexFolder];
        if(flag)
        {
        const newFile = new File([this.fileD], this.CurrentDocument.name, { type: this.fileD.type });
      this.fileD=newFile
      }
        this.FilesAzureService.uploadFileToAzure(this.fileD, pathDoc, this.SchoolId)
          .subscribe(
            d => {
              this.numSuccess++;
              this.CurrentDocument = { ...this.CurrentDocumentsPerStudent };
              this.CurrentDocument.path = d;
              this.CurrentDocument.studentId = this.StudentId;
              if(!flag)
              this.CurrentDocument.name = files[index - this.CurrentDocumentsPerStudent.indexFolder].name;
              this.CurrentDocument.schoolId = this.SchoolId;

              // שמירת סוג הקובץ
              var index2 = files[index - this.CurrentDocumentsPerStudent.indexFolder].name.lastIndexOf('.')
              if (index2 > -1) {
                this.type = files[index - this.CurrentDocumentsPerStudent.indexFolder].name.substring(index2);
                if(!flag)
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerStudent.indexFolder].name.substring(0, index2);

              }
              else {
                this.type = '';
                if(!flag)
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerStudent.indexFolder].name;
              }
              this.CurrentDocument.type = this.type;

              if (this.IsChangeDoc == false) {
                this.CurrentDocument.dateCreated = new Date();
                this.CurrentDocument.userCreatedId = this.CurrentSchool.userId;
                this.CurrentDocument.iddocumentPerStudent = 0;
              }
              else {
                this.CurrentDocument.dateUpdated = new Date();
                this.CurrentDocument.userUpdatedId = this.CurrentSchool.userId;
              }

              //מחיקת הקובץ הישן
              if (this.IsChangeDoc == true && oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
                this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
              }
              // this.CurrentDocument.requiredDocumentPerStudentId = this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId;
              // this.CurrentDocument.folderId = this.CurrentDocumentsPerStudent.folderId;
              // this.CurrentDocument.folderCreated = this.CurrentDocumentsPerStudent.folderCreated;

              this.ListDocumentsPerStudent.push(this.CurrentDocument);
              if (this.numSuccess == files.length && this.ListDocumentsPerStudent.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0) {
                    //שמירה ב-DB
                    this.DocumentPerStudentService.UploadDocumentPerStudent(this.SchoolId, this.StudentId, this.ListDocumentsPerStudent[0], 0)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerStudent.iddocumentPerStudent == 0 || this.CurrentDocumentsPerStudent.iddocumentPerStudent == undefined)
                            &&
                            this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != undefined &&
                            this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerStudentId == this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerStudent>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                              y = this.StudentService.ListStudent.findIndex(f => f.idstudent == d.studentId);
                              if (y >= 0) {
                                this.StudentService.ListStudent[y].numExsistRequiredPerStudent++;
                              }

                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerStudent.iddocumentPerStudent == 0 || this.CurrentDocumentsPerStudent.iddocumentPerStudent == undefined)
                              && (this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId == undefined ||
                                this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId == 0)) {
                              let arr = new Array<DocumentsPerStudent>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerStudent.iddocumentPerStudent != undefined && this.CurrentDocumentsPerStudent.iddocumentPerStudent > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerStudent == this.CurrentDocumentsPerStudent.iddocumentPerStudent);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }

                          debugger;

                          this.CurrentDocumentsPerStudent = new DocumentsPerStudent();
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
                    nameFolder = this.CurrentDocumentsPerStudent.folderName;
                    this.DocumentPerStudentService.UploadFewDocumentsPerStudent(this.SchoolId,
                      this.StudentId, this.ListDocumentsPerStudent, nameFolder)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != null && this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId > 0 && this.ListDocuments[index3][0].requiredDocumentPerStudentId == this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId)
                                || (this.CurrentDocumentsPerStudent.exsistDocumentId != null && this.CurrentDocumentsPerStudent.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerStudent.exsistDocumentId))
                                // אם זה החלפה של קובץ בודד או העלאה של קובץ בודד תואם
                                if (this.ListDocuments[index3].length == 1) {
                                  debugger;
                                  this.ListDocuments[index3] = d;
                                  if ((this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != null && this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId > 0 && this.ListDocuments[index3][0].requiredDocumentPerStudentId == this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId)) {
                                    let y = this.StudentService.ListStudent.findIndex(f => f.idstudent == d[0].studentId);
                                    if (y >= 0) {
                                      this.StudentService.ListStudent[y].numExsistRequiredPerStudent++;
                                    }
                                  }
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerStudent == this.CurrentDocumentsPerStudent.iddocumentPerStudent);
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
                          this.CurrentDocumentsPerStudent;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger
                          // ------------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));


                        }
                        , e => {

                          this.CurrentDocumentsPerStudent;
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
              if (this.numSuccess == files.length && this.ListDocumentsPerStudent.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0) {
                    //שמירה ב-DB
                    this.DocumentPerStudentService.UploadDocumentPerStudent(this.SchoolId, this.StudentId, this.ListDocumentsPerStudent[0], 0)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerStudent.iddocumentPerStudent == 0 || this.CurrentDocumentsPerStudent.iddocumentPerStudent == undefined)
                            &&
                            this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != undefined &&
                            this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerStudentId == this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerStudent>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                              y = this.StudentService.ListStudent.findIndex(f => f.idstudent == d.studentId);
                              if (y >= 0) {
                                this.StudentService.ListStudent[y].numExsistRequiredPerStudent++;
                              }

                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerStudent.iddocumentPerStudent == 0 || this.CurrentDocumentsPerStudent.iddocumentPerStudent == undefined)
                              && (this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId == undefined ||
                                this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId == 0)) {
                              let arr = new Array<DocumentsPerStudent>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerStudent.iddocumentPerStudent != undefined && this.CurrentDocumentsPerStudent.iddocumentPerStudent > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerStudent == this.CurrentDocumentsPerStudent.iddocumentPerStudent);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }

                          debugger;

                          this.CurrentDocumentsPerStudent = new DocumentsPerStudent();
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
                    nameFolder = this.CurrentDocumentsPerStudent.folderName;
                    this.DocumentPerStudentService.UploadFewDocumentsPerStudent(this.SchoolId,
                      this.StudentId, this.ListDocumentsPerStudent, nameFolder)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != null && this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId > 0 && this.ListDocuments[index3][0].requiredDocumentPerStudentId == this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId)
                                || (this.CurrentDocumentsPerStudent.exsistDocumentId != null && this.CurrentDocumentsPerStudent.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerStudent.exsistDocumentId))
                                // אם זה החלפה של קובץ בודד או העלאה של קובץ בודד תואם
                                if (this.ListDocuments[index3].length == 1) {
                                  debugger;
                                  this.ListDocuments[index3] = d;
                                  if ((this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != null && this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId > 0 && this.ListDocuments[index3][0].requiredDocumentPerStudentId == this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId)) {
                                    let y = this.StudentService.ListStudent.findIndex(f => f.idstudent == d[0].studentId);
                                    if (y >= 0) {
                                      this.StudentService.ListStudent[y].numExsistRequiredPerStudent++;
                                    }
                                  }
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerStudent == this.CurrentDocumentsPerStudent.iddocumentPerStudent);
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
                          this.CurrentDocumentsPerStudent;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger
                          // ------------
                          this.ListDocuments = this.ListDocuments.sort((a, b) => (b[0].displayOrderNum > a[0].displayOrderNum ? -1 : 1));


                        }
                        , e => {

                          this.CurrentDocumentsPerStudent;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

                        });
                  }
                }
              }
              else
                if (this.numSuccess == files.length && this.ListDocumentsPerStudent.length == 0)
                  this.ngxService.stop();
              this.CurrentDocument = new DocumentsPerStudent();
              this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.CurrentDocumentsPerStudent.indexFolder].name + ' יש בעיה ', sticky: true });

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
  //     let path = this.SchoolId + "-Students-" + this.StudentId + "&FileName=";

  //     // if (this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != 0 && this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != undefined) {
  //     //   if (this.CurrentDocumentsPerStudent.iddocumentPerStudent != undefined && this.CurrentDocumentsPerStudent.iddocumentPerStudent > 0) {
  //     //     path = path + 'r' + this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId;
  //     //   }
  //     //   else
  //     //     path = path + 'r' + this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId
  //     // }
  //     // else
  //     //   path = path + this.CurrentDocumentsPerStudent.iddocumentPerStudent;
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId + "&FileName=" + this.CurrentDocumentsPerStudent.indexFolder;

  //     this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //       .subscribe(
  //         d => {
  //           debugger;
  //           oldpath = this.CurrentDocumentsPerStudent.path;
  //           this.CurrentDocumentsPerStudent.path = d;
  //           this.CurrentDocumentsPerStudent.StudentId = this.StudentId;
  //           this.CurrentDocumentsPerStudent.name = files[0].name;

  //           //אם זה מסמך מהנדרשים ועדיין לא קיים
  //           if (this.CurrentDocumentsPerStudent.iddocumentPerStudent == 0) {
  //             this.CurrentDocumentsPerStudent.dateCreated = new Date();
  //             this.CurrentDocumentsPerStudent.userCreated = this.CurrentSchool.userId;
  //             this.CurrentDocumentsPerStudent.schoolId = this.SchoolId;
  //           }

  //           //למסמכים קיימים
  //           else {
  //             this.CurrentDocumentsPerStudent.dateUpdated = new Date();
  //             this.CurrentDocumentsPerStudent.userUpdated = this.CurrentSchool.userId;
  //           }

  //           //מחיקת הקובץ הישן מאזור
  //           if (oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
  //             this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
  //           }

  //           // שמירת סוג הקובץ
  //           var index = this.fileD.name.lastIndexOf('.')
  //           if (index > -1) {
  //             this.type = this.fileD.name.substring(index);
  //             this.CurrentDocumentsPerStudent.name = this.fileD.name.substring(0, index);
  //           }
  //           else {
  //             this.type = '';
  //             this.CurrentDocumentsPerStudent.name = this.fileD.name;
  //           }

  //           this.CurrentDocumentsPerStudent.type = this.type;

  //           //שמירה ב-DB
  //           this.DocumentPerStudentService.UploadDocumentPerStudent(this.SchoolId, this.StudentId, this.CurrentDocumentsPerStudent, 0, this.uniqueCodeID)
  //             .subscribe(
  //               d => {
  //                 debugger;

  //                 //דרושים ועדיין לא קיימים
  //                 if (this.CurrentDocumentsPerStudent.iddocumentPerStudent == 0 &&
  //                   this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != undefined &&
  //                   this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId > 0) {
  //                   let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerStudentId == this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId);

  //                   if (y >= 0) {
  //                     let arr = new Array<DocumentsPerStudent>();
  //                     arr.push(d);
  //                     this.ListDocuments[y] = arr;
  //                   }
  //                 }
  //                 else
  //                   //דרושים וקיימים
  //                   if (this.CurrentDocumentsPerStudent.iddocumentPerStudent > 0 &&
  //                     this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != undefined &&
  //                     this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId > 0) {

  //                     debugger;
  //                     let y;
  //                     //קובץ בודד
  //                     if (!IsFolder) {
  //                       y = this.ListDocuments.findIndex(f => f[0].iddocumentPerStudent == this.CurrentDocumentsPerStudent.iddocumentPerStudent);
  //                       if (y >= 0) {
  //                         let arr = new Array<DocumentsPerStudent>();
  //                         arr.push(d);
  //                         this.ListDocuments[y] = arr;
  //                       }
  //                     }

  //                     //קובץ מתיקיה
  //                     else {
  //                       for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
  //                         if (this.ListDocuments[index2][0].folderId == this.CurrentDocumentsPerStudent.folderId) {
  //                           y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerStudent == this.CurrentDocumentsPerStudent.iddocumentPerStudent)
  //                           if (y >= 0) {
  //                             this.ListDocuments[index2][y] = d;
  //                             break;
  //                           }
  //                         }
  //                       }
  //                     }
  //                   }
  //                 debugger;

  //                 this.CurrentDocumentsPerStudent = new DocumentsPerStudent();
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
  //     this.ListDocumentsPerStudent = new Array<DocumentsPerStudent>();

  //     debugger;
  //     this.CurrentDocument = { ...this.CurrentDocumentsPerStudent };
  //     for (let index = this.FolderLength; index < this.FolderLength + files.length; index++) {
  //       // debugger;
  //       oldpath = this.CurrentDocumentsPerStudent.path;

  //       this.fileD = files[index - this.FolderLength];
  //       let path = this.SchoolId + "-Students-" + this.StudentId;
  //       if (this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != 0 && this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId != undefined)
  //         // if (this.FolderLength == 0 && this.CurrentDocumentsPerStudent.iddocumentPerStudent != 0 && this.CurrentDocumentsPerStudent.iddocumentPerStudent != undefined)
  //         path = path + '-' + 'r' + this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId + "&FileName=" + index
  //       else
  //         path = path + '-' + this.CurrentDocumentsPerStudent.iddocumentPerStudent + "&FileName=" + index;

  //       this.FilesAzureService.uploadFileToAzure(this.fileD, path, this.SchoolId)
  //         .subscribe(
  //           d => {
  //             this.numSuccess++;
  //             this.CurrentDocument = { ...this.CurrentDocumentsPerStudent };
  //             this.CurrentDocument.path = d;
  //             this.CurrentDocument.StudentId = this.StudentId;
  //             this.CurrentDocument.folderName = this.CurrentDocumentsPerStudent.folderName;
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
  //             if (this.CurrentDocumentsPerStudent.iddocumentPerStudent == 0 || (this.CurrentDocumentsPerStudent.folderId != undefined && this.CurrentDocumentsPerStudent.folderId > 0)) {
  //               if (this.IsChangeDoc == false) {
  //                 this.CurrentDocument.dateCreated = new Date();
  //                 this.CurrentDocument.userCreated = this.CurrentSchool.userId;
  //               }
  //               else {
  //                 this.CurrentDocument.dateUpdated = new Date();
  //                 this.CurrentDocument.userUpdated = this.CurrentSchool.userId;
  //               }
  //               this.CurrentDocument.schoolId = this.SchoolId;
  //               this.CurrentDocument.requiredDocumentPerStudentId = this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId;
  //               if (this.CurrentDocumentsPerStudent.folderId != undefined && this.CurrentDocumentsPerStudent.folderId > 0) {
  //                 this.CurrentDocument.folderId = this.CurrentDocumentsPerStudent.folderId;
  //                 this.CurrentDocument.folderCreated = this.CurrentDocumentsPerStudent.folderCreated;
  //                 if (this.IsChangeDoc == false)
  //                   this.CurrentDocument.iddocumentPerStudent = 0;
  //               }
  //             }

  //             this.ListDocumentsPerStudent.push(this.CurrentDocument);
  //             if (this.numSuccess == files.length && this.ListDocumentsPerStudent.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerStudent.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerStudent.name;

  //               this.DocumentPerStudentService.UploadFewDocumentsPerStudent(this.SchoolId,
  //                 this.StudentId, this.ListDocumentsPerStudent, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerStudentId == this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId)
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
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerStudent == this.CurrentDocumentsPerStudent.iddocumentPerStudent);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerStudent;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerStudent;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }
  //           }, er => {
  //             debugger;
  //             this.numSuccess++;
  //             if (this.numSuccess == files.length && this.ListDocumentsPerStudent.length > 0) {
  //               debugger
  //               let nameFolder;
  //               //אם זה עידכון
  //               if (this.IsChangeDoc)
  //                 nameFolder = this.CurrentDocumentsPerStudent.folderName;
  //               else
  //                 nameFolder = this.CurrentDocumentsPerStudent.name;

  //               this.DocumentPerStudentService.UploadFewDocumentsPerStudent(this.SchoolId,
  //                 this.StudentId, this.ListDocumentsPerStudent, nameFolder, this.uniqueCodeID, this.SchoolService.userId, this.SchoolService.CustomerId)
  //                 .subscribe(
  //                   d => {
  //                     for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
  //                       if (this.ListDocuments[index3][0].requiredDocumentPerStudentId == this.CurrentDocumentsPerStudent.requiredDocumentPerStudentId)
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
  //                             let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerStudent == this.CurrentDocumentsPerStudent.iddocumentPerStudent);

  //                             if (y >= 0) {

  //                               this.ListDocuments[index3][y] = d[0];
  //                             }
  //                           }

  //                         }
  //                     }
  //                     this.CurrentDocumentsPerStudent;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
  //                     debugger
  //                   }
  //                   , e => {

  //                     this.CurrentDocumentsPerStudent;
  //                     this.ngxService.stop();
  //                     this.FolderLength = 0;
  //                     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

  //                   });


  //             }

  //             this.CurrentDocument = new DocumentsPerStudent();
  //             this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.FolderLength].name + ' יש בעיה ', sticky: true });

  //           }
  //         )

  //     }
  //   }

  // }

  //הצגת קובץ בחלון חדש


  DisplayDocInNewWindow(doc: DocumentsPerStudent) {

    window.open(doc.path);
  }

  //הורדת קובץ
  DownloadDoc(doc: DocumentsPerStudent) {
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
  DownloadFewDoc(docs: DocumentsPerStudent[]) {
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
  DownloadallDoc(docs: DocumentsPerStudent[]) {
    docs.forEach(doc => {
      this.DownloadDoc(doc);
      debugger;
    })
  }
  chooseAll(docs: DocumentsPerStudent[], event: any) {

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

  //מחיקת קובץ
  DeleteDoc(doc: DocumentsPerStudent, IsFolder: boolean = false) {
    // ------------
    var path;
    path = doc.path;
    debugger;


    this.DocumentPerStudentService.DeleteDocumentPerStudent(doc.iddocumentPerStudent, this.StudentId).subscribe(s => {
      debugger;

      // אם זה מחיקת קובץ מתיקיה
      if (IsFolder) {
        let y;
        for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
          if (this.ListDocuments[index2][0].folderId == doc.folderId) {
            y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerStudent == doc.iddocumentPerStudent)
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
        if (doc.requiredDocumentPerStudentId != undefined) {
          doc.dateUpdated = undefined;
          doc.iddocumentPerStudent = 0;
          doc.path = undefined;
          doc.userUpdatedId = undefined;
          doc.userUpdatedId = undefined;
          doc.dateCreated = undefined;
          doc.name = s;
          doc.type = undefined;
          doc.folderId = undefined;
          doc.folderName = s;
          doc.indexFolder = 0;
          let y = this.StudentService.ListStudent.findIndex(f => f.idstudent == doc.studentId);
          if (y >= 0) {
            this.StudentService.ListStudent[y].numExsistRequiredPerStudent--;
          }
        }

        else
          //   קבצים קיימים ולא דרושים
          if (doc.iddocumentPerStudent > 0 && (doc.requiredDocumentPerStudentId == undefined || doc.requiredDocumentPerStudentId == 0)) {
            let x = this.ListDocuments.findIndex(f => f[0].iddocumentPerStudent == doc.iddocumentPerStudent);
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
  DeleteFewDoc(docs: DocumentsPerStudent[]) {

    this.ngxService.start();



    let requiredDocumentPerStudentId = docs[0].requiredDocumentPerStudentId != undefined ? docs[0].requiredDocumentPerStudentId : 0;
    //מחיקת הקבצים מהמסד נתונים
    this.DocumentPerStudentService.DeleteFewDocumentPerStudent(docs[0].folderId, requiredDocumentPerStudentId, this.StudentId).subscribe(
      s => {
        debugger;

        for (let index = 0; index < this.ListDocuments.length; index++) {
          if (this.ListDocuments[index] == docs)
            if (s != undefined && s.requiredDocumentPerStudentId > 0) {
              let x = new Array<DocumentsPerStudent>();
              x.push(s);
              this.ListDocuments[index] = null;
              this.ListDocuments[index] = x;
              let y = this.StudentService.ListStudent.findIndex(f => f.idstudent == docs[0].studentId);
              if (y >= 0) {
                this.StudentService.ListStudent[y].numExsistRequiredPerStudent--;
              }
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
        debugger;
      }
      , er => {
        debugger;
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
      });
  }

  //פתיחת תיקיה והצגת הקבצים שבתוכה
  OpenFolder(docs: DocumentsPerStudent[]) {
    this.ListFilesOnFolder = docs;
    this.IsFolder = true;
    this.IsEditName = false;
  }

  //דיאלוג לשאלה אם רוצה למחוק תיקיה
  confirmFolder(docs: DocumentsPerStudent[]) {
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


  confirmFiles(docs: DocumentsPerStudent[], IsFolder: boolean = true) {
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
  confirmDeleteFile(doc: DocumentsPerStudent, IsFolder: boolean = false) {
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
  ChangeNameDoc(doc: DocumentsPerStudent) {
    this.IsEditName = true;
    this.NameFile = doc.name;
    this.idfile = doc.iddocumentPerStudent;
  }

  //שמירת ההחלפת שם לקובץ
  SaveNameFile(doc: DocumentsPerStudent, FolderId: number = 0) {
    debugger;
    this.IsEditName = false;
    this.DocumentPerStudentService.SaveNameFile(this.idfile, this.NameFile).subscribe(
      da => {
        if (FolderId > 0) {
          for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
            if (this.ListDocuments[index2][0].folderId == FolderId) {
              let y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerStudent == this.idfile)
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
            if (element[0].iddocumentPerStudent == this.idfile) {
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

  isAllFilesOpenByThisUser(doc: DocumentsPerStudent[]) {
    if (doc.length == 0)
      return true
    let index = doc.findIndex(f => f.userCreatedId != this.SchoolService.ListSchool[0].userId)
    return (index != null && index > -1);
  }

  isFilesSelectedOpenByThisUser(doc: DocumentsPerStudent[]) {
    debugger
    let selectedDocs = new Array<DocumentsPerStudent>()
    doc.forEach(
      d => {
        if (d.isSelected)
          selectedDocs.push(d)
      }
    )

    return this.isAllFilesOpenByThisUser(selectedDocs)
  }


  isFilesSelected(doc: DocumentsPerStudent[]) {
    let flag = false;
    doc.forEach(d => {
      if (d.isSelected)
        flag = true;
    })
    return !flag
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
  AddNewDocumentsPerStudent() {
    debugger;
    this.CurrentDocumentsPerStudent = new DocumentsPerStudent();
    this.CurrentDocumentsPerStudent.schoolId = this.SchoolId;
    this.CurrentDocumentsPerStudent.studentId = this.StudentId;
    this.CurrentDocumentsPerStudent.indexFolder = 0;
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
        this.CurrentDocumentsPerStudent = new DocumentsPerStudent();
        this.CurrentDocumentsPerStudent.schoolId = this.SchoolId;
        this.CurrentDocumentsPerStudent.studentId = this.StudentId;
        this.CurrentDocumentsPerStudent.indexFolder = 0;
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
          this.CurrentDocumentsPerStudent.exsistDocumentId = data;
        if (this.CurrentDocumentsPerStudent.name == undefined && this.filesLst != undefined && this.filesLst.length > 1) {
          let name = prompt("הכנס שם תיקיה", "לא נבחר שם")
          this.CurrentDocumentsPerStudent.name=name
        }

        this.CurrentDocumentsPerStudent.folderName = this.CurrentDocumentsPerStudent.name;
        this.uploadDocument(this.filesLst, true, false);
      },
      er => {
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
      }
    );
  }
}
