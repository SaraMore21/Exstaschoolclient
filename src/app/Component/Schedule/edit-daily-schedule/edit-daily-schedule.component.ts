import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { DailyScheduleService } from 'src/app/Service/daily-schedule.service'
import { SchoolService } from 'src/app/Service/school.service'
import { DailySchedule } from 'src/app/Class/daily-schedule'
import { User } from 'src/app/Class/user';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { GroupSemesterPerCourse } from 'src/app/Class/group-semester-per-course';
import { CourseService } from 'src/app/Service/course.service';
import { LessonPerGroup } from 'src/app/Class/lesson-per-group';
import { Time } from "@angular/common";
import { PresenceService } from 'src/app/Service/presence.service';
import { GroupService } from 'src/app/Service/group.service';
import { Presence } from 'src/app/class/presence';
import { StudentPerGroup } from 'src/app/Class/student-per-group';

@Component({
  selector: 'app-edit-daily-schedule',
  templateUrl: './edit-daily-schedule.component.html',
  styleUrls: ['./edit-daily-schedule.component.css'],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})
export class EditDailyScheduleComponent implements OnInit {

  constructor(
    public dailyScheduleService: DailyScheduleService,
    public courseService: CourseService,
    public schoolService: SchoolService,
    public messageService: MessageService,
    private router: Router,
    public presentService:PresenceService,
    public groupService:GroupService
  ) { }
  @Output() messageEvent = new EventEmitter<boolean>();

  DailySchedule: DailySchedule;
  selectedCourse: GroupSemesterPerCourse;
  ListCourses: Array<GroupSemesterPerCourse>;
  ListTeachers: Array<User> = new Array<User>();
  ListLessonsNumbers: Array<LessonPerGroup>;
  SelectedLessonPerGroup: LessonPerGroup;
  selectedTeacher: any;
  selectedLearningStyle: any;
  FromTime: any;
  ToTime: any;

