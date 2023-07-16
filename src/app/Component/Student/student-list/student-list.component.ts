import { Component, OnInit } from '@angular/core';
import { StudentService } from 'src/app/Service/student.service'
import { SchoolService } from 'src/app/Service/school.service';
import { Student } from 'src/app/Class/student';
import { AddOrUpdateComponent } from '../add-or-update/add-or-update.component';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SelectItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { StreetService } from 'src/app/Service/street.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class StudentListComponent implements OnInit {
  selectFilter: Array<any>;
  data: Array<SelectItem>
  ADate: SelectItem
  //משתנה בוליאני לפתיחת דיאלוג הוספה או עריכה
  OpenDialogAOU: boolean = false;
  excelStudentList:Array<any>=new Array<any>()
  constructor(public studentService: StudentService, public schoolService: SchoolService, private router: Router,
    private messageService: MessageService, private confirmationService: ConfirmationService,
    private ngxService: NgxUiLoaderService,private StreetService:StreetService
  ) { }

  ngOnInit(): void {
    debugger;
    console.log(window.location.href);
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    if (this.studentService.ListStudent == null || this.studentService.ListStudent.length == 0 || this.studentService.YearbookIdPerStudent != this.schoolService.SelectYearbook.idyearbook)
      this.GetListStudent();
  }
  //שליפת התלמידים
  GetListStudent() {
    debugger
    this.studentService.GetListStudentsBySchoolIdAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => { debugger; this.studentService.ListStudent = data 
      for(let i=0;i<this.studentService.ListStudent.length;i++){
        this.studentService.ListStudent[i].index=i+1
      }
    }, er => { debugger; console.log(er) });
    // this.studentService.ListStudent.push(new Student(1,"123456789",1,"רחל","לוי","",new Date(),"1234",1,"","","","","","","","","",1,1,1,1,true,"","",",","","",1,new Date(),1,new Date());
  }
  //עריכת פרטי תלמיד
  EditDetailsStudent(StudentID: number) {
    debugger;
    this.router.navigate(["Home/AddOrUpdateStudent/" + StudentID])
  }
  //הוספת תלמיד
  AddStudent() {
    debugger;
    this.router.navigate(["Home/AddOrUpdateStudent/" + 0])
  }
  //מחיקת תלמיד
  DeletStudent(student: Student) {
    debugger;
    this.confirmationService.confirm({
      message: 'האם הנך בטוח כי ברצונך למחוק תלמיד זה   ?  ',
      header: 'מחיקת תלמיד',
      icon: 'pi pi-info-circle',
      acceptLabel: ' מחק ',
      rejectLabel: ' ביטול ',
      accept: () => {
        debugger;
        this.ngxService.start();

        this.studentService.DeleteStudent(student.idstudent).subscribe(data => {
          if (data == true) {
            var i = this.studentService.ListStudent.findIndex(f => f.idstudent == student.idstudent);
            this.studentService.ListStudent.splice(i, 1);
            this.messageService.add({ severity: 'success', summary: 'המחיקה הצליחה', detail: 'התלמיד הוסר בהצלחה' });
          }
          else
            this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'המחיקה נכשלה ,אנא נסה שנית', sticky: true });
        }, er => { this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'המחיקה נכשלה ,אנא נסה שנית', sticky: true }); });
        this.ngxService.stop();

      },
      reject: () => {
      }
    });

  }

  GoToDocumentsPerStudent(Student: Student) {
    this.studentService.NameStudent = Student.lastName + ' ' + Student.firstName;
    this.studentService.CurrentStudent = { ...Student };

    this.router.navigate(['Home/DocumentsPerStudent', Student.idstudent, Student.schoolId, this.schoolService.SelectYearbook.idyearbook])
  }
  // exportExcel() {
  //   debugger;
  //  var fileName=this.data.find(f=>f.value==this.ADate).label;

  //   import("xlsx").then(xlsx => {
  //     const worksheet = xlsx.utils.json_to_sheet(this.ListStudentInGroup);
  //     const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  //     const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
  //     this.saveAsExcelFile(excelBuffer, "Students");
  //   });
  // }

  // saveAsExcelFile(buffer: any, fileName: string): void {
  //   console.log(
  //          this.data

  //   );
  //   fileName=this.data.find(f=>f.value==this.ADate).label;
  //   import("file-saver").then(FileSaver => {
  //     let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  //     let EXCEL_EXTENSION = '.xlsx';
  //     const data: Blob = new Blob([buffer], {
  //       type: EXCEL_TYPE
  //     });
  //     FileSaver.saveAs(data, fileName );
  //   });
  // }

  // PushToSelectObject() {
  //   this.data = new Array<SelectItem>();
  //   this.studentService.ListStudent.forEach(element => {
  //     this.data.push({ label: element.Name, value: element.Id });
  //   });
  // }
  ChangeCity(s) {
    
    if ((this.StreetService.StreetsPerCity == null || this.StreetService.StreetsPerCity.length == 0 || this.StreetService.StreetsPerCity[0].cityId != s.City.value) && (s != null && s.City != null))
      this.StreetService.GetStreetsByCityId(s.City.value).subscribe(data => { this.StreetService.StreetsPerCity = data }, er => { })
  }
  
