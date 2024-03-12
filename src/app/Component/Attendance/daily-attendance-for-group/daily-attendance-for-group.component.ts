import { Component, OnInit, ViewChild, ViewEncapsulation , AfterViewInit, ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import {
  NgbCalendar,
  NgbCalendarHebrew,
  NgbDate,
  NgbDatepickerI18n,
  NgbDatepickerI18nHebrew,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { MessageService, SelectItem } from 'primeng/api';
import { ScheduleRegular } from 'src/app/Class/schedule-regular';
import { GroupService } from 'src/app/Service/group.service';
import { HebrewCalanderService } from 'src/app/Service/hebrew-calander.service';
import { RegularScheduleService } from 'src/app/Service/regular-schedule.service';
import { SchoolService } from 'src/app/Service/school.service';
import {PresenceTypeService}from 'src/app/Service/presence-type.service';
import {AttendanceMarkingService}from 'src/app/Service/attendance-marking.service';
import { AttendanceService } from 'src/app/Service/attendance.service';
import { Group } from 'src/app/Class/group';
import { PresenceService } from 'src/app/Service/presence.service';
import { DatePipe } from '@angular/common';
import { AttendencePerDay } from 'src/app/class/attendancePerDay';
import { Lesson } from 'src/app/class/lesson';
import { Presence } from 'src/app/class/presence';
import { TypePresence } from 'src/app/Class/type-presence'
import { AttendancePerLesson } from 'src/app/class/AttendancePerLesson';
@Component({
  selector: 'app-daily-attendance-for-group',
  templateUrl: './daily-attendance-for-group.component.html',
  styleUrls: ['./daily-attendance-for-group.component.css'],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew },
    { provide: DatePipe, useClass: DatePipe },
    { provide: MessageService, useClass: MessageService }
  ],
  encapsulation: ViewEncapsulation.None
})
export class DailyAttendanceForGroupComponent  implements OnInit {
  ListAttendencePerDay: AttendencePerDay[];
  currentSchool: any;
  schoolId: number;
  model: NgbDateStruct;
  selectedGroup: any;
  selectLesson: number;
  dict: SelectItem[];
  display: boolean = false
  displayPresence:boolean=false
  lLesson: Array<Lesson>
 // presenceList: Array<TypePresence>
  selectedPresence: Presence
  attendencePerDay:AttendencePerDay
  right="right"
  currDate: string
  edit:boolean=false
  dialogPosition:any
  @ViewChild('dialogButton', { read: ElementRef }) dialogButton: ElementRef;
  dialogTop: string;
  dialogLeft: string;
  constructor(
    public groupService: GroupService,
    public presenceTypeService:PresenceTypeService,
    public attendanceMarkingService:AttendanceMarkingService,
    public schoolService: SchoolService,
    // private attendanceService: AttendanceService,
    public presenceService: PresenceService,
    public calendar: NgbCalendar,
    public i18n: NgbDatepickerI18n,
    public hebrewCalanderService: HebrewCalanderService,
    public router: Router,
    public datePipe: DatePipe,
    public hebCalenderService: HebrewCalanderService
  ) {
    this.dayTemplateData = this.dayTemplateData.bind(this);
  }
 

  ngOnInit(): void {
    debugger;

    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    if (this.schoolService.ListSchool.length == 1) {
      this.schoolId = this.schoolService.ListSchool[0].school.idschool
      this.getGroups()
    }
    this.dict = [
      { value: 0, label: 'תפילה' },
      { value: 1, label: 'ראשון' },
      { value: 2, label: 'שני' },
      { value: 3, label: 'שלישי' },
      { value: 4, label: 'רביעי' },
      { value: 5, label: 'חמישי' },
      { value: 6, label: 'שישי' },
      { value: 7, label: 'שביעי' },
      { value: 8, label: 'שמיני' },
      { value: 9, label: 'תשיעי' },
      { value: 10, label: 'עשירי' },
      { value: 11, label: 'אחד עשר' },
      { value: 12, label: 'שנים עשר' },
      { value: 13, label: 'שלושה עשר' },
      { value: 14, label: 'ארבעה עשר' },
      { value: 15, label: 'חמישה עשר' },
      { value: 16, label: 'שישה עשר' },
      { value: 17, label: 'שבעה עשר' },
      { value: 18, label: 'שמונה עשר' },
      { value: 19, label: 'תשעה עשר' },
      { value: 20, label: 'עשרים' },
    ];
    // this.presenceList = new Array<TypePresence>()
    // this.presenceList.push(new TypePresence(1, 'נעדר'))
    // this.presenceList.push(new TypePresence(2, 'נוכח'))
    // this.presenceList.push(new TypePresence(3, 'איחר'))
    debugger
     this.attendanceMarkingService.GetAllPresence().subscribe(d=> { debugger 
      this.attendanceMarkingService.ListAttendanceMarking=d
      console.log("this.attendanceMarkingService.ListAttendanceMarking"+ this.attendanceMarkingService.ListAttendanceMarking);
      debugger
    },e=>{})

  debugger
    
  }

