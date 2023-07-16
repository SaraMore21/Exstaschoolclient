import { FilesAzureService } from "./../../../Service/files-azure.service";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Student } from "src/app/Class/student";
import { StudentService } from "src/app/Service/student.service";
import { MenuItem, MessageService, ConfirmEventType, ConfirmationService } from "primeng/api";
import { CardModule } from "primeng/card";
import { SchoolService } from "src/app/Service/school.service";
import { ContactService } from "src/app/Service/contact.service";
import { TypeContactService } from "src/app/Service/type-contact.service"
import { NgbCalendar, NgbCalendarHebrew, NgbDate, NgbDatepickerI18n, NgbDatepickerI18nHebrew, NgbDateStruct, } from "@ng-bootstrap/ng-bootstrap";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { HebrewCalanderService } from "src/app/Service/hebrew-calander.service";
import { Address } from "src/app/Class/address";
import { ContactInformation } from "src/app/Class/contact-information";
import { Birth } from "src/app/Class/birth";
import { Contact } from "src/app/Class/contact";
import { ContactPerStudent } from "src/app/Class/contact-per-student";
import { TypeContact } from "src/app/Class/type-contact";
import { StreetService } from 'src/app/Service/street.service';
import { GenericFunctionService } from "src/app/Service/generic-function.service";

@Component({
  selector: "app-add-or-update",
  templateUrl: "./add-or-update.component.html",
  styleUrls: ["./add-or-update.component.css"],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew },
    [MessageService, ConfirmationService],
  ],
})
export class AddOrUpdateComponent implements OnInit {
  @ViewChild("pdf") pdf2: any;