exportExcelAsync()
{debugger
 return new Promise((resolve, reject) => {
   
  
    
   let genercListStudent:Array<any>=this.studentService.ListStudent
    genercListStudent.forEach(d=>
      this.studentService.GetStudentDetailsByIDStudent(d.idstudent)
      .subscribe(s => {
        
        let status=this.schoolService.Status.find((f) => f.value == s.statusId)
        let studentStatus=this.schoolService.StatusStudent.find((f) => f.value == s.statusStudentId)
        let city
        let neigborhood
        if (s.address!=null){
         city = this.schoolService.Cities.find((f) => f.value == s.address.cityId);
         neigborhood = this.schoolService.Neigborhoods.find(
          (f) => f.value ==s.address.neighborhoodId
        );
        }
        let street
        if (city != '') {
          this.ChangeCity(s);
           street = this.StreetService.StreetsPerCity.find(
            (f) => f.idstreet == s.address.streetId
          );
        }
        let citizenship
        let country
        let countryofImmigration
        if (s.birth!=null){
         citizenship = this.schoolService.Countries.find(
          (f) => f.value == s.birth.citizenshipId
        );
         country = this.schoolService.Countries.find(
          (f) => f.value == s.birth.birthCountryId
        );
        countryofImmigration =
        this.schoolService.Countries.find(
          (f) => f.value == s.birth.countryIdofImmigration
        );
       }
       debugger;
        let gender = this.schoolService.Genders.find(
          (f) => f.idGender == s.genderId
        );
        console.log(this.schoolService.Genders)
      
    
        let typeIdentity = this.schoolService.TypeIdentitys.find(
          (f) => f.value == s.typeIdentityId
        );
       let fatherTypeIdentity =
          this.schoolService.TypeIdentitys.find(
            (f) => f.value == s.fatherTypeIdentityId
          );
       let motherTypeIdentity =
          this.schoolService.TypeIdentitys.find(
            (f) => f.value == s.motherTypeIdentityId
          );
       let apotropusTypeIdentity =
          this.schoolService.TypeIdentitys.find(
            (f) => f.value ==s.apotropusTypeIdentityId
          );
       
      this.excelStudentList.push(
        {'tz': s.tz,
        'typeTz': typeIdentity!=null?typeIdentity.name:'',
        'code':s.code,
        'fname':s.firstName,
        'lname':s.lastName,
        'gender':gender!=null?gender.name:'',
        'eBirthdate': s.birth!=null?s.birth.birthDate:'',
        'hBirthdate': s.birth!=null?s.birth.birthHebrewDate:'',
        'birthCountry':country!=null?country.name:'',
        'citizenship':citizenship!=null?country.name:'',
        'imigrationDate':s.birth!=null?s.birth.dateOfImmigration:'',
        'imigrationCountry':countryofImmigration!=null?countryofImmigration.name:'',
        'famStatus': status!=null?status.name:'',
        'foreginFname':s.foreignFirstName,
        'foreginLname':s.foreignLastName,
        'prevLname':s.previusName,
        'phone1': s.contactInformation!=null?s.contactInformation.telephoneNumber1:'',
        'phone2': s.contactInformation!=null?s.contactInformation.telephoneNumber2:'',
        'cell1':s.contactInformation!=null?s.contactInformation.phoneNumber1:'',
        'cell2':s.contactInformation!=null?s.contactInformation.phoneNumber2:'',
        'cell3':s.contactInformation!=null?s.contactInformation.phoneNumber3:'',
        'fax':s.contactInformation!=null?s.contactInformation.faxNumber:'',
        'email':s.contactInformation!=null?s.contactInformation.email:'',
        'fatherTz':s.fatherTz,
        'typeFatherTz':fatherTypeIdentity!=null?fatherTypeIdentity.name:'',
        'motherTz':s.motherTz,
        'typeMotherTz':motherTypeIdentity!=null?motherTypeIdentity.name:'',
        'apotropusTz':s.apotropusTz,
        'guardianTypeTz':apotropusTypeIdentity!=null?apotropusTypeIdentity.name:'',
        'active':s.isActive?'פעיל':'לא פעיל',
        'studentStatus':studentStatus!=null?studentStatus.name:'',
        'reason':s.reasonForLeaving,
        'city':city!=null?city.name:'',
        'neighborhood':neigborhood!=null?neigborhood.name:'',
        
        'street':street!=null?street.name:'',
        'building':s.address!=null?s.address.houseNumber:'',
        'apartment':s.address!=null?s.address.apartmentNumber:'',
        'poBox': s.address!=null?s.address.poBox:'',
        'zip':s.address!=null?s.address.zipCode:'',
        'moreDetails':s.anatherDetails,
        'note':s.note}
      )
      
    }
    
    )
  
  )
});
 
}

