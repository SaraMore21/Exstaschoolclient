import { FilesAzureService } from './../../Service/files-azure.service';
import { DocumentPerStudentService } from './../../Service/document-per-student.service';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmEventType, MessageService } from 'primeng/api';
import { groupBy } from 'rxjs/internal/operators/groupBy';
import { School } from 'src/app/Class/school';
import { SchoolService } from 'src/app/Service/school.service';
import { CoordinationService } from 'src/app/Service/coordination.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DomSanitizer } from '@angular/platform-browser';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Time } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  styles: [
    `
      :host ::ng-deep .p-password input {
      }
    `
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService]
})
export class LoginComponent implements OnInit {
  @ViewChild('someInput') someInput: ElementRef;
  school: any;
  UserPassword: string;
  UserCode: string;
  Mosad: string;
  IsShow: boolean;
  IsFailed: boolean;
  isDisable: Boolean;
  IsChooseSchool: boolean;
  selectSchool = new School();
  selectedScools: any[];
  Schools: Array<School>;
  filename = "aaa.png";
  typefile = "Img.png"
  DisplaySelectEmail: boolean = false;
  SelectEmail: string = null;
  ListEmail: Array<string>;
  // src = "https://storagefilesmore21.blob.core.windows.net/upload-container/2/Students/366/passport.png?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D"
  src = "https://storagefilesmore21.blob.core.windows.net/upload-container/2/Students/366/3.vnd.ms-excel?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D"
  fileUrl;
  // flag: boolean = false;
  url;
  y:Time;


  constructor(private messageService: MessageService, private route: Router, public schoolService: SchoolService, private coordinationService: CoordinationService,
    private ngxService: NgxUiLoaderService, private sanitizer: DomSanitizer, private DocumentPerStudentService: DocumentPerStudentService,
    private FilesAzureService: FilesAzureService
  ) { }

  ngOnInit(): void {
    debugger
    var x="11:00"
this.y= x as unknown as Time;
    debugger;
    document.getElementById('user').focus();



  }


