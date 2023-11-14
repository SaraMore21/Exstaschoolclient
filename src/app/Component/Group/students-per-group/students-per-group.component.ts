import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from 'src/app/Service/group.service';
import { SchoolService } from 'src/app/Service/school.service';
import { StudentService } from 'src/app/Service/student.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { StreetService } from 'src/app/Service/street.service';
import {
  NgbCalendar,
  NgbCalendarHebrew, NgbDate,
  NgbDatepickerI18n,
  NgbDatepickerI18nHebrew,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { ConvertDateToStringService } from 'src/app/Service/convert-date-to-string.service';
import { StudentPerGroup } from 'src/app/Class/student-per-group';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';
import { HebrewCalanderService } from 'src/app/Service/hebrew-calander.service';
import * as XLSX from 'xlsx';
import { Street } from 'src/app/Class/street';
import { async } from 'rxjs/internal/scheduler/async';

@Component({
  selector: 'app-students-per-group',
  templateUrl: './students-per-group.component.html',
  styleUrls: ['./students-per-group.component.css'],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew },
    [MessageService, ConfirmationService]
  ],
  encapsulation: ViewEncapsulation.None,
})
export class StudentsPerGroupComponent implements OnInit {
  id: number;
  ListStudentPerGroup: Array<StudentPerGroup>;
  NameGroup: string;
  AddSPG: boolean = false;
  ListStudentNotInGroup: Array<StudentPerGroup> = new Array<StudentPerGroup>();
  openDialog: boolean = false;
  openMultipleDialog: boolean = false;
  FromDate: any;
  ToDate: any;
  disabled: boolean = false;
  newStudentId: number;
  selectedOption: any = null;
  checked1: boolean = false;
  options: any[] = [{ name: 'הזנה ידנית ', key: 'A' }, { name: 'הזנה אוטומטית', key: 'M' }];
  Today = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate() + "T00:00:00";
  EditDialog: boolean = false;
  FromDateEdit: NgbDateStruct;
  ToDateEdit: NgbDateStruct;
  editStudent: StudentPerGroup;
  IsExixtTask: boolean = false;
  ListTask: any;
  selectedTask: any;
  excelStudentPerGroupList: Array<any> = new Array<any>();
  CurrentSchool: any;
  spinner:boolean=false
  street:Street
  constructor(private messageService: MessageService,
    public router: Router,
    private active: ActivatedRoute,
    public groupService: GroupService,
    public studentService: StudentService,
    public schoolService: SchoolService,
    public genericFunctionService: GenericFunctionService,
    private confirmationService: ConfirmationService,
    private calendar: NgbCalendar,
    public i18n: NgbDatepickerI18n,
    public convertDateToStringService: ConvertDateToStringService,
    public StreetService:StreetService,
    public hebrewCalanderService: HebrewCalanderService) {
    this.dayTemplateData = this.dayTemplateData.bind(this);
    active.params.subscribe(c => this.id = c["id"]);
  }

  ngOnInit(): void {
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.StudentPerGroup(this.id);
    const group = this.groupService.ListGroupsByListSchoolAndYerbook.find(f => f.idgroupPerYearbook == this.id).group;

    var yearbook;
    this.schoolService.ListSchool.find(f => f.appYearbookPerSchools.find(f => {
      if (f.idyearbookPerSchool == this.groupService.ListGroupsByListSchoolAndYerbook[0].yearbookId) yearbook = f;
    }));
    if (yearbook.yearbookId != this.schoolService.SelectYearbook.idyearbook)
      this.genericFunctionService.GoBackToLastPage();
    this.CurrentSchool = this.schoolService.ListSchool.find(f => f.school.idschool == group.schoolId)
    this.NameGroup = group.nameGroup;
    this.selectedOption = this.options[1];
 

  }
  //המרת תאריך
  dayTemplateData(date: NgbDate) {
    return {
      gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date)
    };
  }
  //שליפת תלמיד בקבוצה בשנה מסויימת
  StudentPerGroup(groupId: number) {
     
    this.groupService.GetStudentPerGroup(groupId, this.schoolService.SelectYearbook != null ? this.schoolService.SelectYearbook.idyearbook : null).subscribe(data => { this.ListStudentPerGroup = data; 
      this.exportExcelAsync()
       ; }, er => { });
  }
  //פתיחת טבלת התלמידות שלא קיימות בקבוצה המבוקשת
  AddStudentPerGroup() {
     debugger
    this.AddSPG = true;
    if (this.ListStudentNotInGroup == null || this.ListStudentNotInGroup.length == 0) {
      if (this.studentService.ListStudent == null || this.studentService.ListStudent.length == 0)
        this.studentService.GetListStudentsBySchoolIdAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
          this.studentService.ListStudent = data; let SPG;
          this.studentService.ListStudent.forEach(element => {
            if (this.ListStudentPerGroup.find(f => f.student.idstudent == element.idstudent) == null) {
              SPG = new StudentPerGroup(); SPG.student = element;
              this.ListStudentNotInGroup.push(SPG);
            }
          });
        }, er => { })
      else {
        this.studentService.ListStudent.forEach(element => {
          if (this.ListStudentPerGroup.find(f => f.student.idstudent == element.idstudent) == null) {
            let SPG;
            SPG = new StudentPerGroup(); SPG.student = element;
            this.ListStudentNotInGroup.push(SPG);
          }
        });
      }
    }
  }