sendToExportExcel()
{
  if(this.excelStudentList.length==0)
  {
      this.exportExcelAsync()
    .then(()=>
    {
      debugger
    this.exportExcel()
    }
  )
  }
  else
  this.exportExcel()
}

  exportExcel() {
    
    debugger;
   //var fileName=this.data.find(f=>f.value==this.ADate).label;
   let Heading = [['מספר זיהוי','	סוג זיהוי',	'קוד',	'פרטי',	'משפחה',	'מין','	תאריך לידה לועזי','תאריך עברי','	ארץ לידה',	'אזרחות','	תאריך עליה',
   	'ארץ עליה','מצב משפחתי','	פרטי בלועזית','	משפחה בלועזית'	,'שם משפחה קודם',	'טלפון1',	'טלפון2',	'נייד1',	'נייד2', 	'נייד3',	'פקס',	'מייל',	'מספר זיהוי אב',
    	'סוג זיהוי אב','	מספר זיהוי אם','	סוג זיהוי אם','	מספר זיהוי אפוטרופוס','	סוג זיהוי אפוטרופוס',	'פעיל','סטטוס תלמידה',	'סיבה',	'עיר',	'שכונה',	'רחוב',	
      'בנין',	'דירה','	ת.ד.',	'מיקוד','	פרטים נוספים',	'הערה']];


  const worksheet = XLSX.utils.json_to_sheet([]);
  XLSX.utils.sheet_add_aoa(worksheet, Heading);

  //Starting in the second row to avoid overriding and skipping headers
  XLSX.utils.sheet_add_json(worksheet, this.excelStudentList, { origin: 'A2', skipHeader: true });
  const workbook:XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  if(!workbook.Workbook) workbook.Workbook = {};
  if(!workbook.Workbook.Views) workbook.Workbook.Views = [];
  if(!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
  workbook.Workbook.Views[0].RTL = true;
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  this.saveAsExcelFile(excelBuffer, "Students");
}
   
 



  saveAsExcelFile(buffer: any, fileName: string): void {
    console.log(
           this.data

    );
    //fileName=this.data.find(f=>f.value==this.ADate).label;
    import("file-saver").then(FileSaver => {
      let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
      });
      FileSaver.saveAs(data, fileName );
    });
  }
}
