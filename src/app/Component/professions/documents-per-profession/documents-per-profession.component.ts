import { ExsistDocumentService } from './../../../Service/exsist-document.service';
import { GenericFunctionService } from './../../../Service/generic-function.service';
import { ProfessionService } from 'src/app/Service/profession.service';
import { DocumentPerProfessionService } from './../../../Service/document-per-profession.service';
import { FilesAzureService } from './../../../Service/files-azure.service';
import { SchoolService } from './../../../Service/school.service';
import { DocumentsPerProfession } from './../../../Class/documents-per-profession';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import * as fileSaver from 'file-saver';

@Component({
  selector: 'app-documents-per-Profession',
  templateUrl: './documents-per-Profession.component.html',
  styleUrls: ['./documents-per-Profession.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService]
})

export class DocumentsPerProfessionComponent implements OnInit {

  //החלונית של בחירת קובץ בודד
  @ViewChild('file') fileInput: ElementRef;
  //חלונית לבחיקת קבצים מרובים
  @ViewChild('file2') fileInput2: ElementRef;

  ListDocuments: any;// Array<DocumentsPerProfession> = new Array<DocumentsPerProfession>();
  ProfessionId: number;
  fileD: File;
  CurrentDocumentsPerProfession: DocumentsPerProfession;
  //משתנה מסמל להצגת הקובץ באותו חלון
  visible = false;
  path: any;
  passport: DocumentsPerProfession = new DocumentsPerProfession();
  //מסמכים להעלות לתיקיה
  ListDocumentsPerProfession: Array<DocumentsPerProfession> = new Array<DocumentsPerProfession>();
  //משתנה המונה את מספר הנסיונות העלאת קבצים כדי לדעת מתי הוא באחרון
  numSuccess: number = 0;
  CurrentDocument: DocumentsPerProfession;
  IsFolder = false;
  ListFilesOnFolder: Array<DocumentsPerProfession>;
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

  constructor(private confirmationService: ConfirmationService, public DocumentPerProfessionService: DocumentPerProfessionService,
    public SchoolService: SchoolService, public ProfessionService: ProfessionService, private active: ActivatedRoute, public router: Router,
    private FilesAzureService: FilesAzureService, private ExsistDocumentService: ExsistDocumentService,
    public sanitizer: DomSanitizer, private ngxService: NgxUiLoaderService,
    private messageService: MessageService, public GenericFunctionService: GenericFunctionService) {
  }

  ngOnInit(): void {

    if (this.SchoolService.ListSchool == null || this.SchoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.active.params.subscribe(c => { this.ProfessionId = c["id"] })
    this.active.params.subscribe(c => { this.SchoolId = c["schoolId"] })
    this.active.params.subscribe(c => { this.uniqueCodeID = c["uniqueCodeID"] })
    this.active.params.subscribe(c => { this.YearBookId = c["YearbookID"] })

    debugger;

    this.CurrentSchool = this.SchoolService.ListSchool.find(f => f.school.idschool == this.SchoolId)
    // if (this.YearBookId != this.SchoolService.SelectYearbook.idyearbook)
    // this.GenericFunctionService.GoBackToLastPage();

    this.DocumentPerProfessionService.getLstDocumentPerProfession(this.SchoolId, this.ProfessionId)
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
  ChangeDoc(doc: DocumentsPerProfession, IsMultiple: boolean = true, FolderLength: number = 0, IsChange: boolean = false, lengthFolder: number = 0) {
    debugger;
    this.FolderLength = FolderLength;
    this.IsChangeDoc = IsChange;
    this.CurrentDocumentsPerProfession = new DocumentsPerProfession();
    this.CurrentDocumentsPerProfession = { ...doc };
    let event = new MouseEvent('click', { bubbles: false });
    if (IsMultiple)
      this.fileInput.nativeElement.dispatchEvent(event);
    else
      this.fileInput2.nativeElement.dispatchEvent(event);
    // if (FolderLength > 0 && this.CurrentDocumentsPerProfession.folderName != null)
    //   this.CurrentDocumentsPerProfession.name = this.CurrentDocumentsPerProfession.folderName;
  }

  //הצגת קובץ
  DisplayDoc(doc: DocumentsPerProfession) {
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
      this.ListDocumentsPerProfession = new Array<DocumentsPerProfession>();

      debugger;
      this.CurrentDocument = { ...this.CurrentDocumentsPerProfession };
      let path = this.SchoolId + "-Professions-" + this.ProfessionId + '-';
      let flag: boolean = false
      //נדרשים
      if (this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId != null && this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId > 0) {
        path = path + 'r' + this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId + "&FileName=";
        flag = confirm("האם ברצונך להשאיר את השם של הקובץ כפי שמופיע באתר?")
      }
      //קיימים ולא דרושים
      else
        path = path + 'd' + this.CurrentDocumentsPerProfession.exsistDocumentId + "&FileName=";

      for (let index = this.CurrentDocumentsPerProfession.indexFolder; index < this.CurrentDocumentsPerProfession.indexFolder + files.length; index++) {
        oldpath = this.CurrentDocumentsPerProfession.path;
        pathDoc = path + index;
        this.fileD = files[index - this.CurrentDocumentsPerProfession.indexFolder];
        if (flag) {
          const newFile = new File([this.fileD], this.CurrentDocument.name, { type: this.fileD.type });
          this.fileD = newFile
        }
        this.FilesAzureService.uploadFileToAzure(this.fileD, pathDoc, this.SchoolId)
          .subscribe(
            d => {
              this.numSuccess++;
              this.CurrentDocument = { ...this.CurrentDocumentsPerProfession };
              this.CurrentDocument.path = d;
              this.CurrentDocument.ProfessionId = this.ProfessionId;
              if (!flag)
                this.CurrentDocument.name = files[index - this.CurrentDocumentsPerProfession.indexFolder].name;
              this.CurrentDocument.schoolId = this.SchoolId;

              // שמירת סוג הקובץ
              var index2 = files[index - this.CurrentDocumentsPerProfession.indexFolder].name.lastIndexOf('.')
              if (index2 > -1) {
                this.type = files[index - this.CurrentDocumentsPerProfession.indexFolder].name.substring(index2);
                if (!flag)
                  this.CurrentDocument.name = files[index - this.CurrentDocumentsPerProfession.indexFolder].name.substring(0, index2);

              }
              else {
                this.type = '';
                if (!flag)
                  this.CurrentDocument.name = files[index - this.CurrentDocumentsPerProfession.indexFolder].name;
              }
              this.CurrentDocument.type = this.type;

              if (this.IsChangeDoc == false) {
                this.CurrentDocument.dateCreated = new Date();
                this.CurrentDocument.userCreatedId = this.CurrentSchool.userId;
                this.CurrentDocument.iddocumentPerProfession = 0;
              }
              else {
                this.CurrentDocument.dateUpdated = new Date();
                this.CurrentDocument.userUpdatedId = this.CurrentSchool.userId;
              }

              //מחיקת הקובץ הישן
              if (this.IsChangeDoc == true && oldpath != undefined && oldpath != "" && oldpath != d + this.FilesAzureService.tokenAzure) {
                this.FilesAzureService.DeleteFileFromAzure(oldpath).subscribe(s => { }, er => { });
              }
              // this.CurrentDocument.requiredDocumentPerProfessionId = this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId;
              // this.CurrentDocument.folderId = this.CurrentDocumentsPerProfession.folderId;
              // this.CurrentDocument.folderCreated = this.CurrentDocumentsPerProfession.folderCreated;

              this.ListDocumentsPerProfession.push(this.CurrentDocument);
              if (this.numSuccess == files.length && this.ListDocumentsPerProfession.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0 && this.uniqueCodeID == 0) {
                    //שמירה ב-DB
                    this.DocumentPerProfessionService.UploadDocumentPerProfession(this.SchoolId, this.ProfessionId, this.ListDocumentsPerProfession[0], 0, this.uniqueCodeID)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerProfession.iddocumentPerProfession == 0 || this.CurrentDocumentsPerProfession.iddocumentPerProfession == undefined)
                            &&
                            this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId != undefined &&
                            this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerProfessionId == this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerProfession>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerProfession.iddocumentPerProfession == 0 || this.CurrentDocumentsPerProfession.iddocumentPerProfession == undefined)
                              && (this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId == undefined ||
                                this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId == 0)) {
                              let arr = new Array<DocumentsPerProfession>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerProfession.iddocumentPerProfession != undefined && this.CurrentDocumentsPerProfession.iddocumentPerProfession > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerProfession == this.CurrentDocumentsPerProfession.iddocumentPerProfession);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }


                          debugger;

                          this.CurrentDocumentsPerProfession = new DocumentsPerProfession();
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
                    nameFolder = this.CurrentDocumentsPerProfession.folderName;
                    let CustomerId = this.SchoolService.CustomerId != null ? this.SchoolService.CustomerId : 0;
                    this.DocumentPerProfessionService.UploadFewDocumentsPerProfession(this.SchoolId,
                      this.ProfessionId, this.ListDocumentsPerProfession, nameFolder, this.uniqueCodeID, this.SchoolService.userId, CustomerId)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId != null && this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId > 0 && this.ListDocuments[index3][0].requiredDocumentPerProfessionId == this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId)
                                || (this.CurrentDocumentsPerProfession.exsistDocumentId != null && this.CurrentDocumentsPerProfession.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerProfession.exsistDocumentId))
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerProfession == this.CurrentDocumentsPerProfession.iddocumentPerProfession);
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
                          this.CurrentDocumentsPerProfession;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger

                        }
                        , e => {

                          this.CurrentDocumentsPerProfession;
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
              if (this.numSuccess == files.length && this.ListDocumentsPerProfession.length > 0) {
                {
                  if (files.length == 1 && this.FolderLength == 0 && this.uniqueCodeID == 0) {
                    //שמירה ב-DB
                    this.DocumentPerProfessionService.UploadDocumentPerProfession(this.SchoolId, this.ProfessionId, this.ListDocumentsPerProfession[0], 0, this.uniqueCodeID)
                      .subscribe(
                        d => {
                          debugger;

                          //דרושים ועדיין לא קיימים
                          if ((this.CurrentDocumentsPerProfession.iddocumentPerProfession == 0 || this.CurrentDocumentsPerProfession.iddocumentPerProfession == undefined)
                            &&
                            this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId != undefined &&
                            this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId > 0) {
                            let y = this.ListDocuments.findIndex(f => f.length == 1 && f[0].requiredDocumentPerProfessionId == this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId);
                            if (y >= 0) {
                              let arr = new Array<DocumentsPerProfession>();
                              arr.push(d);
                              this.ListDocuments[y] = arr;
                            }
                          }
                          else
                            //לא דרושים -חדשים
                            if ((this.CurrentDocumentsPerProfession.iddocumentPerProfession == 0 || this.CurrentDocumentsPerProfession.iddocumentPerProfession == undefined)
                              && (this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId == undefined ||
                                this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId == 0)) {
                              let arr = new Array<DocumentsPerProfession>();
                              arr.push(d);
                              this.displayDialog = false;
                              this.ListDocuments.push(arr);
                            }
                            else
                              // דרושים או חדשים שכבר קיימים
                              if (this.CurrentDocumentsPerProfession.iddocumentPerProfession != undefined && this.CurrentDocumentsPerProfession.iddocumentPerProfession > 0) {
                                debugger;
                                let y;
                                y = this.ListDocuments.findIndex(f => f[0].iddocumentPerProfession == this.CurrentDocumentsPerProfession.iddocumentPerProfession);
                                if (y >= 0) {
                                  this.ListDocuments[y][0] = d;
                                }
                              }


                          debugger;

                          this.CurrentDocumentsPerProfession = new DocumentsPerProfession();
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
                    nameFolder = this.CurrentDocumentsPerProfession.folderName;
                    let CustomerId = this.SchoolService.CustomerId != null ? this.SchoolService.CustomerId : 0;
                    this.DocumentPerProfessionService.UploadFewDocumentsPerProfession(this.SchoolId,
                      this.ProfessionId, this.ListDocumentsPerProfession, nameFolder, this.uniqueCodeID, this.SchoolService.userId, CustomerId)
                      .subscribe(
                        d => {
                          //קובץ קיים או מהנדרש
                          if (isRequired) {
                            for (let index3 = 0; index3 < this.ListDocuments.length; index3++) {
                              if ((this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId != null && this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId > 0 && this.ListDocuments[index3][0].requiredDocumentPerProfessionId == this.CurrentDocumentsPerProfession.requiredDocumentPerProfessionId)
                                || (this.CurrentDocumentsPerProfession.exsistDocumentId != null && this.CurrentDocumentsPerProfession.exsistDocumentId > 0 && this.ListDocuments[index3][0].exsistDocumentId == this.CurrentDocumentsPerProfession.exsistDocumentId))
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
                                    let y = this.ListDocuments[index3].findIndex(f => f.iddocumentPerProfession == this.CurrentDocumentsPerProfession.iddocumentPerProfession);
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
                          this.CurrentDocumentsPerProfession;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'info', summary: '', detail: 'הקבצים הועלו בהצלחה' });
                          debugger

                        }
                        , e => {

                          this.CurrentDocumentsPerProfession;
                          this.ngxService.stop();
                          this.FolderLength = 0;
                          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

                        });
                  }
                }
              }
              else
                if (this.numSuccess == files.length && this.ListDocumentsPerProfession.length == 0)
                  this.ngxService.stop();
              this.CurrentDocument = new DocumentsPerProfession();
              this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' בקובץ ' + files[index - this.CurrentDocumentsPerProfession.indexFolder].name + ' יש בעיה ', sticky: true });

            }
          )
      }
    }

  }


  DisplayDocInNewWindow(doc: DocumentsPerProfession) {

    window.open(doc.path);
  }

  //הורדת קובץ
  DownloadDoc(doc: DocumentsPerProfession) {
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
  DownloadFewDoc(docs: DocumentsPerProfession[]) {
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
  // הורדת כל התיקייה
  DownloadallDoc(docs: DocumentsPerProfession[]) {
    docs.forEach(doc => {
      this.DownloadDoc(doc);
      debugger;
    })
  }
  //מחיקת קובץ
  DeleteDoc(doc: DocumentsPerProfession, IsFolder: boolean = false) {
    debugger;
    this.FilesAzureService.DeleteFileFromAzure(doc.path).subscribe(response => {
      debugger;

    }, error => {
      // this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });

      debugger; console.log('Error delete the file')
    });
    let uniqueCodeId;
    uniqueCodeId = doc.uniqueCodeId != null ? doc.uniqueCodeId : 0;
    this.DocumentPerProfessionService.DeleteDocumentPerProfession(doc.iddocumentPerProfession, this.ProfessionId, uniqueCodeId).subscribe(s => {
      debugger;

      // אם זה מחיקת קובץ מתיקיה
      if (IsFolder) {
        let y;
        for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
          if (this.ListDocuments[index2][0].folderId == doc.folderId) {
            y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerProfession == doc.iddocumentPerProfession)
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
        if (doc.requiredDocumentPerProfessionId != undefined) {
          doc.dateUpdated = undefined;
          doc.iddocumentPerProfession = 0;
          doc.path = undefined;
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
          if (doc.iddocumentPerProfession > 0 && (doc.requiredDocumentPerProfessionId == undefined || doc.requiredDocumentPerProfessionId == 0)) {
            let x = this.ListDocuments.findIndex(f => f[0].iddocumentPerProfession == doc.iddocumentPerProfession);
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
  DeleteFewDoc(docs: DocumentsPerProfession[]) {

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
    console.log(docs[0].folderId);
    var unique = docs[0].uniqueCodeId;
    if (unique == null)
      unique = 0;

    let requiredDocumentPerProfessionId = docs[0].requiredDocumentPerProfessionId != undefined ? docs[0].requiredDocumentPerProfessionId : 0;
    //מחיקת הקבצים מהמסד נתונים
    this.DocumentPerProfessionService.DeleteFewDocumentPerProfession(docs[0].folderId, requiredDocumentPerProfessionId, this.ProfessionId, unique).subscribe(
      s => {
        debugger;

        for (let index = 0; index < this.ListDocuments.length; index++) {
          if (this.ListDocuments[index] == docs)
            if (s != undefined && s.requiredDocumentPerProfessionId > 0) {
              let x = new Array<DocumentsPerProfession>();
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
  OpenFolder(docs: DocumentsPerProfession[]) {
    this.ListFilesOnFolder = docs;
    this.IsFolder = true;
    this.IsEditName = false;
  }

  //דיאלוג לשאלה אם רוצה למחוק תיקיה
  confirmFolder(docs: DocumentsPerProfession[]) {
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
  confirmDeleteFile(doc: DocumentsPerProfession, IsFolder: boolean = false) {
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
  ChangeNameDoc(doc: DocumentsPerProfession) {
    this.IsEditName = true;
    this.NameFile = doc.name;
    this.idfile = doc.iddocumentPerProfession;
  }

  //שמירת ההחלפת שם לקובץ
  SaveNameFile(doc: DocumentsPerProfession, FolderId: number = 0) {
    debugger;
    this.IsEditName = false;
    var uniqeId = doc.uniqueCodeId != null ? doc.uniqueCodeId : 0;
    this.DocumentPerProfessionService.SaveNameFile(this.idfile, this.NameFile, uniqeId).subscribe(
      da => {
        if (FolderId > 0) {
          for (let index2 = 0; index2 < this.ListDocuments.length; index2++) {
            if (this.ListDocuments[index2][0].folderId == FolderId) {
              let y = this.ListDocuments[index2].findIndex(f => f.iddocumentPerProfession == this.idfile)
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
            if (element[0].iddocumentPerProfession == this.idfile) {
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
  isAllFilesOpenByThisUser(doc: DocumentsPerProfession[]) {
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
  AddNewDocumentsPerProfession() {
    debugger;
    this.CurrentDocumentsPerProfession = new DocumentsPerProfession();
    this.CurrentDocumentsPerProfession.schoolId = this.SchoolId;
    this.CurrentDocumentsPerProfession.ProfessionId = this.ProfessionId;
    this.CurrentDocumentsPerProfession.indexFolder = 0;
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
        this.CurrentDocumentsPerProfession = new DocumentsPerProfession();
        this.CurrentDocumentsPerProfession.schoolId = this.SchoolId;
        this.CurrentDocumentsPerProfession.ProfessionId = this.ProfessionId;
        this.CurrentDocumentsPerProfession.indexFolder = 0;
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
          this.CurrentDocumentsPerProfession.exsistDocumentId = data;
          if (this.CurrentDocumentsPerProfession.name == undefined && this.filesLst != undefined && this.filesLst.length > 1) {
            let name = prompt("הכנס שם תיקיה", "לא נבחר שם")
            this.CurrentDocumentsPerProfession.name = name
          }
        this.CurrentDocumentsPerProfession.folderName = this.CurrentDocumentsPerProfession.name;

        this.uploadDocument(this.filesLst, true, false);

      },
      er => {
        this.ngxService.stop();
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסו שוב' });
      }
    );
  }

}
