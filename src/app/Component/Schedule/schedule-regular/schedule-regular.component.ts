import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {
  NgbCalendar,
  NgbCalendarHebrew,
  NgbDate,
  NgbDatepickerI18n,
  NgbDatepickerI18nHebrew,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GroupSemesterPerCourse } from 'src/app/Class/group-semester-per-course';
import { ScheduleRegular } from 'src/app/Class/schedule-regular';
import { CourseService } from 'src/app/Service/course.service';
import { DailyScheduleService } from 'src/app/Service/daily-schedule.service';
import { GroupService } from 'src/app/Service/group.service';
import { HebrewCalanderService } from 'src/app/Service/hebrew-calander.service';
import { RegularScheduleService } from 'src/app/Service/regular-schedule.service';
import { SchoolService } from 'src/app/Service/school.service';
import { SelectItem } from 'primeng/api';
@Component({
  selector: 'app-schedule-regular',
  templateUrl: './schedule-regular.component.html',
  styleUrls: ['./schedule-regular.component.css'],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew },
    ConfirmationService,
    MessageService
  ],
  encapsulation: ViewEncapsulation.None
})

export class ScheduleRegularComponent implements OnInit {
  data: Array<SelectItem>
  ADate: SelectItem
  constructor(
    public groupService: GroupService,
    public regularScheduleService: RegularScheduleService,
    public schoolService: SchoolService,
    public calendar: NgbCalendar,
    public i18n: NgbDatepickerI18n,
    public hebrewCalanderService: HebrewCalanderService,
    public router: Router,
    private courseService: CourseService,
    private dailyScheduleService: DailyScheduleService,
    private messageService: MessageService
  ) {
    this.dayTemplateData = this.dayTemplateData.bind(this);
  }

  currentSchool: any
  choose: boolean = false
  model: NgbDateStruct;
  dateHebrew: string;
  a: NgbDate;

  listWeek: Array<Array<ScheduleRegular>> = new Array<Array<ScheduleRegular>>()

  length: number = 0
  listLength: Array<any> = new Array<any>()
  startDate: Date
  endDate: Date
  dayInWeek: number;
  displayDialog: boolean = false;
  ListCourses: Array<GroupSemesterPerCourse>;
  selectedCourse: GroupSemesterPerCourse;
  selectTeacher: string;
  SelectDate: Date;
  CurrentScheduleRegular: ScheduleRegular;
  //משתנה המייצג האם לחצו על הכפתור או לא
  IsClick: boolean = false;
  ngOnInit(): void {
    debugger;

    this.regularScheduleService.selectedGroup = undefined
    this.regularScheduleService.listRegularSchedulePerGroup = undefined
    this.listWeek = new Array<Array<ScheduleRegular>>()
    this.listLength = new Array<any>()

    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    if (this.schoolService.ListSchool.length == 1) {
      this.regularScheduleService.schoolId = this.schoolService.ListSchool[0].school.idschool
      this.getGroups()
    }
  }

  changeSchool() {
    this.regularScheduleService.schoolId = this.currentSchool.school.idschool
    this.getGroups()
  }

