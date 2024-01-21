import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SchoolService } from 'src/app/Service/school.service';
import { CourseService } from '../../../Service/course.service';
import { Course } from '../../../Class/course'
import { UserService } from 'src/app/Service/user.service';
import { Semester } from 'src/app/Class/semester'
import { Group } from 'src/app/Class/group';
import { Profession } from 'src/app/Class/profession';
import { GroupService } from 'src/app/Service/group.service';
import { ProfessionService } from 'src/app/Service/profession.service';
import { LearningStyleService } from 'src/app/Service/learning-style.service';
import { UserPerCourse } from 'src/app/Class/user-per-course'
import { DatePipe } from '@angular/common';
import { listenerCount } from 'process';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { analyzeAndValidateNgModules, identifierModuleUrl } from '@angular/compiler';
import { toJSDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';
import { UserPerSchool } from 'src/app/Class/user-per-school';
import { ConvertDateToStringService } from 'src/app/Service/convert-date-to-string.service'
import { School } from 'src/app/Class/school';
import { User } from 'src/app/Class/user';
import { GroupSemesterPerCourse } from 'src/app/Class/group-semester-per-course'
import { FatherCourse } from 'src/app/Class/father-course';
import { FatherCourseService } from 'src/app/Service/father-course.service';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';
import { HebrewCalanderService } from 'src/app/Service/hebrew-calander.service';
import { SelectItem } from 'primeng/api';
import * as XLSX from 'xlsx';
import { StreetService } from 'src/app/Service/street.service';
@Component({
  selector: 'app-list-course',
  templateUrl: './list-course.component.html',
  styleUrls: ['./list-course.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, DatePipe, ConfirmationService]


})
export class ListCourseComponent implements OnInit {
  data: Array<SelectItem>
  ADate: SelectItem
  edit: boolean = false;
  // SelectNameCourse: Course = new Course();
  excelCourseList: Array<any> = new Array<any>();
  SelectTeacher: any;
  ListSemester: any;
  SelectSemester: Semester = new Semester();
  SelectGroup: any;
  SelectProfession: Profession;
  // HoursPerWeek: number;
  // Hours: number;
  // Credits: number;
  // Cost: number;
  // MinimumScore: number;
  // nameCourse: string;
  SelectLearningStyle: any;
  // SemesterFromDate: Date;
  // SemesterToDate: Date;
  Course: Course = new Course();
  add: boolean = false;
  SFD: string;
  STD: string;
  ListUsersPerCourse: Array<any>;
  CurrentCourse: GroupSemesterPerCourse = new GroupSemesterPerCourse();
  CurrentSchool: any;
  FatherCourse: boolean = false;
  //חדש
  FatherCourseId: number;
  ListCourse: Array<GroupSemesterPerCourse>;
  CurrentFatherCourse: FatherCourse;
  schoolId: number;
  YearbookPerSchool: number = 0;
  IsAddCoordinationsCode: boolean = false;
  FatherCourseName:string;

  //אוביקט לשמירת הקוד תאום הנבחר
  CoordinationCode: string = '';

  constructor(
    public courseService: CourseService,
    public fatherCourseService: FatherCourseService,
    public schoolService: SchoolService,
    public userService: UserService,
    public groupService: GroupService,
    public professionService: ProfessionService,
    public learningStyleService: LearningStyleService,
    public confirmationService: ConfirmationService,
    public convertDateToStringService: ConvertDateToStringService,
    public GenericFunctionService: GenericFunctionService,
    public hebrewCalanderService: HebrewCalanderService,
    public messageService: MessageService,
    public datepipe: DatePipe,
    public active: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    debugger;

    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.active.params.subscribe(c => { this.FatherCourseId = c["FatherCourseId"] })
    this.active.params.subscribe(c => { this.schoolId = c["schoolId"] })
    this.active.params.subscribe(c => { this.YearbookPerSchool = c["YearbookPerSchool"] })
    this.active.params.subscribe(c => { this.FatherCourseName = c["name"] })


    this.CurrentFatherCourse = this.fatherCourseService.ListFatherCourse.find(f => f.idcourse == this.FatherCourseId);
    this.CurrentSchool = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentFatherCourse.schoolId);

    if (this.CurrentSchool.appYearbookPerSchools.find(f => f.idyearbookPerSchool == this.CurrentFatherCourse.yearbookId).yearbookId != this.schoolService.SelectYearbook.idyearbook)
      this.GenericFunctionService.GoBackToLastPage();
    // if (this.courseService.ListCourseByListSchoolAndYearbook == null || this.courseService.ListCourseByListSchoolAndYearbook.length == 0 || this.courseService.ListCourseByListSchoolAndYearbook[0].yearbookId != this.schoolService.SelectYearbook.idyearbook)
    this.GetAllCourse();
    this.SelectSemester.fromDate = new Date();
    this.SelectSemester.toDate = new Date();
  }
  //עריכת קורס
  EditDetailsCrouse(course: any) {
    debugger;
    this.CurrentCourse = { ...course };
    this.courseService.GetUsersPerCourse(course.idgroupSemesterPerCourse).subscribe(data1 => {
      if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
        this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
          debugger;
          this.userService.ListUserByListSchoolAndYerbook = data;
          this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentFatherCourse.schoolId);
          this.PushUserPerSchool(data1);
        }, er => { });
      else {
        if (this.userService.ListUserPerSY == null || this.userService.ListUserPerSY.length == 0 || this.userService.ListUserPerSY[0].schoolId != this.CurrentFatherCourse.schoolId) {
          this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentFatherCourse.schoolId);
          this.PushUserPerSchool(data1);
        }
        else
          this.PushUserPerSchool(data1);
      }

    }, er => { })

    this.edit = true; this.add = true;
    this.SelectGroup = new Group();
    if (this.groupService.ListGroupsByListSchoolAndYerbook != null) {
      var yearbook;
      this.schoolService.ListSchool.find(f => f.appYearbookPerSchools.find(f => {
        if (f.idyearbookPerSchool == this.groupService.ListGroupsByListSchoolAndYerbook[0].yearbookId) yearbook = f;
      }));
    }
    if (this.groupService.ListGroupsByListSchoolAndYerbook == null || this.groupService.ListGroupsByListSchoolAndYerbook.length == 0 || yearbook.yearbookId != this.schoolService.SelectYearbook.idyearbook) {
      this.groupService.GetGroupsByIdSchool(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        this.groupService.ListGroupsByListSchoolAndYerbook = data;

        this.PushListGroupPerSY();
        this.SelectGroup = this.groupService.ListGroupPerSY.find(f => f.idgroupPerYearbook == course.groupId);
      }, er => { })
    } else
      if (this.groupService.ListGroupPerSY == null || this.groupService.ListGroupPerSY.length == 0 || this.groupService.ListGroupPerSY[0].group == null || this.groupService.ListGroupPerSY[0].group.schoolId != this.CurrentFatherCourse.schoolId)
        this.PushListGroupPerSY();
    this.SelectGroup = this.groupService.ListGroupPerSY.find(f => f.idgroupPerYearbook == course.groupId);

    debugger
    var y = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentFatherCourse.schoolId).appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook)
    if (this.ListSemester == null || this.ListSemester.length == 0 || this.ListSemester[0].yearbookId != y.idyearbookPerSchool)
      this.courseService.GetAllSemester(y.idyearbookPerSchool).subscribe(data => {
        this.ListSemester = data; debugger;
        this.SelectSemester = this.ListSemester.find(f => f.idsemester == course.semesterId)
        this.CurrentCourse.fromDate = new Date(course.fromDate); this.CurrentCourse.toDate = new Date(course.toDate);
        this.SFD = this.convertDateToStringService.formatDate(new Date(course.fromDate)); this.STD = this.convertDateToStringService.formatDate(new Date(course.toDate));
      }, er => { })

    else {
      this.SelectSemester = this.ListSemester.find(f => f.idsemester == course.semesterId);
      this.CurrentCourse.fromDate = new Date(course.fromDate); this.CurrentCourse.toDate = new Date(course.toDate);
      this.SFD = this.convertDateToStringService.formatDate(new Date(course.fromDate)); this.STD = this.convertDateToStringService.formatDate(new Date(course.toDate));
    }
  }
  //מילוי ליסט קבוצות למוסד ושנתון
  PushListGroupPerSY() {
    debugger;
    this.groupService.ListGroupPerSY = this.groupService.ListGroupsByListSchoolAndYerbook.filter(f => f.group.schoolId == this.CurrentFatherCourse.schoolId);
  }
  //מחיקת קורס
  DeleteCrouse(course: any) {
    debugger;
    this.confirmationService.confirm({
      message: 'האם הנך בטוח כי ברצונך למחוק קורס זו   ?  ',
      header: 'מחיקת קורס',
      icon: 'pi pi-info-circle',
      acceptLabel: ' מחק ',
      rejectLabel: ' ביטול ',
      accept: () => {
        debugger;
        this.courseService.DeleteCourse(course.idgroupSemesterPerCourse).subscribe(data => {
          if (data == 1) {
            var i = this.ListCourse.findIndex(f => f.idgroupSemesterPerCourse == course.idgroupSemesterPerCourse);
            this.ListCourse.splice(i, 1);
            this.messageService.add({ key: "tc", severity: 'success', summary: 'המחיקה הצליחה', detail: 'הקורס נמחק בהצלחה' });
          }
          else
            this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: ' המחיקה נכשלה,אנא נסה שנית' });
        }, er => {
          this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: ' המחיקה נכשלה,אנא נסה שנית' });
        });
      },
      reject: () => {
      }
    });
  }
  //שליפת הקורסים בשנה המבוקשת לפי מוסד
  GetAllCourse() {
    // debugger;
    // this.courseService.GetAllCourseBySchoolDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
    //   this.courseService.ListCourseByListSchoolAndYearbook = data
    // }, er => { })
    this.courseService.GetAllCourseByFatherCourseId(this.FatherCourseId).subscribe(data => {
      debugger;
      this.ListCourse = data;

    }, er => { });
  }
  //הוספת קורס
  AddCrousePerGroup() {
    debugger;
    this.edit = false;
    this.add = true;
    this.SelectLearningStyle = null;
    this.SelectTeacher = new UserPerSchool();
    this.CurrentCourse = new GroupSemesterPerCourse();
    this.SelectProfession = new Profession();
    this.SelectSemester = new Semester();
    this.SelectGroup = new Group();
    this.CurrentCourse.fromDate = null;
    this.CurrentCourse.toDate = null;
    this.SFD = null;
    this.STD = null;
    this.hebrewCalanderService.getHebrew(new Date()).subscribe(data => {
      this.CurrentCourse.code = this.CurrentFatherCourse.code != null ? this.CurrentFatherCourse.code.toString() : 0 + '-' + this.CurrentFatherCourse.schoolId + '-' + data.hy;
    }, er => { });

    this.ChangeSchoolCourse();
  }

  AddCoordinationsCourse() {
    this.edit = false;
    this.add = false;
    this.IsAddCoordinationsCode = true;
    this.SelectLearningStyle = null;
    //this.SelectTeacher = new UserPerSchool();
    this.CurrentCourse = new GroupSemesterPerCourse();
    //this.SelectProfession = new Profession();
    this.SelectSemester = new Semester();
    this.SelectGroup = new Group();
    this.CurrentCourse.fromDate = null;
    this.CurrentCourse.toDate = null;
    this.SFD = null;
    this.STD = null;
    this.hebrewCalanderService.getHebrew(new Date()).subscribe(data => {
      this.CurrentCourse.code = this.CurrentFatherCourse.code != null ? this.CurrentFatherCourse.code.toString() : 0 + '-' + this.CurrentFatherCourse.schoolId + '-' + data.hy;
    }, er => { });
    //שמתי בהערה בשביל התיאומים
    // this.groupService.GetGroupsByCoordinationCode(this.CurrentFatherCourse.coordinationTypeId).subscribe(
    //   d => {
    //     this.groupService.listCoordinatedGroup = d
    //     this.groupService.listCoordinatedGroup = this.GenericFunctionService.uniqueBy(this.groupService.listCoordinatedGroup, (o1, o2) => o1.group.nameGroup === o2.group.nameGroup);
    //   }
    // )


  }

  ChangeCoordinationCode() {

  }


  //שליפת הנתונים המשוייכים למוסד בזמן הוספה
  ChangeSchoolCourse() {
    if (this.groupService.ListGroupsByListSchoolAndYerbook != null) {
      var yearbook;
      this.schoolService.ListSchool.find(f => f.appYearbookPerSchools.find(f => {
        if (f.idyearbookPerSchool == this.groupService.ListGroupsByListSchoolAndYerbook[0].yearbookId) yearbook = f;
      }));
    }
    if (this.groupService.ListGroupsByListSchoolAndYerbook == null || this.groupService.ListGroupsByListSchoolAndYerbook.length == 0 || yearbook.yearbookId != this.schoolService.SelectYearbook.idyearbook) {
      this.groupService.GetGroupsByIdSchool(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        this.groupService.ListGroupsByListSchoolAndYerbook = data;

        this.PushListGroupPerSY();
      }, er => { })
    } else
      if (this.groupService.ListGroupPerSY == null || this.groupService.ListGroupPerSY.length == 0 || this.groupService.ListGroupPerSY[0].group == null || this.groupService.ListGroupPerSY[0].group.schoolId != this.CurrentSchool.school.idschool)
        this.PushListGroupPerSY();

    var y = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentSchool.school.idschool).appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook)
    if (this.ListSemester == null || this.ListSemester.length == 0 || this.ListSemester[0].yearbookId != y.idyearbookPerSchool)
      this.courseService.GetAllSemester(y.idyearbookPerSchool).subscribe(data => { this.ListSemester = data }, er => { })

    if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        debugger;
        this.userService.ListUserByListSchoolAndYerbook = data;
        this.userService.ListUserPerSY = new Array<User>();
        if (this.CurrentSchool && this.CurrentSchool.school)
          this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentSchool.school.idschool);
      }, er => { });
    else {
      if (this.CurrentSchool && this.CurrentSchool.school && (this.userService.ListUserPerSY == null || this.userService.ListUserPerSY.length == 0 || this.userService.ListUserPerSY[0].schoolId != this.CurrentSchool.school.idschool)) {
        this.userService.ListUserPerSY = new Array<User>();
        if (this.CurrentSchool && this.CurrentSchool.school)
          this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentSchool.school.idschool);
      }
    }
  }

  AddCrouseFather() {
    debugger;
    this.FatherCourse = true;
    this.CurrentSchool = null;
    this.Course = new Course();
    if (this.schoolService.ListSchool.length == 1) {
      this.CurrentSchool = this.schoolService.ListSchool[0];
      this.ChangeSchool();
    }
  }
  //שמירת הוספה /עדכון קורס תואם ושליחה לסרבר
  SaveEditOrAddCoordinated() {
    this.IsAddCoordinationsCode = false
    this.CurrentCourse.fromDate = new Date(this.SFD + " 00:00:00"); this.CurrentCourse.toDate = new Date(this.STD + " 00:00:00");
    let date = new Date();
    this.CurrentCourse.dateCreated = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        this.CurrentCourse.fromDate = new Date(Date.UTC(this.CurrentCourse.fromDate.getFullYear(), this.CurrentCourse.fromDate.getMonth(), this.CurrentCourse.fromDate.getDate()));
        this.CurrentCourse.toDate = new Date(Date.UTC(this.CurrentCourse.toDate.getFullYear(), this.CurrentCourse.toDate.getMonth(), this.CurrentCourse.toDate.getDate()));
        this.CurrentCourse.groupId = this.SelectGroup.idgroupPerYearbook;
        this.CurrentCourse.userCreatedId = this.CurrentSchool.userId;
        this.CurrentCourse.courseId = this.FatherCourseId;
        this.CurrentCourse.course=this.CurrentFatherCourse
    debugger
    this.courseService.AddCoordinatedCourse(this.CurrentCourse,this.schoolService.SelectYearbook.idyearbook)
    .subscribe(
      d=>
      d.forEach(
        c=>this.ListCourse.push(c)
      )
    )



  }


  //שמירת הוספה /עדכון קורס ושליחה לסרבר
  SaveEditOrAdd() {
    debugger;
    //#region אם ההוספה היא הוספת קורס אב
    // if (this.FatherCourse == true) {
    //   this.Course.professionId = this.SelectProfession != null ? this.SelectProfession.idprofession : null;
    //   this.Course.learningStyleId = this.SelectLearningStyle != null ? this.SelectLearningStyle.idTypeLearningStyle : null;
    //   this.Course.schoolId = this.CurrentSchool.school.idschool;
    //   this.courseService.AddFatherCourse(this.Course).subscribe(data => {
    //     if (data == null)
    //       this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'קיים כבר קורס עם שם זהה' });
    //     else {
    //       if (this.courseService.ListCourse != null && this.courseService.ListCourse.length != 0 && this.courseService.ListCourse[0].schoolId == this.Course.schoolId)
    //         this.courseService.ListCourse.push(data);
    //       this.messageService.add({ key: "tc", severity: 'success', summary: 'ההוספה הצליחה', detail: 'הקורס נוסף בהצלחה' });
    //       this.FatherCourse = false;
    //     }
    //   }, er => {
    //     this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'ארעה תקלה, אנא נסה שנית' });
    //   });
    // }
    // else {
    //#endregion
    //#region בדיקות תקינות-על הסמסטר
    this.CurrentCourse.fromDate = new Date(this.SFD + " 00:00:00"); this.CurrentCourse.toDate = new Date(this.STD + " 00:00:00");
    if (this.CurrentCourse.fromDate > this.CurrentCourse.toDate) {
      this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'תאריך סיום קטן מתאריך התחלה' }); return
    }
    else if (this.CurrentCourse.fromDate < new Date(this.SelectSemester.fromDate.toString())) {
      this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'תאריך התחלה קטן מתאריך התחלה של הסמסטר' }); return;
    }
    else if (this.CurrentCourse.toDate > new Date(this.SelectSemester.toDate.toString())) {
      this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'תאריך סיום גדול מתאריך סיום של הסמסטר' }); return;
    }
    //#endregion
    else {
      //#region הוספה
      if (this.edit == false) {

        // if (this.courseService.ListCourseByListSchoolAndYearbook.find(f => f.course.idcourse == this.SelectNameCourse.idcourse && f.groupId == this.SelectGroup.idgroupPerYearbook && f.semesterId == this.SelectSemester.idsemester) != null) {
        //   this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'קיים קורס זה בקבוצה זהה עם אותו סמסטר' }); return;
        // }
        // else
        let date = new Date();
        this.CurrentCourse.dateCreated = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        this.CurrentCourse.fromDate = new Date(Date.UTC(this.CurrentCourse.fromDate.getFullYear(), this.CurrentCourse.fromDate.getMonth(), this.CurrentCourse.fromDate.getDate()));
        this.CurrentCourse.toDate = new Date(Date.UTC(this.CurrentCourse.toDate.getFullYear(), this.CurrentCourse.toDate.getMonth(), this.CurrentCourse.toDate.getDate()));
        this.CurrentCourse.groupId = this.SelectGroup.idgroupPerYearbook;
        this.CurrentCourse.semesterId = this.SelectSemester.idsemester;
        this.CurrentCourse.userCreatedId = this.CurrentSchool.userId;
        this.CurrentCourse.courseId = this.FatherCourseId;
        this.courseService.AddCourse(this.CurrentCourse, this.SelectTeacher.userPerSchoolID).subscribe(data => {
          if (data == null)
            this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'קורס זה קיים כבר לקבוצה זו בתאריכים נפגשים' });

          else {
            this.ListCourse.push(data);
            this.messageService.add({ key: "tc", severity: 'success', summary: 'ההוספה הצליחה', detail: 'הקורס נוסף בהצלחה' });
          }
        }, er => { this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'ארעה תקלה, אנא נסה שנית' }); })
        // this.courseService.AddCourse(this.Course, this.CurrentSchool.school.idschool, this.SelectSemester.idsemester, this.FatherCourseId, this.SelectGroup.idgroupPerYearbook, this.CurrentCourse.fromDate.getDate() + "-" + (this.CurrentCourse.fromDate.getMonth() + 1) + "-" + this.CurrentCourse.fromDate.getFullYear(), this.CurrentCourse.toDate.getDate() + "-" + (this.CurrentCourse.toDate.getMonth() + 1) + "-" + this.CurrentCourse.toDate.getFullYear(), this.SelectTeacher.userPerSchoolID, this.schoolService.SelectYearbook.idyearbook, this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentSchool
        //   .school.idschool).userId).subscribe(data => {
        //     debugger;
        //     if (data == null)
        //       this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'קיים קורס זה בקבוצה זהה עם אותו סמסטר' });
        //     else {
        //       data.schoolId = this.CurrentSchool.idschool;
        //       data.course.schoolName = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentSchool.school.idschool).school.name;
        //       this.courseService.ListCourseByListSchoolAndYearbook.push(data);
        //       // if (this.SelectNameCourse.idcourse == 0)
        //       //   this.courseService.ListCourse.push(data.course);
        //       this.messageService.add({ key: "tc", severity: 'success', summary: 'ההוספה הצליחה', detail: 'הקורס נוסף בהצלחה' });
        //     }
        //   }, er => {
        //     this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'ארעה תקלה, אנא נסה שנית' });
        //   });
      }
      //#endregion
      //#region עריכה
      else {
        //בדיקות תקינות על התאריכים והשיוכים
        debugger;
        if (this.ListUsersPerCourse == null || this.ListUsersPerCourse.length == 0) {
          this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'לא קיים שיוך מורה לקורס' }); return;
        }
        else {
          this.ListUsersPerCourse = this.ListUsersPerCourse.sort((a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime());
          for (var j = 0; j < this.ListUsersPerCourse.length; j++) {
            debugger;
            this.ListUsersPerCourse[j].userId = this.ListUsersPerCourse[j] != null && this.ListUsersPerCourse[j].user != null ? this.ListUsersPerCourse[j].user.userPerSchoolID : null;
            this.ListUsersPerCourse[j].groupSemesterPerCourseId = this.CurrentCourse.idgroupSemesterPerCourse;
            this.ListUsersPerCourse[j].iduserPerCourse == 0 || this.ListUsersPerCourse[j].iduserPerCourse == null ?
              (this.ListUsersPerCourse[j].userCreatedId = this.CurrentSchool.userId, this.ListUsersPerCourse[j].dateCreated = new Date()) :
              (this.ListUsersPerCourse[j].userUpdatedId = this.CurrentSchool.userId, this.ListUsersPerCourse[j].dateUpdated = new Date())

            if (new Date(this.ListUsersPerCourse[j].fromDate + " 00:00:00") > new Date(this.ListUsersPerCourse[j].toDate + " 00:00:00")) {
              this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'שיוך לא תקין-תאריך סיום קטן מתאריך התחלה' }); return;
            }
            if (new Date(this.ListUsersPerCourse[j].fromDate + " 00:00:00") < this.CurrentCourse.fromDate) {
              this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'שיוך לא תקין-תאריך תחילת השיוך קודם לתאריך פתיחת הקורס' }); return;
            }
            if (new Date(this.ListUsersPerCourse[j].toDate + " 00:00:00") > this.CurrentCourse.toDate) {
              this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'שיוך לא תקין-תאריך סיום השיוך לאחר תאריך סיום הקורס' }); return;
            }
            if (this.ListUsersPerCourse[j].userId == null || this.ListUsersPerCourse[j].fromDate == "" || this.ListUsersPerCourse[j].toDate == "" || this.ListUsersPerCourse[j].fromDate == null || this.ListUsersPerCourse[j].toDate == null) {
              this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'שיוך לא תקין-אחד הנתונים רייק' }); return;
            }
            if (this.ListUsersPerCourse[j + 1] && new Date(this.ListUsersPerCourse[j].toDate) >= new Date(this.ListUsersPerCourse[j + 1].fromDate)) {
              this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'ישנו תאריך הקיים בכמה שיוכים' }); return;
            }
            if (this.ListUsersPerCourse[j + 1] && new Date(new Date(this.ListUsersPerCourse[j].toDate).getFullYear(), new Date(this.ListUsersPerCourse[j].toDate).getMonth(), new Date(this.ListUsersPerCourse[j].toDate).getDate() + 1) < new Date(this.ListUsersPerCourse[j + 1].fromDate + " 00:00:00")) {
              this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'ישנו תאריך שלא קיים באף שיוך' }); return;
            }
            if (this.ListUsersPerCourse[j + 1] && this.ListUsersPerCourse[j + 1].user && this.ListUsersPerCourse[j].userId == this.ListUsersPerCourse[j + 1].user.userPerSchoolID && this.ListUsersPerCourse[j + 1].fromDate != null && this.ListUsersPerCourse[j + 1].fromDate != "" && this.ListUsersPerCourse[j + 1].toDate != null && this.ListUsersPerCourse[j + 1].toDate != "") {
              this.ListUsersPerCourse[j + 1].fromDate = this.ListUsersPerCourse[j].fromDate;
              this.ListUsersPerCourse.splice(j, 1);
              j--;
            }
            // else
            //   this.ListUsersPerCourse[j].user = null;

          };
        }
        debugger;
        this.courseService.EditCourse(this.CurrentCourse.idgroupSemesterPerCourse, this.CurrentCourse.code, this.ListUsersPerCourse).subscribe(data => {
          if (data == true) {
            var i = this.ListCourse.findIndex(f => f.idgroupSemesterPerCourse == this.CurrentCourse.idgroupSemesterPerCourse);
            if (i != -1) this.ListCourse[i].code = this.CurrentCourse.code;
            this.messageService.add({ key: "tc", severity: 'success', summary: 'העדכון הצליח', detail: 'הקורס עודכן בהצלחה' });
          }
          else
            this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: ' העדכון נכשל,אנא נסה שנית' });
        }, er => {
          this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: ' העדכון נכשל,אנא נסה שנית' });
        });
      }
      //#endregion
    }
    this.edit = false;
    this.add = false;
    // }
  }
  //שינוי סמסטר-משנה את התאריך התחלה וסיום
  ChangeSemester() {
    this.CurrentCourse.fromDate = new Date(this.SelectSemester.fromDate.toString());
    this.CurrentCourse.toDate = new Date(this.SelectSemester.toDate.toString());
    this.SFD = this.convertDateToStringService.formatDate(new Date(this.SelectSemester.fromDate));
    this.STD = this.convertDateToStringService.formatDate(new Date(this.SelectSemester.toDate))
  }
  //הוספת שיוך מורה לקורס
  newUserPerCourse() {
    var UPC = new UserPerCourse();
    this.ListUsersPerCourse.push(UPC);
  }
  //מחיקת שיוך מורה לקורס
  DeleteUserPerCourse(course: UserPerCourse) {
    debugger;
    var i = this.ListUsersPerCourse.findIndex(f => f.iduserPerCourse == course.iduserPerCourse && f.user == course.user && f.userId == course.userId && f.fromDate == course.fromDate && f.toDate == course.toDate);

    this.ListUsersPerCourse.splice(i, 1);
  }
  //מעבר לקומפוננטה מסמכים לקורס
  GoToDocumentsPerCourse(Course: any) {
    debugger;
    this.courseService.NameCourse = Course.groupName;
    this.router.navigate(['Home/DocumentsPerCourse', Course.idgroupSemesterPerCourse, this.schoolId, this.YearbookPerSchool]);
  }
  //מילוי המורות לפי רשימת המורות הקיימות בשנה ובמוסד
  PushUserPerSchool(ListUPC: any) {
    this.ListUsersPerCourse = ListUPC;
    this.ListUsersPerCourse.forEach(element => {
      element.user = this.userService.ListUserPerSY.find(f => f.iduser == element.user.iduser)
      element.fromDate = this.convertDateToStringService.formatDate(new Date(element.fromDate))
      element.toDate = this.convertDateToStringService.formatDate(new Date(element.toDate))
    });
  }
  //לאחר הזנת מוסד בהוספה
  ChangeSchool() {
    debugger;
    if (this.professionService.ListProfession == null || this.professionService.ListProfession.length == 0)
      this.professionService.GetAllProfessionByIdSchool(this.schoolService.ListSchool).subscribe(data => {
        this.professionService.ListProfession = data;
        this.professionService.ListProfessionPerS = this.professionService.ListProfession.filter(f => f.schoolId == this.CurrentSchool.school.idschool)
      }, er => { })
    else if (this.professionService.ListProfessionPerS == null || this.professionService.ListProfessionPerS.length == 0 || this.professionService.ListProfessionPerS[0].schoolId != this.CurrentSchool.school.idschool)
      this.professionService.ListProfessionPerS = this.professionService.ListProfession.filter(f => f.schoolId == this.CurrentSchool.school.idschool)
  }
  exportExcelAsync() {
    debugger;
    this.ListCourse.forEach(c => {
      let course: Course;
      this.fatherCourseService.getFatherCourseById(c.courseId)
        .subscribe(d =>
          course = d
        )
      this.excelCourseList.push(
        {
          'codeFatherCourse': course.idcourse,
          'mosad': course.schoolName,
          'group': c.groupName,
          'semester': c.semesterName,
          'fromDate': c.fromDate,
          'toDate': c.toDate,
          'code': c.code,
          'teacher': course.teacherId,
          'FatherCourseName': c.courseId,
          'coursename': course.name
        })

    })
  }
  exportExcel() {
    debugger;

    let Heading = [['קוד קורס אב', 'מוסד', 'קבוצה', 'סמסטר', 'מתאריך', 'עד תאריך', 'קוד', 'מורה', 'שם קורס אב', 'שם קורס']];
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheet, Heading);

    //Starting in the second row to avoid overriding and skipping headers
    XLSX.utils.sheet_add_json(worksheet, this.excelCourseList, { origin: 'A2', skipHeader: true });
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    if (!workbook.Workbook) workbook.Workbook = {};
    if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
    if (!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
    workbook.Workbook.Views[0].RTL = true;
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, "Course");
  }

  //var fileName=this.data.find(f=>f.value==this.ADate).label;



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
      FileSaver.saveAs(data, fileName);
    });
  }

  log() {
    console.log(this.CurrentCourse)
  }

}