  // Etime:Time;
  // Stime:Time;
  ngOnInit(): void {
    debugger;
    this.dailyScheduleService.selectedGroup == undefined;
    this.selectedLearningStyle = this.schoolService.LearningStyle.find(f => f.value == this.dailyScheduleService.currentDailySchedule?.learningStyleId);
    this.GetCoursesForGroup(this.dailyScheduleService.selectedGroup.idgroupPerYearbook);
     if(this.dailyScheduleService.currentDailySchedule.iddailySchedule==null) this.GetNumLessonAvailable();
    if (this.dailyScheduleService.currentDailySchedule.iddailySchedule != null) this.GetAvailableTeachers();

  }
  //GroupId שליפת הקורסים לקבוצה לפי  
  GetCoursesForGroup(GroupId: number) {
    this.courseService.GetCoursesForGroup(GroupId,new Date(this.dailyScheduleService.currentDailySchedule?.scheduleDate).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })).subscribe(data => {
      this.ListCourses = data;
      this.selectedCourse = this.ListCourses.find(f => f.idgroupSemesterPerCourse == this.dailyScheduleService.currentDailySchedule?.courseId);
    }, er => { })
  }
  //שליפת מורה לפי הקורס הנבחר
  GetTeacherBySelectCourse() {
    this.dailyScheduleService.GetTeacherBySelectCourse(this.selectedCourse.idgroupSemesterPerCourse,new Date(this.dailyScheduleService.currentDailySchedule?.scheduleDate).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })).subscribe(data => {
      if (data == null)
        this.messageService.add({ severity: "info", summary: "שים לב", detail: "לקורס זה לא משובצת מורה, בחר מורה לשיעור זה" });
      else
        if (this.ListTeachers != null && this.ListTeachers.length != 0 && this.ListTeachers.find(f => f.userPerSchoolID == data.userPerSchoolID) == null)
          this.messageService.add({ severity: "info", summary: "שים לב", detail: " המורה המלמד/ת קורס זה משובצ/ת בשעה זו," + '\n' + "בחר מורה אחר/ת." });
      this.selectedTeacher = this.ListTeachers.find(f => f.userPerSchoolID == data?.userPerSchoolID);
    }, er => { })
  }
  //שליפת המורות הפנויות לשיעור המבוקש
  GetAvailableTeachers() {
    debugger;
    this.dailyScheduleService.GetAvailableTeachers(new Date(this.dailyScheduleService.currentDailySchedule.scheduleDate).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }), this.dailyScheduleService.currentDailySchedule.numLesson, this.dailyScheduleService.currentDailySchedule.schoolId, this.dailyScheduleService.currentDailySchedule.courseId ?? 0).subscribe(data => {
      this.ListTeachers = data;
      this.selectedTeacher = this.ListTeachers.find(f => f.userPerSchoolID == this.dailyScheduleService.currentDailySchedule.teacherId);
    }, er => { })
  }
  //עריכת מערכת יומית-שמירת פרטי השיעור 
  EditDailySchedule() {
    let date = new Date()
    this.dailyScheduleService.currentDailySchedule.userCreatedId = this.schoolService.ListSchool.find(f => f.school.idschool == this.dailyScheduleService.currentDailySchedule.schoolId)?.userId;
    this.dailyScheduleService.currentDailySchedule.dateCreated = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    this.DailySchedule = this.dailyScheduleService.currentDailySchedule;
    this.DailySchedule.courseId = this.selectedCourse.idgroupSemesterPerCourse;
    this.DailySchedule.teacherId = this.selectedTeacher.userPerSchoolID;
    this.DailySchedule.learningStyleId = this.selectedLearningStyle.value;
    this.dailyScheduleService.EditDailySchedule(this.DailySchedule).subscribe(data => {
      if (data == null)
        this.messageService.add({ severity: "error", summary: "שגיאה", detail: "ארעה תקלה בעת עדכון-שיעור זה לא קיים במערכת" });
      //במקרה והמורה שנבחרה משובצת לשיעור בזמן זהה
      //undefined-התראה למשתמש+הורדה מרשימת המורות+הסרת המשתמש הבחור ל 
      else if (data.iddailySchedule == 0 || data.iddailySchedule == null) {
        this.messageService.add({ severity: "error", summary: "עדכון לא בוצע", detail: " המורה המלמד/ת קורס זה משובצ/ת בשעה זו," + '\n' + "בחר מורה אחר/ת." });
        let i = this.ListTeachers.findIndex(f => f.userPerSchoolID == this.DailySchedule.teacherId);
        if (i != -1) this.ListTeachers.splice(i, 1);
        this.selectedTeacher = undefined;
      }
      else {
        this.dailyScheduleService.currentDailySchedule.learningStyleId = data.learningStyleId;
        this.dailyScheduleService.currentDailySchedule.courseId = data.courseId;
        this.dailyScheduleService.currentDailySchedule.teacherId = this.DailySchedule.teacherId;
        let i = this.dailyScheduleService.listDailySchedule.findIndex(f => f.iddailySchedule == data.iddailySchedule);
        if (i != -1) this.dailyScheduleService.listDailySchedule[i] = data;
        this.dailyScheduleService.currentDailySchedule = { ...data }
        this.messageEvent.emit(true)
      }
    }, er => {
      this.messageService.add({ severity: "error", summary: "שגיאה", detail: "ארעה תקלה בעת עדכון, אנא נסה שנית בעוד מספר דקות" });
    })
  }
  //פונקציה הקורת בעת שינוי מס שיעור
  ChangeNumLesson() {
    this.selectedCourse = null;
    this.selectedTeacher = null;
    // this.dailyScheduleService.currentDailySchedule.teacherId = this.selectedTeacher?.userPerSchoolID;
    // if(this.selectedCourse!=undefined&&this.selectedCourse.idgroupSemesterPerCourse!=undefined)
    if (this.SelectedLessonPerGroup.idlessonPerGroup != 0) {
      let date = new Date();
      this.dailyScheduleService.currentDailySchedule.startTime = this.SelectedLessonPerGroup.startTime;
      //  new Date(date.getFullYear(), date.getMonth(), date.getDate(), this.SelectedLessonPerGroup.startTime.hours, this.SelectedLessonPerGroup.startTime.minutes)
      // this.GetAvailableTeachers();
      this.dailyScheduleService.currentDailySchedule.endTime = this.SelectedLessonPerGroup.endTime;
      // this.dailyScheduleService.currentDailySchedule.numLesson=Number(this.SelectedLessonPerGroup.numLesson);
      // new Date(date.getFullYear(), date.getMonth(), date.getDate(), this.SelectedLessonPerGroup.endTime.hours, this.SelectedLessonPerGroup.endTime.minutes)

      this.dailyScheduleService.GetAvailableTeachersByHourRange(new Date(this.dailyScheduleService.currentDailySchedule.scheduleDate).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }), this.SelectedLessonPerGroup.startTime, this.SelectedLessonPerGroup.endTime, this.dailyScheduleService.currentDailySchedule.schoolId, this.dailyScheduleService.currentDailySchedule.courseId ?? 0).subscribe(data => {
        this.ListTeachers = data;
        this.GetDailyScheduleDetailsByScheduleRegular();

      }, er => { });
    }
    else {
      this.dailyScheduleService.currentDailySchedule.scheduleRegularId = null;
      this.SelectedLessonPerGroup.startTime = null;
      this.SelectedLessonPerGroup.endTime = null;
      // this.dailyScheduleService.currentDailySchedule.numLesson=null;
    }
    // this.GetAvailableTeachersByHourRange();

  }
  //שמירת הנתונים שהוזנו ומעבר להוספה/עדכון
  SaveDailySchedule() {
    if (this.dailyScheduleService.currentDailySchedule.iddailySchedule != undefined)
      this.EditDailySchedule();
    else
      this.AddDailySchedule();
  }
  //הוספת מערכת יומית
  AddDailySchedule() {
    debugger;
    let date = new Date();
    this.dailyScheduleService.currentDailySchedule.courseId = this.selectedCourse.idgroupSemesterPerCourse;
    this.dailyScheduleService.currentDailySchedule.learningStyleId = this.selectedLearningStyle.value;
    this.dailyScheduleService.currentDailySchedule.teacherId = this.selectedTeacher.userPerSchoolID;
    this.dailyScheduleService.currentDailySchedule.userCreatedId = this.schoolService.ListSchool.find(f => f.school.idschool == this.dailyScheduleService.currentDailySchedule.schoolId)?.userId;
    this.dailyScheduleService.currentDailySchedule.dateCreated = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    this.dailyScheduleService.currentDailySchedule.scheduleDate = new Date(Date.UTC(this.dailyScheduleService.currentDailySchedule.scheduleDate.getFullYear(), this.dailyScheduleService.currentDailySchedule.scheduleDate.getMonth(), this.dailyScheduleService.currentDailySchedule.scheduleDate.getDate()))
    this.dailyScheduleService.currentDailySchedule.isChange = false;
    this.dailyScheduleService.currentDailySchedule.numLesson=this.SelectedLessonPerGroup.idlessonPerGroup!=0?Number(this.SelectedLessonPerGroup.numLesson):-1;
    // this.dailyScheduleService.currentDailySchedule.startTime =this.dailyScheduleService.currentDailySchedule.startTime 
    // new Date(Date.UTC(this.dailyScheduleService.currentDailySchedule.startTime.getFullYear(),this.dailyScheduleService.currentDailySchedule.startTime.getMonth(),this.dailyScheduleService.currentDailySchedule.startTime.getDate(),this.dailyScheduleService.currentDailySchedule.startTime.getHours(),this.dailyScheduleService.currentDailySchedule.startTime.getMinutes(),this.dailyScheduleService.currentDailySchedule.startTime.getSeconds()));
    // this.dailyScheduleService.currentDailySchedule.endTime =this.dailyScheduleService.currentDailySchedule.endTime
    //  new Date(Date.UTC(this.dailyScheduleService.currentDailySchedule.endTime.getFullYear(),this.dailyScheduleService.currentDailySchedule.endTime.getMonth(),this.dailyScheduleService.currentDailySchedule.endTime.getDate(),this.dailyScheduleService.currentDailySchedule.endTime.getHours(),this.dailyScheduleService.currentDailySchedule.endTime.getMinutes(),this.dailyScheduleService.currentDailySchedule.endTime.getSeconds()));
    // this.dailyScheduleService.currentDailySchedule.startTime = this.SelectedLessonPerGroup.startTime;
    // this.dailyScheduleService.currentDailySchedule.endTime = this.SelectedLessonPerGroup.endTime;
    this.dailyScheduleService.AddDailySchedule().subscribe(data => {
      debugger;
      if (data.item1 == null)
        this.messageService.add({ severity: "error", summary: "ההוספה בוטלה", detail: data.item2 });
      else {
        debugger;
        this.dailyScheduleService.listDailySchedule.push(data.item1);
       this.dailyScheduleService.listDailySchedule= this.dailyScheduleService.listDailySchedule.sort((a,b)=> new Date("2000-01-01 "+a.startTime).getTime()-new Date("2000-01-01 "+b.startTime).getTime())
        this.messageEvent.emit(true)
        var listStudent:Array<StudentPerGroup>;
        var listPresence:Array<Presence>
        var scheduleDate=data.item1.scheduleDate
        this.groupService.GetStudentPerGroup(this.dailyScheduleService.selectedGroup.idgroupPerYearbook,0).subscribe(d=>
          {
            
          listStudent=d
          listPresence=new Array<Presence>()
          listStudent.forEach(s=>
            {
             var presenceTemp= new Presence()
             presenceTemp.dateCreated=new Date(Date.now())
             presenceTemp.typePresenceId=2
             presenceTemp.studentId=s.studentId
             presenceTemp.dailyScheduleId=data.item1.iddailySchedule
             // presenceTemp.userCreatedId= this.dailyScheduleService.currentDailySchedule.userCreatedId
             listPresence.push(presenceTemp)
            }
          )
          var user= this.dailyScheduleService.currentDailySchedule.userCreatedId
          
          this.presentService.addOrUpdateAttendance(new Date(scheduleDate),user,listPresence)
          .subscribe(
            d=>{},e=>{}
          )
      })
        debugger
      
      }
    }, er => {
      this.messageService.add({ severity: "error", summary: "שגיאה", detail: "ארעה תקלה בעת הוספה, אנא נסה שנית בעוד מספר דקות" });
    });


  }
  //שליפת השיעורים הפנויים
  GetNumLessonAvailable() {
    debugger;
    this.dailyScheduleService.GetNumLessonAvailable(this.dailyScheduleService.selectedGroup.idgroupPerYearbook,new Date(this.dailyScheduleService.currentDailySchedule?.scheduleDate).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })).subscribe(data => {
      this.ListLessonsNumbers = data;
      let LpG = new LessonPerGroup();
      LpG.idlessonPerGroup = 0; LpG.numLesson = "אחר"
      this.ListLessonsNumbers.push(LpG);
      debugger;
    }, er => { })
  }
  ChangeTime() {
    debugger;
    if (this.SelectedLessonPerGroup.startTime != this.FromTime || this.SelectedLessonPerGroup.endTime != this.ToTime) {
      if (this.SelectedLessonPerGroup.startTime != null && this.SelectedLessonPerGroup.endTime != null) {
        if (this.SelectedLessonPerGroup.startTime >= this.SelectedLessonPerGroup.endTime)
          this.messageService.add({ severity: "info", summary: "שים לב", detail: "הזנת שעת סיום קטן משעת התחלה" });
        else {
          let date = new Date();
          // let sTime = this.SelectedLessonPerGroup.startTime.splice(":");
          // let eTime = this.SelectedLessonPerGroup.endTime.splice(":");
          this.dailyScheduleService.currentDailySchedule.startTime =this.SelectedLessonPerGroup.startTime;
          //  new Date(date.getFullYear(), date.getMonth(), date.getDate(), sTime[0], sTime[1])
          this.dailyScheduleService.currentDailySchedule.endTime = this.SelectedLessonPerGroup.endTime;
          // new Date(date.getFullYear(), date.getMonth(), date.getDate(), eTime[0], eTime[1])

          debugger;

          this.dailyScheduleService.GetAvailableTeachersByHourRange(new Date(this.dailyScheduleService.currentDailySchedule.scheduleDate).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }), this.SelectedLessonPerGroup.startTime, this.SelectedLessonPerGroup.endTime, this.dailyScheduleService.currentDailySchedule.schoolId, this.dailyScheduleService.currentDailySchedule.courseId ?? 0).subscribe(data => {
            this.ListTeachers = data;
            // this.selectedTeacher = this.ListTeachers.find(f => f.userPerSchoolID == this.dailyScheduleService.currentDailySchedule.teacherId);
          }, er => { });
          // this.GetAvailableTeachersByHourRange();
          // this.FromTime = this.SelectedLessonPerGroup.startTime;
          // this.ToTime = this.SelectedLessonPerGroup.endTime;

        }
      }
      // alert("FromTime="+this.SelectedLessonPerGroup.fromTime +" ToTime="+this.SelectedLessonPerGroup.toTime);
    }
  }

  //שליפת המורות הפנויות -בדיקה לפי שעות
  GetAvailableTeachersByHourRange() {
    this.dailyScheduleService.GetAvailableTeachersByHourRange(new Date(this.dailyScheduleService.currentDailySchedule.scheduleDate).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }), this.SelectedLessonPerGroup.startTime, this.SelectedLessonPerGroup.endTime, this.dailyScheduleService.currentDailySchedule.schoolId, this.dailyScheduleService.currentDailySchedule.courseId ?? 0).subscribe(data => {
      this.ListTeachers = data;
      this.selectedTeacher = this.ListTeachers.find(f => f.userPerSchoolID == this.dailyScheduleService.currentDailySchedule.teacherId);
    }, er => { });
  }
  //שליפת נתוני מערכת יומית לפי מערכת קבועה 
  GetDailyScheduleDetailsByScheduleRegular() {
    debugger;
    this.dailyScheduleService.GetDailyScheduleDetailsByScheduleRegular(this.dailyScheduleService.selectedGroup.idgroupPerYearbook, new Date(this.dailyScheduleService.currentDailySchedule?.scheduleDate).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }), this.dailyScheduleService.currentDailySchedule.startTime.toLocaleString(), this.dailyScheduleService.currentDailySchedule.endTime.toLocaleString()).subscribe(data => {
      debugger;
      if (data != null) {
        this.selectedCourse = this.ListCourses.find(f => f.idgroupSemesterPerCourse == data.item1.idgroupSemesterPerCourse);
        this.selectedTeacher = this.ListTeachers.find(f => f.userPerSchoolID == data.item2?.iduserPerSchool);
        this.dailyScheduleService.currentDailySchedule.scheduleRegularId = data.item3;
      }
    }, er => { })
  }
}