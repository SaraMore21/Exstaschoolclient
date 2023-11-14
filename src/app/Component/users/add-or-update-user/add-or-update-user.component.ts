import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NgbCalendar,
  NgbCalendarHebrew,
  NgbDate,
  NgbDatepickerI18n,
  NgbDatepickerI18nHebrew,
} from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import { Address } from 'src/app/Class/address';
import { Birth } from 'src/app/Class/birth';
import { ContactInformation } from 'src/app/Class/contact-information';
import { User } from 'src/app/Class/user';
import { SchoolService } from 'src/app/Service/school.service';
import { UserService } from 'src/app/Service/user.service';

import { HebrewCalanderService } from 'src/app/Service/hebrew-calander.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { FilesAzureService } from 'src/app/Service/files-azure.service';
import { UserPerSchool } from 'src/app/Class/user-per-school';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { StreetService } from 'src/app/Service/street.service';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';

@Component({
  selector: 'app-add-or-update-user',
  templateUrl: './add-or-update-user.component.html',
  styleUrls: ['./add-or-update-user.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew },
    [MessageService],
  ],
})
export class AddOrUpdateUserComponent implements OnInit {

  //#region
  UserId: number; //Id from URL
  CurrentUser: any;
  street: Array<any> = new Array<any>();
  flag: boolean = false;
  displayModal: boolean;
  displayModal2: boolean;
  emailAddress: string;
  password: string;
  city1: any;
  city: any;
  flagInvalid: boolean = false;
  lock: boolean = false;
  success: boolean = false
  contactInformationValidaition: boolean = false;
  schoolId: number = 0;
  //#endregion

  blockSpecial: RegExp = /^[0-9]+$/;

  constructor(
    public userService: UserService,
    public schoolService: SchoolService,
    public streetService: StreetService,
    public genericFunctionService: GenericFunctionService,
    public router: Router,
    public active: ActivatedRoute,
    public messageService: MessageService,
    private calendar: NgbCalendar,
    public i18n: NgbDatepickerI18n,
    public HebrewCalanderService: HebrewCalanderService,
    public FilesAzureService: FilesAzureService,
    private ngxService: NgxUiLoaderService
  ) {
    this.dayTemplateData = this.dayTemplateData.bind(this);
    this.active.params.subscribe((c) => {
      this.UserId = c['id'];
      this.schoolId = c['schoolId'];

    });
  }

