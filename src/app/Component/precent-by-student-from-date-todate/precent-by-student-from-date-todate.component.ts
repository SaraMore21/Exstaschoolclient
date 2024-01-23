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
import { StudentPerGroup } from 'src/app/Class/student-per-group';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-precent-by-student-from-date-todate',
  templateUrl: './precent-by-student-from-date-todate.component.html',
  styleUrls: ['./precent-by-student-from-date-todate.component.css'],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew },
    { provide: DatePipe, useClass: DatePipe },
    { provide: MessageService, useClass: MessageService }
  ],
})
export class PrecentByStudentFromDateTODAteComponent implements OnInit {
  selectedGroup: any;
  schoolId: number;
  ListStudentPerGroup: Array<StudentPerGroup>;
  studend:any;
  fromDate: NgbDate;
  toDate: NgbDate | null = null;
  hoveredDate: NgbDate | null = null;
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
    public hebCalenderService: HebrewCalanderService,
    private ngxService: NgxUiLoaderService,
    ) { 
      this.dayTemplateData = this.dayTemplateData.bind(this);
    }
    isHovered(date: NgbDate) {
      return (
        this.fromDate &&
        !this.toDate &&
        this.hoveredDate &&
        date.after(this.fromDate) &&
        date.before(this.hoveredDate)
      );
    }
  
    isInside(date: NgbDate) {
      return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
    }
  
    isRange(date: NgbDate) {
      return (
        date.equals(this.fromDate) ||
        (this.toDate && date.equals(this.toDate)) ||
        this.isInside(date) ||
        this.isHovered(date)
      );
    }
  
   
  
    dayTemplateData(date: NgbDate) {
      return {
        gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date),
      };
    }
  

  ngOnInit(): void {
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    if (this.schoolService.ListSchool.length == 1) {
      this.schoolId = this.schoolService.ListSchool[0].school.idschool
      this.getGroups()
    }
    

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
        this.selectedGroup = this.groupService.ListGroupPerSY[0]
        debugger
        
      },
        err => {
          console.log("error: " + err.message);
        })
    }
    else if (this.groupService.ListGroupPerSY == null || this.groupService.ListGroupPerSY.length == 0 || this.groupService.ListGroupPerSY[0].group == null || this.groupService.ListGroupPerSY[0].group.schoolId != this.schoolId) {
      this.groupService.ListGroupPerSY = this.groupService.ListGroupsByListSchoolAndYerbook.filter(f => f.group.schoolId == this.schoolId);
      this.selectedGroup = this.groupService.ListGroupPerSY[0]
    }
    
  }
  StudentPerGroup(groupId: number) {
     debugger
    this.groupService.GetStudentPerGroup(groupId, this.schoolService.SelectYearbook != null ? this.schoolService.SelectYearbook.idyearbook : null).subscribe(data => { this.ListStudentPerGroup = data; 
debugger;
       ; }, er => { });
  }

  onDateSelection(date: NgbDate) {
    debugger;

    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }
  // ok(){
  //   debugger
  //   this.ngxService.start();
  //   this.presenceService.GetNochectByDateIdgroup(date, this.selectedGroup.idgroupPerYearbook).subscribe(data => {
  //     debugger
  //     this.ListAttendencePerDay = data
  //   }, er => { })
      
//}
  onGroupChange(selectedGroup:any){
    debugger
    this.StudentPerGroup(selectedGroup.idgroupPerYearbook)

  }
}


