import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  NgbCalendar,
  NgbCalendarHebrew,
  NgbDate,
  NgbDatepickerI18n,
  NgbDatepickerI18nHebrew,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { MessageService, SelectItem } from 'primeng/api';
import * as moment from 'moment';
import { ScheduleRegular } from 'src/app/Class/schedule-regular';
import { GroupService } from 'src/app/Service/group.service';
import { HebrewCalanderService } from 'src/app/Service/hebrew-calander.service';
import { RegularScheduleService } from 'src/app/Service/regular-schedule.service';
import { SchoolService } from 'src/app/Service/school.service';
import { PresenceTypeService } from 'src/app/Service/presence-type.service';
import { AttendanceMarkingService } from 'src/app/Service/attendance-marking.service';
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
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FontService } from 'src/app/Service/font.service';


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
  fromHeb: string;
  toHeb: string;
  isEditPresence: boolean;
  filteredAttendence: AttendencePerDay[] = [];
  ListAttendencePerDay: AttendencePerDay[];
  data: Array<SelectItem>;
  ListAttendencePerDayByStudent: AttendencePerDay[];
  display: boolean;
  selectedGroup: any;
  schoolId: number;
  showOneGroup: boolean = false
  //DontshowAllGroups:boolean=true
  ListStudentPerGroup: Array<StudentPerGroup>;
  studend: Array<StudentPerGroup>;
  fromDate: NgbDate;
  toDate: NgbDate | null = null;
  hoveredDate: NgbDate | null = null;
  DesabledEdit: boolean = false;
  presence: Presence;
  tempPres: AttendancePerLesson;
  attendencePerDay: AttendencePerDay;
  selectedTypePresenceId: string
  edit: boolean = false
  dialogPosition: any
  @ViewChild('dialogButton', { read: ElementRef }) dialogButton: ElementRef;
  dialogTop: string;
  dialogLeft: string;
  obj: {
    s: StudentPerGroup,
    a: AttendencePerDay[]

  }[] = []
  constructor(
    public groupService: GroupService,
    public presenceTypeService: PresenceTypeService,
    public attendanceMarkingService: AttendanceMarkingService,
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
    public FontService: FontService,
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
    debugger
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
      this.attendanceMarkingService.GetAllPresence().subscribe(d => {
        debugger
        this.attendanceMarkingService.ListAttendanceMarking = d
        console.log("this.attendanceMarkingService.ListAttendanceMarking" + this.attendanceMarkingService.ListAttendanceMarking);
        debugger
      }, e => { })

    }
    this.display = false

  }
  EditPresence(pres: AttendancePerLesson, AttendencePerDay: AttendencePerDay) {
    debugger
    this.tempPres = pres;
    this.isEditPresence = true;

    //   const buttonRect = this.dialogButton.nativeElement.getBoundingClientRect();
    ////this.dialogPosition = 'right'//{ top: buttonRect.top + buttonRect.height + 'px',
    // //  left: buttonRect.left + 'px'};
    // this.dialogPosition = { my: 'center top', at: 'center bottom', of: buttonRect };
    //this.dialogTop = buttonRect.bottom + 'px';
    //this.dialogLeft = buttonRect.left + 'px';
    this.presence = pres.presence
    this.attendencePerDay = AttendencePerDay
    this.selectedTypePresenceId = "" + this.presence.typePresenceId

    document.body.style.overflow = 'hidden';


  }

  save() {
    debugger
    this.isEditPresence = false
    // var a = this.tempPres.lesson.date;
    // a = (this.calendar as NgbCalendarHebrew).toGregorian(a);
    // var s = a.year + '-' + a.month + '-' + a.day;
    var temp: Array<Presence> = new Array<Presence>()
    //var newPresence: Presence = new Presence()
    // newPresence.dailyScheduleId = attPerLesson.lesson.scheduleId
    this.presence.dateUpdated = new Date(Date.now())
    var user = this.schoolService.ListSchool.find(f => f.school.idschool == this.schoolId)?.userId;
    // newPresence.studentId = idStudent
    debugger
    this.presence.typePresenceId = parseInt(this.selectedTypePresenceId)
    temp.push(this.presence)
    debugger
    this.presenceService.addOrUpdateAttendance(new Date(this.tempPres.lesson.date), user, temp).subscribe(

      d => {
        debugger

        this.obj.find(o => o.s.studentId == this.tempPres.presence.studentId).a.find(npl => npl.date == this.tempPres.lesson.date).nochecotPerLesson
          .find(n => n.presence.idpresence == this.tempPres.presence.idpresence).presence.typePresenceName = this.attendanceMarkingService.ListAttendanceMarking
            .find(pl => pl.idattendanceMarkings == this.presence.typePresenceId).markingName

      },
      e =>
        console.log(e)
    )
  }
  puttInSelectObject() {
    this.data = new Array<any>();
    debugger;
    //לשנות ל
    for (let index = 0; index < this.ListStudentPerGroup.length; index++) {
      //for (let index = 0; index < 3; index++) {
      const element = this.ListStudentPerGroup[index];
      this.data.push({
        label: element.student.lastName + ' ' + element.student.firstName,
        value: element.studentId,
      });
    }
    console.log(this.data);
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
        // this.selectedGroup = this.groupService.ListGroupPerSY[0]
        debugger
        console.log("this.groupService.ListGroupPerSY:", this.groupService.ListGroupPerSY)
      },
        err => {
          console.log("error: " + err.message);
        })
    }
    else if (this.groupService.ListGroupPerSY == null || this.groupService.ListGroupPerSY.length == 0 || this.groupService.ListGroupPerSY[0].group == null || this.groupService.ListGroupPerSY[0].group.schoolId != this.schoolId) {
      this.groupService.ListGroupPerSY = this.groupService.ListGroupsByListSchoolAndYerbook.filter(f => f.group.schoolId == this.schoolId);
      // this.selectedGroup = this.groupService.ListGroupPerSY[0]
    }

  }
  StudentPerGroup(groupId: number) {
    debugger
    this.groupService.GetStudentPerGroup(groupId, this.schoolService.SelectYearbook != null ? this.schoolService.SelectYearbook.idyearbook : null).subscribe(data => {
      this.ListStudentPerGroup = data;
      this.puttInSelectObject()
      debugger;
      ;
    }, er => { });
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
  ok() {
    if (this.showOneGroup) {
      debugger
      // this.ngxService.start();
      const fd = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
      const td = new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
      let fa = (this.calendar as NgbCalendarHebrew).toGregorian(this.fromDate);
      let ta = (this.calendar as NgbCalendarHebrew).toGregorian(this.toDate);

      var f = fa.year + '-' + fa.month + '-' + fa.day;
      var newDatef = new Date(f);
      // this.idStudent = (this.ADate as unknown) as number;
      debugger
      this.hebrewCalanderService.getHebrew(newDatef).subscribe(
        (d) => {
          this.fromHeb = d.hebrew;
        },
        (err) => {
          alert(err);
          setTimeout(() => {
            // this.ngxService.stop(); // stop foreground spinner of the master loader with 'default' taskId
          }, 0);
        }
      );
      // this.fromHeb=this.HebrewChalanderService.getHebrew(new Date(this.fromHebreDate.year,this.fromHebreDate.month,this.fromHebreDate.day))
      var t = ta.year + '-' + ta.month + '-' + ta.day;
      var newDate = new Date(t);
      this.hebrewCalanderService.getHebrew(newDate).subscribe(
        (d) => {
          debugger
          this.toHeb = d.hebrew;
        },
        (er) => {
          alert(er);
          setTimeout(() => {
            this.ngxService.stop(); // stop foreground spinner of the master loader with 'default' taskId
          }, 0);
        })


      this.presenceService.GetPresenceByRangeDateAndGroup(newDatef, newDate, this.selectedGroup.idgroupPerYearbook).subscribe(data => {
        debugger
        this.ListAttendencePerDay = data

        if (this.ListAttendencePerDay != undefined) {
          const observablesArray = this.studend.map(s => {
            const a = this.ListAttendencePerDay.filter(item => item.idStudent == s.studentId);
            a.forEach(b => {
              this.filteredAttendence.push(b);
            });
            return forkJoin(
              a.map(n => this.hebrewCalanderService.getHebrew(n.date))
            ).pipe(
              map(hebrewDates => {
                a.forEach((n, index) => {
                  n.hebrewDate = hebrewDates[index].hebrew;
                });
                return { s: s, a: a };
              })
            );
          });

          forkJoin(observablesArray).subscribe(result => {
            this.obj = result;
            this.display = true;
          });
        }



        // this.filteredAttendence = this.ListAttendencePerDay.filter(item => item.idStudent == s.studentId);

        // this.filteredAttendence.push(this.ListAttendencePerDay.filter(item => item.idStudent == s.studentId));
        console.log("studend:" + this.studend)
        console.log("filteredAttendence:" + this.filteredAttendence)
      });
      // debugger
      // this.display = true;
    }
    else {

      debugger
      // this.ngxService.start();
      const fd = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
      const td = new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
      let fa = (this.calendar as NgbCalendarHebrew).toGregorian(this.fromDate);
      let ta = (this.calendar as NgbCalendarHebrew).toGregorian(this.toDate);

      var f = fa.year + '-' + fa.month + '-' + fa.day;
      var newDatef = new Date(f);
      // this.idStudent = (this.ADate as unknown) as number;
      debugger
      this.hebrewCalanderService.getHebrew(newDatef).subscribe(
        (d) => {
          this.fromHeb = d.hebrew;
        },
        (err) => {
          alert(err);
          setTimeout(() => {
            // this.ngxService.stop(); // stop foreground spinner of the master loader with 'default' taskId
          }, 0);
        }
      );
      // this.fromHeb=this.HebrewChalanderService.getHebrew(new Date(this.fromHebreDate.year,this.fromHebreDate.month,this.fromHebreDate.day))
      var t = ta.year + '-' + ta.month + '-' + ta.day;
      var newDate = new Date(t);
      this.hebrewCalanderService.getHebrew(newDate).subscribe(
        (d) => {
          debugger
          this.toHeb = d.hebrew;
        },
        (er) => {
          alert(er);
          setTimeout(() => {
            this.ngxService.stop(); // stop foreground spinner of the master loader with 'default' taskId
          }, 0);
        })


      this.presenceService.GetPresenceByRangeDateToAllGroupBySchool(newDatef, newDate, this.schoolId).subscribe(data => {
        debugger
        this.ListAttendencePerDay = data

        if (this.ListAttendencePerDay != undefined) {
          const observablesArray = this.studend.map(s => {
            const a = this.ListAttendencePerDay.filter(item => item.idStudent == s.studentId);
            a.forEach(b => {
              this.filteredAttendence.push(b);
            });
            return forkJoin(
              a.map(n => this.hebrewCalanderService.getHebrew(n.date))
            ).pipe(
              map(hebrewDates => {
                a.forEach((n, index) => {
                  n.hebrewDate = hebrewDates[index].hebrew;
                });
                return { s: s, a: a };
              })
            );
          });

          forkJoin(observablesArray).subscribe(result => {
            this.obj = result;
            this.display = true;
          });
        }



        // this.filteredAttendence = this.ListAttendencePerDay.filter(item => item.idStudent == s.studentId);

        // this.filteredAttendence.push(this.ListAttendencePerDay.filter(item => item.idStudent == s.studentId));
        console.log("studend:" + this.studend)
        console.log("filteredAttendence:" + this.filteredAttendence)
      });
      // debugger
      // this.display = true;

    }
  }
  sortByHebrewDate(list: any[]) {
    debugger
    return list.sort((a, b) => {
      const dateA = moment(a.hebrewDate, 'YYYY/MM/DD');
      console.log(dateA)
      const dateB = moment(b.hebrewDate, 'YYYY/MM/DD');
      console.log(dateB)
      return dateA.isBefore(dateB) ? -1 : 1;
    });
  }

  // ExportPdf(NochechotPerDay: nByGroup) {
  //   if (NochechotPerDay.nameStudent == null) alert('לא קיימת נוכחות');
  //   else {
  //     debugger;
  //     var prepare = [];
  //     var tempObj = [];
  //     NochechotPerDay.lNochechotPerDay.forEach((NPD) => {
  //       tempObj.push(NPD.hebrewDate.split('').reverse().join('') + '  ');
  //       NPD.NochecotPerLesson.forEach((NPL) => {
  //         tempObj.push(
  //           NPL.name.split('').reverse().join('') +
  //           '\n' +
  //           '  ' +
  //           NPL.siman.Name.split('').reverse().join('') +
  //           '     '
  //         );
  //       });
  //       tempObj.reverse();
  //       prepare.push(tempObj);
  //       tempObj = new Array();
  //     });

  //     const doc = new jsPDF({
  //       unit: 'pt',
  //     });
  //     doc.addFileToVFS('Arimo-Regular.ttf', this.FontService.myFont);

  //     doc.addFont('Arimo-Regular.ttf', 'Arimo', 'normal');
  //     doc.setFont('Arimo', 'normal');
  //     doc.setFontSize(13);
  //     doc.setLineWidth(20);
  //     var title =
  //       this.toHeb.split('').reverse().join('') +
  //       ' ' +
  //       '-'.split('').reverse().join('') +
  //       ' ' +
  //       this.fromHeb.split('').reverse().join('') +
  //       ' ' +
  //       'בתאריכים'.split('').reverse().join('') +
  //       ' ' +
  //       // this.NameGroup.split('').reverse().join('') +
  //       // ' ' +
  //       // 'מכיתה'.split('').reverse().join('') +
  //       // ' ' +
  //       NochechotPerDay.nameGroup.split('').reverse().join('') +
  //       ' מכיתה '.split('').reverse().join('') +
  //       NochechotPerDay.nameStudent.split('').reverse().join('') +
  //       ' ' +
  //       ' נוכחות עבור'.split('').reverse().join('');
  //     doc.text(title, 30, 30);
  //     //  pdf['autoTable']({
  //     //  @ts-ignore

  //     doc.autoTable({
  //       head: [
  //         [
  //           'תאריך:'.split('').reverse().join(''),
  //           '0',
  //           '1',
  //           '2',
  //           '3',
  //           '4',
  //           '5',
  //           '6',
  //           '7',
  //           '8',
  //           '9',
  //           '10',
  //           '11',
  //           '12',
  //           '13',
  //           '14',
  //         ].reverse(),
  //       ],
  //       body: prepare,
  //       styles: {
  //         font: 'Arimo',
  //         dir: 'right',
  //         align: 'right',
  //         textalign: 'center',
  //         fontSize: 6,
  //         //  dir:'rtl',
  //         margins: {
  //           top: 80,
  //           bottom: 60,
  //           left: 85,
  //           width: 522,
  //         },
  //       },
  //     });
  //     doc.getStyle('aa');
  //     var date = new Date();
  //     doc.save(
  //       'דוח בין טווח תאריכים ' +
  //       NochechotPerDay.nameStudent +
  //       ' - ' +
  //       NochechotPerDay.nameGroup +
  //       ' - ' +
  //       date.getDate() +
  //       '-' +
  //       (date.getMonth().valueOf() + 1) +
  //       '-' +
  //       date.getFullYear() +
  //       '.pdf'
  //     );
  //   }
  // }





  export() {
    debugger;
    const doc = new jsPDF({
      unit: 'pt',
    });
    doc.setR2L(true)
    //this.displayModal = false;
    var i = 0;
    var x = 0
    this.obj.forEach((element) => {
      i += 1;

      // setTimeout(() =>
      // {
      var prepare = [];
      var tempObj = [];
      console.log("element.a" + element.a)
      element.a.sort((a, b) => {
        const dateA = moment(a.date, 'YYYY/MM/DD');
        const dateB = moment(b.date, 'YYYY/MM/DD');
        return dateA.isBefore(dateB) ? -1 : 1;
      });

      // var sortA=this.sortByHebrewDate(element.a);
      // debugger
      // element.a.forEach((NPD) => {

      //   tempObj.push(NPD.hebrewDate.split('').join('') + '  ');

      //   NPD.nochecotPerLesson.sort((a,b)=>a.lesson.lessonNumber-b.lesson.lessonNumber)
      //   NPD.nochecotPerLesson.forEach((NPL) => {
      //     if(NPL.presence.typePresenceId!=4){
      //     tempObj.push(
      //       NPL.lesson.lessonName.split('').join('') +
      //       '\n' +
      //       '  ' +
      //       NPL.presence.typePresenceName.split('').join('') +
      //       ' '
      //     );}
      //   });
      //   for(let i=16-tempObj.length;i>0;i--)
      //   {
      //    tempObj.push('')
      //   }
      //   tempObj.reverse();

      //   prepare.push(tempObj);
      //   tempObj = new Array();
      // });




      debugger
      element.a.forEach((NPD) => {



        NPD.nochecotPerLesson.forEach((NPL) => {
          if (NPL.presence.typePresenceId != 5)
            x = 1
         
        }
        );
        if (x == 1){
          tempObj.push(NPD.hebrewDate.split('').join('') + '  ');
        NPD.nochecotPerLesson.sort((a, b) => a.lesson.lessonNumber - b.lesson.lessonNumber)
        NPD.nochecotPerLesson.forEach((NPL) => {
          if (NPL.presence.typePresenceId == 5) {
            tempObj.push('')
          }
          if (NPL.presence.typePresenceId != 5) {
            tempObj.push(
              NPL.lesson.lessonName.split('').join('') +
              '\n' +
              ' ' +
              NPL.presence.typePresenceName.split('').join('') +
              ' '
            );
          }
          x=0
        });


        for (let i = 16 - tempObj.length; i > 0; i--) {
          tempObj.push('')
        }
        tempObj.reverse();

        prepare.push(tempObj);
        tempObj = new Array();}
      });

      debugger
      doc.addFileToVFS('Arimo-Regular.ttf', this.FontService.font);

      doc.addFont('Arimo-Regular.ttf', 'Arimo', 'normal');
      doc.setFont('Arimo', 'normal');
      doc.setFontSize(13);
      doc.setLineWidth(20);

      var title =
        ' נוכחות עבור'.split('').join('') +
        ' ' +
        element.s.student.firstName.split('').join('') +
        ' ' +
        element.s.student.lastName.split('').join('') +
        ' ' +
        ' מכיתה '.split('').join('') +
        ' ' +
        this.selectedGroup.group.nameGroup.split('').join('') +
        ' ' +
        'בתאריכים'.split('').join('') +
        ' ' +
        this.fromHeb.split('').join('') +
        ' ' +
        '-'.split('').join('') +
        ' ' +
        this.toHeb.split('').join('')






      //doc.addImage("")
      doc.text(title, 30, 30);
      //  pdf['autoTable']({
      //  @ts-ignore

      doc.autoTable({
        head: [
          [
            'תאריך:'.split('').join(''),
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '01',
            '11',
            '21',
            '31',
            '41',
          ].reverse(),
        ],
        body: prepare,
        styles: {
          font: 'Arimo',
          dir: 'right',
          align: 'right',
          textalign: 'center',
          fontSize: 6,
          cellWidth: 'auto',
          //  dir:'rtl',
          margins: {
            top: 80,
            bottom: 60,
            left: 85,
            width: 522,
          },
        },
      });


      var date = new Date();
      debugger;

      doc.addPage();
      // }    },
      //  i*1000);
    });
    doc.save('דוח תלמידות כיתה ' + this.selectedGroup.group.nameGroup);
  }

  onGroupChange(selectedGroup: any) {
    debugger
    this.StudentPerGroup(selectedGroup.idgroupPerYearbook)

  }


}


