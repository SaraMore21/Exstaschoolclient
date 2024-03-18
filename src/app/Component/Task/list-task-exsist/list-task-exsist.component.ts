import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';
import { ConvertDateToStringService } from './../../../Service/convert-date-to-string.service';
import { CourseService } from './../../../Service/course.service';
import { TaskExsist } from './../../../Class/task-exsist';
import { TaskExsistService } from './../../../Service/task-exsist.service';
import { TypeTaskService } from './../../../Service/type-task.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';
import { Task } from 'src/app/Class/task';
import { TypeTask } from 'src/app/Class/type-task';
import { SchoolService } from 'src/app/Service/school.service';
import { CheckTypeService } from 'src/app/Service/check-type.service';
import { TaskService } from 'src/app/Service/task.service';
import { UserService } from 'src/app/Service/user.service';
import { User } from 'src/app/Class/user';
import { TaskToStudentService } from 'src/app/Service/task-to-student.service';
import { TaskToStudent } from 'src/app/Class/task-to-student';
import { QuestionsOfTaskService } from 'src/app/Service/questions-of-task.service';
import { QuestionsOfTasks } from 'src/app/Class/questions-of-tasks';
import { StatusTaskPerformance } from 'src/app/Class/StatusTaskPerformance'
import { StatusTaskPerformanceService } from 'src/app/Service/status-task-performance.service'
import { SelectItem } from 'primeng/api';
@Component({
  selector: 'app-list-task-exsist',
  templateUrl: './list-task-exsist.component.html',
  styleUrls: ['./list-task-exsist.component.css'],
  providers: [MessageService, ConfirmationService]
})

export class ListTaskExsistComponent implements OnInit {

  data: Array<SelectItem>
  ADate: SelectItem
  constructor(private active: ActivatedRoute, public router: Router, public taskService: TaskService,
    public schoolService: SchoolService, public userService: UserService,
    private messageService: MessageService, public TypeTaskService: TypeTaskService, public TaskExsistService: TaskExsistService,public checkTypeService:CheckTypeService,
    private confirmationService: ConfirmationService, public CourseService: CourseService, public taskToStudentService: TaskToStudentService,
    public convertDateToStringService: ConvertDateToStringService, public GenericFunctionService: GenericFunctionService,
    private questionsOfTaskService: QuestionsOfTaskService, public statusTaskPerformanceService:StatusTaskPerformanceService,
    private ngxLoader:NgxUiLoaderService) { }


  TaskID: number = 0;
  CurrentTask: TaskExsist = new TaskExsist();
  displayModal: boolean = false;
  coordinator: any;
  course: any;
  dateSubmitA: string;
  dateSubmitB: string;
  dateSubmitC: string;
  isEdit: boolean = true;
  flagInvalid: boolean = false;
  oldPercents: number = 0;
  CurrentSchool: any;

  listTaskToStudent: Array<TaskToStudent>;
  ListStatusTaskP:Array<StatusTaskPerformance>;
  selectedStatus:StatusTaskPerformance;

  dialogVisible: boolean;
  //משתנה המייצג את השאלה הבחורה
  CurrentQuestion: QuestionsOfTasks;
  //משתנה המייצג מה להציג בדיאלוג צינוי התלמידות
  flag: boolean = false;
  //רשימת שאלונים למטלת אב
  ListQuestionsOfTasks: Array<QuestionsOfTasks>;
  //רשימת צינוי התלמידות לשאלה
  ListScoreStudent: any;
  //משתנה עזר המכיל את המטלה שנבחרה
  TaskEzer: TaskExsist;

  temp:StatusTaskPerformance;

  ngOnInit(): void {
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.active.params.subscribe(c => { this.TaskID = c["id"]})

    this.GetAllTaskExsistByTaskId();
    this.CurrentSchool = this.schoolService.ListSchool.find(f => f.school.idschool == this.taskService.ListTask.find(f => f.idtask == this.TaskID).schoolId)
    if (this.CurrentSchool.appYearbookPerSchools.find(f => f.idyearbookPerSchool == this.taskService.ListTask[0].yearBookId).yearbookId != this.schoolService.SelectYearbook.idyearbook)
      this.GenericFunctionService.GoBackToLastPage();


      this.statusTaskPerformanceService.GetAllStatusTaskPerformanceBySchoolId(this.CurrentSchool.school.idschool)
      .subscribe(data=>{
        this.ListStatusTaskP=data
        debugger

      },err=>console.log(err));

  }