  //בדיקה האם קיים משתמש עם נתונים אלו
  CheckIfExsist(UserCode: string, UserPassword: string) {

    // if(this.flag==true)
    // alert("hvfjdl");
    if (this.schoolService.AllTable == null) {
      this.ngxService.start();
      this.schoolService.GetAllTable().subscribe(
        data => {
          this.schoolService.AllTable = data;
          data.forEach(f => {
            if (f.nameTable == "City")
              this.schoolService.Cities = f.listCodetable;
            else if (f.nameTable == "Gender")
              this.schoolService.Genders = f.listCodetable
            else if (f.nameTable == "TypeIdentity")
              this.schoolService.TypeIdentitys = f.listCodetable
            else if (f.nameTable == "Citizenship")
              this.schoolService.Citizenships = f.listCodetable
            else if (f.nameTable == "Country")
              this.schoolService.Countries = f.listCodetable
            else if (f.nameTable == "Neighborhood")
              this.schoolService.Neigborhoods = f.listCodetable
            else if (f.nameTable == "StatusStudent")
              this.schoolService.StatusStudent = f.listCodetable
            else if (f.nameTable == "Status")
              this.schoolService.Status = f.listCodetable
            else if (f.nameTable == "ReasonForLeaving")
              this.schoolService.reasonForLeaving = f.listCodetable
            else if (f.nameTable == "LearningStyle")
              this.schoolService.LearningStyle = f.listCodetable
            // else if(f.nameTable=="Yearbook")
            // this.schoolService.Yearbooks=f.listCodetable
            else if (f.nameTable == "TypeGroup")
              this.schoolService.TypeGroups = f.listCodetable
            else if (f.nameTable == "PaymentMethod")
              this.schoolService.PaymentMethod = f.listCodetable
            else if (f.nameTable == "PaymentStatus")
              this.schoolService.PaymentStatus = f.listCodetable
            else if (f.nameTable == "TypeTask")
              this.schoolService.TypeTask = f.listCodetable;
            else if (f.nameTable == "ProfessionCategory")
              this.schoolService.ProfessionCategories = f.listCodetable
            else if (f.nameTable == "TypeOfTaskCalculation")
              this.schoolService.TypeOfTaskCalculations = f.listCodetable
            this.ngxService.stop();
          })
          this.getSchool(UserCode, UserPassword);

        }, er => {
          debugger; this.ngxService.stop();
          alert('התרחשה שגיאה, נסו שוב.')
        });
    }
    else {
      this.ngxService.stop();
      this.getSchool(UserCode, UserPassword);
    }
  }
  //שליפת מוסד למשתמש ע"פ שם משתמש וסיסמא
  getSchool(UserCode: string, UserPassword: string) {
    debugger
    if (this.schoolService.IsCustomer == true)
      this.schoolService.GetAllSchoolAndYearbookPerCustomer(UserCode, UserPassword).subscribe(data => {
        debugger;
        if (data.status == 2) {
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: data.nameStatus });
          this.isDisable = false; return
        }
        else if (data.status == 3) {
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: data.nameStatus });
          this.isDisable = false; return

        }
        else {
          this.schoolService.ListYearbook = data.listYearbook;
          this.schoolService.ListSchool = data.listSchool;
          let listSchoolIds:Array<number> = new Array<number>()
          this.schoolService.ListSchool.forEach(
            s=> listSchoolIds.push(s.school.idschool)
          )
          debugger
          this.coordinationService.GetAllCoordinationsByListSchoolId(listSchoolIds)
          .subscribe(
            data=>{
              debugger
              this.coordinationService.listCoordinationsPerSchools=data},
            err=> {}
          )
          this.schoolService.CustomerId = data.userPerCustomerId;
          this.schoolService.userId = data.userId;

          let i = this.schoolService.ListSchool.findIndex(f => f.school.coordinationCode != undefined);
          if (i > -1) {
            this.schoolService.isCoordinationSchools = true;
            this.schoolService.ListSchool.forEach(f => { if (f.school.coordinationCode != undefined) this.schoolService.listCoordinationsCode.push(f.school.coordinationCode) });
            this.schoolService.listCoordinationsCode = this.schoolService.listCoordinationsCode.filter((n, i) => this.schoolService.listCoordinationsCode.indexOf(n) === i);
          }
          this.schoolService.SelectYearbook = data.listYearbook.find(f => new Date(Date.parse(f.fromDate)) <= new Date() && new Date(Date.parse(f.toDate)) >= new Date());
          if (this.schoolService.SelectYearbook == null) this.schoolService.SelectYearbook = data.listYearbook.find(f => f);
          this.route.navigate(['Home']);
          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 14)
            this.route.navigate(['Home/DocumentsPerSchool']);

          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 15)
            this.route.navigate(['Home/DocumentsPerSchool']);
          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 16)
            this.route.navigate(['Home/DocumentsPerSchool']);

          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 26)
            this.route.navigate(['Home/DocumentsPerSchool']);
          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 27)
            this.route.navigate(['Home/DocumentsPerSchool']);
          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 28)
            this.route.navigate(['Home/DocumentsPerSchool']);
          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 29)
            this.route.navigate(['Home/DocumentsPerSchool']);
          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 30)
            this.route.navigate(['Home/DocumentsPerSchool']);
          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 31)
            this.route.navigate(['Home/DocumentsPerSchool']);
          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 32)
            this.route.navigate(['Home/DocumentsPerSchool']);
          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 33)
            this.route.navigate(['Home/DocumentsPerSchool']);
          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 34)
            this.route.navigate(['Home/DocumentsPerSchool']);
          if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 35)
            this.route.navigate(['Home/DocumentsPerSchool']);
          if (this.schoolService.SelectYearbook == null) {
            this.schoolService.SetYearbook = true;
            this.route.navigate(['Home/SchoolDetails']);
          }
          this.schoolService.LastYearbook = this.schoolService.SelectYearbook;
          this.schoolService.YearbookEzer = this.schoolService.SelectYearbook;
          debugger;
        }
      }, er => { });
    else
      if (this.school != null && this.school.length != 0) {
        this.schoolService.ListSchool = new Array<any>();
        this.schoolService.ListSchool.push(this.school);
        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 14)
          this.route.navigate(['Home/DocumentsPerSchool']);

        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 15)
          this.route.navigate(['Home/DocumentsPerSchool']);
        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 16)
          this.route.navigate(['Home/DocumentsPerSchool']);

        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 26)
          this.route.navigate(['Home/DocumentsPerSchool']);
        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 27)
          this.route.navigate(['Home/DocumentsPerSchool']);
        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 28)
          this.route.navigate(['Home/DocumentsPerSchool']);
        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 29)
          this.route.navigate(['Home/DocumentsPerSchool']);
        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 30)
          this.route.navigate(['Home/DocumentsPerSchool']);
        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 31)
          this.route.navigate(['Home/DocumentsPerSchool']);
        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 32)
          this.route.navigate(['Home/DocumentsPerSchool']);
        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 33)
          this.route.navigate(['Home/DocumentsPerSchool']);
        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 34)
          this.route.navigate(['Home/DocumentsPerSchool']);
        if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 35)
          this.route.navigate(['Home/DocumentsPerSchool']);
        this.route.navigate(['Home']);
      }
      else
        this.schoolService.GetSchoolByUserCodeAndPassword(UserCode, UserPassword).subscribe(
          data => {
            debugger;
            if (data.status == 2) {
              this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: data.nameStatus });
              this.isDisable = false; return
            }
            else
              this.schoolService.ListSchool = data.listSchool;
            this.schoolService.ListYearbook = data.listYearbook;
            this.schoolService.userId = data.userId;

            this.schoolService.SelectYearbook = data.listYearbook.find(f => new Date(Date.parse(f.fromDate)) <= new Date() && new Date(Date.parse(f.toDate)) >= new Date());
            if (this.schoolService.SelectYearbook == null) this.schoolService.SelectYearbook = data.listYearbook.find(f => f);
            this.schoolService.LastYearbook = this.schoolService.SelectYearbook;
            this.schoolService.YearbookEzer = this.schoolService.SelectYearbook;
            if (data.listSchool.length > 1)
              this.IsChooseSchool = true;
            
            else {

              // this.schoolService.ListSchool=new Array<any>();
              // this.schoolService.ListSchool.push(data);

              // if (this.schoolService.ListSchool.length==1&&this.schoolService.ListSchool[0].school.idschool  == 14 )
              // this.route.navigate(['Home/DocumentsPerSchool',14]);

              // if (this.schoolService.ListSchool.length==1&&this.schoolService.ListSchool[0].school.idschool  == 15 )
              // this.route.navigate(['Home/DocumentsPerSchool',15]);
              this.route.navigate(['Home']);
            }
            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 14)
              this.route.navigate(['Home/DocumentsPerSchool']);

            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 15)
              this.route.navigate(['Home/DocumentsPerSchool']);
            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 16)
              this.route.navigate(['Home/DocumentsPerSchool']);

            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 26)
              this.route.navigate(['Home/DocumentsPerSchool']);
            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 27)
              this.route.navigate(['Home/DocumentsPerSchool']);
            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 28)
              this.route.navigate(['Home/DocumentsPerSchool']);
            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 29)
              this.route.navigate(['Home/DocumentsPerSchool']);
            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 30)
              this.route.navigate(['Home/DocumentsPerSchool']);
            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 31)
              this.route.navigate(['Home/DocumentsPerSchool']);
            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 32)
              this.route.navigate(['Home/DocumentsPerSchool']);
            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 33)
              this.route.navigate(['Home/DocumentsPerSchool']);
            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 34)
              this.route.navigate(['Home/DocumentsPerSchool']);
            if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1 && this.schoolService.ListSchool[0].school.idschool == 35)
              this.route.navigate(['Home/DocumentsPerSchool']);
            this.isDisable = false;
            // if (this.schoolService.SelectYearbook == null) {
            //   this.schoolService.SetYearbook = true;
            //   this.route.navigate(['Home/SchoolDetails']);
            // }
            debugger;
          }, er => {
            alert('התרחשה שגיאה, נסו שוב.' + er)
            this.isDisable = false
          });

    this.isDisable = true;
  }
  //שכחתי סיסמא
  ForgetPassword() {

    debugger;
    if (this.SelectEmail != null && this.SelectEmail != "") {
      this.DisplaySelectEmail = false;
      this.messageService.add({ key: 'tc', severity: 'info', summary: '', sticky: true, detail: 'בדקות אלו נשלחת הסיסמא למייל: ' + this.SelectEmail });
      this.schoolService.GetPasswordToEmailByUserCode(this.UserCode, this.SelectEmail).subscribe(data => { this.SelectEmail = null }
        , er => { this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסה שוב.' }); })
    }
    else {
      this.schoolService.GetPasswordToEmailByUserCode(this.UserCode, null).subscribe(data => {
        debugger;
        if (data == null)
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'לא נמצא משתמש עם שם משתמש זה' });
        else if (data.length == 0)
          this.messageService.add({ key: 'tc', severity: 'info', summary: 'שימי לב', detail: 'לא נמצאו בנתונים הקיימים מייל ,אנא פני למזכירת המוסד בכדי להסדיר את הענין.' });
        else if (data.length == 1)
          this.messageService.add({ key: 'tc', severity: 'info', summary: '', sticky: true, detail: 'נשלחה אליך הסיסמא למייל: ' + data[0] });
        else {
          this.DisplaySelectEmail = true;
          this.ListEmail = data;
        }
      }, er => {
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסה שוב.' });

      });
    }
  }
  SentEmail() {

  }

}