async AddMultipuleStudentsInGroup()
  {
    let i=0
    while(this.ListStudentNotInGroup.length>0) {
      if (!this.ListStudentNotInGroup[i].student.checked) 
          i++
      else
        await this.AddStudentInGroup(this.ListStudentNotInGroup[i].student.idstudent);
      
    }
  }

   openDialogAddStudent(studentId: number){
    //if (studentId != -1) {
      this.openDialog = true;
      this.newStudentId = studentId;
      this.disabled = false;
      this.selectedOption = this.options[1];
    //}


   }

   openMultipleDialogAddStudent(){
    //if (studentId != -1) {
      this.openMultipleDialog = true; 
      this.disabled = false;
      this.selectedOption = this.options[1];
    //}
   

   }
  //הוספת שיוך תלמיד לקבוצה
  AddStudentInGroup(studentId: number) {
return new Promise<void>((resolve, reject) => {
    if(studentId!=-1)
    {
      this.AddSPG = true
    this.newStudentId=studentId
    }
     
    // if (studentId != -1) {
    //   this.openDialog = true;
    //   this.newStudentId = studentId;
    //   this.disabled = false;
    //   this.selectedOption = this.options[1];
    // }
    // else {
      var school = this.schoolService.ListSchool.find(f => f.school.idschool == this.studentService.ListStudent.find(f => f.idstudent == this.newStudentId).schoolId);
      var yearbook = school.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook);
       ;
      var FromDate = this.FromDate != null ? new NgbDate(this.FromDate.year, this.FromDate.month, this.FromDate.day) : null;
      FromDate = FromDate != null ? (this.calendar as NgbCalendarHebrew).toGregorian(FromDate) : null;
      var f = FromDate != null ? FromDate.year + '-' + FromDate.month + '-' + FromDate.day : null;

       ;
      var ToDate = this.ToDate != null ? new NgbDate(this.ToDate.year, this.ToDate.month, this.ToDate.day) : null;
      ToDate = ToDate != null ? (this.calendar as NgbCalendarHebrew).toGregorian(ToDate) : null;
      var t = ToDate != null ? ToDate.year + '-' + ToDate.month + '-' + ToDate.day : null;

      if (new Date(f) > new Date(t)) {
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'תאריך הסיום חייב להיות גדול מתאריך התחלה' }); return;
      }
      if (new Date(f + " 00:00:00") < new Date(yearbook.fromDate)) {
        this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: "התאריך התחלה קודם לתאריך פתיחת שנה " + this.convertDateToStringService.formatDate(new Date(yearbook.fromDate)) }); return;
      }
      if (new Date(t + " 00:00:00") > new Date(yearbook.toDate)) {
        this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: "התאריך סיום מאוחר מתאריך סיום שנה " + this.convertDateToStringService.formatDate(new Date(yearbook.toDate)) }); return;
      }

      this.groupService.AddStudentInGroup(this.newStudentId, this.id, yearbook.idyearbookPerSchool, f, t, school.userId).subscribe(data => {
        if (data.id == 1) {
          this.messageService.add({ severity: 'success', summary: 'ההוספה הצליחה', detail: data.name })
          var i = this.ListStudentNotInGroup.findIndex(f => f.student.idstudent == this.newStudentId);
          this.ListStudentNotInGroup[i].fromDate = (FromDate == null ? yearbook.fromDate : this.convertDateToStringService.formatDate(new Date(f)) + "T00:00:00");
          this.ListStudentNotInGroup[i].toDate = (ToDate == null ? yearbook.toDate : this.convertDateToStringService.formatDate(new Date(t)) + "T00:00:00");
          this.ListStudentPerGroup.push(this.ListStudentNotInGroup[i]);
          this.exportExcelAsync()
          this.ListStudentNotInGroup[i].student.checked=undefined
          this.ListStudentNotInGroup.splice(i, 1);
          this.AddSPG = false;
          
          if (data.listTaskToGroup != null) {
             ;
            this.ListTask = data.listTaskToGroup;
            this.IsExixtTask = true
          }
          resolve()
        }
        else
        {
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: data.name });
          reject()
        }
      }, er => { reject()})
      this.openDialog = false;
      this.openMultipleDialog=false
    })
  }
  //מחקית תלמיד מקבוצה
  DeleteStudentInGroup(StudentId: number) {

    this.confirmationService.confirm({
      message: 'האם הנך בטוח כי ברצונך למחוק תלמיד זה מהקבוצה   ?  ',
      header: 'מחיקת תלמיד',
      icon: 'pi pi-info-circle',
      acceptLabel: ' מחק ',
      rejectLabel: ' ביטול ',
      accept: () => {
        this.groupService.DeleteStudentInGroup(StudentId, this.id).subscribe(data => {
          if (data == null)
            this.messageService.add({ key: "tc", severity: 'warn', summary: 'המחיקה בוטלה', detail: 'לתלמיד זה קיים מטלות בקורסים המשוייכים לקבוצה זו' });
          else {
            if (data.idstudentPerGroup == null || data.idstudentPerGroup == 0)
              this.messageService.add({ key: "tc", severity: 'error', summary: 'המחיקה נכשלה', detail: 'ארעה תקלה ,אנא נסה שוב' });
            else {
              var i = this.ListStudentPerGroup.findIndex(f => f.student.idstudent == StudentId);
              if (this.ListStudentNotInGroup != null && this.ListStudentNotInGroup.length != 0) this.ListStudentNotInGroup.push(this.ListStudentPerGroup[i]);
              this.ListStudentPerGroup.splice(i, 1);
              this.exportExcelAsync()
              this.messageService.add({ severity: 'success', summary: 'המחיקה הצליחה', detail: "התלמיד הוסר מהקבוצה בהצלחה" })
            }
          }
        }, er => {
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: "ארעה שגיאה ,אנא נסה שנית" });
        })
      },
      reject: () => {
      }
    })
  }
  //עריכת תלמיד בקבוצה
  EditStudentInGroup(student: StudentPerGroup) {
     ;
    if (student == null) {
      var yearbook = this.CurrentSchool.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook);

      var t, f;
      var ToDate = this.ToDateEdit != null ? new NgbDate(this.ToDateEdit.year, this.ToDateEdit.month, this.ToDateEdit.day) : null;
      ToDate = ToDate != null ? (this.calendar as NgbCalendarHebrew).toGregorian(ToDate) : null;
      t = ToDate != null ? ToDate.year + '-' + ToDate.month + '-' + ToDate.day : null;

      var FromDate = this.FromDateEdit != null ? new NgbDate(this.FromDateEdit.year, this.FromDateEdit.month, this.FromDateEdit.day) : null;
      FromDate = FromDate != null ? (this.calendar as NgbCalendarHebrew).toGregorian(FromDate) : null;
      f = FromDate != null ? FromDate.year + '-' + FromDate.month + '-' + FromDate.day : null;

      if (new Date(f) > new Date(t)) {
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'תאריך הסיום חייב להיות גדול מתאריך התחלה' }); return;
      }
      if (new Date(f) < new Date(yearbook.fromDate)) {
        this.hebrewCalanderService.getHebrew(new Date(yearbook.fromDate)).subscribe((d) => {
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' תאריך התחלה קודם לתאריך פתיחת השנה ' + d.hebrew });
        }, er => { }); return;
      }
      if (new Date(t) > new Date(yearbook.toDate)) {
        this.hebrewCalanderService.getHebrew(new Date(yearbook.toDate)).subscribe((d) => {
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' תאריך הסיום מאוחר מתאריך סיום השנה ' + d.hebrew });
        }
          , er => { }); return;
      }

      this.EditDialog = false;
      this.groupService.EditStudentInGroup(this.editStudent, f, t, this.CurrentSchool.userId).subscribe(data => {
         debugger;
        if (data.id == 1) {
           
          this.messageService.add({ severity: 'success', summary: 'העדכון הצליח', detail: data.name })
          this.AddSPG = false;
          var s = this.ListStudentPerGroup.find(f => f.idstudentPerGroup == this.editStudent.idstudentPerGroup);
          s.fromDate = data.studentPerGroup.fromDate;
          s.toDate = data.studentPerGroup.toDate;
          this.ListStudentPerGroup = [...this.ListStudentPerGroup];
          this.exportExcelAsync()
        }

        else
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: data.name });
      }, er => { })
    }
    else {
      this.EditDialog = true;
      this.editStudent = student;
      this.hebrewCalanderService.getHebrew(new Date(student.fromDate)).subscribe((d) => {
         ;
        if (this.calendar.getMonths(d.hy).length == 13)
          var hm = this.hebrewCalanderService.dict2.find(f => f.label == d.hm);
        else
          var hm = this.hebrewCalanderService.dict1.find(f => f.label == d.hm);
        this.FromDateEdit = new NgbDate(d.hy, hm.value, d.hd);
      }, er => { })
      this.hebrewCalanderService.getHebrew(new Date(student.toDate)).subscribe((d) => {
         ;
        if (this.calendar.getMonths(d.hy).length == 13)
          var hm = this.hebrewCalanderService.dict2.find(f => f.label == d.hm);
        else
          var hm = this.hebrewCalanderService.dict1.find(f => f.label == d.hm);
        this.ToDateEdit = new NgbDate(d.hy, hm.value, d.hd);
      }, er => { })
       ;
    }

  }

   exportExcelAsync() {

    return new Promise((resolve, reject) => {
      this.excelStudentPerGroupList=new Array<any>()
    this.ListStudentPerGroup.forEach(c => {
      let studentId=c.studentId
      if(c.student!=null)
      studentId=c.student.idstudent
        this.studentService.GetStudentDetailsByIDStudent(studentId)
        .subscribe(async s => {
          
          let status=this.schoolService.Status.find((f) => f.value == s.statusId)
          let studentStatus=this.schoolService.StatusStudent.find((f) => f.value == s.statusStudentId)
          let city
          let neigborhood
          if (s.address!=null){
           city = this.schoolService.Cities.find((f) => f.value == s.address.cityId);
           neigborhood = this.schoolService.Neigborhoods.find(
            (f) => f.value ==s.address.neighborhoodId
          );
          s.City=city
          }
          if (city != '') {
            await this.ChangeCity(s);
            
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
          ;
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

      this.excelStudentPerGroupList.push(
        {
          'firstName': c.student.firstName,
          'lastName': c.student.lastName,
          'tz': c.student.tz,

          //יש פה בעיה משום מה זה לא עובד- צריך לבדוק
          'isactive': new Date(c.fromDate)<new Date(this.Today)&&new Date(c.toDate)>new Date(this.Today)?'פעיל':'לא פעיל',

            'typeTz': typeIdentity!=null?typeIdentity.name:'',
            'code':c.student.code,
            'gender':gender!=null?gender.name:'',
            'eBirthdate': s.birth!=null?s.birth.birthDate:'',
            'hBirthdate': s.birth!=null?s.birth.birthHebrewDate:'',
            'birthCountry':country!=null?country.name:'',
            'citizenship':citizenship!=null?country.name:'',
            'imigrationDate':s.birth!=null?s.birth.dateOfImmigration:'',
            'imigrationCountry':countryofImmigration!=null?countryofImmigration.name:'',
          
            'famStatus': status!=null?status.name:'',
            'foreginFname':c.student.foreignFirstName,
            'foreginLname':c.student.foreignLastName,
            'prevLname':c.student.previusName,
            'phone1': s.contactInformation!=null?s.contactInformation.telephoneNumber1:'',
            'phone2': s.contactInformation!=null?s.contactInformation.telephoneNumber2:'',
            'cell1':s.contactInformation!=null?s.contactInformation.phoneNumber1:'',
            'cell2':s.contactInformation!=null?s.contactInformation.phoneNumber2:'',
            'cell3':s.contactInformation!=null?s.contactInformation.phoneNumber3:'',
            'fax':s.contactInformation!=null?s.contactInformation.faxNumber:'',
            'email':s.contactInformation!=null?s.contactInformation.email:'',
            'fatherTz':c.student.fatherTz,
            'typeFatherTz':fatherTypeIdentity!=null?fatherTypeIdentity.name:'',
            'motherTz':s.motherTz,
            'typeMotherTz':motherTypeIdentity!=null?motherTypeIdentity.name:'',
            'apotropusTz':s.apotropusTz,
            'guardianTypeTz':apotropusTypeIdentity!=null?apotropusTypeIdentity.name:'',
            // 'active':s.isActive?'פעיל':'לא פעיל',
            'studentStatus':studentStatus!=null?studentStatus.name:'',
            'reason':c.student.reasonForLeaving,
            'city':city!=null?city.name:'',
            'neighborhood':neigborhood!=null?neigborhood.name:'',
            
            'street':this.street!=null?this.street.name:'',
            'building':s.address!=null?s.address.houseNumber:'',
            'apartment':s.address!=null?s.address.apartmentNumber:'',
            'poBox': s.address!=null?s.address.poBox:'',
            'zip':s.address!=null?s.address.zipCode:'',
            'moreDetails':s.anatherDetails,
            'note':c.student.note


          
        })
      }
    )
    })

    }
  ) }




  exportExcel() {
this.spinner=true
      setTimeout(() => {
        let Heading = [['שם פרטי', 'שם משפחה ', 'מספר זהות',  'פעיל?','	סוג זיהוי',	'קוד','מין','	תאריך לידה לועזי','תאריך עברי','	ארץ לידה',	'אזרחות','	תאריך עליה',
   	'ארץ עליה','מצב משפחתי','	פרטי בלועזית','	משפחה בלועזית'	,'שם משפחה קודם',	'טלפון1',	'טלפון2',	'נייד1',	'נייד2', 	'נייד3',	'פקס',	'מייל',	'מספר זיהוי אב',
    	'סוג זיהוי אב','	מספר זיהוי אם','	סוג זיהוי אם','	מספר זיהוי אפוטרופוס','	סוג זיהוי אפוטרופוס',	'סטטוס תלמידה',	'סיבה',	'עיר',	'שכונה',	'רחוב',	
      'בנין',	'דירה','	ת.ד.',	'מיקוד','	פרטים נוספים',	'הערה']];

    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheet, Heading);

    //Starting in the second row to avoid overriding and skipping headers
    XLSX.utils.sheet_add_json(worksheet, this.excelStudentPerGroupList, { origin: 'A2', skipHeader: true });
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    if (!workbook.Workbook) workbook.Workbook = {};
    if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
    if (!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
    workbook.Workbook.Views[0].RTL = true;
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, this.NameGroup);
    this.spinner=false
    console.log("time: "+this.ListStudentPerGroup.length*200);
    
      }, this.ListStudentPerGroup.length*200);

    
  
  }

  //var fileName=this.data.find(f=>f.value==this.ADate).label;



  saveAsExcelFile(buffer: any, fileName: string): void {

    //fileName=this.data.find(f=>f.value==this.ADate).label;
    import("file-saver").then(FileSaver => {
      let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
      });
      FileSaver.saveAs(data, fileName);
    });
  }


async ChangeCity(s) {
  return new Promise<void>((resolve, reject) => {
    debugger;
    if (
      this.StreetService.StreetsPerCity == null ||
      this.StreetService.StreetsPerCity.length == 0 ||
      this.StreetService.StreetsPerCity[0].cityId != s.City.value
    ) {
      if (s != null && s.City != null) {
        this.StreetService.GetStreetsByCityId(s.City.value).subscribe(
          (data) => {
            this.StreetService.StreetsPerCity = data;
            this.street = this.StreetService.StreetsPerCity.find(
              (f) => f.idstreet == s.address.streetId
            );
            resolve(); // Resolve the promise when the operation is complete
          },
          (err) => {
            reject(err); // Reject the promise if an error occurs
          }
        );
      } else {
        reject(new Error('Invalid parameters')); // Reject the promise with an error
      }
    } else {
      resolve(); // Resolve the promise if the condition is not met
    }
  });
}

  
 
  // fromModel(date: Date): NgbDateStruct {
  //   return date ? {
  //     year: date.getUTCFullYear(),
  //     month: date.getUTCMonth() + 1,
  //     day: date.getUTCDate()
  //   } : null;
  // }

  // Back() {
  //   this.AddSPG = false;
  // }
}