  //שליפת כל המטלות
  GetAllTaskExsistByTaskId() {
    this.TaskExsistService.GetAllTaskExsistByTaskId(this.TaskID)
      .subscribe(data => { this.TaskExsistService.listTaskExsist = data
        for(let i=0; i<this.TaskExsistService.listTaskExsist.length;i++)
        {
            this.TaskExsistService.listTaskExsist[i].index=i+1
        }
      }, er => { })
  }

  //הוספת מטלה
  AddTask() {
    this.oldPercents = 0;
    debugger
    this.flagInvalid = false;
    this.CurrentTask = new TaskExsist();
    this.coordinator = undefined;
    this.course = undefined;
    this.dateSubmitA = '';
    this.dateSubmitB = '';
    this.dateSubmitC = '';
    this.displayModal = true;
    this.isEdit = false;

    this.CurrentTask.schoolId = this.CurrentSchool && this.CurrentSchool.school ? this.CurrentSchool.school.idschool : 0;

    if (this.CourseService.ListCourseByListSchoolAndYearbook == null || this.CourseService.ListCourseByListSchoolAndYearbook.length == 0 || this.CourseService.ListCourseByListSchoolAndYearbook[0].yearbookId != this.schoolService.SelectYearbook.idyearbook)
      this.CourseService.GetAllCourseBySchoolDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        this.CourseService.ListCourseByListSchoolAndYearbook = data;
        this.CourseService.ListCoursePerSY = new Array<any>();
        this.CourseService.ListCoursePerSY = this.CourseService.ListCourseByListSchoolAndYearbook.filter(f => f.schoolId == this.CurrentTask.schoolId)
      }, er => { })
    else if (this.CurrentTask && (this.CourseService.ListCoursePerSY == null || this.CourseService.ListCoursePerSY.length == 0 || this.CourseService.ListCoursePerSY[0].schoolId != this.CurrentTask.schoolId)) {
      this.CourseService.ListCoursePerSY = new Array<User>();
      this.CourseService.ListCoursePerSY = this.CourseService.ListCourseByListSchoolAndYearbook.filter(f => f.schoolId == this.CurrentTask.schoolId)
    }


    if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        debugger;
        this.userService.ListUserByListSchoolAndYerbook = data;
        this.userService.ListUserPerSY = new Array<User>();
        this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentTask.schoolId)
      }, er => { });
    else {
      if (this.CurrentTask && (this.userService.ListUserPerSY == null || this.userService.ListUserPerSY.length == 0 || this.userService.ListUserPerSY[0].schoolId != this.CurrentTask.schoolId)) {
        this.userService.ListUserPerSY = new Array<User>();
        this.userService.ListUserByListSchoolAndYerbook.forEach(f => {
          if (this.CurrentTask && f.schoolId == this.CurrentTask.schoolId)
            this.userService.ListUserPerSY.push(f);
        })
      }
    }
  }

  // עריכת מטלה
  EditDetailsTask(task: TaskExsist) {
    this.oldPercents = task.percents != null ? task.percents : 0;

    this.flagInvalid = false;

    this.CurrentTask = { ...task };
    this.isEdit = true;
    this.displayModal = true;
    if (this.CourseService.ListCourseByListSchoolAndYearbook == null || this.CourseService.ListCourseByListSchoolAndYearbook.length == 0 || this.CourseService.ListCourseByListSchoolAndYearbook[0].yearbookId != this.schoolService.SelectYearbook.idyearbook)
      this.CourseService.GetAllCourseBySchoolDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        this.CourseService.ListCourseByListSchoolAndYearbook = data;
        this.CourseService.ListCoursePerSY = new Array<any>();
        this.CourseService.ListCoursePerSY = this.CourseService.ListCourseByListSchoolAndYearbook.filter(f => f.schoolId == this.CurrentTask.schoolId)
        this.course = this.CourseService.ListCoursePerSY.find(f => f.idgroupSemesterPerCourse == this.CurrentTask.courseId);
      }, er => { })
    else if (this.CurrentTask && (this.CourseService.ListCoursePerSY == null || this.CourseService.ListCoursePerSY.length == 0 || this.CourseService.ListCoursePerSY[0].schoolId != this.CurrentTask.schoolId)) {
      this.CourseService.ListCoursePerSY = new Array<User>();
      this.CourseService.ListCoursePerSY = this.CourseService.ListCourseByListSchoolAndYearbook.filter(f => f.schoolId == this.CurrentTask.schoolId);
      this.course = this.CourseService.ListCoursePerSY.find(f => f.idgroupSemesterPerCourse == this.CurrentTask.courseId);
    }
    else {
      this.course = this.CourseService.ListCoursePerSY.find(f => f.idgroupSemesterPerCourse == this.CurrentTask.courseId);
    }

    if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        debugger;
        this.userService.ListUserByListSchoolAndYerbook = data;
        this.userService.ListUserPerSY = new Array<User>();
        this.userService.ListUserByListSchoolAndYerbook.forEach(f => {
          if (this.CurrentTask != null && f.schoolId == this.CurrentTask.schoolId)
            this.userService.ListUserPerSY.push(f);
        })
        this.coordinator = this.userService.ListUserPerSY.find(f => f.userPerSchoolID == this.CurrentTask.coordinatorId)

      }, er => { });
    else {
      if (this.CurrentTask && (this.userService.ListUserPerSY == null || this.userService.ListUserPerSY.length == 0 || this.userService.ListUserPerSY[0].schoolId != this.CurrentTask.schoolId)) {
        this.userService.ListUserPerSY = new Array<User>();
        this.userService.ListUserByListSchoolAndYerbook.forEach(f => {
          if (this.CurrentTask && f.schoolId == this.CurrentTask.schoolId)
            this.userService.ListUserPerSY.push(f);
        })
        this.coordinator = this.userService.ListUserPerSY.find(f => f.userPerSchoolID == this.CurrentTask.coordinatorId)
      }
      else
        this.coordinator = this.userService.ListUserPerSY.find(f => f.userPerSchoolID == this.CurrentTask.coordinatorId)

    }

    this.dateSubmitA = task.dateSubmitA != undefined ? this.convertDateToStringService.formatDate(new Date(task.dateSubmitA)) : undefined;
    this.dateSubmitB = task.dateSubmitB != undefined ? this.convertDateToStringService.formatDate(new Date(task.dateSubmitB)) : undefined;
    this.dateSubmitC = task.dateSubmitC != undefined ? this.convertDateToStringService.formatDate(new Date(task.dateSubmitC)) : undefined;

  }

  //בדיקת תקינות התאריכים בעת לחיצה על שמור
  CheckDates() {
    debugger
    // const nowDate = new Date(this.dateSubmitB);
    // var time = nowDate.getTime();

    let daA = this.dateSubmitA != undefined && this.dateSubmitA != '' ? new Date(this.dateSubmitA) : undefined;
    let daB = this.dateSubmitB != undefined && this.dateSubmitB != '' ? new Date(this.dateSubmitB) : undefined;
    let daC = this.dateSubmitC != undefined && this.dateSubmitC != '' ? new Date(this.dateSubmitC) : undefined;

    if (daA == undefined) {
      this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'חייב להיות לפחות מועד אחד להגשה ' });
      return;
    }
    if ((daC != undefined && daB == undefined || daA == undefined) || (daB != undefined && daA == undefined) || (daA != undefined && (daB != undefined && daA >= daB || daC != undefined && daA >= daC)) || (daB != undefined && daC != undefined && daB >= daC)) {
      this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'תאריכי המועדים צריכים להיות מסודרים בסדר עולה.' });
      return;
    }
    this.CurrentTask.dateSubmitA = daA;
    this.CurrentTask.dateSubmitB = daB;
    this.CurrentTask.dateSubmitC = daC;

    debugger;
    var x = new Date();
    x.setHours(daA.getHours(), daA.getMinutes(), daA.getSeconds(), daA.getMilliseconds());
    if (daA < x) {
      this.confirmationService.confirm({
        message: 'שימי ❤ כי התאריך חלף, האם ברצונך להמשיך?',
        header: 'אזהרה',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: ' כן',
        rejectLabel: ' ביטול',
        key: "myDialog",
        accept: () => {
          // this.confirmationService.close();
          this.CheckPresents();
        },
        reject: (type) => {
          if (type == ConfirmEventType.REJECT) {
            debugger;
            this.displayModal = false;
            this.CurrentTask = new TaskExsist();
            this.coordinator = null;
            this.course = null;
            this.flagInvalid = false;
          }

        }
      });
    }
    else {
      this.CheckPresents();
    }


  }

  //בדיקת סך האחוזים של הקורס שלא עולה על 100 ומתריע במידה וקטן מ-100
  CheckPresents() {
    if (this.isEdit) {

      if (this.CurrentTask.percents == null) this.CurrentTask.percents = 0;
      // if (this.CurrentTask.idexsistTask == null || this.CurrentTask.idexsistTask == 0) this.CurrentTask.percentsCourse = 0;
      if (this.CurrentTask.percents + this.CurrentTask.percentsCourse - this.oldPercents > 100) {
        this.confirmationService.confirm({
          message: 'סך האחוזים של מטלות לקורס זה גדול מ-100, אנא עדכני אחוזים שישלימו ל-100',
          header: 'אזהרה',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: ' הבנתי',
          rejectLabel: ' ביטול',
          key: "myDialog2",
          accept: () => {
            this.confirmationService.close();
          },
          reject: (type) => {
            if (type == ConfirmEventType.REJECT) {
              debugger;
              this.displayModal = false;
              this.CurrentTask = new TaskExsist();
              this.coordinator = null;
              this.course = null;
              this.flagInvalid = false;
            }

          }
        });
      }
      else if (this.CurrentTask.percents + this.CurrentTask.percentsCourse - this.oldPercents < 100) {
        this.confirmationService.confirm({
          message: 'שימי ❤ כי סך האחוזים של מטלות לקורס זה קטן מ-100, האם ברצונך להמשיך?',
          header: 'אזהרה',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: ' כן',
          rejectLabel: ' לא',
          key: "myDialog2",
          accept: () => {
            this.saveTask();
          },
          reject: (type) => {
            if (type == ConfirmEventType.REJECT) {
              debugger;
              this.displayModal = false;
              this.CurrentTask = new TaskExsist();
              this.coordinator = null;
              this.course = null;
              this.flagInvalid = false;
            }

          }
        });
      }
      else
        this.saveTask();
    }
    else
      this.saveTask();
  }

  //שמירת מטלה
  saveTask() {
    this.CurrentTask.courseId = this.course != undefined ? this.course.idgroupSemesterPerCourse : null;

    let i = this.TaskExsistService.listTaskExsist.findIndex(f => f.idexsistTask != this.CurrentTask.idexsistTask && this.CurrentTask.courseId != null && f.courseId == this.CurrentTask.courseId)
    if (i > -1) {
      this.messageService.add({ severity: 'error', summary: 'נתונים שגויים', detail: 'לא ניתן לשייך מטלה לקורס פעמיים ', sticky: true });
      return;
    }
    debugger;

    if (this.CurrentTask.idexsistTask != undefined && this.CurrentTask.idexsistTask != 0) {
      this.CurrentTask.userUpdatedId = this.CurrentSchool.userId;
      this.CurrentTask.dateUpdated = new Date();
    }
    else {
      this.CurrentTask.userCreatedId = this.CurrentSchool.userId;
      this.CurrentTask.dateCreated = new Date();
    }
    this.CurrentTask.coordinatorId = this.coordinator != undefined ? this.coordinator.userPerSchoolID : null;
    this.CurrentTask.taskId = this.TaskID;
    this.TaskExsistService.AddOrUpdate(this.CurrentTask.schoolId, this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentTask.schoolId).appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook).idyearbookPerSchool, this.CurrentTask)
      .subscribe(data => {
        debugger;


        if (data.item1 == 201 || data.item1 == 202) {
          this.messageService.add({ severity: 'error', summary: 'שימי 💕', detail: data.item2, sticky: true });
        }

        else if (data.item1 == 200 || data.item1 == 203) {

          if (this.CurrentTask.idexsistTask != 0 && this.CurrentTask.idexsistTask != undefined) {
            let i = this.TaskExsistService.listTaskExsist.findIndex(f => f.idexsistTask == this.CurrentTask.idexsistTask);
            if (i != undefined && i > -1)
              this.TaskExsistService.listTaskExsist[i] = data.item2;
            this.messageService.add({ key: "tc", severity: 'success', summary: 'העידכון הצליח', detail: 'המטלה עודכנה בהצלחה' });

          }
          else {
            this.TaskExsistService.listTaskExsist.push(data.item2);
            if (data.item1 == 203)
              this.messageService.add({ severity: 'info', summary: 'ההוספה הצליחה', detail: 'המטלה הוספה בהצלחה \n אך שימי לב כי סך האחוזים של המטלות לקורס זה קטן ממאה = ' + data.item3, sticky: true });
            else
              this.messageService.add({ key: "tc", severity: 'success', summary: 'ההוספה הצליחה', detail: 'המטלה הוספה בהצלחה' });

          }
          this.CurrentTask = new TaskExsist();
          this.coordinator = null;
          this.course = null;
          this.displayModal = false;

        }
      },
        er => {
          debugger
          // if (er.status == -1)
          //   this.messageService.add({ severity: 'error', summary: 'שימי 💕', detail: er.error, sticky: true });
          // else
          {
            this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'התרחשה שגיאה :(  אנא נסי שוב מאוחר יותר.', sticky: true });
            this.displayModal = false;
            this.CurrentTask = new TaskExsist();
            this.coordinator = null;
            this.course = null;
          }


        })
  }

  //מחיקת מטלה
  DeleteTask(task: TaskExsist,) {
    this.TaskExsistService.deleteTask(task.idexsistTask)
      .subscribe(
        data => {
          if (data == true) {
            this.messageService.add({ key: "tc", severity: 'success', summary: 'המחיקה הצליחה', detail: 'המטלה נמחקה בהצלחה' });
            let i = this.TaskExsistService.listTaskExsist.indexOf(task);
            if (i > -1)
              this.TaskExsistService.listTaskExsist.splice(i, 1);
          }
          else {
            debugger;
            this.confirmationService.confirm({
              message: 'אין אפשרות למחוק מטלה זו כיוון שיש תלמידות המשוייכות למטלה, האם ברצונכם למחוק את המטלה יחד עם השיוכים?',
              header: 'אזהרה',
              icon: 'pi pi-exclamation-triangle',
              acceptLabel: ' כן',
              rejectLabel: ' לא',
              key: "myDialog",
              accept: () => {
                this.TaskExsistService.deleteTask(task.idexsistTask, true).subscribe(
                  s => {
                    if (s == true) {
                      let i = this.TaskExsistService.listTaskExsist.indexOf(task);
                      if (i > -1)
                        this.TaskExsistService.listTaskExsist.splice(i, 1);
                      this.messageService.add({ key: "tc", severity: 'success', summary: 'המחיקה הצליחה', detail: 'המטלה נמחקה בהצלחה' });
                    }
                    else
                      this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'המחיקה נכשלה, אנא נסי שוב בעוד מספר דקות.' });

                  }
                  ,
                  er => { })
              },
              reject: (type) => {
                debugger;
                switch (type) {
                  case ConfirmEventType.REJECT || ConfirmEventType.CANCEL:
                    this.messageService.add({ severity: 'error', summary: 'בוטל', detail: 'המחיקה בוטלה' });
                    break;

                }
              }
            });

          }
        }
        , eror => {
          this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'המחיקה נכשלה ,אנא נסה שנית' });

        });
  }

  //דיאלוג לשאלה אם רוצה למחוק
  confirmDeleteFile(TaskExsist: TaskExsist) {
    this.confirmationService.confirm({
      message: 'האם הינך בטוח/ה כי ברצונך למחוק מטלה זו?',
      header: 'אזהרה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: ' מחק',
      rejectLabel: ' ביטול',
      key: "myDialog",
      accept: () => {
        this.DeleteTask(TaskExsist);
      },
      reject: (type) => {
        debugger;
        switch (type) {
          case ConfirmEventType.REJECT || ConfirmEventType.CANCEL:
            this.messageService.add({ severity: 'error', summary: 'בוטל', detail: 'המחיקה בוטלה' });
            break;

        }
      }
    });
  }

  //מעבר לתלמידות המשוייכות למטלה זו
  GoToListTaskToStudent(task: TaskExsist){
    debugger;
    let dates = [];
    task.dateSubmitA = new Date(task.dateSubmitA);
    dates.push({ moed: 'מועד א', date: task.dateSubmitA })
    // dates.push({ moed: 'מועד א, ', date: task.dateSubmitA.getDate() + '/' + (task.dateSubmitA.getMonth() + 1) + '/' + task.dateSubmitA.getFullYear() })
    if (task.dateSubmitB != undefined) {
      task.dateSubmitB = new Date(task.dateSubmitB);
      dates.push({ moed: 'מועד ב', date: task.dateSubmitB })
      if (task.dateSubmitC != undefined) {
        task.dateSubmitC = new Date(task.dateSubmitC);
        dates.push({ moed: 'מועד ג', date: task.dateSubmitC })
      }
    }
    dates.push({ moed: 'אחר', date: "" })
    this.TaskExsistService.SubmitedDate = dates;
    this.TaskExsistService.CurrentTaskExsist = task;
    this.router.navigate(['Home/ListTaskToStudent', task.idexsistTask,task.courseId]);
  }

  GoToDocumentsPerTaskExsist(task: TaskExsist) {
    this.TaskExsistService.NameTaskExsist = task.name;
    this.router.navigate(['Home/DocumentsPerTaskExsist', task.idexsistTask, task.schoolId, task.yearBookId]);
  }
  showDialogBasic(task: TaskExsist) {
    this.CurrentQuestion = null;
    if (this.taskService.ListQuestionsOfTasks == null || this.taskService.ListQuestionsOfTasks.length == 0)
      this.questionsOfTaskService.GetQuestionOfTask(this.taskService.CurrentTask.idtask).subscribe(data => {
        debugger;
        this.taskService.ListQuestionsOfTasks = data.sort((a, b) => a.number - b.number);
        this.ListQuestionsOfTasks = [...this.taskService.ListQuestionsOfTasks];
        var q = new QuestionsOfTasks();
        q.name = "ציון סופי"; q.number = 0;
        this.ListQuestionsOfTasks.push(q);
      }, er => { });
    else {
      if (this.ListQuestionsOfTasks == null || this.ListQuestionsOfTasks.length == 0) {
        this.ListQuestionsOfTasks = [...this.taskService.ListQuestionsOfTasks];
        if (this.ListQuestionsOfTasks.find(f => f.number == 0) == null) {
          var q = new QuestionsOfTasks();
          q.name = "ציון סופי"; q.number = 0;
          this.ListQuestionsOfTasks.push(q);
        }
      }
    }
    this.TaskEzer = task;
    if (this.taskService.CurrentTask.typeOfTaskCalculationId == 2) {
      this.flag = true;
    }
    else
      this.showDialog();

  }
  //פתיחת דיאלוג עריכת ציוני התלמידות במטלה
  showDialog() {
    this.flag = false;
    this.dialogVisible = true;
    if (this.CurrentQuestion == null || this.CurrentQuestion.number == 0)
      this.GetAllTaskToStudentByTaskExsistId(this.TaskEzer.idexsistTask);
    else
      this.GetScoreStudentInQuestionOfTask();
  }
  //שליפת כל המטלות
  GetAllTaskToStudentByTaskExsistId(TaskExsistId: number) {
    this.taskToStudentService.GetAllTaskToStudentByTaskExsistID(this.CurrentSchool.school.idschool, this.CurrentSchool.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook).idyearbookPerSchool, TaskExsistId)
      .subscribe(data => {
        debugger;
        this.listTaskToStudent = data
        // this.listTaskToStudent.forEach(s=>s.statusTaskPerformance.id=s.statusTaskPerformanceId)
      }, er => { })
  }
  //שמירת ציוני התלמידות במטלה
  SaveEditScoreToStudents() {
    this.ngxLoader.start()
   debugger
    this.listTaskToStudent.forEach(s=>s.statusTaskPerformanceId=s.statusTaskPerformance.id)
    if (this.CurrentQuestion==null||this.CurrentQuestion.number == 0)
      this.taskToStudentService.EditScoreToStudents(this.listTaskToStudent).subscribe(data => {
        debugger;
        this.ngxLoader.stop()
        this.messageService.add({ key: "tc", severity: 'success', summary: 'העידכון הצליח', detail: 'ציוני התלמידות עודכנו בהצלחה' });
      }, er => { this.ngxLoader.stop()
        this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'ארעה שגיאה ,אנא נסה שנית' }); })
    else
      this.taskToStudentService.EditScoreQuestionToStudents(this.ListScoreStudent).subscribe(data => {
        debugger;
        if (data != null) {
          this.ngxLoader.stop()
          this.messageService.add({ key: "tc", severity: 'success', summary: 'העריכה הצליחה', detail: 'ציוני שאלה '+this.CurrentQuestion.number+','+this.CurrentQuestion.name+ ' נערכו בהצלחה ' });
          this.ListScoreStudent = data;
        }
        else{
          this.ngxLoader.stop()
          this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'ארעה שגיאה ,אנא נסה שנית' });

        }
      }, er => { })
  }
  //שליפת ציונוי התלמידות לשאלה מסויימת במטלה
  GetScoreStudentInQuestionOfTask() {
    this.taskToStudentService.GetScoreStudentInQuestionOfTask(this.CurrentQuestion.idquestionOfTask).subscribe(data => {
      debugger;
      this.ListScoreStudent = data;
    }, er => { })
  }

  show(taskToStudent:any){
    taskToStudent.show=true
  }
  exportExcel() {
    debugger;
   //var fileName=this.data.find(f=>f.value==this.ADate).label;

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.TaskExsistService.listTaskExsist);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "listTaskExsist");
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