  changeSchool() {
    this.schoolId = this.currentSchool.school.idschool
    this.getGroups()
  }

  getGroups() {
    debugger
    if (this.groupService.ListGroupsByListSchoolAndYerbook != null && this.groupService.ListGroupsByListSchoolAndYerbook.length != 0) {



      var yearbook;
      this.schoolService.ListSchool.find(f => f.appYearbookPerSchools.find(f => {
        if (f.idyearbookPerSchool == this.groupService.ListGroupsByListSchoolAndYerbook[0].yearbookId) yearbook = f;
      }));
    }

    if (this.groupService.ListGroupsByListSchoolAndYerbook == null || this.groupService.ListGroupsByListSchoolAndYerbook.length == 0 || yearbook.yearbookId != this.schoolService.SelectYearbook.idyearbook) {
      this.groupService.GetGroupsByIdSchool(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        this.groupService.ListGroupsByListSchoolAndYerbook = data;
    
        this.groupService.ListGroupPerSY = this.groupService.ListGroupsByListSchoolAndYerbook.filter(f => f.group.schoolId == this.schoolId);
        debugger
        this.selectedGroup = this.groupService.ListGroupPerSY[0]
      },
        err => {
          console.log("error: " + err.message);
        })
    }
    else if (this.groupService.ListGroupPerSY == null || this.groupService.ListGroupPerSY.length == 0 || this.groupService.ListGroupPerSY[0].group == null || this.groupService.ListGroupPerSY[0].group.schoolId != this.schoolId) {
      this.groupService.ListGroupPerSY = this.groupService.ListGroupsByListSchoolAndYerbook.filter(f => f.group.schoolId == this.schoolId);
      debugger
      this.selectedGroup = this.groupService.ListGroupPerSY[0]
    }
  }

  dayTemplateData(date: NgbDate) {
    return {
      gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date),
    };
  }
  DisplayAttendance() {
    debugger;
  console.log(this.selectedGroup);
  this.displayPresence=false

    var a = new NgbDate(this.model.year, this.model.month, this.model.day);
    a = (this.calendar as NgbCalendarHebrew).toGregorian(a);
    var s = a.year + '-' + a.month + '-' + a.day;

    var date = new Date(s);

    this.hebCalenderService.getHebrew(date).subscribe(

      d => {
        debugger
        console.log(d);

        this.currDate = d.hebrew
      },
      e => console.log(e)

    )


    this.presenceService.GetNochectByDateIdgroup(date, this.selectedGroup.idgroupPerYearbook).subscribe(data => {
      debugger
      this.ListAttendencePerDay = data
      
      
      for(let i=0; i<this.ListAttendencePerDay.length;i++)
      {
          this.ListAttendencePerDay[i].index=i+1
          this.ListAttendencePerDay[i].nochecotPerLesson.sort((a,b)=>a.lesson.lessonNumber-b.lesson.lessonNumber)
      }
      
      if(this.ListAttendencePerDay[0].nochecotPerLesson[0])
      this.displayPresence=true
    }, er => { })
  
    this.display = true


    this.getLessonsByGroupAndDate(date, this.selectedGroup.idgroupPerYearbook)
    //     this.presenceService.GetLessonsByDate(new Date(s),this.selectedGroup.idgroupPerYearbook).subscribe(data => {
    // alert(data)
    //      }, er => { })

    //this.router.navigate(['Home/Presence']);
  }

  getLessonsByGroupAndDate(date: Date, idGroup: number) {
    debugger;
    this.presenceService.GetLessonsByDate(date, idGroup).subscribe(d => {
      this.lLesson = d
      this.lLesson.sort((a,b)=>a.lessonNumber-b.lessonNumber)
    },
      e => {
        console.log(e);

      })
  }
  nextDay() {

    this.displayPresence=false
    this.model.day += 1;
    this.DisplayAttendance()

    // var a = new NgbDate(this.model.year, this.model.month, this.model.day);
    // a = (this.calendar as NgbCalendarHebrew).toGregorian(a);
    // var s = a.year + '-' + a.month + '-' + a.day;

    // this.presenceService.GetNochectByDateIdgroup(new Date(s),this.selectedGroup.idgroupPerYearbook).subscribe(data => {
    //   this.presenceService.ListAttendencePerDay=data
    // }, er => { })
  }
  previousDay() {
    this.displayPresence=false
    this.model.day -= 1;
    this.DisplayAttendance()
    // var a = new NgbDate(this.model.year, this.model.month, this.model.day);
    // a = (this.calendar as NgbCalendarHebrew).toGregorian(a);
    // var s = a.year + '-' + a.month + '-' + a.day;

    // this.presenceService.GetNochectByDateIdgroup(new Date(s),this.selectedGroup.idgroupPerYearbook).subscribe(data => {
    //   this.presenceService.ListAttendencePerDay=data
    // }, er => { })
  }

  changePresence(idStudent: number, presence: Presence) {
    debugger
    var a = new NgbDate(this.model.year, this.model.month, this.model.day);
    a = (this.calendar as NgbCalendarHebrew).toGregorian(a);
    var s = a.year + '-' + a.month + '-' + a.day;
    var temp: Array<Presence> = new Array<Presence>()
    temp.push(presence)
    debugger
    this.presenceService.addOrUpdateAttendance(new Date(s), idStudent, temp).subscribe(
      d => { },
      e =>
        console.log(e)
    )
  }
  
  selectedTypePresenceId: string
  presence:Presence
  
  save() {
    debugger
    this.edit = false
    var a = new NgbDate(this.model.year, this.model.month, this.model.day);
    a = (this.calendar as NgbCalendarHebrew).toGregorian(a);
    var s = a.year + '-' + a.month + '-' + a.day;
    var temp: Array<Presence> = new Array<Presence>()
    //var newPresence: Presence = new Presence()
   // newPresence.dailyScheduleId = attPerLesson.lesson.scheduleId
    this.presence.dateUpdated = new Date(Date.now())
    var user=  this.schoolService.ListSchool.find(f => f.school.idschool == this.schoolId)?.userId;
   // newPresence.studentId = idStudent
   debugger
    this.presence.typePresenceId = parseInt(this.selectedTypePresenceId) 
    temp.push(this.presence)
    debugger
    this.presenceService.addOrUpdateAttendance(new Date(s), user, temp).subscribe(
      
      d => { 
        debugger
        this.ListAttendencePerDay.filter(lapd=>lapd.idStudent==this.attendencePerDay.idStudent)[0]
        .nochecotPerLesson.filter(npl=>npl.presence.idpresence==this.presence.idpresence)[0].presence.typePresenceName
        =this.attendanceMarkingService.ListAttendanceMarking.filter(pl=>pl.idattendanceMarkings==this.presence.typePresenceId)[0].markingName

        
      },
      e =>
        console.log(e)
    )
  }
 
  onRowEditInit(item:AttendancePerLesson,AttendencePerDay:AttendencePerDay){
    debugger
    this.edit = true;
    const buttonRect = this.dialogButton.nativeElement.getBoundingClientRect();
    //this.dialogPosition = 'right'//{ top: buttonRect.top + buttonRect.height + 'px',
  //  left: buttonRect.left + 'px'};
  this.dialogPosition = { my: 'center top', at: 'center bottom', of: buttonRect };
  //this.dialogTop = buttonRect.bottom + 'px';
  //this.dialogLeft = buttonRect.left + 'px';
    this.presence=item.presence
    this.attendencePerDay=AttendencePerDay
    this.selectedTypePresenceId=""+this.presence.typePresenceId

    document.body.style.overflow = 'hidden';

    
  }


  exportPdf() { }
  exportExcel() { }
  EditLesson(item: any) { }
  DeleteLesson(item: any) { }

}
