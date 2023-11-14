import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  NgbCalendar,
  NgbCalendarHebrew,
  NgbDatepickerI18n,
  NgbDatepickerI18nHebrew,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { Contact } from 'src/app/Class/contact';
import { ContactInformation } from 'src/app/Class/contact-information';
import { TypeContact } from 'src/app/Class/type-contact';
import { ContactService } from 'src/app/Service/contact.service';
import { SchoolService } from 'src/app/Service/school.service';
import { StudentService } from 'src/app/Service/student.service';
import { TypeContactService } from 'src/app/Service/type-contact.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css'],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew },
    [MessageService, ConfirmationService],
  ],
})
export class ContactsComponent implements OnInit {
  firstName: String;
  displayModal: boolean = false;
  currentContactByTz: Contact = new Contact();
  contactInformationValidaition: boolean = false;
  typeIdentity: any;
  flagAddContactOrAddContactPerStudentAndUpdateContact: boolean = false//true-עדכון איש קשר והוספת קשר
  flag: boolean = false;

  blockSpecial: RegExp = /^[0-9]+$/;

  constructor(
    public contactService: ContactService,
    public schoolService: SchoolService,
    public studentService: StudentService,
    public typecontactService: TypeContactService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private ngxService: NgxUiLoaderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    debugger;
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }

    if (this.contactService.currentContact != null &&
      this.contactService.currentContact.typeIdentityId != null &&
      this.contactService.currentContact.typeIdentityId != 0
    )
      this.typeIdentity = this.schoolService.TypeIdentitys.find((f) => f.value == this.contactService.currentContact.typeIdentityId);
    else this.typeIdentity = this.schoolService.TypeIdentitys[1];

    var u = this.schoolService.ListSchool.find((f) => f.school.idschool == this.studentService.CurrentStudent.schoolId).userId;
    var x = this.contactService.currentContact;
    debugger;

