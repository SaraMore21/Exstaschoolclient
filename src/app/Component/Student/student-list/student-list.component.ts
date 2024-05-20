import { Component, OnInit,ElementRef, HostListener } from '@angular/core';
import { StudentService } from 'src/app/Service/student.service'
import { SchoolService } from 'src/app/Service/school.service';
import { Student } from 'src/app/Class/student';
import { AddOrUpdateComponent } from '../add-or-update/add-or-update.component';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SelectItem } from 'primeng/api';
import { finalize, switchMap } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { StreetService } from 'src/app/Service/street.service';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';
import { forkJoin, of } from 'rxjs';

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
  ddata: any[] = [];
  page = 1; // הדף הנוכחי
  pageSize = 10; // מספר הפריטים לכל דף
  //משתנה בוליאני לפתיחת דיאלוג הוספה או עריכה
  OpenDialogAOU: boolean = false;
  spin:boolean=false
  excelStudentList:Array<any>=new Array<any>()
  virtualStudents:Student[]
  searchText:string
  detailesToDisplay=[]
  optionsToMoreDetailes = [
    { value: 'typeidentity', label: ' סוג זיהוי ' },
    { value: 'code', label: ' קוד נבחנת' },
    { value: 'preName', label: ' שם קודם ' },
    { value: 'foreignLastName', label: ' שם משפחה לועזי' },
    { value: 'foreignFirstName', label: ' שם פרטי לועזי' },
    { value: 'gender', label: ' מין ' },
    { value: 'citizenship', label: ' אזרחות' },
    { value: 'birthDate', label: ' תאריך לידה ' },
    { value: 'birtheCountry', label: ' ארץ לידה ' },
    { value: 'imigrationCountry', label: ' ארץ עליה ' },
    { value: 'imigrationDate', label: ' תאריך עליה ' },
    { value: 'fatherTz', label: ' מ.ז אב ' },
    { value: 'fatherTypeIdentity', label: ' סוג זיהוי אב ' },
    { value: 'motherTz', label: ' מ.ז אם ' },
    { value: 'motherTypeIdentit', label: ' סוג זיהוי אם ' },
    { value: 'field1', label: ' ציון מבחן תיל ' },
    { value: 'field2', label: 'שדה 2' },
    { value: 'field3', label: 'שדה 3' },
    { value: 'field4', label: 'שדה 4' },
    { value: 'field5', label: 'שדה 5' },
    { value: 'status', label: '  סטטוס' },
    { value: 'studentStatus', label: ' סטטוס תלמיד' },
    { value: 'isActive', label: 'פעיל?' },
    { value: 'street', label: ' רחוב ' },
    { value: 'city', label: ' עיר' },
    { value: 'houseNum', label: ' מספר בית' },
    { value: 'aptNum', label: ' מספר דירה' },
    { value: 'zip', label: ' מיקוד' },
    { value: 'poBox', label: ' תיבת דואר' },
    { value: 'phone1', label: '  טלפון1' },
    { value: 'phone2', label: '  טלפון2' },
    { value: 'cell1', label: '  נייד1' },
    { value: 'cell2', label: '  נייד 2' },
    { value: 'cell3', label: '  נייד 3' },
    { value: 'fax', label: '  פקס' },
    { value: 'mail', label: '  מייל' },
    { value: 'passportPicture', label: '  תמונת פספורט' },
// מ.ז. אפוטרופוס -קיים
// סוג זיהוי אפוטרופוס

  ];

  detailsOptions: any = {
  typeidentity:false,
  code:false,
  preName:false,
  foreignLastName:false,
  foreignFirstName:false,
  gender:false,
  citizenship:false,
  birthDate:false,
  birtheCountry:false,
  imigrationCountry:false,
  imigrationDate:false,
  fatherTz:false,
  fatherTypeIdentity:false,
  motherTz:false,
  motherTypeIdentit:false,
  field1:false,
  field2:false,
  field3:false,
  field4:false,
  field5:false,
  status:false,
  studentStatus:false,
  isActive:false,
  street:false,
  city:false,
  houseNum:false,
  aptNum:false,
  zip:false,
  poBox:false,
  phone1:false,
  phone2:false,
  cell1:false,
  cell2:false,
  cell3:false,
  fax:false,
  mail:false,
  passportPicture:false};



  constructor(public studentService: StudentService, public schoolService: SchoolService, private router: Router,
    private messageService: MessageService, private confirmationService: ConfirmationService,
    private ngxService: NgxUiLoaderService,private StreetService:StreetService,private el: ElementRef,private genericFunctionService:GenericFunctionService
  ) { }

  ngOnInit(): void {
    debugger;
    console.log(window.location.href);
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.virtualStudents = Array.from({ length: 10000 });
    if (this.studentService.ListStudent == null || this.studentService.ListStudent.length == 0 || this.studentService.YearbookIdPerStudent != this.schoolService.SelectYearbook.idyearbook)
    
    //this.GetListStudent();
    this.loadPage();


  }
  search(){
    if(this.searchText!='' && this.searchText!=undefined)
    this.studentService.SearchInStudentList(this.searchText,this.schoolService.SelectYearbook.idyearbook,this.schoolService.ListSchool)
    .subscribe(data=>
      {
        debugger
        this.studentService.ListStudent=data
      }
      )
 
  }
  setDisplayValue(option: string) {
 debugger
 console.log("this.detailesToDisplay"+this.detailesToDisplay)
//  if (this.detailsOptions.hasOwnProperty(option)) {
 // this.detailsOptions[option] = !this.detailsOptions[option];
// } 
this.optionsToMoreDetailes.forEach(opt=>
  {
    if(!this.detailesToDisplay.includes(opt.value))
    this.detailsOptions[opt.value]=false
  })
this.detailsOptions[option[option.length-1]] = true
 console.log("detailsOptions[option]"+this.detailsOptions[option])
 console.log("detailsOptions.typeidentity"+this.detailsOptions[option])
 console.log("student.typeidentity"+this.studentService.ListStudent)
}

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    debugger
    const infiniteScrollBackground = this.el.nativeElement.querySelector('.infinite-scroll-background');
    if (infiniteScrollBackground && infiniteScrollBackground.getBoundingClientRect().bottom <= window.innerHeight) {
      debugger
      this.loadMoreData();
    }
  }
 
 
    debugger

  loadMoreData() {
    debugger
    this.page++;
    this.spin=false
    this.studentService.getData(this.page, this.pageSize,this.schoolService.SelectYearbook.idyearbook,this.schoolService.ListSchool)
      .subscribe((result: any[]) => {
        this.studentService.ListStudent = this.studentService.ListStudent.concat(result); 
        if(result.length>0)     
          this.spin=true  
        for(let i=0;i<this.studentService.ListStudent.length;i++){
                this.studentService.ListStudent[i].index=i+1
              }
      });
  }

  loadPage() {
    debugger;
    this.studentService.getData(this.page, this.pageSize,this.schoolService.SelectYearbook.idyearbook,this.schoolService.ListSchool)
      .subscribe((result: any) => {
        this.studentService.ListStudent = result;
        this.spin=true
        for(let i=0;i<this.studentService.ListStudent.length;i++){
                this.studentService.ListStudent[i].index=i+1
              }
      });
      this.searchText = '';
  }





  // nextPage() {
  //   debugger
  //   this.page++;
  //   this.loadPage();
  // }

  // prevPage() {
  //   debugger
  //   if (this.page > 1) {
  //     this.page--;
  //     this.loadPage();
  //   }
  // }

  //שליפת התלמידים
  GetListStudent() {
    debugger
    this.studentService.GetListStudentsBySchoolIdAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => { debugger; this.studentService.ListStudent = data 
      for(let i=0;i<this.studentService.ListStudent.length;i++){
        this.studentService.ListStudent[i].index=i+1
      }
    }, er => { debugger; console.log(er) });


}

    // this.studentService.ListStudent.push(new Student(1,"123456789",1,"רחל","לוי","",new Date(),"1234",1,"","","","","","","","","",1,1,1,1,true,"","",",","","",1,new Date(),1,new Date());
  
  //עריכת פרטי תלמיד
  EditDetailsStudent(StudentID: number) {
    debugger;
    this.genericFunctionService.isEdit=true
    this.router.navigate(["Home/AddOrUpdateStudent/" + StudentID])
  }
  //הוספת תלמיד
  AddStudent() {
    debugger;
    this.router.navigate(["Home/AddOrUpdateStudent/" + 0])
  }
  //מחיקת תלמיד
  DeletStudent(student: Student,event:Event=null) {
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
    if (event!=null)
    event.stopPropagation();
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
  
exportExcelAsync1()
{debugger
 return new Promise((resolve, reject) => {
   
  
    
   let genercListStudent:Array<any>=this.studentService.ListStudent
   debugger
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
          debugger
          // this.ChangeCity(s);
          if ((this.StreetService.StreetsPerCity == null || this.StreetService.StreetsPerCity.length == 0 || this.StreetService.StreetsPerCity[0].cityId != s.address.cityId) && (s != null && s.address.cityId != null))
            this.StreetService.GetStreetsByCityId(s.address.cityId).subscribe(data => {
              this.StreetService.StreetsPerCity = data
              debugger
              street = this.StreetService.StreetsPerCity.find(
                (f) => f.idstreet == s.address.streetId
              );
              console.log("street@@@@@@@@@@@@", street.name)


            }, er => { })

        }
        // if (city != '') {
        //   this.ChangeCity(s);
        //    street = this.StreetService.StreetsPerCity.find(
        //     (f) => f.idstreet == s.address.streetId
        //   );
        // }
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
        'note':s.note,
        'fatherPhone1':s.contactPerStudent[0]!=null&& s.contactPerStudent[0].contact && s.contactPerStudent[0].contact.contactInformation?s.contactPerStudent[0].contact.contactInformation.phoneNumber1:null,
        'fPhoneNumber2':s.contactPerStudent[0]!=null&& s.contactPerStudent[0].contact && s.contactPerStudent[0].contact.contactInformation?s.contactPerStudent[0].contact.contactInformation.phoneNumber2:null,
        'fPhoneNumber3':s.contactPerStudent[0]!=null&& s.contactPerStudent[0].contact && s.contactPerStudent[0].contact.contactInformation?s.contactPerStudent[0].contact.contactInformation.phoneNumber3:null,
        'fTelephoneNumber1':s.contactPerStudent[0]!=null&& s.contactPerStudent[0].contact && s.contactPerStudent[0].contact.contactInformation?s.contactPerStudent[0].contact.contactInformation.telephoneNumber1:null,
        'fTelephoneNumber2':s.contactPerStudent[0]!=null&& s.contactPerStudent[0].contact && s.contactPerStudent[0].contact.contactInformation?s.contactPerStudent[0].contact.contactInformation.telephoneNumber2:null,
        'matherPhone':s.contactPerStudent[1]!=null&& s.contactPerStudent[1].contact && s.contactPerStudent[1].contact.contactInformation?s.contactPerStudent[1].contact.contactInformation.phoneNumber1:null,
        'mPhoneNumber2':s.contactPerStudent[1]!=null&& s.contactPerStudent[1].contact && s.contactPerStudent[1].contact.contactInformation?s.contactPerStudent[1].contact.contactInformation.phoneNumber2:null,
        'mPhoneNumber3':s.contactPerStudent[1]!=null&& s.contactPerStudent[1].contact && s.contactPerStudent[1].contact.contactInformation?s.contactPerStudent[1].contact.contactInformation.phoneNumber3:null,
        'mTelephoneNumber1':s.contactPerStudent[1]!=null&& s.contactPerStudent[1].contact && s.contactPerStudent[1].contact.contactInformation?s.contactPerStudent[1].contact.contactInformation.telephoneNumber1:null,
        'mTelephoneNumber2':s.contactPerStudent[1]!=null&& s.contactPerStudent[1].contact && s.contactPerStudent[1].contact.contactInformation?s.contactPerStudent[1].contact.contactInformation.telephoneNumber2:null,
     } )
      
    }
    
    )
  
  )
});
 
}
exportExcelAsync() {
  return new Promise((resolve, reject) => {
    let genericListStudent: Array<any> = this.studentService.ListStudent;
    console.log("genericListStudent------",genericListStudent)
    let studentDetailsObservables = genericListStudent.map(d => 
      this.studentService.GetStudentDetailsByIDStudent(d.idstudent)
    );

    forkJoin(studentDetailsObservables).pipe(
      switchMap(students => {
        console.log("student------",students)
        let streetObservables = students.map(s => {
          debugger
          if ((this.StreetService.StreetsPerCity == null || this.StreetService.StreetsPerCity.length == 0 || this.StreetService.StreetsPerCity[0].cityId != s.address.cityId) && (s != null && s.address.cityId != null)) {
            return this.StreetService.GetStreetsByCityId(s.address.cityId).pipe(
              switchMap(data => {
                this.StreetService.StreetsPerCity = data;
                let street = this.StreetService.StreetsPerCity.find(f => f.idstreet == s.address.streetId);
                return of({ student: s, street });
              })
            );
          } else {
            return of({ student: s, street: null });
          }
        });

        return forkJoin(streetObservables);
      })
    ).subscribe(results => {
      results.forEach(result => {
        let s = result.student;
        let street = result.street;
        let status = this.schoolService.Status.find(f => f.value == s.statusId);
        let studentStatus = this.schoolService.StatusStudent.find(f => f.value == s.statusStudentId);
        let city = s.address ? this.schoolService.Cities.find(f => f.value == s.address.cityId) : null;
        let neighborhood = s.address ? this.schoolService.Neigborhoods.find(f => f.value == s.address.neighborhoodId) : null;
        let citizenship = s.birth ? this.schoolService.Countries.find(f => f.value == s.birth.citizenshipId) : null;
        let country = s.birth ? this.schoolService.Countries.find(f => f.value == s.birth.birthCountryId) : null;
        let countryofImmigration = s.birth ? this.schoolService.Countries.find(f => f.value == s.birth.countryIdofImmigration) : null;
        let gender = this.schoolService.Genders.find(f => f.idGender == s.genderId);
        let typeIdentity = this.schoolService.TypeIdentitys.find(f => f.value == s.typeIdentityId);
        let fatherTypeIdentity = this.schoolService.TypeIdentitys.find(f => f.value == s.fatherTypeIdentityId);
        let motherTypeIdentity = this.schoolService.TypeIdentitys.find(f => f.value == s.motherTypeIdentityId);
        let apotropusTypeIdentity = this.schoolService.TypeIdentitys.find(f => f.value == s.apotropusTypeIdentityId);

        this.excelStudentList.push({
          'tz': s.tz,
          'typeTz': typeIdentity ? typeIdentity.name : '',
          'code': s.code,
          'fname': s.firstName,
          'lname': s.lastName,
          'gender': gender ? gender.name : '',
          'eBirthdate': s.birth ? s.birth.birthDate : '',
          'hBirthdate': s.birth ? s.birth.birthHebrewDate : '',
          'birthCountry': country ? country.name : '',
          'citizenship': citizenship ? citizenship.name : '',
          'imigrationDate': s.birth ? s.birth.dateOfImmigration : '',
          'imigrationCountry': countryofImmigration ? countryofImmigration.name : '',
          'famStatus': status ? status.name : '',
          'foreginFname': s.foreignFirstName,
          'foreginLname': s.foreignLastName,
          'prevLname': s.previusName,
          'phone1': s.contactInformation ? s.contactInformation.telephoneNumber1 : '',
          'phone2': s.contactInformation ? s.contactInformation.telephoneNumber2 : '',
          'cell1': s.contactInformation ? s.contactInformation.phoneNumber1 : '',
          'cell2': s.contactInformation ? s.contactInformation.phoneNumber2 : '',
          'cell3': s.contactInformation ? s.contactInformation.phoneNumber3 : '',
          'fax': s.contactInformation ? s.contactInformation.faxNumber : '',
          'email': s.contactInformation ? s.contactInformation.email : '',
          'fatherTz': s.fatherTz,
          'typeFatherTz': fatherTypeIdentity ? fatherTypeIdentity.name : '',
          'motherTz': s.motherTz,
          'typeMotherTz': motherTypeIdentity ? motherTypeIdentity.name : '',
          'apotropusTz': s.apotropusTz,
          'guardianTypeTz': apotropusTypeIdentity ? apotropusTypeIdentity.name : '',
          'active': s.isActive ? 'פעיל' : 'לא פעיל',
          'studentStatus': studentStatus ? studentStatus.name : '',
          'reason': s.reasonForLeaving,
          'city': city ? city.name : '',
          'neighborhood': neighborhood ? neighborhood.name : '',
          'street': street ? street.name : '',
          'building': s.address ? s.address.houseNumber : '',
          'apartment': s.address ? s.address.apartmentNumber : '',
          'poBox': s.address ? s.address.poBox : '',
          'zip': s.address ? s.address.zipCode : '',
          'moreDetails': s.anatherDetails,
          'note': s.note,
          'fatherPhone1': s.contactPerStudent[0]?.contact?.contactInformation?.phoneNumber1 ?? null,
          'fPhoneNumber2': s.contactPerStudent[0]?.contact?.contactInformation?.phoneNumber2 ?? null,
          'fPhoneNumber3': s.contactPerStudent[0]?.contact?.contactInformation?.phoneNumber3 ?? null,
          'fTelephoneNumber1': s.contactPerStudent[0]?.contact?.contactInformation?.telephoneNumber1 ?? null,
          'fTelephoneNumber2': s.contactPerStudent[0]?.contact?.contactInformation?.telephoneNumber2 ?? null,
          'matherPhone': s.contactPerStudent[1]?.contact?.contactInformation?.phoneNumber1 ?? null,
          'mPhoneNumber2': s.contactPerStudent[1]?.contact?.contactInformation?.phoneNumber2 ?? null,
          'mPhoneNumber3': s.contactPerStudent[1]?.contact?.contactInformation?.phoneNumber3 ?? null,
          'mTelephoneNumber1': s.contactPerStudent[1]?.contact?.contactInformation?.telephoneNumber1 ?? null,
          'mTelephoneNumber2': s.contactPerStudent[1]?.contact?.contactInformation?.telephoneNumber2 ?? null,
        });
      });
      resolve(this.excelStudentList);
    }, error => {
      reject(error);
    });
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
      'בנין',	'דירה','	ת.ד.',	'מיקוד','	פרטים נוספים',	'הערה','פלאפון1 אב',' פלאפון 2 אב','פלאפון 3 אב','טלפון 1 אב','טלפון 2 אב','פלאפון 1 אם','פלאפון 2 אם','פלאפון 3 אם','טלפון 1 אם','טלפון 2 אם']];


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
