import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { group, time } from 'console';
import { GroupSemesterPerCourse } from 'src/app/Class/group-semester-per-course';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';
import { SchoolService } from 'src/app/Service/school.service';
import { StudentService } from 'src/app/Service/student.service';
import { MessageService, ConfirmationService } from "primeng/api";
import { GroupService } from 'src/app/Service/group.service';
import { Student } from 'src/app/Class/student';
import { StudentPerGroup } from 'src/app/Class/student-per-group';
import {
  NgbCalendar,
  NgbCalendarHebrew, NgbDate,
  NgbDatepickerI18n,
  NgbDatepickerI18nHebrew,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { ConvertDateToStringService } from 'src/app/Service/convert-date-to-string.service';
import { HebrewCalanderService } from 'src/app/Service/hebrew-calander.service';
import { YearbookPerSchool } from 'src/app/Class/yearbook-per-school';
import { toJSDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';
import { TaskExsist } from 'src/app/Class/task-exsist';
import { School } from 'src/app/Class/school';
@Component({
  selector: 'app-group-per-student',
  templateUrl: './group-per-student.component.html',
  styleUrls: ['./group-per-student.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew },
    [MessageService, ConfirmationService]
  ]
})
export class GroupPerStudentComponent implements OnInit {
  StudentId: number;
  SchoolId: number;
  //המוסד העכשוי
  CurrentSchool: any;
  //התלמיד העכשוי
  CurrentStudent: Student;
  //השנתון העכשוי
  CurrentYearbookPerSchool: YearbookPerSchool;
  //רשימת הקבוצות כולל הקורסים המשוייכים אליהם
  ListGroupWithCourseToStudent: Array<any>;
  //משתנה בוליאני להצגת דיאלוג הוספת קבוצה לתלמידה
  displayDialogAddGTS: boolean;
  //משתנה בוליאני להצגת בחירת טווח תאריכים לשיוך
  openDialogRangOfDate: boolean = false;
  //משתנה בוליאני לעריכת טווח תאריכים
  DialogEditRangOfDate: boolean = false;
  //רשימת הקבוצות אליהם התלמידה לא משוייכת
  ListGroup: any;
  //הקבוצה שנבחרה להוספת שיוך
  selectedGroup: any;
  //אפשרויות לטווח התאריכים
  options: any[] = [{ name: 'הזנה ידנית ', key: 'A' }, { name: 'הזנה אוטומטית', key: 'M' }];
  //הסוג טווח תאריכים הבחור
  selectedOption: any = null;
  //טווח תאריכים
  FromDate: any;
  ToDate: any;
  //משתנה המאפיין איזה סוג טווח תאריכים
  disabled: boolean = false;
  //משתנה בוליאני המאפיין האם לפתוח את דיאלוג בחירת המטלות לשייך לתלמידה
  DialogTaskExsist: boolean;
  //רשימת המטלות הקיימות
  ListTaskExsist: Array<TaskExsist> = new Array<TaskExsist>();
  //המטלות שנבחרו
  SelectTaskExsist: Array<TaskExsist>;
  //התלמידה לעריכה
  StudentPerGroup: StudentPerGroup;
  FromDateEdit: NgbDateStruct;
  ToDateEdit: NgbDateStruct;
  constructor(
    private router: Router,
    private active: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public schoolService: SchoolService,
    public studentService: StudentService,
    public groupService: GroupService,
    public genericFunctionService: GenericFunctionService,
    private calendar: NgbCalendar,
    public i18n: NgbDatepickerI18n,
    public convertDateToStringService: ConvertDateToStringService,
    public hebrewCalanderService: HebrewCalanderService) {
    this.dayTemplateData = this.dayTemplateData.bind(this);
  }

  ngOnInit(): void {
    this.active.params.subscribe((c) => { this.StudentId = c["StudentId"] });
    this.active.params.subscribe((c) => { this.SchoolId = c["SchoolId"] });
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    if (this.studentService.YearbookIdPerStudent != this.schoolService.SelectYearbook.idyearbook)
      this.genericFunctionService.GoBackToLastPage();
    this.CurrentStudent = this.studentService.ListStudent.find(f => f.idstudent == this.StudentId);
    this.CurrentSchool = this.schoolService.ListSchool.find(f => f.school.idschool == this.SchoolId);
    this.CurrentYearbookPerSchool = this.CurrentSchool.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook);
    this.GetGroupsToStudent();
  }
  //המרת תאריך
  dayTemplateData(date: NgbDate) {
    return {
      gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date)
    };
  }
  //שליפת הקבוצות לפי תלמידה ושנתון
  GetGroupsToStudent() {
    this.studentService.GetGroupsToStudent(this.StudentId, this.CurrentYearbookPerSchool.idyearbookPerSchool).subscribe(data => {
      debugger;
      this.ListGroupWithCourseToStudent = data;
    }, er => { });
  }
  //הוספת שיוך קבוצה לתלמיד
  AddGroupToStudent() {
    debugger;
    this.SelectTaskExsist = new Array<TaskExsist>();
    this.selectedGroup = null;
    this.hebrewCalanderService.getHebrew(new Date(this.CurrentYearbookPerSchool.fromDate)).subscribe((d) => {
      debugger;
      if (this.calendar.getMonths(d.hy).length == 13)
        var hm = this.hebrewCalanderService.dict2.find(f => f.label == d.hm);
      else
        var hm = this.hebrewCalanderService.dict1.find(f => f.label == d.hm);
      this.FromDate = new NgbDate(d.hy, hm.value, d.hd);
    }, er => { })
    this.hebrewCalanderService.getHebrew(new Date(this.CurrentYearbookPerSchool.toDate)).subscribe((d) => {
      debugger;
      if (this.calendar.getMonths(d.hy).length == 13)
        var hm = this.hebrewCalanderService.dict2.find(f => f.label == d.hm);
      else
        var hm = this.hebrewCalanderService.dict1.find(f => f.label == d.hm);
      this.ToDate = new NgbDate(d.hy, hm.value, d.hd);
    }, er => { })

    this.displayDialogAddGTS = true;
    if (this.groupService.ListGroupsByListSchoolAndYerbook != null) {
      var yearbook;
      this.schoolService.ListSchool.find(f => f.appYearbookPerSchools.find(f => {
        if (f.idyearbookPerSchool == this.groupService.ListGroupsByListSchoolAndYerbook[0].yearbookId) yearbook = f;
      }));
    }

    if (this.groupService.ListGroupsByListSchoolAndYerbook == null || this.groupService.ListGroupsByListSchoolAndYerbook.length == 0 || yearbook.yearbookId != this.schoolService.SelectYearbook.idyearbook) {
      this.groupService.GetGroupsByIdSchool(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        this.groupService.ListGroupsByListSchoolAndYerbook = data;
     
        this.groupService.ListGroupPerSY = this.groupService.ListGroupsByListSchoolAndYerbook.filter(f => f.group.schoolId == this.SchoolId);
        debugger;
        this.ListGroup = this.groupService.ListGroupPerSY.filter(f => this.ListGroupWithCourseToStudent.findIndex(g => g.group.idgroup == f.group.idgroup) == -1)
      }, er => { })
    } else
      if (this.groupService.ListGroupPerSY == null || this.groupService.ListGroupPerSY.length == 0 || this.groupService.ListGroupPerSY[0].group == null || this.groupService.ListGroupPerSY[0].group.schoolId != this.SchoolId)
        this.groupService.ListGroupPerSY = this.groupService.ListGroupsByListSchoolAndYerbook.filter(f => f.group.schoolId == this.SchoolId);
    debugger;
    this.ListGroup = this.groupService.ListGroupPerSY.filter(f => f.group != null && this.ListGroupWithCourseToStudent.findIndex(g => g.group.idgroup == f.group.idgroup) == -1)
  }
  //עריכת שיוך קבוצה לתלמיד
  EditGroupToStudent(group: any) {
    this.studentService.GetStudentPerGroupById(group.studentPerGroupId).subscribe(data => {
      this.StudentPerGroup = data;
      this.DialogEditRangOfDate = true;
      this.hebrewCalanderService.getHebrew(new Date(data.fromDate)).subscribe((d) => {
        debugger;
        if (this.calendar.getMonths(d.hy).length == 13)
          var hm = this.hebrewCalanderService.dict2.find(f => f.label == d.hm);
        else
          var hm = this.hebrewCalanderService.dict1.find(f => f.label == d.hm);
        this.FromDateEdit = new NgbDate(d.hy, hm.value, d.hd);
      }, er => { })
      this.hebrewCalanderService.getHebrew(new Date(data.toDate)).subscribe((d) => {
        debugger;
        if (this.calendar.getMonths(d.hy).length == 13)
          var hm = this.hebrewCalanderService.dict2.find(f => f.label == d.hm);
        else
          var hm = this.hebrewCalanderService.dict1.find(f => f.label == d.hm);
        this.ToDateEdit = new NgbDate(d.hy, hm.value, d.hd);
      }, er => { })
      debugger;
    }, er => { })
  }
  SaveEditStudentInGroup() {

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
    if (new Date(f) < new Date(this.CurrentYearbookPerSchool.fromDate)) {
      this.hebrewCalanderService.getHebrew(new Date(this.CurrentYearbookPerSchool.fromDate)).subscribe((d) => {
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' תאריך התחלה קודם לתאריך פתיחת השנה ' + d.hebrew });
      }, er => { }); return;
    }
    if (new Date(t) > new Date(this.CurrentYearbookPerSchool.toDate)) {
      this.hebrewCalanderService.getHebrew(new Date(this.CurrentYearbookPerSchool.toDate)).subscribe((d) => {
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: ' תאריך הסיום מאוחר מתאריך סיום השנה ' + d.hebrew });
      }
        , er => { }); return;
    }


    this.DialogEditRangOfDate = false;
    this.groupService.EditStudentInGroup(this.StudentPerGroup, f, t, this.CurrentSchool.userId).subscribe(data => {
      debugger;
      if (data.id == 1) {
        this.messageService.add({ key: 'tc', severity: 'success', summary: 'העדכון הצליח', detail: data.name })
      }
      else
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: data.name });
    }, er => { })

  }
  //מחיקת שיוך קבוצה לתלמיד
  DeleteGroupToStudent(group: any) {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק תלמיד זה?',
      header: 'שים לב',
      icon: 'pi pi-info-circle',
      acceptLabel: "כן",
      rejectLabel: "לא",
      accept: () => {
        this.studentService.DeleteGroupToStudent(group.studentPerGroupId).subscribe(data => {
          debugger;
          if (data == null)
            this.messageService.add({ key: "tc", severity: 'warn', summary: 'המחיקה בוטלה', detail: 'לתלמיד זה קיים מטלות בקורסים המשוייכים לקבוצה זו' });
          else {
            if (data.idstudentPerGroup == null || data.idstudentPerGroup == 0)
              this.messageService.add({ key: "tc", severity: 'error', summary: 'המחיקה נכשלה', detail: 'ארעה תקלה ,אנא נסה שוב' });
            else {
              var i = this.ListGroupWithCourseToStudent.findIndex(f => f.studentPerGroupId == data.idstudentPerGroup);
              if (i != -1) {
                this.ListGroupWithCourseToStudent.splice(i, 1);
                this.messageService.add({ key: "tc", severity: 'success', summary: 'המחיקה הצליחה', detail: 'השיוך נמחק בהצלחה' });
              }
            }
          }
        }, er => {
          this.messageService.add({ key: "tc", severity: 'error', summary: 'המחיקה נכשלה', detail: 'ארעה תקלה ,אנא נסה שוב' });

        })
      },
      reject: () => {
      }
    });
  }
  //שמירת הוספת קבוצה לתלמיד
  SaveAddGroupPerStudent() {
    debugger;
    var FromDate = this.FromDate != null ? new NgbDate(this.FromDate.year, this.FromDate.month, this.FromDate.day) : null;
    FromDate = FromDate != null ? (this.calendar as NgbCalendarHebrew).toGregorian(FromDate) : null;
    var f = FromDate != null ? FromDate.year + '-' + FromDate.month + '-' + FromDate.day : null;

    debugger;
    var ToDate = this.ToDate != null ? new NgbDate(this.ToDate.year, this.ToDate.month, this.ToDate.day) : null;
    ToDate = ToDate != null ? (this.calendar as NgbCalendarHebrew).toGregorian(ToDate) : null;
    var t = ToDate != null ? ToDate.year + '-' + ToDate.month + '-' + ToDate.day : null;

    if (new Date(f) > new Date(t)) {
      this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'תאריך הסיום חייב להיות גדול מתאריך התחלה' }); return;
    }
    if (new Date(f + " 00:00:00") < new Date(this.CurrentYearbookPerSchool.fromDate)) {
      this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: "התאריך התחלה קודם לתאריך פתיחת שנה " + this.convertDateToStringService.formatDate(new Date(this.CurrentYearbookPerSchool.fromDate)) }); return;
    }
    if (new Date(t + " 00:00:00") > new Date(this.CurrentYearbookPerSchool.toDate)) {
      this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: "התאריך סיום מאוחר מתאריך סיום שנה " + this.convertDateToStringService.formatDate(new Date(this.CurrentYearbookPerSchool.toDate)) }); return;
    }

    // this.dailyScheduleService.currentDailySchedule.dateCreated = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // this.dailyScheduleService.currentDailySchedule.scheduleDate = new Date(Date.UTC(this.dailyScheduleService.currentDailySchedule.scheduleDate.getFullYear(), this.dailyScheduleService.currentDailySchedule.scheduleDate.getMonth(), this.dailyScheduleService.currentDailySchedule.scheduleDate.getDate()))

    this.openDialogRangOfDate = false;
    var GroupPerStudent = new StudentPerGroup();
    GroupPerStudent.studentId = this.StudentId;
    GroupPerStudent.groupId = this.selectedGroup.idgroupPerYearbook;
    let fd=new Date(f);
    GroupPerStudent.fromDate = new Date(Date.UTC(fd.getFullYear(),fd.getMonth(),fd.getDate()));
    let td=new Date(t);
    GroupPerStudent.toDate =new Date(Date.UTC(td.getFullYear(),td.getMonth(),td.getDate())) ;
    GroupPerStudent.userCreatedId = this.CurrentSchool.userId;
    let date=new Date();
    GroupPerStudent.dateCreated = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    this.studentService.AddGroupPerStudent(GroupPerStudent).subscribe(data => {
      if (data.item1 == false)
        this.messageService.add({ key: 'tc', severity: 'warn', summary: 'ההוספה בוטלה', detail: data.item2 });
      else {
        debugger;
        this.ListGroupWithCourseToStudent.push(data.item3);
        this.messageService.add({ key: 'tc', severity: 'success', summary: 'ההוספה הצליחה', detail: 'השיוך נוסף בהצלחה' });
        this.DialogTaskExsist = true;
        this.ListTaskExsist = data.item4;
      }
    }, er => {
      this.messageService.add({ key: 'tc', severity: 'error', summary: 'ההוספה נכשלה', detail: 'ארעה תקלה ,אנא נסה שוב' });

    });
  }
  //הוספת שיוך מטלות לתלמידה לאחר הוספת שיוך קבוצה לתלמידה
  AddTaskToStudent() {
    debugger;
    this.studentService.AddTaskToStudent(this.SelectTaskExsist, this.StudentId, this.CurrentSchool.userId).subscribe(data => {
      debugger;
      if (data == true)
        this.messageService.add({ key: 'tc', severity: 'success', summary: 'ההוספה הצליחה', detail: 'המטלות נוספו בהצלחה' });
      else
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'ההוספה נכשלה', detail: 'ארעה תקלה ,אנא נסה שוב' });
    }, er => {
      this.messageService.add({ key: 'tc', severity: 'error', summary: 'ההוספה נכשלה', detail: 'ארעה תקלה ,אנא נסה שוב' });

    })
    this.DialogTaskExsist = false;
  }
}