    if (this.studentService.flagAddOrUpdateContact == true)//true-הוספה false-עריכה
      this.typecontactService.GetTypeContactBySchoolID(this.studentService.CurrentStudent.schoolId).subscribe(
        (data) => {
          this.contactService.currentContacPerStudent.typeContact = null
          this.contactService.typeContactList = data;
          debugger;
        },
        (err) => {
          debugger;
        }
      );
  }
  moveToPrev(){
    //this.router.navigate()
  }
  // שמירת איש קשר
  //הוספה/עדכון
  SaveContact() {
    debugger;
    if (
      (this.contactService.currentContact.contactInformation.telephoneNumber1 == null ||
        this.contactService.currentContact.contactInformation.telephoneNumber1 == '') &&
      (this.contactService.currentContact.contactInformation.telephoneNumber2 == null ||
        this.contactService.currentContact.contactInformation.telephoneNumber2 == '') &&
      (this.contactService.currentContact.contactInformation.phoneNumber1 == null ||
        this.contactService.currentContact.contactInformation.phoneNumber1 == '') &&
      (this.contactService.currentContact.contactInformation.phoneNumber2 == null ||
        this.contactService.currentContact.contactInformation.phoneNumber2 == '') &&
      (this.contactService.currentContact.contactInformation.phoneNumber3 == null ||
        this.contactService.currentContact.contactInformation.phoneNumber3 == '')
    ) {
      this.contactInformationValidaition = true;
      return;
    }

    this.ngxService.start();
    var userId = this.schoolService.ListSchool.find(
      (f) => f.school.idschool == this.studentService.CurrentStudent.schoolId
    ).userId;

    //עדכון
    if (this.studentService.flagAddOrUpdateContact == false) {
      debugger;
      this.contactService
        .UpdateContact(
          this.contactService.currentContact,
          userId,
          this.studentService.CurrentStudent.schoolId
        )
        .subscribe(
          (data) => {
            debugger;
            this.messageService.add({
              severity: 'success',
              summary: 'העדכון הצליח',
              detail: 'איש קשר עודכן בהצלחה',
            });
            this.ngxService.stop();
            debugger;
          },
          (err) => {
            this.messageService.add({
              key: 'tc',
              severity: 'error',
              summary: 'שגיאה',
              detail: 'העדכון נכשל אנא נסה שנית',
            });
            this.ngxService.stop();
            debugger;
          }
        );
    }
    else
      //עדכון איש קשר והוספת קשר חדש
      if (this.flagAddContactOrAddContactPerStudentAndUpdateContact == true) {
        this.contactService.UpdateContactAndAddContactPerStudent(this.contactService.currentContact,
          this.contactService.currentContacPerStudent.typeContact.idtypeContact,
          userId,
          this.studentService.CurrentStudent.schoolId,
          this.studentService.CurrentStudent.idstudent).subscribe(
            data => {
              debugger
              if (data[1] == "1")
                this.messageService.add({
                  severity: 'success',
                  summary: '  פעולה הצליחה!',
                  detail: '  איש קשר קושר לתלמיד בהצלחה',
                });
              else
                this.messageService.add({
                  key: 'tc',
                  severity: 'error',
                  summary: 'שגיאה',
                  detail: data[0],
                });


            },
            err => {
              debugger
              this.messageService.add({
                key: 'tc',
                severity: 'error',
                summary: 'שגיאה',
                detail: 'ההוספה נכשלה אנא נסה שנית',
              });
            })
        this.ngxService.stop()
      }
      //הוספה
      else {
        debugger;
        if (this.typeIdentity != null)
          this.contactService.currentContact.typeIdentityId =
            this.typeIdentity.value;
            this.contactService.currentContact.SchoolId=this.studentService.CurrentStudent.schoolId;
        this.contactService
          .AddContact(
            this.contactService.currentContact,
            userId,
            this.studentService.CurrentStudent.schoolId,
            this.studentService.CurrentStudent.idstudent,
            this.contactService.currentContacPerStudent.typeContact.idtypeContact
          )
          .subscribe(
            (data) => {
              debugger
              if (data.id == "1")
                this.messageService.add({
                  key: 'tc',
                  severity: 'error',
                  summary: 'שגיאה',
                  detail: '  תעודת זהות לא תקינה ',
                });
              else
                if (data.id == "2")
                  this.messageService.add({
                    key: 'tc',
                    severity: 'error',
                    summary: 'שגיאה',
                    detail: 'ההוספה נכשלה אנא נסה שנית',
                  });

                else
                  if (data.id == "4")
                    this.messageService.add({
                      severity: 'success',
                      summary: ' ההוספה הצליחה',
                      detail: 'איש קשר נוסף בהצלחה',
                    });

              this.ngxService.stop();
              debugger;
              // this.router.navigate(['Home/AddOrUpdateStudent/',this.studentService.CurrentStudent.idstudent]);
            },
            (err) => {
              this.messageService.add({
                key: 'tc',
                severity: 'error',
                summary: 'שגיאה',
                detail: 'ההוספה נכשלה אנא נסה שנית',
              });
              this.ngxService.stop();
            }
          );
      }
  }

  onClose() {
    this.contactService.currentContact.tz = null;
  }

  CheckTz() {
    debugger;
    this.contactService
      .GetContactByTz(this.contactService.currentContact.tz, this.studentService.CurrentStudent.schoolId)
      .subscribe(
        (data) => {
          debugger;
          if (data != null) {
            debugger;

            this.currentContactByTz = data;
            debugger

            // this.displayModal = true;
            this.OpenDialog();
          }
        },
        (err) => {
          debugger;
        }
      );
  }

  AddContactPerStudent() {
    debugger;
    this.typeIdentity = this.schoolService.TypeIdentitys.find((f) => f.value == this.currentContactByTz.typeIdentityId);
    this.contactService.currentContact = this.currentContactByTz;
    if (this.contactService.currentContact.contactInformationId == null)
      this.contactService.currentContact.contactInformation =
        new ContactInformation();

    this.displayModal = false;
  }

  // סגירת הדיילוג
  closeDialog() {
    this.displayModal = false;
    this.contactService.currentContact.tz = null;
  }

  OnChangeContactInformation() {
    if (
      (this.contactService.currentContact.contactInformation.telephoneNumber1 ==
        null ||
        this.contactService.currentContact.contactInformation
          .telephoneNumber1 == '') &&
      (this.contactService.currentContact.contactInformation.telephoneNumber2 ==
        null ||
        this.contactService.currentContact.contactInformation
          .telephoneNumber2 == '') &&
      (this.contactService.currentContact.contactInformation.phoneNumber1 ==
        null ||
        this.contactService.currentContact.contactInformation.phoneNumber1 ==
        '') &&
      (this.contactService.currentContact.contactInformation.phoneNumber2 ==
        null ||
        this.contactService.currentContact.contactInformation.phoneNumber2 ==
        '') &&
      (this.contactService.currentContact.contactInformation.phoneNumber3 ==
        null ||
        this.contactService.currentContact.contactInformation.phoneNumber3 ==
        '')
    )
      this.contactInformationValidaition = true;
    else this.contactInformationValidaition = false;
  }

  OpenDialog() {
    this.confirmationService.confirm({
      message: 'נמצא איש קשר זה במאגר, האם לשייך אותו לתלמיד זה?',
      header: 'שים לב',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'שייך איש קשר לתלמיד',
      rejectLabel: 'ביטול',
      accept: () => {
        this.flagAddContactOrAddContactPerStudentAndUpdateContact = true
        this.AddContactPerStudent()
      },
      reject: (type) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            this.closeDialog();
            break;
          case ConfirmEventType.CANCEL:
            this.closeDialog();
            break;
        }
      }
    });
  }



}