  getGroups() {
    if (this.groupService.ListGroupsByListSchoolAndYerbook != null && this.groupService.ListGroupsByListSchoolAndYerbook.length != 0) {
      var yearbook;
      this.schoolService.ListSchool.find(f => f.appYearbookPerSchools.find(f => {
        if (f.idyearbookPerSchool == this.groupService.ListGroupsByListSchoolAndYerbook[0].yearbookId) yearbook = f;
      }));
    }

    if (this.groupService.ListGroupsByListSchoolAndYerbook == null || this.groupService.ListGroupsByListSchoolAndYerbook.length == 0 || yearbook.yearbookId != this.schoolService.SelectYearbook.idyearbook) {
      this.groupService.GetGroupsByIdSchool(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        this.groupService.ListGroupsByListSchoolAndYerbook = data;
      
        this.groupService.ListGroupPerSY = this.groupService.ListGroupsByListSchoolAndYerbook.filter(f => f.group.schoolId == this.regularScheduleService.schoolId);
        this.regularScheduleService.selectedGroup = this.groupService.ListGroupPerSY[0]
      },
        err => {
          console.log("error: " + err.message);
        })
    }
    else if (this.groupService.ListGroupPerSY == null || this.groupService.ListGroupPerSY.length == 0 || this.groupService.ListGroupPerSY[0].group == null || this.groupService.ListGroupPerSY[0].group.schoolId != this.regularScheduleService.schoolId) {
      this.groupService.ListGroupPerSY = this.groupService.ListGroupsByListSchoolAndYerbook.filter(f => f.group.schoolId == this.regularScheduleService.schoolId);
      this.regularScheduleService.selectedGroup = this.groupService.ListGroupPerSY[0]
    }
  }

  dayTemplateData(date: NgbDate) {
    return {
      gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date),
    };
  }
  compareArrays(array1: any[], array2: any[]): number {
    // לדוגמה, נמיין לפי ה-property1 של האובייקט הראשון במערך
    return array1[0].dayOfWeek - array2[0].dayOfWeek;}
  open() {
    if (this.model != undefined) {
      this.a = new NgbDate(this.model.year, this.model.month, this.model.day);
      this.a = (this.calendar as NgbCalendarHebrew).toGregorian(this.a);
      var s = this.a.year + '-' + this.a.month + '-' + this.a.day;
      this.regularScheduleService.date = new Date(s);
    }
    this.IsClick = true;
    this.hebrewCalanderService.getHebrew(this.regularScheduleService.date).subscribe(
      (d) => {
        this.dateHebrew = d.hebrew;

        this.regularScheduleService.GetRegularSchedulePerGroup().subscribe(
          data => {
            debugger
            this.regularScheduleService.listRegularSchedulePerGroup = data;
            this.regularScheduleService.listRegularSchedulePerGroup.sort(this.compareArrays)
            console.log(data);
            this.listWeek = new Array<Array<ScheduleRegular>>();
            this.listLength = new Array<any>();
            console.log(this.regularScheduleService.listRegularSchedulePerGroup);
            debugger
            let list: Array<ScheduleRegular> = new Array<ScheduleRegular>()
            let num = 1
            debugger
            this.regularScheduleService.listRegularSchedulePerGroup.forEach(day => {
              debugger
              console.log(day[0]);

              while (day[0].dayOfWeek > num) {
                this.listWeek.push(new Array<ScheduleRegular>())
                num++
                console.log(num);
              }
              list = this.getListFullWithSpaces(day)
              this.listWeek.push(list)
              if (list.length > this.length) {
                this.length = list.length
              }
              num++
            });
            while (num < 7) {
              this.listWeek.push(new Array<ScheduleRegular>())
              num++
            }

            let day = this.regularScheduleService.date.getDay()
            let index = 0;
            debugger
            // for (; index < this.listWeek[day].length && this.listWeek[day][index] == null; index++);
            // this.startDate = this.listWeek[day][index].startDate
            // this.endDate = this.listWeek[day][index].endDate
            // this.dayInWeek = this.listWeek[day][index].dayOfWeek;
            for (let i = 0; i < this.length; i++) {
              this.listLength.push({ index: i, current: true })
            }
            // for (let j = this.dayInWeek - 1; j <= 1; j--)
            //   if (this.listWeek[j].find(f => f != null && this.listWeek))

            console.log(this.listWeek);

            this.listWeek
            this.listLength
            debugger
            this.choose = true
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

  getListFullWithSpaces(list: Array<ScheduleRegular>) {
    debugger;
    let i =0
    let arr: Array<ScheduleRegular> = new Array<ScheduleRegular>()
    while(list[0].numLesson>i){
    arr.push(null)
  i++}
    arr.push(list[0])
    let dsP, dsC,def;
    for (let i = 1; i < list.length; i++) {

      dsP = list[i - 1].endTime.split(":");
      dsC = list[i].startTime.split(":");

      let previous = Number(dsP[0] * 60) + Number(dsP[1]);
      console.log("previous:" + previous);

      let current = Number(dsC[0] * 60) + Number(dsC[1]);
      console.log("current:" + current);
      
      if (current - previous >= 45) {
        def= Math.trunc((current - previous)/45)
        console.log("def" + def);
      
        while(def>0){
          arr.push(null)
          def--
        }

      }
      arr.push(list[i])
    }
    return arr;
  }

  //חזרה לבחירת כיתה
  goBack() {
    this.choose = false;
    this.IsClick = false;
  }
  //עריכת מערכת קבועה
  EditScheduleRegular(ScheduleRegular: ScheduleRegular) {
    debugger;
    this.CurrentScheduleRegular = ScheduleRegular;
    this.GetCoursesForGroup(this.regularScheduleService.selectedGroup.idgroupPerYearbook);
    this.displayDialog = true;
  }
  //GroupId שליפת הקורסים לקבוצה לפי  
  GetCoursesForGroup(GroupId: number) {
    this.CalculateCurrentDate();
    this.courseService.GetCoursesForGroup(GroupId, this.SelectDate.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })).subscribe(data => {
      this.ListCourses = data;
      this.selectedCourse = this.ListCourses.find(f => f.idgroupSemesterPerCourse == this.CurrentScheduleRegular.courseId);
      this.selectTeacher = this.CurrentScheduleRegular.teacherName;
    }, er => { })
  }
  // עריכת מערכת קבועה-שליחה לסרבר
  SaveScheduleRegular() {
    debugger;
    this.CurrentScheduleRegular.courseId = this.selectedCourse.idgroupSemesterPerCourse;
    this.regularScheduleService.UpdateScheduleRegularByWebsite(this.CurrentScheduleRegular, this.currentSchool.userId, this.SelectDate.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })).subscribe(data => {
      debugger;
      if (data == null)
        this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'ארעה תקלה, אנא נסה שנית' });
      else {
        let i = this.listWeek[data.dayOfWeek - 1].findIndex(f => f.idscheduleRegular == data.idscheduleRegular)
        if (i != -1) this.listWeek[data.dayOfWeek - 1][i] = data;
        this.messageService.add({ key: "tc", severity: 'success', summary: 'העידכון הצליח', detail: 'המערכת עודכנה בהצלחה' });
      }
      this.displayDialog = false;
    }, er => {
      this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'ארעה תקלה, אנא נסה שנית' });
    });
  }
  //שליפת מורה לקורס
  GetTeacherBySelectCourse() {
    debugger;
    this.CalculateCurrentDate();
    this.courseService.GetUserPerCourse(this.selectedCourse.idgroupSemesterPerCourse, this.SelectDate.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })).subscribe(data => {
      this.selectTeacher = data != null ? (data.lastName + " " + data.firstName) : " ";
    }, er => {
      console.log(er);
    });
  }
  //חישוב התאריך הנבחר
  CalculateCurrentDate() {
    let d1 = this.regularScheduleService.date.getDay() + 1;
    let d2 = this.CurrentScheduleRegular.dayOfWeek;
    this.SelectDate = new Date(this.regularScheduleService.date);
    this.SelectDate.setDate(this.regularScheduleService.date.getDate() + ((d1 - d2) * -1));
  }
  // exportExcel() {
  //   debugger;
  //  //var fileName=this.data.find(f=>f.value==this.ADate).label;

  //   import("xlsx").then(xlsx => {
  //     const worksheet = xlsx.utils.json_to_sheet(this.studentService.ListStudent);
  //     const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  //     const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
  //     this.saveAsExcelFile(excelBuffer, "Students");
  //   });
  // }
  // saveAsExcelFile(buffer: any, fileName: string): void {
  //   console.log(
  //          this.data

  //   );
  //   //fileName=this.data.find(f=>f.value==this.ADate).label;
  //   import("file-saver").then(FileSaver => {
  //     let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  //     let EXCEL_EXTENSION = '.xlsx';
  //     const data: Blob = new Blob([buffer], {
  //       type: EXCEL_TYPE
  //     });
  //     FileSaver.saveAs(data, fileName );
  //   });
  // }
}
