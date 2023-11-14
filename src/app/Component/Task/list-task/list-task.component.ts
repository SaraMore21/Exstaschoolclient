import { GenericFunctionService } from './../../../Service/generic-function.service';
import { TypeTask } from './../../../Class/type-task';
import { TypeTaskService } from './../../../Service/type-task.service';
import { UserService } from './../../../Service/user.service';
import { Task } from '../../../Class/task';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SchoolService } from 'src/app/Service/school.service';
import { TaskService } from 'src/app/Service/task.service';
import { ConfirmationService, ConfirmEventType, MessageService, PrimeNGConfig } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { School } from 'src/app/Class/school';
import { User } from 'src/app/Class/user';
import { CheckType } from 'src/app/Class/check-type';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { QuestionsOfTasks } from 'src/app/Class/questions-of-tasks';
import { TypeOfTaskCalculation } from 'src/app/Class/type-of-task-calculation'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { QuestionsOfTaskService } from 'src/app/Service/questions-of-task.service';
import { CheckTypeService } from 'src/app/Service/check-type.service';
import * as XLSX from 'xlsx';
import { SelectItem } from 'primeng/api';
@Component({
  selector: 'app-list-task',
  templateUrl: './list-task.component.html',
  styleUrls: ['./list-task.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, DatePipe, ConfirmationService]

})
export class ListTaskComponent implements OnInit {
  data: Array<SelectItem>
  ADate: SelectItem
  constructor(public taskService: TaskService, public schoolService: SchoolService, public userService: UserService,
    private messageService: MessageService, public TypeTaskService: TypeTaskService, public questionsOfTaskService: QuestionsOfTaskService, public router: Router,
    private confirmationService: ConfirmationService, private GenericFunctionService: GenericFunctionService,public checkTypeService:CheckTypeService) { }

  CurrentTask: Task = new Task();
  
  displayModal: boolean = false;
  coordinator: any;
  typeTask: any;
  checkType:any;
  typeOfTaskCalculation: any;
  CurrentSchool: any;
  //האם להציג את הכפתור של פתיחת מטלה למוסדות תואמים -כלומר זה לקוח שיש לו מוסדות תואמים
  isCoordinationSchools: boolean = false;
  //אוביקט לשמירת הקוד תאום הנבחר
  CoordinationCode: string = '';
  //רשימת כל הקודי תאום של הלקוח
  listCoordinationsCode: Array<string> = new Array<string>();
  //אוביקט לציון האם הטופס שמולא תקין - ובאם לא בלחיצה על שמור יוצגו השדות הלא תקינים
  flagInvalid: boolean = false;
  //משתנה לסימון האם בחרו לפתוח מטלה למוסד או לכמה מוסדות בעלי קוד תאום זהה.
  isCoordinationOrSchool: boolean = false;
  //משתנה המסמל האם הליסט של היוזרים הוא של כמה מוסדות או לא.
  IsListUserOfCoordinationCode: boolean = false;
  //ליסט לשמירה של האחראי מטלה
  ListUserOfCoordinationCode: Array<User> = new Array<User>();
  //האם להציג אאת הדיאלוג של  הצגה המוסדות אליהם הצטרף משתמש בעקבות פתיחת לה למוסדות תואמים
  DisplayModelTheNewUsersToCustomer: boolean = false;
  stringNewUsers: string = "";


  ngOnInit(): void {
    
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    // if (this.taskService.ListTask == undefined || this.taskService.ListTask.length == 0)
    this.GetAllTaskBySchoolId();
    debugger
    this.checkTypeService.GetAll().subscribe(d=>this.checkTypeService.ListCheckType=d)
   
    if (this.schoolService.IsCustomer) {
      let i = this.schoolService.ListSchool.findIndex(f => f.school.coordinationCode != undefined);
      if (i > -1) {
        this.isCoordinationSchools = true;
        this.schoolService.ListSchool.forEach(f => { if (f.school.coordinationCode != undefined) this.listCoordinationsCode.push(f.school.coordinationCode) });
        this.listCoordinationsCode = this.listCoordinationsCode.filter((n, i) => this.listCoordinationsCode.indexOf(n) === i);
        //  console.dir( this.listCoordinationsCode);

      }
    }

  }

  GetAllTaskBySchoolId() {
    this.taskService.GetAllTaskBySchoolId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook)
      .subscribe(data => { this.taskService.ListTask = data; 
        for(let i=0; i<this.taskService.ListTask.length;i++)
        {
            this.taskService.ListTask[i].index=i+1
        }
      }, er => { });
  }

  AddTask() {
    debugger;
    this.taskService.ListQuestionsOfTasks = new Array<QuestionsOfTasks>();
    this.CurrentTask = new Task();
    this.coordinator = undefined;
    this.typeTask = new TypeTask();
    this.checkType = new CheckType();
    this.typeOfTaskCalculation = new TypeOfTaskCalculation();
    this.displayModal = true;
    this.CurrentSchool = null;
    this.isCoordinationOrSchool = false;
    this.CoordinationCode = null;
    if (this.schoolService.ListSchool.length == 1) {
      this.CurrentSchool = this.schoolService.ListSchool[0];
      this.ChangeSchool();
    }

  }

  EditDetailsTask(task: Task,event:Event=null) {
    this.taskService.ListQuestionsOfTasks = new Array<QuestionsOfTasks>();
    this.isCoordinationOrSchool = false;
    this.CurrentTask = { ...task };
    if (this.CurrentSchool == null)
      this.CurrentSchool = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentTask.schoolId);
    // if (this.TypeTaskService.ListTypeTask == undefined || this.TypeTaskService.ListTypeTask.length == 0)
    //   this.TypeTaskService.GetAllTypeTaskBySchoolId(this.CurrentTask.schoolId, this.schoolService.SelectYearbook.idyearbook)
    //     .subscribe(data => {
    //       this.TypeTaskService.ListTypeTask = data;
    //       this.typeTask = this.TypeTaskService.ListTypeTask.find(f => f.idtypeTask == this.CurrentTask.typeTaskId);
    //     }, er => { })
    // else
    this.typeTask = this.schoolService.TypeTask.find(f => f.value == this.CurrentTask.typeTaskId);
    this.typeOfTaskCalculation = this.schoolService.TypeOfTaskCalculations.find(f => f.value == this.CurrentTask.typeOfTaskCalculationId);
    if (this.CurrentTask.typeOfTaskCalculationId == 2)
      this.questionsOfTaskService.GetQuestionOfTask(this.CurrentTask.idtask).subscribe(data => {
        this.taskService.ListQuestionsOfTasks = data.sort((a, b) => a.number - b.number);
      }, er => { });

    if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        debugger;
        this.userService.ListUserByListSchoolAndYerbook = data;
        this.ListUserOfCoordinationCode = new Array<User>();
        this.userService.ListUserByListSchoolAndYerbook.forEach(f => {
          if (this.CurrentTask != null && f.schoolId == this.CurrentTask.schoolId)
            this.ListUserOfCoordinationCode.push(f);
        });
        this.coordinator = this.ListUserOfCoordinationCode.find(f => f.userPerSchoolID == this.CurrentTask.coordinatorId);

      }, er => { });
    else {
      if (this.IsListUserOfCoordinationCode == true || (this.CurrentTask && (this.ListUserOfCoordinationCode == null || this.ListUserOfCoordinationCode.length == 0 || this.ListUserOfCoordinationCode[0].schoolId != this.CurrentTask.schoolId))) {
        this.ListUserOfCoordinationCode = new Array<User>();
        this.userService.ListUserByListSchoolAndYerbook.forEach(f => {
          if (this.CurrentTask && f.schoolId == this.CurrentTask.schoolId)
            this.ListUserOfCoordinationCode.push(f);
        });
        this.coordinator = this.ListUserOfCoordinationCode.find(f => f.userPerSchoolID == this.CurrentTask.coordinatorId);
      }
      else
        this.coordinator = this.ListUserOfCoordinationCode.find(f => f.userPerSchoolID == this.CurrentTask.coordinatorId);

    }

    // this.CurrentTask.coondinator=this.userService.ListUser.find(f=> f.iduserPerSchool== this.CurrentTask.coordinatorId)
    this.displayModal = true;
    this.IsListUserOfCoordinationCode = false;

    if (event!=null)
    event.stopPropagation();

  }

  DeleteTask(task: Task) {
    this.taskService.deleteTask(task.schoolId, this.schoolService.SelectYearbook.idyearbook, task.idtask)
      .subscribe(
        data => {
          if (data == true) {
            this.messageService.add({ key: "tc", severity: 'success', summary: 'המחיקה הצליחה', detail: 'המטלה נמחקה בהצלחה' });
            let i = this.taskService.ListTask.indexOf(task);
            if (i > -1) {
              this.taskService.ListTask.splice(i, 1);
              this.taskService.ListTask = [...  this.taskService.ListTask]
            }

          }
          else {
            debugger;
            this.messageService.add({ severity: 'warn', summary: 'המחיקה בוטלה', detail: ' אין אפשרות למחוק מטלה זו כיוון שיש מטלות שמשוייכות אליה' });

          }
        }
        , eror => {
          this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'המחיקה נכשלה ,אנא נסה שנית' });

        });
    
  }

  //אם זו מטלה שנפתחה ע"י לקוח וגם נכנסו כעת כלקוח.
  CheckIfCustomerAndTaskOpenByCustomer() {
    debugger;

    if (this.schoolService.IsCustomer == true && this.CurrentTask != null && this.CurrentTask.idtask != null && this.CurrentTask.uniqueCodeId != null && this.taskService.ListTask.findIndex(f => f.uniqueCodeId == this.CurrentTask.uniqueCodeId && this.CurrentTask.idtask != f.idtask) > -1) {
      this.confirmationService.confirm({
        message: 'מטלה זו נפתחה למוסדות נוספים, האם ברצונכם לערוך את המטלה בכל המוסדות או רק את המטלה הזו?',
        header: 'שימי ♥',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: ' ערוך מטלה זו בלבד',
        rejectLabel: ' ערוך את כל המטלות',
        accept: () => {
          this.SaveTask();
        },
        reject: (type) => {
          debugger;
          switch (type) {
            case ConfirmEventType.REJECT || ConfirmEventType.CANCEL:
              // this.messageService.add({ severity: 'error', summary: 'בוטל', detail: 'המחיקה בוטלה' });
              // break;
              this.isCoordinationOrSchool = true;
              this.SaveTask();


          }
        }
      });
    }
    else
      this.SaveTask();
  }

  SaveTask() {
    debugger;
    // אם צריך לבחור מוסד או קוד תאום והוא עוד לא בחר ולחץ על שמור - הקפצת הדיב של שדה חובה
    if ((this.isCoordinationOrSchool == true && (this.CurrentTask.idtask == null || this.CurrentTask.idtask == 0) && (this.CoordinationCode == undefined || this.CoordinationCode == '') ||
      (this.isCoordinationOrSchool == false && (this.CurrentTask == null || this.CurrentTask.idtask == undefined || this.CurrentTask.idtask == 0) &&
        (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length > 1 && (this.CurrentSchool == null || this.CurrentSchool.school == null ||
          this.CurrentSchool.school.idschool == null || this.CurrentSchool.school.idschool == 0))))) {
      this.flagInvalid = true;
      return;
    }
    //#region בדיקות תקינות
    if (this.typeOfTaskCalculation.value == 2) {
      if (this.taskService.ListQuestionsOfTasks == null || this.taskService.ListQuestionsOfTasks.length == 0) {
        this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'חייב להיות לפחות שאלה אחת' }); return;
      }
      if (this.taskService.ListQuestionsOfTasks.find(f => f.name == null || f.name == '' || f.percent == null) != null) {
        this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'אחד או יותר מהנתונים רייק' }); return;
      }

      var sum = this.taskService.ListQuestionsOfTasks.reduce((sum, current) => sum + current.percent, 0);
      if (sum != 100) {
        this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'סך אחוזי השאלות שונה מ-100' });
        return;
      }
    }
    //#endregion
    this.displayModal = false;
    if (this.isCoordinationOrSchool == false) {
      if (this.CurrentTask.idtask != undefined && this.CurrentTask.idtask != 0) {
        this.CurrentTask.userUpdatedId = this.CurrentSchool.userId;
        this.CurrentTask.dateUpdate = new Date();
      }
      else {
        this.CurrentTask.userCreatedId = this.CurrentSchool.userId;
        this.CurrentTask.dateCreated = new Date();
      }
      this.taskService.ListQuestionsOfTasks.forEach(f => {
        f.idquestionOfTask == 0 || f.idquestionOfTask == null ? (f.UserCreatedId = this.CurrentSchool.userId, f.DateCreated = new Date()) :
          (f.UserUpdatedId = this.CurrentSchool.userId, f.DateUpdate = new Date());
      });

      this.CurrentTask.schoolId = this.CurrentTask.idtask == null ? this.CurrentSchool.school.idschool : this.CurrentTask.schoolId;
      var yearbook = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentTask.schoolId).appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook);
      this.CurrentTask.coordinatorId = this.coordinator != undefined ? this.coordinator.userPerSchoolID : null;
    }
    else {
      this.CurrentTask.coordinatorId = this.coordinator != undefined ? this.coordinator.iduser : null;
    }
    this.CurrentTask.typeTaskId = this.typeTask != undefined ? this.typeTask.value : null;
    this.CurrentTask.checkTypeId = this.checkType != undefined ? this.checkType.idcheckType : null;
    this.CurrentTask.typeOfTaskCalculationId = this.typeOfTaskCalculation != undefined ? this.typeOfTaskCalculation.value : null;
    this.CurrentTask.ListQuestion = this.taskService.ListQuestionsOfTasks;

    if (this.isCoordinationOrSchool == true) {
      this.AddOrUpdateTasksOfSpecificCodeByCustomer();
    }
    else {
      this.taskService.AddOrUpdate(this.CurrentTask.schoolId, yearbook.idyearbookPerSchool, this.CurrentTask)
        .subscribe(data => {
          debugger;
          if (data == null)
            this.messageService.add({ key: "tc", severity: 'error', summary: 'העידכון נכשל', detail: 'לא ניתן לערוך מטלה שישנם ציונים המשוייכים אליה, במידת הצורך יש לפתוח מטלה חדשה' });
          else {
            data.schoolName = this.schoolService.ListSchool.find(f => f.school.idschool == data.schoolId).school.name;
            if (this.CurrentTask.idtask != 0 && this.CurrentTask.idtask != undefined) {
              let i = this.taskService.ListTask.findIndex(f => f.idtask == this.CurrentTask.idtask);
              if (i != undefined && i > -1) {
                this.taskService.ListTask[i] = data;
                this.taskService.ListTask = [... this.taskService.ListTask];
              }
              this.messageService.add({ key: "tc", severity: 'success', summary: 'העידכון הצליח', detail: 'המטלה עודכנה בהצלחה' });

            }
            else {
              this.taskService.ListTask.push(data);
              this.messageService.add({ key: "tc", severity: 'success', summary: 'ההוספה הצליחה', detail: 'המטלה הוספה בהצלחה' });
            }
            this.CurrentTask = new Task();
            this.coordinator = null;
            this.typeTask = null;
          }
        },
          er => {
            this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'העידכון נכשל ,אנא נסה שנית', sticky: true });
            this.displayModal = false;
            this.CurrentTask = new Task();
            this.coordinator = null;
            this.typeTask = null;
          });
    }

  }

  GoToListTaskExsist(task: Task) {
    debugger;
    this.taskService.CurrentTask = task;
    this.router.navigate(['Home/ListTaskExsist', task.idtask]);
  }

  GoToDocumentsPerTask(task: Task) {
    if (task.uniqueCodeId == null)
      task.uniqueCodeId = 0;
    this.taskService.nameTask = task.name;
    this.router.navigate(['Home/DocumentsPerTask', task.idtask, task.schoolId, task.uniqueCodeId]);
  }

  //דיאלוג לשאלה אם רוצה למחוק
  confirmDeleteFile(task: Task,event:Event) {
    debugger;
    this.confirmationService.confirm({
      message: 'האם הינך בטוח/ה כי ברצונך למחוק מטלה זו?',
      header: 'אזהרה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: ' מחק',
      rejectLabel: ' ביטול',
      accept: () => {
        this.DeleteTask(task);
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
    if (event!=null)
    event.stopPropagation();
  }

  ChangeSchool() {
    // if (this.TypeTaskService.ListTypeTask == undefined || this.TypeTaskService.ListTypeTask.length == 0 || this.TypeTaskService.ListTypeTask[0].SchoolId != this.CurrentSchool.school.idschool)
    //   this.TypeTaskService.GetAllTypeTaskBySchoolId(this.CurrentSchool.school.idschool, this.schoolService.SelectYearbook.idyearbook)
    //     .subscribe(data => { this.TypeTaskService.ListTypeTask = data; }, er => { });

    if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        debugger;
        this.userService.ListUserByListSchoolAndYerbook = data;
        this.ListUserOfCoordinationCode = new Array<User>();
        this.userService.ListUserByListSchoolAndYerbook.forEach(f => {
          if (this.CurrentSchool && this.CurrentSchool.school && f.schoolId == this.CurrentSchool.school.idschool)
            this.ListUserOfCoordinationCode.push(f);
        });
      }, er => { });
    else {
      if (this.IsListUserOfCoordinationCode == true || (this.CurrentSchool && this.CurrentSchool.school && (this.ListUserOfCoordinationCode == null || this.ListUserOfCoordinationCode.length == 0 || this.ListUserOfCoordinationCode[0].schoolId != this.CurrentSchool.school.idschool))) {
        this.ListUserOfCoordinationCode = new Array<User>();
        this.userService.ListUserByListSchoolAndYerbook.forEach(f => {
          if (this.CurrentSchool && this.CurrentSchool.school && f.schoolId == this.CurrentSchool.school.idschool)
            this.ListUserOfCoordinationCode.push(f);
        });
      }
    }
    this.IsListUserOfCoordinationCode = false;

  }

  AddOrUpdateTasksOfSpecificCodeByCustomer() {
    debugger;
    if (this.CoordinationCode == "" || this.CoordinationCode == null)
      this.CoordinationCode = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentTask.schoolId)?.school.coordinationCode;
    var object = new ObjectWithTaskAndListSchools();
    object.TaskDTO = this.CurrentTask;
    object.ListSchool = this.schoolService.ListSchool.filter(f => f.school.coordinationCode == this.CoordinationCode);
    this.taskService.AddOrUpdateTasksOfSpecificCodeByCustomer(this.schoolService.SelectYearbook.idyearbook, object, this.schoolService.CustomerId)
      .subscribe(data => {
        debugger;
        if (data.item4 == -1)
          this.messageService.add({ key: "tc", severity: 'error', summary: 'העידכון נכשל', detail: 'לא ניתן לערוך מטלה שישנם ציונים המשוייכים אליה, במידת הצורך יש לפתוח מטלה חדשה' });
        else {
          this.taskService.ListTask = this.taskService.ListTask.filter(f => object.ListSchool.findIndex(d =>
            d.school.idschool == f.schoolId) == -1);

          this.taskService.ListTask = this.taskService.ListTask.concat(data.item1);
          this.taskService.ListTask = [... this.taskService.ListTask]
          if (this.CurrentTask != null && (this.CurrentTask.idtask == 0 || this.CurrentTask.idtask == null))
            this.messageService.add({ key: "tc", severity: 'success', summary: 'ההוספה הצליחה', detail: 'המטלות נוספו בהצלחה' });
          else
            this.messageService.add({ key: "tc", severity: 'success', summary: 'העידכון הצליח', detail: 'המטלות עודכנו בהצלחה' });

          //אם נפתחו משתמשים חדשים כיוון שבחרו משתמש שאינו מופיע בכל המוסדות
          if (data.item2 != null && data.item2.length > 0) {
            //הוספת המשתמשים החדשים לליסט הכללי
            this.userService.ListUserByListSchoolAndYerbook = this.userService.ListUserByListSchoolAndYerbook.concat(data.item2);
            //הוספה לליסט המוצג בעריכת או הוספת מטלה
            this.ListUserOfCoordinationCode = this.ListUserOfCoordinationCode.concat(data.item2);
            if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY.length > 0)
              this.userService.ListUserPerSY = this.userService.ListUserPerSY.concat(data.item2.filter(f => f.schoolId == this.userService.ListUserPerSY[0].schoolId));
            this.stringNewUsers = 'שימי לב כי המשתמש הנבחר אינו הופיע בכל המוסדות המשוייכים לקוד תאום הנבחר \n ולכן נפתח משתמש זה למוסדות ההבאים : \n';
            data.item2.forEach(element => {
              this.stringNewUsers += element.schoolName + '\n';
            });
            this.DisplayModelTheNewUsersToCustomer = true;
          }
          //עידכון הקוד תאום לכל היוזר פר סקול של היוזר הנבחר
          if (data.item4 != null && data.item4 > 0) {

            if (this.ListUserOfCoordinationCode != null)
              this.ListUserOfCoordinationCode.forEach(fo => {
                if (fo.iduser == this.CurrentTask.coordinatorId && this.schoolService.ListSchool.findIndex(f => f.school.idschool == fo.schoolId) > -1)
                  fo.uniqueCodeId = data.item4;
              })

            if (this.userService.ListUserByListSchoolAndYerbook != null)
              this.userService.ListUserByListSchoolAndYerbook.forEach(fo => {
                if (fo.iduser == this.CurrentTask.coordinatorId && this.schoolService.ListSchool.findIndex(f => f.school.idschool == fo.schoolId) > -1)
                  fo.uniqueCodeId = data.item4;
              })
            if (this.userService.ListUserPerSY != null)
              this.userService.ListUserPerSY.forEach(fo => {
                if (fo.iduser == this.CurrentTask.coordinatorId && this.schoolService.ListSchool.findIndex(f => f.school.idschool == fo.schoolId) > -1)
                  fo.uniqueCodeId = data.item4;
              })

          }
        }
      }, er => { debugger; });

    this.isCoordinationOrSchool = false;

  }

  AddTaskToCoordinationScools() {
    debugger;
    this.taskService.ListQuestionsOfTasks = new Array<QuestionsOfTasks>();
    this.CoordinationCode = undefined;
    this.CurrentTask = new Task();
    this.coordinator = undefined;
    this.typeTask = new TypeTask();
    this.typeOfTaskCalculation = new TypeOfTaskCalculation();
    this.displayModal = true;
    this.CurrentSchool = null;
    this.isCoordinationOrSchool = true;
    if (this.listCoordinationsCode.length == 1) {
      this.CoordinationCode = this.listCoordinationsCode[0];
      this.SetListUserToCoordinationScools();
    }
  }

  SetListUserToCoordinationScools() {
    if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        debugger;
        this.userService.ListUserByListSchoolAndYerbook = data;
        this.ListUserOfCoordinationCode = new Array<User>();
        this.userService.ListUserByListSchoolAndYerbook.forEach(e => {
          if (this.schoolService.ListSchool.findIndex(f => f.school.coordinationCode == this.CoordinationCode && e.schoolId == f.school.idschool) > -1)
            this.ListUserOfCoordinationCode.push(e);
        });
        this.ListUserOfCoordinationCode = this.GenericFunctionService.uniqueBy(this.ListUserOfCoordinationCode, (o1, o2) => o1.iduser === o2.iduser);
      }, er => { });
    else {
      //אם זה הליסט ריק או שמלא לא בליסט של הקוד תאום
      if (this.ListUserOfCoordinationCode == null || this.ListUserOfCoordinationCode.length == 0 || this.IsListUserOfCoordinationCode == false || this.schoolService.ListSchool.findIndex(f => f.school.coordinationCode == this.CoordinationCode && this.ListUserOfCoordinationCode[0].schoolId == f.school.idschool) == -1) {
        // this.ListUserOfCoordinationCode.sort((a, b) => a.schoolId - b.schoolId);
        // if (this.ListUserOfCoordinationCode[0].schoolId != this.ListUserOfCoordinationCode[this.ListUserOfCoordinationCode.length - 1].schoolId)
        // return;

        // console.log('filter');
        this.ListUserOfCoordinationCode = new Array<User>();
        this.userService.ListUserByListSchoolAndYerbook.forEach(e => {
          if (this.schoolService.ListSchool.findIndex(f => f.school.coordinationCode == this.CoordinationCode && e.schoolId == f.school.idschool) > -1)
            this.ListUserOfCoordinationCode.push(e);
        });
        this.ListUserOfCoordinationCode = this.GenericFunctionService.uniqueBy(this.ListUserOfCoordinationCode, (o1, o2) => o1.iduser === o2.iduser);

      }
      this.IsListUserOfCoordinationCode = true;

    }
  }
  //בעת שינוי סוג חישוב מטלה
  ChangeTypeOfTaskCalculation() {
    // ---להמשיך מפה
    if (this.typeOfTaskCalculation.value == 2) {
      if (this.taskService.ListQuestionsOfTasks.length == 0)
        this.newQuestion();
    }
    else
      this.taskService.ListQuestionsOfTasks = new Array<QuestionsOfTasks>();
  }
  newQuestion() {
    debugger;
    var newQuestion = new QuestionsOfTasks();
    // newQuestion.number = this.ListQuestionsOfTasks.length + 1;
    this.taskService.ListQuestionsOfTasks.push(newQuestion);
  }
  DeleteQuestion(index: number) {
    debugger;
    // var i = this.ListQuestionsOfTasks.findIndex(i => i.number == question.number);
    this.taskService.ListQuestionsOfTasks.splice(index, 1);
  }
  exportExcel() {
    debugger;
   //var fileName=this.data.find(f=>f.value==this.ADate).label;

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.taskService.ListTask);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "listTask");
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

export class ObjectWithTaskAndListSchools {

  constructor(
    public TaskDTO?: Task,
    public ListSchool?: any
  ) {

  }

  
}



