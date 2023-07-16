import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DailyScheduleService } from 'src/app/Service/daily-schedule.service';
import { GroupService } from 'src/app/Service/group.service';
import { SchoolService } from 'src/app/Service/school.service';
import {
  NgbCalendar,
  NgbCalendarHebrew, NgbDate,
  NgbDatepickerI18n,
  NgbDatepickerI18nHebrew,
  NgbDateStruct,
  NgbPaginationNumber
} from '@ng-bootstrap/ng-bootstrap';
import { HebrewCalanderService } from 'src/app/Service/hebrew-calander.service';
import { Router } from '@angular/router';
import { DailySchedule } from 'src/app/Class/daily-schedule';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectItem } from 'primeng/api';
@Component({
  selector: 'app-daily-schedule',
  templateUrl: './daily-schedule.component.html',
  styleUrls: ['./daily-schedule.component.css'],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew },
    ConfirmationService,
    MessageService
  ],
  encapsulation: ViewEncapsulation.None
})
export class DailyScheduleComponent implements OnInit {
  data: Array<SelectItem>
  ADate: SelectItem
  currentSchool: any
  openSchedule: boolean = false
  model: NgbDateStruct;
  dateHebrew: string;
  a: NgbDate;
  list: Array<DailySchedule>
  edit: boolean = false;

  constructor(
    public dailyScheduleService: DailyScheduleService,
    public groupService: GroupService,
    public schoolService: SchoolService,
    public calendar: NgbCalendar,
    public i18n: NgbDatepickerI18n,
    public hebrewCalanderService: HebrewCalanderService,
    public router: Router,
    private modalService: NgbModal,
    private messageService: MessageService,
    private confirmationService: ConfirmationService) {
    this.dayTemplateData = this.dayTemplateData.bind(this);
  }

  ngOnInit(): void {
    debugger;
    this.dailyScheduleService.selectedGroup = undefined

    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    if (this.schoolService.ListSchool.length == 1) {
      debugger
      this.dailyScheduleService.schoolId = this.schoolService.ListSchool[0].school.idschool;
      this.currentSchool = this.schoolService.ListSchool[0];
      this.getGroups();
    }
    else
      this.dailyScheduleService.schoolId = null;
  }
  //פונקצייה הקורה בעת שינוי מוסד
  changeSchool() {
    this.dailyScheduleService.schoolId = this.currentSchool.school.idschool;
    if (this.dailyScheduleService.currentDailySchedule == null) this.dailyScheduleService.currentDailySchedule = new DailySchedule();
    this.dailyScheduleService.currentDailySchedule.schoolId = this.currentSchool.school.idschool;
    this.getGroups()
  }