  //#region משתנים
  items: MenuItem[];
  cityi: any;
  id: number;
  CurrentStudent: any;
  passportPicture: any;
  activeIndex: number = 1;
  flag: boolean = false;
  hoveredDate: NgbDate | null = null;
  model: NgbDateStruct;
  date: Date;
  OpenCalander: boolean = false;
  ab: any;
  DateHeb: any;
  street: Array<any> = new Array<any>();
  fileD: File;
  duration: string;
  fileSize: any;
  lock: boolean = false;
  success: boolean = false;
  flagInvalid: boolean = false;
  contactInformationValidaition: boolean = false;
  general: boolean = false;
  addressDetails: boolean = false;
  contactDetails: boolean = false;
  familyDetails: boolean = false;
  displayModal: boolean = false
  date6: Date;
  contact: any;
  blockSpecial: RegExp = /^[0-9]+$/;
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private active: ActivatedRoute,
    public studentService: StudentService,
    public schoolService: SchoolService,
    public StreetService: StreetService,
    public contactService: ContactService,
    public genericFunctionService: GenericFunctionService,
    public typecontactService: TypeContactService,
    private router: Router,
    private ngxService: NgxUiLoaderService,
    private calendar: NgbCalendar,
    public i18n: NgbDatepickerI18n,
    public hebrewCalanderService: HebrewCalanderService,
    public FilesAzureService: FilesAzureService
  ) {
    this.dayTemplateData = this.dayTemplateData.bind(this);
    this.active.params.subscribe((c) => {
      this.id = c["id"];
    });
  }

  ngOnInit(): void {
    this.general = true;
    debugger;
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    if (this.studentService.YearbookIdPerStudent != this.schoolService.SelectYearbook.idyearbook)
      this.genericFunctionService.GoBackToLastPage();
    this.general = true;
    if (this.id != 0)
      this.GetStudentDetailsByIDStudent();
    else
      this.DetailsStudent();
    //  window.open();
  }
  GetReasonForLeavingPerSchool(){
    debugger;
    this.studentService.GetReasonForLeavingPerSchool(this.CurrentStudent.School.school.idschool).subscribe(data=>{
      debugger;
      this.schoolService.reasonForLeaving=data;
     },er=>{});
  }
  ngAfterViewInit() {
    debugger;
    // child is set
  }
  //מעבר לקומפוננטת מסמכים לתלמיד
  GoToDocumentsPerStudent() {
    debugger;
    this.studentService.NameStudent = this.CurrentStudent.lastName + ' ' + this.CurrentStudent.firstName;
    if (this.CurrentStudent.idstudent != undefined)
      this.router.navigate(["Home/DocumentsPerStudent", this.id, this.CurrentStudent.schoolId, this.schoolService.SelectYearbook.idyearbook]);
  }
  //מעבר לקומפוננטת קבוצות לתלמיד
  GoToGroupPerStudent() {
    debugger;
    this.router.navigate(["Home/GroupPerStudent", this.id, this.CurrentStudent.schoolId]);
  }
  //פונקציה השולפת את פרטי התלמיד
  GetStudentDetailsByIDStudent() {
    this.studentService.GetStudentDetailsByIDStudent(this.id).subscribe(
      (data) => {
        debugger;
        this.CurrentStudent = data;
        this.DetailsStudent();
      },
      (er) => { }
    );
  }
  // פרטי תלמיד
  DetailsStudent() {
    if (this.CurrentStudent == null) {
      this.CurrentStudent = new Student();
      this.CurrentStudent.isActive = true;
      this.CurrentStudent.typeIdentityId =
        this.schoolService.TypeIdentitys[1].value;
      this.CurrentStudent.fatherTypeIdentityId =
        this.schoolService.TypeIdentitys[1].value;
      this.CurrentStudent.motherTypeIdentityId =
        this.schoolService.TypeIdentitys[1].value;
      this.CurrentStudent.apotropusTypeIdentityId =
        this.schoolService.TypeIdentitys[1].value;
      this.CurrentStudent.statusStudentId = this.schoolService.StatusStudent.find(f => f.value == 3)?.value;
      debugger;
    }
    if (this.CurrentStudent.address == null)
      this.CurrentStudent.address = new Address();
    if (this.CurrentStudent.contactInformation == null)
      this.CurrentStudent.contactInformation = new ContactInformation();
    if (this.CurrentStudent.birth == null)
      this.CurrentStudent.birth = new Birth();
    this.CurrentStudent.birthDate =
      this.CurrentStudent.birth.birthDate != null
        ? new Date(this.CurrentStudent.birth.birthDate)
        : (this.CurrentStudent.birth.birthDate = null);
    this.CurrentStudent.DateOfImmigration =
      this.CurrentStudent.birth.dateOfImmigration != null
        ? new Date(this.CurrentStudent.birth.dateOfImmigration)
        : (this.CurrentStudent.birth.birthDate = null);
    // if(this.CurrentStudent.FatherName!=null)

    debugger;
    this.CurrentStudent.City = this.schoolService.Cities.find(
      (f) => f.value == this.CurrentStudent.address.cityId
    );
    if (this.CurrentStudent.City != null) {
      this.ChangeCity();
      this.CurrentStudent.Street = this.StreetService.StreetsPerCity.find(
        (f) => f.idstreet == this.CurrentStudent.address.streetId
      );
    }
    this.CurrentStudent.Citizenship = this.schoolService.Countries.find(
      (f) => f.value == this.CurrentStudent.birth.citizenshipId
    );
    this.CurrentStudent.Country = this.schoolService.Countries.find(
      (f) => f.value == this.CurrentStudent.birth.birthCountryId
    );
    this.CurrentStudent.Gender = this.schoolService.Genders.find(
      (f) => f.value == this.CurrentStudent.genderId
    );
    this.CurrentStudent.Neigborhood = this.schoolService.Neigborhoods.find(
      (f) => f.value == this.CurrentStudent.address.neighborhoodId
    );

    this.CurrentStudent.typeIdentity = this.schoolService.TypeIdentitys.find(
      (f) => f.value == this.CurrentStudent.typeIdentityId
    );
    this.CurrentStudent.fatherTypeIdentity =
      this.schoolService.TypeIdentitys.find(
        (f) => f.value == this.CurrentStudent.fatherTypeIdentityId
      );
    this.CurrentStudent.motherTypeIdentity =
      this.schoolService.TypeIdentitys.find(
        (f) => f.value == this.CurrentStudent.motherTypeIdentityId
      );
    this.CurrentStudent.apotropusTypeIdentity =
      this.schoolService.TypeIdentitys.find(
        (f) => f.value == this.CurrentStudent.apotropusTypeIdentityId
      );
    this.CurrentStudent.CountryIdofImmigration =
      this.schoolService.Countries.find(
        (f) => f.value == this.CurrentStudent.birth.countryIdofImmigration
      );
    this.CurrentStudent.status = this.schoolService.Status.find(
      (f) => f.value == this.CurrentStudent.statusId
    );
    this.CurrentStudent.statusStudent = this.schoolService.StatusStudent.find(
      (f) => f.value == this.CurrentStudent.statusStudentId
    );
    this.CurrentStudent.reasonForLeaving =
      this.schoolService.reasonForLeaving.find(
        (f) => f.value == this.CurrentStudent.reasonForLeavingId
      );

    debugger;
    this.CurrentStudent.School = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentStudent.schoolId);
    if (this.schoolService.ListSchool.length == 1 && (this.CurrentStudent.schoolId == null || this.CurrentStudent.schoolId == 0)) { this.CurrentStudent.School = this.schoolService.ListSchool[0] }
    this.studentService.CurrentStudent = this.CurrentStudent;
  }
  //העלאת קובץ לתמונת פספורט
  setFile(files: FileList) {
    if (files.length > 0) {
      this.fileD = files[0];
      let path =
        this.studentService.CurrentStudent.schoolId +
        "-Students-" +
        this.id +
        "&FileName=passport";
      this.FilesAzureService.uploadFileToAzure(
        this.fileD,
        path,
        this.studentService.CurrentStudent.schoolId
      ).subscribe(
        (d) => {
          debugger;
          const school = this.schoolService.ListSchool.find(f => f.school.idschool == this.studentService.CurrentStudent.schoolId)
          this.studentService
            .UpdateProfilePathToStudent(
              this.studentService.CurrentStudent.schoolId,
              this.CurrentStudent.idstudent,
              //d,
              school.userId
            )
            .subscribe(
              (da) => {
                debugger;
                this.CurrentStudent.passportPicture = da;
                let y = this.studentService.ListStudent.findIndex(f => f.idstudent == this.CurrentStudent.idstudent);
                if (y > -1) {
                   this.studentService.ListStudent[y].passportPicture = JSON.stringify(da);
                }
              },
              (er) => {
                debugger; 
              }
            );
        },
        (er) => {
          debugger;
          alert("ארעה שגיאה, אנא נסו שוב.");
        }
      );
    }

    // let obUrl = URL.createObjectURL(this.fileD);
    // document.getElementById('audio').setAttribute('src', obUrl);
  }

  url() {
    debugger;
    return this.CurrentStudent.passportPicture;
  }

  SetInvalidFields() {
    debugger;
    if (this.CurrentStudent.City == null || this.CurrentStudent.City.value == null || this.CurrentStudent.City.value == 0 || this.CurrentStudent.Street == null || this.CurrentStudent.Street.idstreet == null || this.CurrentStudent.Street.idstreet == 0 || this.CurrentStudent.address.houseNumber == null) {
      this.AddressFunc();
      return;
    }
    else {
      this.flagInvalid = true;
      this.generalDetailsFunc();
    }
  }

  //שמירת פרטי תלמיד ושליחה לפונקציות הוספה /עדכון
  SaveStudent() {
    debugger;

    if (this.CurrentStudent.birthDate > new Date()) {
      this.messageService.add({ key: "tl", severity: "info", summary: "שים לב", detail: "הזנת תאריך לידה עתידי" });
      return;
    }
    if (this.CurrentStudent.DateOfImmigration > new Date()) {
      this.messageService.add({ key: "tl", severity: "info", summary: "שים לב", detail: "הזנת תאריך עלייה עתידי" });
      return;
    }
    if (this.CurrentStudent.City == null || this.CurrentStudent.Street == null || this.CurrentStudent.address.houseNumber == null) {
      this.AddressFunc();
      return;
    }
    if (
      (this.CurrentStudent.contactInformation.telephoneNumber1 == null ||
        this.CurrentStudent.contactInformation.telephoneNumber1 == "") &&
      (this.CurrentStudent.contactInformation.telephoneNumber2 == null ||
        this.CurrentStudent.contactInformation.telephoneNumber2 == "") &&
      (this.CurrentStudent.contactInformation.phoneNumber1 == null ||
        this.CurrentStudent.contactInformation.phoneNumber1 == "") &&
      (this.CurrentStudent.contactInformation.phoneNumber2 == null ||
        this.CurrentStudent.contactInformation.phoneNumber2 == "") &&
      (this.CurrentStudent.contactInformation.phoneNumber3 == null ||
        this.CurrentStudent.contactInformation.phoneNumber3 == "")
    ) {
      this.contactInformationValidaition = true;
      this.contactDetailsFunc();
      debugger;
      return;
    }


    // this.flagInvalid = false;
    this.ngxService.start();

    this.CurrentStudent.birth.BirthCountryId = this.CurrentStudent.Country != null ? this.CurrentStudent.Country.value : null;
    this.CurrentStudent.birth.birthDate = this.CurrentStudent.birthDate != null ? new Date(Date.UTC(this.CurrentStudent.birthDate.getFullYear(),this.CurrentStudent.birthDate.getMonth(),this.CurrentStudent.birthDate.getDate())) : null;
    this.CurrentStudent.GenderId = this.CurrentStudent.Gender != null ? this.CurrentStudent.Gender.value : null;
    this.CurrentStudent.typeIdentityId = this.CurrentStudent.typeIdentity != null ? this.CurrentStudent.typeIdentity.value : null;
    this.CurrentStudent.fatherTypeIdentityId = this.CurrentStudent.fatherTypeIdentity != null ? this.CurrentStudent.fatherTypeIdentity.value : null;
    this.CurrentStudent.motherTypeIdentityId = this.CurrentStudent.motherTypeIdentity != null ? this.CurrentStudent.motherTypeIdentity.value : null;
    this.CurrentStudent.apotropusTypeIdentityId = this.CurrentStudent.apotropusTypeIdentity != null ? this.CurrentStudent.apotropusTypeIdentity.value : null;
    this.CurrentStudent.statusStudentId = this.CurrentStudent.statusStudent != null ? this.CurrentStudent.statusStudent.value : null;
    this.CurrentStudent.statusId = this.CurrentStudent.status != null ? this.CurrentStudent.status.value : null;
    this.CurrentStudent.reasonForLeavingId = this.CurrentStudent.reasonForLeaving != null ? this.CurrentStudent.reasonForLeaving.value : null;
    this.CurrentStudent.birth.dateOfImmigration = this.CurrentStudent.DateOfImmigration != null ? new Date(Date.UTC(this.CurrentStudent.DateOfImmigration.getFullYear(),this.CurrentStudent.DateOfImmigration.getMonth(),this.CurrentStudent.DateOfImmigration.getDate())) : null;
    this.CurrentStudent.address.CityId = this.CurrentStudent.City != null ? this.CurrentStudent.City.value : null;
    this.CurrentStudent.address.NeighborhoodId = this.CurrentStudent.Neigborhood != null ? this.CurrentStudent.Neigborhood.value : null;
    this.CurrentStudent.address.StreetId = this.CurrentStudent.Street != null ? this.CurrentStudent.Street.idstreet : null;
    this.CurrentStudent.birth.CitizenshipId = this.CurrentStudent.Citizenship != null ? this.CurrentStudent.Citizenship.value : null;
    this.CurrentStudent.birth.countryIdofImmigration = this.CurrentStudent.CountryIdofImmigration != null ? this.CurrentStudent.CountryIdofImmigration.value : null;
    this.CurrentStudent.schoolId = this.CurrentStudent.School.school.idschool;
    debugger;
    let yearbookPerSchool = this.CurrentStudent.School.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook)
    if (yearbookPerSchool == undefined || yearbookPerSchool.idyearbookPerSchool == undefined) {
      this.ngxService.stop();
      this.messageService.add({ key: 'tl', severity: 'error', summary: 'שגיאה', detail: "למוסד שהזנת לא קיים שנתון תואם" });
    }
    else
      if (
        this.CurrentStudent.idstudent == 0 ||
        this.CurrentStudent.idstudent == undefined
      )
        this.studentService.AddStudent(this.CurrentStudent, this.CurrentStudent.School.userId, this.CurrentStudent.School.school.idschool, yearbookPerSchool.idyearbookPerSchool)
          .subscribe(
            (data) => {
              debugger;
              this.ngxService.stop();
              debugger;
              //  this.messageService.add({ severity:'success', summary: 'ההוספה הצליחה', detail: 'התלמיד נוסף בהצלחה'});
              if (data.id == "3" || data.id == "4") {
                this.success = true;
                data.appStudent.schoolName = this.CurrentStudent.School.school.name;
                this.studentService.ListStudent.push(data.appStudent);
                {
                  this.lock = true;
                  this.messageService.add({
                    key: "tl",
                    severity: "success",
                    summary: "ההוספה הצליחה",
                    detail: data.name,
                    sticky: true,
                  });
                }
              } else
                this.messageService.add({
                  key: "tl",
                  severity: "error",
                  summary: "ההוספה נכשלה",
                  detail: data.name,
                });
              // this.messageService.add({key: 'tl', severity:'info', summary: 'ההוספה נכשלה', detail: 'וודא שאין תלמיד עם תז זהה'});

              //  if(data==null)
              // this.messageService.add({key: 'tc', severity:'error', summary: 'ההוספה נכשלה', detail: 'וודא שאין תלמיד עם תז זהה'});

              //  this.studentService.ListStudent.push(data);
              //  else
              //    this.messageService.add({ severity:'success', summary: 'ההוספה הצליחה', detail: 'התלמיד נוסף בהצלחה'});
            },
            (er) => {
              debugger
              this.ngxService.stop();
              this.messageService.add({
                key: "tc",
                severity: "error",
                summary: "ההוספה נכשלה",
                detail: "ארעה שגיאה, אנא נסה שנית",
              });
            }
          );
      else {
        this.studentService
          .UpdateStudent(
            this.CurrentStudent,
            this.CurrentStudent.School.userId,
            this.CurrentStudent.School.school.idschool
          )
          .subscribe(
            (data) => {
              debugger;
              this.ngxService.stop();
              if (data == null)
                this.messageService.add({ key: "tc", severity: "error", summary: "שגיאה", detail: "העדכון נכשל אנא נסה שנית", });
              else {
                var i = this.studentService.ListStudent.findIndex(
                  (f) => f.idstudent == data.idstudent
                );
                if (i != -1) {
                  data.schoolName = this.CurrentStudent.School.school.name;
                  this.studentService.ListStudent[i] = data;
                  this.studentService.ListStudent = [...this.studentService.ListStudent];
                }
                debugger;
                this.messageService.add({
                  severity: "success",
                  summary: "העדכון הצליח",
                  detail: "התלמיד עודכן בהצלחה",
                  sticky: true,
                });

              }
            },
            (er) => {
              debugger;
              this.messageService.add({
                key: "tc",
                severity: "error",
                summary: "שגיאה",
                detail: "העדכון נכשל אנא נסה שנית",
              });
            }
          );
      }
  }

  //פונקציה הבודקת האם תז זו כבר קיימת במוסד
  ExitTz() {
    debugger;
    if (this.CurrentStudent.tz != null && this.CurrentStudent.tz != '' && this.CurrentStudent.School != null && this.CurrentStudent.School.school != null &&
      this.studentService.ListStudent.find(
        (f) => f.tz == this.CurrentStudent.tz && f.schoolId == this.CurrentStudent.School.school.idschool
      ) != null
    )
      this.flag = true;
    else this.flag = false;
    this.GetReasonForLeavingPerSchool();
  }

  //תאריך
  // isHovered(date: NgbDate) {

  //   return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  // }

  // isInside(date: NgbDate) {

  //   return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  // }

  // isRange(date: NgbDate) {

  //   return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  // }

  // onDateSelection(date: NgbDate) {
  //   debugger;

  //   if (!this.fromDate && !this.toDate) {
  //     this.fromDate = date;
  //   } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
  //     this.toDate = date;
  //   } else {
  //     this.toDate = null;
  //     this.fromDate = date;
  //   }
  // }

  dayTemplateData(date: NgbDate) {
    return {
      gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date),
    };
  }
  //בעת שינוי עיר-שליפת הרחובות בעיר זו
  ChangeCity() {
    debugger;
    if ((this.StreetService.StreetsPerCity == null || this.StreetService.StreetsPerCity.length == 0 || this.StreetService.StreetsPerCity[0].cityId != this.CurrentStudent.City.value) && (this.CurrentStudent != null && this.CurrentStudent.City != null))
      this.StreetService.GetStreetsByCityId(this.CurrentStudent.City.value).subscribe(data => { this.StreetService.StreetsPerCity = data }, er => { })
  }

  onClose() {
    debugger;
    if (this.success == true) this.router.navigate(["Home/StudentList"]);
  }

  lockForm() {
    if (this.lock == true) return "none";
    return "visible";
  }

  OnChangeContact() {
    debugger;
    if (
      (this.CurrentStudent.contactInformation.telephoneNumber1 == null ||
        this.CurrentStudent.contactInformation.telephoneNumber1 == "") &&
      (this.CurrentStudent.contactInformation.telephoneNumber2 == null ||
        this.CurrentStudent.contactInformation.telephoneNumber2 == "") &&
      (this.CurrentStudent.contactInformation.phoneNumber1 == null ||
        this.CurrentStudent.contactInformation.phoneNumber1 == "") &&
      (this.CurrentStudent.contactInformation.phoneNumber2 == null ||
        this.CurrentStudent.contactInformation.phoneNumber2 == "") &&
      (this.CurrentStudent.contactInformation.phoneNumber3 == null ||
        this.CurrentStudent.contactInformation.phoneNumber3 == "")
    )
      this.contactInformationValidaition = true;
    else this.contactInformationValidaition = false;
  }

  //#region // radioButtons-מעבר
  //כללי
  generalDetailsFunc() {
    debugger;
    this.general = true;

    this.addressDetails = false;
    this.contactDetails = false;
    this.familyDetails = false
  }
  //כתובת
  addressDetailsFunc() {
    this.addressDetails = true;

    this.general = false;
    this.contactDetails = false;
    this.familyDetails = false;
  }
  //יצירת קשר
  contactDetailsFunc() {
    this.contactDetails = true;

    this.general = false;
    this.addressDetails = false;
    this.familyDetails = false;
  }
  //כתובת
  AddressFunc() {
    this.addressDetails = true;
    this.general = false;
    this.contactDetails = false;
    this.familyDetails = false;
  }
  //משפחה
  familyDetailsFunc() {
    this.familyDetails = true;

    this.contactDetails = false;
    this.general = false;
    this.addressDetails = false;
  }
  //#endregion

  // עריכת פרטי איש קשר
  openContactDetails(contact: Contact) {
    debugger;
    this.contactService.currentContact = { ...contact };
    if (this.contactService.currentContact.contactInformation == null) this.contactService.currentContact.contactInformation = new ContactInformation();
    this.studentService.flagAddOrUpdateContact = false
    debugger;
    this.router.navigate(["Home/Contacts"]);
  }

  // שמירת איש קשר
  SaveContact() {
    debugger;
    const school = this.schoolService.ListSchool.find(f => f.school.idschool == this.studentService.CurrentStudent.schoolId)
    this.contactService
      .UpdateContact(
        this.contactService.currentContact,
        school.userId,
        this.schoolService.SelectYearbook.idyearbook
      )
      .subscribe(
        (data) => {
          debugger
        },
        (err) => {
          debugger
        }
      );
  }

  // עריכת קשר
  opencontactTypeDetails(contactPerStudent: ContactPerStudent) {
    this.contactService.currentContacPerStudent = { ...contactPerStudent };
    this.studentService.flagAddOrUpdateContact = false
    debugger;

    this.typecontactService
      .GetTypeContactBySchoolID(this.studentService.CurrentStudent.schoolId)
      .subscribe(
        (data) => {
          this.contactService.typeContactList = data;
          debugger;
        },
        (err) => {
          debugger;
        }
      );
    this.displayModal = true;
  }

  //  שמירת עריכת קשר
  SaveContactPerStudent() {
    debugger
    this.displayModal = false;
    debugger;
    this.ngxService.start();
    const school = this.schoolService.ListSchool.find(f => f.school.idschool == this.studentService.CurrentStudent.schoolId)
    this.contactService
      .UpdateContactPerStudent(this.contactService.currentContacPerStudent, school.userId, this.studentService.CurrentStudent.schoolId
      )
      .subscribe(
        (data) => {
          debugger
          var con = this.CurrentStudent.contactPerStudent.find(f => f.idcontactPerStudent == this.contactService.currentContacPerStudent.idcontactPerStudent);
          if (con.typeContact != null) con.typeContact = this.contactService.currentContacPerStudent.typeContact
          this.messageService.add({
            severity: "success",
            summary: "העדכון הצליח",
            detail: "קשר עודכן בהצלחה",
          });
          this.ngxService.stop();

        },
        (err) => {
          this.messageService.add({
            key: "tc",
            severity: "error",
            summary: "שגיאה",
            detail: "העדכון נכשל אנא נסה שנית",
          });
          this.ngxService.stop();
          debugger;
        }
      );


  }

  // מחיקת איש קשר
  DeleteContactPerStudent(contactPerStudent: any) {
    this.confirmationService.confirm({
      message: 'האם הנך בטוח/ה שברצונך למחוק איש קשר זה',
      header: 'מחיקת איש קשר לתלמיד/ה',
      icon: 'pi pi-info-circle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        debugger;
        this.contactService.DeleteContactPerStudent(contactPerStudent.idcontactPerStudent).subscribe(data => {
          if (data == true) {
            var i = this.CurrentStudent.contactPerStudent.findIndex(f => f.idcontactPerStudent == contactPerStudent.idcontactPerStudent);
            if (i != -1) this.CurrentStudent.contactPerStudent.splice(i, 1);
            this.messageService.add({ severity: 'success', summary: 'המחיקה הצליחה', detail: 'איש קשר זה נמחק בהצלחה' });
          }
          else
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'ארעה שגיאה, אנא נסה שנית' });
        }, er => {
          this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'ארעה שגיאה, אנא נסה שנית' });
        });
      },
      reject: (type) => {
      }
    });
  }

  AddContact() {
    this.studentService.flagAddOrUpdateContact = true
    this.contactService.currentContact = new Contact()
    this.contactService.currentContact.contactInformation = new ContactInformation()
    this.contactService.currentStudentForContact = { ...this.CurrentStudent }
    this.router.navigate(["Home/Contacts"]);
  }
}