  ngOnInit(): void {
    debugger;
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    if (this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.genericFunctionService.GoBackToLastPage();
    if (this.UserId != 0) this.GetUserDetailsByIDUser();
    else this.SetDetails();
  }

  //בעת טעינה- הצגת פרטי המשתמש
  GetUserDetailsByIDUser() {
    var user = this.userService.ListUserByListSchoolAndYerbook.find(f => f.iduser == this.UserId && f.schoolId == this.schoolId);
    this.userService
      .GetUserDetailsByIDUser(this.UserId, user ? user.schoolId : null)
      .subscribe(
        (data) => {
          debugger;
          this.CurrentUser = data;
          this.SetDetails();
        },
        (err) => { }
      );
  }

  SaveUser(a: any) {
    if (this.CurrentUser.iduserPerSchool == null
      || this.CurrentUser.iduserPerSchool == 0)
      this.ExitTz();
    if (this.flag == true) return;

    debugger;

    if (this.CurrentUser.birthDate > new Date()) {
      this.messageService.add({ key: "tl", severity: "info", summary: "שים לב", detail: "הזנת תאריך לידה עתידי" });
      return;
    }
    if (this.CurrentUser.DateOfImmigration > new Date()) {
      this.messageService.add({ key: "tl", severity: "info", summary: "שים לב", detail: "הזנת תאריך עלייה עתידי" });
      return;
    }
    if (
      (this.CurrentUser.contactInformation.telephoneNumber1 == null ||
        this.CurrentUser.contactInformation.telephoneNumber1 == '') &&
      (this.CurrentUser.contactInformation.telephoneNumber2 == null ||
        this.CurrentUser.contactInformation.telephoneNumber2 == '') &&
      (this.CurrentUser.contactInformation.phoneNumber1 == null ||
        this.CurrentUser.contactInformation.phoneNumber1 == '') &&
      (this.CurrentUser.contactInformation.phoneNumber2 == null ||
        this.CurrentUser.contactInformation.phoneNumber2 == '') &&
      (this.CurrentUser.contactInformation.phoneNumber3 == null ||
        this.CurrentUser.contactInformation.phoneNumber3 == '')
    ) {
      this.contactInformationValidaition = true
      return;
    }

    this.flagInvalid = false;
    debugger;
    this.CurrentUser.birth.birthCountryId = this.CurrentUser.Country != null ? this.CurrentUser.Country.value : null;
    this.CurrentUser.birth.birthDate = this.CurrentUser.birthDate != null  ?new Date(Date.UTC(this.CurrentUser.birthDate.getFullYear(),this.CurrentUser.birthDate.getMonth(),this.CurrentUser.birthDate.getDate()))  : null;
    this.CurrentUser.genderId = this.CurrentUser.Gender != null ? this.CurrentUser.Gender.value : null;
    this.CurrentUser.user.TypeIdentityId =  this.CurrentUser.TypeIdentity != null ? this.CurrentUser.TypeIdentity.value : null;
    this.CurrentUser.address.cityId = this.CurrentUser.City != null ? this.CurrentUser.City.value : null;
    this.CurrentUser.address.StreetId =  this.CurrentUser.Street != null ? this.CurrentUser.Street.idstreet : null;
    this.CurrentUser.birth.citizenshipId = this.CurrentUser.CitizenshipId != null  ? this.CurrentUser.CitizenshipId.value : null;
    this.CurrentUser.birth.countryIdofImmigration = this.CurrentUser.CountryIdofImmigration != null ? this.CurrentUser.CountryIdofImmigration.value : null;
    this.CurrentUser.birth.dateOfImmigration =  this.CurrentUser.DateOfImmigration != null ? new Date(Date.UTC(this.CurrentUser.DateOfImmigration.getFullYear(),this.CurrentUser.DateOfImmigration.getMonth(),this.CurrentUser.DateOfImmigration.getDate()))   : null;

    this.CurrentUser.address.HouseNumber = this.CurrentUser.houseNumber;
    if (
      this.CurrentUser.user.iduser == 0 ||
      this.CurrentUser.user.iduser == undefined
    ) {
      this.showModalDialog();
    } else {
      debugger;
      this.userService.UpdateUser(this.CurrentUser, this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentUser.schoolId).userId).subscribe(data => {
        if (data == null) this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'העדכון נכשל אנא נסה שנית' });
        else {
          var i = this.userService.ListUserByListSchoolAndYerbook.findIndex(f => f.iduser == data.iduser && f.schoolId == this.CurrentUser.schoolId);
          if (i != -1) {
            let schoolname = this.userService.ListUserByListSchoolAndYerbook[i].schoolName;
            this.userService.ListUserByListSchoolAndYerbook[i] = data;
            this.userService.ListUserByListSchoolAndYerbook[i].schoolName = schoolname;
          }
          var i = this.userService.ListUserPerSY.findIndex(f => f.iduser == data.iduser && f.schoolId == this.CurrentUser.schoolId);
          if (i != -1) {
            let schoolname = this.userService.ListUserPerSY[i].schoolName;
            this.userService.ListUserPerSY[i] = data;
            this.userService.ListUserPerSY[i].schoolName = schoolname;
          }
          debugger;
          this.messageService.add({ severity: 'success', summary: 'העדכון הצליח', detail: 'המשתמש עודכן בהצלחה' });
        }
      }, er => {
        debugger;
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'העדכון נכשל אנא נסה שנית' });
      });
    }
  }

  SetDetails() {
    debugger;
    if (this.CurrentUser == null) {
      this.CurrentUser = new UserPerSchool();
      this.CurrentUser.isActive = true;
    }
    if (this.CurrentUser.user == null) {
      this.CurrentUser.user = new User();
      this.CurrentUser.user.typeIdentityId =
        this.schoolService.TypeIdentitys[1].value;
    }
    if (this.CurrentUser.address == null) this.CurrentUser.address = new Address();
    if (this.CurrentUser.contactInformation == null) this.CurrentUser.contactInformation = new ContactInformation();
    if (this.CurrentUser.birth == null) this.CurrentUser.birth = new Birth();
    this.CurrentUser.birthDate = this.CurrentUser.birth.birthDate != null ? new Date(this.CurrentUser.birth.birthDate) : this.CurrentUser.birth.birthDate = null
    this.CurrentUser.DateOfImmigration = this.CurrentUser.birth.dateOfImmigration != null ? new Date(this.CurrentUser.birth.dateOfImmigration) : null;

    debugger;

    this.CurrentUser.City = this.schoolService.Cities.find(
      (f) => f.value == this.CurrentUser.address.cityId
    );
    if (this.CurrentUser.City != null) {
      this.ChangeCity();
    }
    this.CurrentUser.Citizenship = this.schoolService.Countries.find(
      (f) => f.value == this.CurrentUser.birth.citizenshipId
    );
    this.CurrentUser.Country = this.schoolService.Countries.find(
      (f) => f.value == this.CurrentUser.birth.birthCountryId
    );
    this.CurrentUser.Gender = this.schoolService.Genders.find(
      (f) => f.value == this.CurrentUser.genderId
    );
    this.CurrentUser.Neigborhood = this.schoolService.Neigborhoods.find(
      (f) => f.value == this.CurrentUser.address.neighborhoodId
    );
    this.CurrentUser.TypeIdentity = this.schoolService.TypeIdentitys.find(
      (f) => f.value == this.CurrentUser.user.typeIdentityId
    );
    this.CurrentUser.CitizenshipId = this.schoolService.Countries.find(
      (f) => f.value == this.CurrentUser.birth.citizenshipId
    );
    this.CurrentUser.CountryIdofImmigration = this.schoolService.Countries.find(
      (f) => f.value == this.CurrentUser.birth.countryIdofImmigration
    );
    this.CurrentUser.School = this.schoolService.ListSchool.find(
      (f) => f.school.idschool == this.CurrentUser.schoolId
    );
    if (this.schoolService.ListSchool.length == 1 && (this.CurrentUser.schoolId == null || this.CurrentUser.schoolId == 0))
      this.CurrentUser.School = this.schoolService.ListSchool[0]
    this.userService.CurrentUser = this.CurrentUser;
  }

  AddUserAndSendMail() {
    debugger;
    this.displayModal = false;
    this.ngxService.start();
    var yearbook = this.CurrentUser.School.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook);
    if (yearbook == null) {
      this.messageService.add({ key: 'tl', severity: 'error', summary: 'שגיאה', detail: "למוסד שהזנת לא קיים שנתון תואם" });
      this.ngxService.stop();

    }
    else {
      this.CurrentUser.schoolId = this.CurrentUser.School.school.idschool;
      this.userService
        .AddUser(
          this.CurrentUser,
          this.CurrentUser.School.userId,
          this.CurrentUser.School.school.idschool,
          yearbook.idyearbookPerSchool,
          this.emailAddress,
          '   פרטי כניסה לאתר extraschool'
        )
        .subscribe(
          (data) => {
            this.ngxService.stop();
            debugger;
            if (data.id == '4' || data.id == '3') {
              this.success = true
              data.user.schoolId = this.CurrentUser.School.school.idschool;
              data.user.schoolName = this.CurrentUser.School.school.name;
              this.userService.ListUserByListSchoolAndYerbook.push(data.user);
              if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY.length > 0 && this.userService.ListUserPerSY[0].schoolId == this.CurrentUser.School.school.idschool)
                this.userService.ListUserPerSY.push(data.user);

              {
                this.lock = true;
                this.messageService.add({
                  key: 'tl',
                  severity: 'success',
                  summary: data.name,
                  detail: 'ברגעים אלו נשלחת אליך הסיסמא למייל ',
                  sticky: true,
                });
                //    this.router.navigate(['Home/UserList']);
              }

            } else
              this.messageService.add({
                key: 'tl',
                severity: 'info',
                summary: 'ההוספה נכשלה',
                detail: data.name,
              });
          },
          (er) => {
            debugger;
            this.ngxService.stop();
            this.messageService.add({
              key: 'tc',
              severity: 'error',
              summary: 'ההוספה נכשלה',
              detail: 'וודא שאין משתמש עם תז זהה',
            });
          }
        );
    }
  }

  onClose() {
    debugger;
    if (this.success == true)
      this.router.navigate(['Home/UserList']);
  }

  //פונקציה הבודקת האם תז זו כבר קיימת במוסד
  ExitTz() {
    debugger;
    if (
      this.userService.ListUserByListSchoolAndYerbook.find((u) => this.CurrentUser && u.tz == this.CurrentUser.user.tz && this.CurrentUser.School && u.schoolId == this.CurrentUser.School.school.idschool) !=
      null
    )
      this.flag = true;
    else this.flag = false;
  }

  ChangeCity() {
    debugger;
    if (this.streetService.StreetsPerCity == null || this.streetService.StreetsPerCity.length == 0 || this.streetService.StreetsPerCity[0].cityId != this.CurrentUser.City.value)
      this.streetService.GetStreetsByCityId(this.CurrentUser.City.value).subscribe(data => { this.streetService.StreetsPerCity = data 
        this.CurrentUser.Street = this.streetService.StreetsPerCity.find(
          (f) => f.idstreet == this.CurrentUser.address.streetId
        );}, er => { })
  }

  showModalDialog() {
    this.displayModal = true;
  }

  // SendEmailForPassword(){
  //  this.displayModal = false
  //   debugger;
  //   this.userService.SendEmailWithPassword(this.emailAddress," סיסמא מרבכבל"," HI"+this.CurrentUser.user.firstName+"הסיסמא שלך היא"+this.password).subscribe(data=>{
  //     debugger;
  //     if(data==true)

  //     this.messageService.add({ key: 'tc', severity: 'success', summary: '', detail: 'נשלחה אליך הסיסמא למייל' });
  //     else
  //     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: '   נסה שנית' });

  //   },err=>{
  //     this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'התרחשה שגיאה, נסה שוב.' });

  //   });

  // }

  dayTemplateData(date: NgbDate) {
    return {
      gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date),
    };
  }

  Ok() {
    this.displayModal2 = false;
  }

  lockForm() {
    if (this.lock == true) return 'none';
    return 'visible';
  }

  OnChangeContact() {
    debugger
    if (
      (this.CurrentUser.contactInformation.telephoneNumber1 == null ||
        this.CurrentUser.contactInformation.telephoneNumber1 == '') &&
      (this.CurrentUser.contactInformation.telephoneNumber2 == null ||
        this.CurrentUser.contactInformation.telephoneNumber2 == '') &&
      (this.CurrentUser.contactInformation.phoneNumber1 == null ||
        this.CurrentUser.contactInformation.phoneNumber1 == '') &&
      (this.CurrentUser.contactInformation.phoneNumber2 == null ||
        this.CurrentUser.contactInformation.phoneNumber2 == '') &&
      (this.CurrentUser.contactInformation.phoneNumber3 == null ||
        this.CurrentUser.contactInformation.phoneNumber3 == '')
    )
      this.contactInformationValidaition = true
    else
      this.contactInformationValidaition = false
  }
}