  getGroups() {
    debugger;
    if (this.groupService.ListGroupsByListSchoolAndYerbook != null && this.groupService.ListGroupsByListSchoolAndYerbook.length != 0) {
      var yearbook;
      this.schoolService.ListSchool.find(f => f.appYearbookPerSchools.find(f => {
        if (f.idyearbookPerSchool == this.groupService.ListGroupsByListSchoolAndYerbook[0].yearbookId)
          yearbook = f;
      }));
    }

    if (this.groupService.ListGroupsByListSchoolAndYerbook == null || this.groupService.ListGroupsByListSchoolAndYerbook.length == 0 || yearbook.yearbookId != this.schoolService.SelectYearbook.idyearbook) {
      this.groupService.GetGroupsByIdSchool(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        this.groupService.ListGroupsByListSchoolAndYerbook = data;
      
        this.groupService.ListGroupPerSY = this.groupService.ListGroupsByListSchoolAndYerbook.filter(f => f.group.schoolId == this.dailyScheduleService.schoolId);
        this.dailyScheduleService.selectedGroup = this.groupService.ListGroupPerSY[0]
      },
        err => {
          console.log("error: " + err.message);
        })
    }
    else if (this.groupService.ListGroupPerSY == null || this.groupService.ListGroupPerSY.length == 0 || this.groupService.ListGroupPerSY[0].group == null || this.groupService.ListGroupPerSY[0].group.schoolId != this.dailyScheduleService.schoolId) {
      this.groupService.ListGroupPerSY = this.groupService.ListGroupsByListSchoolAndYerbook.filter(f => f.group.schoolId == this.dailyScheduleService.schoolId);
      this.dailyScheduleService.selectedGroup = this.groupService.ListGroupPerSY[0]
    }
  }

  dayTemplateData(date: NgbDate) {
    return {
      gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date),
    };
  }

  open() {
    debugger;
    this.openSchedule = true
    if (this.model != undefined) {
      this.a = new NgbDate(this.model.year, this.model.month, this.model.day);
      this.a = (this.calendar as NgbCalendarHebrew).toGregorian(this.a);
      var s = this.a.year + '-' + this.a.month + '-' + this.a.day;
      this.dailyScheduleService.date = new Date(s);
    }

    this.hebrewCalanderService.getHebrew(this.dailyScheduleService.date).subscribe(
      (d) => {
        this.dateHebrew = d.hebrew;
        console.log(this.dailyScheduleService.selectedGroup.idgroupPerYearbook)

        this.dailyScheduleService.GetDailySchedulePerGroup().subscribe(
          data => {
            debugger
            this.dailyScheduleService.listDailySchedule = data;
            this.list = this.getListFullWithSpaces()
            this.openSchedule = true
          },
          err => {
            console.log("error: " + err.message);
          }
        )
      },
      (err) => {
        console.log("error: " + err.message);
      }
    );
  }
  //list-הכנסת המערכת היומית ל
  getListFullWithSpaces() {
    debugger;
    let arr: Array<DailySchedule> = new Array<DailySchedule>()
    let num = 0
let dsP,dsC;
    arr.push(this.dailyScheduleService.listDailySchedule[0])
    for (let i = 1; i < this.dailyScheduleService.listDailySchedule.length; i++) {
      debugger;
      dsP=this.dailyScheduleService.listDailySchedule[i-1].endTime.split(":");
      // let previous = this.dailyScheduleService.listDailySchedule[i - 1].endTime.hours * 60 + this.dailyScheduleService.listDailySchedule[i - 1].endTime.minutes 
      let previous = dsP[0] * 60 + dsP[1];
      dsC=this.dailyScheduleService.listDailySchedule[i].startTime.split(":");
      // let current = this.dailyScheduleService.listDailySchedule[i].startTime.hours * 60 + this.dailyScheduleService.listDailySchedule[i].startTime.minutes
      let current =dsC[0] * 60 + dsC[1];
      if (current - previous >= 30) {
        arr.push(null)
      }
      arr.push(this.dailyScheduleService.listDailySchedule[i])
    }
    return arr;
  }
  //עריכת מערכת יומית
  editDailySchedule(dailySchedule: DailySchedule) {
    debugger;
    this.dailyScheduleService.currentDailySchedule = dailySchedule
    this.edit = true
  }
  //חזרה לבחירת כיתה
  goBack() {
    this.openSchedule = false
  }
  //הוספת מערכת יומית
  AddDailyShcedule() {
    this.dailyScheduleService.currentDailySchedule = new DailySchedule();
    this.dailyScheduleService.currentDailySchedule.scheduleDate = this.dailyScheduleService.date;
    this.dailyScheduleService.currentDailySchedule.schoolId = this.dailyScheduleService.schoolId
    this.edit = true;
  }
  //list -עדכון הליסט בשם
  UpdateList($event) {
    debugger;
    if ($event == true) {
      //עדכון
      if (this.dailyScheduleService.currentDailySchedule.iddailySchedule != null && this.dailyScheduleService.currentDailySchedule.iddailySchedule != 0) {
        let i = this.list.findIndex(f => f != null && f.iddailySchedule == this.dailyScheduleService.currentDailySchedule.iddailySchedule);
        if (i != -1) {
          this.list[i] = { ...this.dailyScheduleService.currentDailySchedule };
          this.messageService.add({ severity: "success", summary: "העדכון הצליח", detail: " שיעור זה עודכן בהצלחה" });
          this.edit = false;
        }
      }
      //הוספה
      else {
        let DS = this.dailyScheduleService.listDailySchedule[this.dailyScheduleService.listDailySchedule.length - 1];
        this.list = this.getListFullWithSpaces();

        // let flag = false;
        // for (let i = 0; i < this.list.length; i++)
        //   if (i + 1 == DS.numLesson) {
        //     this.list[i] = { ...DS };
        //     flag = true
        //     break;
        //   }
        // if (flag == false)
        //   this.list = this.getListFullWithSpaces();
        this.messageService.add({ severity: "success", summary: "ההוספה הצליחה", detail: " שיעור זה נוסף בהצלחה" });
        this.edit = false;
        this.dailyScheduleService.listDailySchedule.sort((a, b) => a.numLesson - b.numLesson);
      }
    }
  }
  //מחיקת מערכת יומית
  DeleteDailySchedule(IddailySchedule: number) {
    debugger;
    this.confirmationService.confirm({
      message: 'האם הנך בטוח כי ברצונך למחוק שיעור זה מהמערכת היומית?',
      header: 'שים לב',
      icon: 'pi pi-info-circle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.dailyScheduleService.DeleteDailySchedule(IddailySchedule).subscribe(data => {
          if (data == true) {
            let i = this.dailyScheduleService.listDailySchedule.findIndex(f => f.iddailySchedule == IddailySchedule);
            if (i != -1) this.dailyScheduleService.listDailySchedule.splice(i, 1);
            // let j = this.list.findIndex(f =>f!=null&& f.iddailySchedule == IddailySchedule);
            // if (j != -1) this.list.splice(j, 1);
            this.list = this.getListFullWithSpaces();
            this.messageService.add({ severity: "success", summary: "המחיקה הצליחה", detail: " שיעור זה נמחק בהצלחה" });

          }
          else if(data==false)
          this.messageService.add({ severity: "error", summary: "המחיקה בוטלה", detail: "המחיקה בוטלה מאחר וישנם נתוני נוכחות המשוייכים לשיעור זה" });

        }, er => { 
          this.messageService.add({ severity: "error", summary: "המחיקה נכשלה", detail: "ארעה תקלה בעת המחיקה ,אנא  נסה שנית בעוד מס' דקות" });
        })
      },
      reject: (type) => {

      }

    });

  }
  exportExcel() {
    debugger;
   //var fileName=this.data.find(f=>f.value==this.ADate).label;

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.schoolService.ListSchool);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Students");
    });
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

