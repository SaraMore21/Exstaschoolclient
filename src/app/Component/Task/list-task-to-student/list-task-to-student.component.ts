import { GenericFunctionService } from 'src/app/Service/generic-function.service';
import { TaskExsistService } from './../../../Service/task-exsist.service';
import { StudentService } from './../../../Service/student.service';
import { TaskToStudent } from './../../../Class/task-to-student';
import { TaskToStudentService } from './../../../Service/task-to-student.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchoolService } from 'src/app/Service/school.service';
import { UserService } from 'src/app/Service/user.service';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { ConvertDateToStringService } from 'src/app/Service/convert-date-to-string.service';
import { User } from 'src/app/Class/user';
import { TaskService } from 'src/app/Service/task.service';
import { SelectItem } from 'primeng/api';
@Component({
  selector: 'app-list-task-to-student',
  templateUrl: './list-task-to-student.component.html',
  styleUrls: ['./list-task-to-student.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class ListTaskToStudentComponent implements OnInit {

  data: Array<SelectItem>
  ADate: SelectItem
  constructor(private active: ActivatedRoute, public TaskToStudentService: TaskToStudentService, public schoolService: SchoolService, public userService: UserService,
    private messageService: MessageService, public router: Router, public taskService: TaskService,
    private confirmationService: ConfirmationService, public convertDateToStringService: ConvertDateToStringService, public studentService: StudentService
    , public TaskExsistService: TaskExsistService, public GenericFunctionService: GenericFunctionService) { }

  TaskExsistID: number = 0;
  CurrentTask: TaskToStudent = new TaskToStudent();
  displayModal: boolean = false;
  // listTaskToStudent: Array<TaskToStudent> = new Array<TaskToStudent>();
  listTaskToStudentSpecific: Array<TaskToStudent> = new Array<TaskToStudent>();
  dateNeedSubmit: any;
  dateSubmit: string;
  flagInvalid: boolean = false;
  Student: any;
  Status: any;
  PaymentMethod1: any;
  ReceivePayment: any;
  DisplayDate: boolean = false;
  dateNeed: string;
  changeIsActive: boolean = false;
  indexStudent: number = -1;
  VisibleTable: boolean = true;
  CurrentSchool: any;
  selectedProduct: any;
  courseID:number=0;
  ngOnInit(): void {
    debugger
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    this.active.params.subscribe(c => { this.TaskExsistID = c["id"] ,this.courseID=c["courseId"]})
    debugger;
    this.CurrentSchool = this.schoolService.ListSchool.find(f => f.school.idschool == this.TaskExsistService.listTaskExsist.find(f => f.idexsistTask == this.TaskExsistID).schoolId)
    if (this.CurrentSchool.appYearbookPerSchools.find(f => f.idyearbookPerSchool == this.taskService.ListTask[0].yearBookId).yearbookId != this.schoolService.SelectYearbook.idyearbook)
      this.GenericFunctionService.GoBackToLastPage();
    this.GetAllTaskToStudentByTaskExsistId();
  }

  //שליפת כל המטלות
  GetAllTaskToStudentByTaskExsistId() {
    debugger
    this.TaskToStudentService.GetAllTaskToStudentByTaskExsistID(this.CurrentSchool.school.idschool, this.CurrentSchool.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook).idyearbookPerSchool, this.TaskExsistID) 
      .subscribe(data => { this.TaskToStudentService.listTaskToStudent = data
        debugger
      }, er => { })
  }

  //הוספת מטלה
  AddTask() {
    if (this.studentService.ListStudent == null || this.studentService.ListStudent.length == 0 || this.studentService.YearbookIdPerStudent != this.schoolService.SelectYearbook.idyearbook)
      this.studentService.GetListStudentsBySchoolIdAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook)
        .subscribe(data => {
          debugger; this.studentService.ListStudent = data;
          this.studentService.ListStudentPerSY = this.studentService.ListStudent.filter(f => f.schoolId == this.CurrentSchool.school.idschool);
        }, er => { debugger; console.log(er) });
    else if (this.studentService.ListStudentPerSY == null || this.studentService.ListStudentPerSY.length == 0 || this.studentService.ListStudentPerSY[0].schoolId != this.CurrentSchool.school.idschool)
      this.studentService.ListStudentPerSY = this.studentService.ListStudent.filter(f => f.schoolId == this.CurrentSchool.school.idschool);

    if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        debugger;
        this.userService.ListUserByListSchoolAndYerbook = data;
        this.userService.ListUserPerSY = new Array<User>();
        this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentSchool.school.idschool);
      }, er => { });
    else if ((this.CurrentSchool && this.CurrentSchool.school) && (this.userService.ListUserPerSY == null || this.userService.ListUserPerSY[0].schoolId != this.CurrentSchool.school.idschool)) {
      this.userService.ListUserPerSY = new Array<User>();
      this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentSchool.school.idschool)
    }

    debugger
    this.flagInvalid = false;
    this.CurrentTask = new TaskToStudent();
    this.CurrentTask.isActiveTask = true;
    this.dateSubmit = '';
    this.dateNeedSubmit = '';
    this.displayModal = true;
    this.Student = undefined;
    this.Status = undefined;
    this.PaymentMethod1 = undefined;
    this.ReceivePayment = undefined;
    this.DisplayDate = false;
    this.dateNeed = "";

  }

  //עריכת מטלה
  EditDetailsTask(task: TaskToStudent) {
    debugger
    this.CurrentTask = Object.assign({}, task);
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // this.CurrentTask.appScoreStudentPerQuestionsOfTasks = [...task.appScoreStudentPerQuestionsOfTasks];
    // var t= (task.appScoreStudentPerQuestionsOfTasks);

    this.CurrentTask.appScoreStudentPerQuestionsOfTasks = null;
    this.CurrentTask.appScoreStudentPerQuestionsOfTasks = new Array<any>();
    task.appScoreStudentPerQuestionsOfTasks.forEach(val => this.CurrentTask.appScoreStudentPerQuestionsOfTasks.push(Object.assign({}, val)));
    // this.listTaskToStudent;
    debugger
    Object.assign([], (task.appScoreStudentPerQuestionsOfTasks));

    if (this.studentService.ListStudent == null || this.studentService.ListStudent.length == 0 || this.studentService.YearbookIdPerStudent != this.schoolService.SelectYearbook.idyearbook)
      this.studentService.GetListStudentsBySchoolIdAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook)
        .subscribe(data => {
          debugger; this.studentService.ListStudent = data;
          this.studentService.ListStudentPerSY = this.studentService.ListStudent.filter(f => f.schoolId == this.CurrentSchool.school.idschool);
          this.Student = this.studentService.ListStudentPerSY.find(f => f.idstudent == this.CurrentTask.studentId);

        }, er => { ; console.log(er) });
    else {
      if (this.studentService.ListStudentPerSY == null || this.studentService.ListStudentPerSY.length == 0 || this.studentService.ListStudentPerSY[0].schoolId != this.CurrentSchool.school.idschool)
        this.studentService.ListStudentPerSY = this.studentService.ListStudent.filter(f => f.schoolId == this.CurrentSchool.school.idschool);
      this.Student = this.studentService.ListStudentPerSY.find(f => f.idstudent == this.CurrentTask.studentId);
    }
    

    if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        debugger;
        this.userService.ListUserByListSchoolAndYerbook = data;
        this.userService.ListUserPerSY = new Array<User>();
        this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentSchool.school.idschool);
        this.ReceivePayment = this.userService.ListUserPerSY.find(f => f.userPerSchoolID == this.CurrentTask.receivePaymentId);
      }, er => { });
    else {
      if ((this.CurrentSchool && this.CurrentSchool.school) && (this.userService.ListUserPerSY == null || this.userService.ListUserPerSY.length == 0 || this.userService.ListUserPerSY[0].schoolId != this.CurrentSchool.school.idschool)) {
        this.userService.ListUserPerSY = new Array<User>();
        this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentSchool.school.idschool)
      }
      this.ReceivePayment = this.userService.ListUserPerSY.find(f => f.userPerSchoolID == this.CurrentTask.receivePaymentId);
    }
    debugger;
    if (task.dateNeedSubmitStr != undefined && task.dateNeedSubmit != undefined) {
      if (task.dateNeedSubmitStr != 'אחר') {
        var date = new Date(task.dateNeedSubmit);
        this.dateNeedSubmit = this.TaskExsistService.SubmitedDate.find(f => f.moed == task.dateNeedSubmitStr && f.date.getTime() == new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime());
      }
      else {
        this.dateNeedSubmit = this.TaskExsistService.SubmitedDate.find(f => f.moed == 'אחר');
        this.dateNeed = this.convertDateToStringService.formatDate(new Date(task.dateNeedSubmit));
        this.DisplayDate = true
      }
    }
    else
      this.dateNeedSubmit = undefined;
    debugger;
    this.PaymentMethod1 = this.schoolService.PaymentMethod.find(f => f.value == this.CurrentTask.paymentMethodId);
    this.Status = this.schoolService.PaymentStatus.find(f => f.value == this.CurrentTask.paymentStatusId);
    this.flagInvalid = false;
    this.dateSubmit = task.dateSubmit != undefined ? this.convertDateToStringService.formatDate(new Date(task.dateSubmit)) : undefined;
    this.displayModal = true;
    // if (task.dateNeedSubmit != undefined) {
    //   this.dateNeed = this.convertDateToStringService.formatDate(new Date(task.dateNeedSubmit));
    //   this.DisplayDate = true
    //   this.dateNeedSubmit = this.TaskExsistService.SubmitedDate.find(f => f.moed == 'אחר');
    // }
    // else {
    //   this.dateNeed = undefined;
    //   this.DisplayDate = false;
    // }
    debugger;

  }

  //בדיקה האם קיים כבר שיוך לתלמידה למטלה זו
  checkIfStudentExsist() {
    if (this.Student != undefined) {
      this.indexStudent = this.TaskToStudentService.listTaskToStudent.findIndex(f => f.idtaskToStudent != this.CurrentTask.idtaskToStudent && this.Student.idstudent != null && f.studentId == this.Student.idstudent && f.isActiveTask == true)
      if (this.indexStudent > -1 && (this.CurrentTask.idtaskToStudent == null || this.CurrentTask.idtaskToStudent == 0)) {
        this.confirmationService.confirm({
          message: 'תלמידה זו משוייכת כבר למטלה זו האם ברצונך להמשיך? פעולה זו תהפוך אוטומטית את המטלה הקודמת ללא פעילה',
          header: 'אזהרה',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: ' כן',
          rejectLabel: ' לא',
          key: "myDialog2",
          accept: () => {
            this.changeIsActive = true;
            this.CheckDate();
          },
          reject: (type) => {
            if (type == ConfirmEventType.REJECT) {
              this.displayModal = false;
              this.CurrentTask = new TaskToStudent();
              this.flagInvalid = false;
              this.dateNeedSubmit = undefined;
              this.dateSubmit = "";
              this.Student = undefined;
              this.Status = undefined;
              this.PaymentMethod1 = undefined;
              this.ReceivePayment = undefined;
              this.DisplayDate = false;
              this.dateNeed = "";
            }
          }
        });
      }
      else
        this.CheckDate();
    }
    else
      this.CheckDate();
  }

  CheckDate() {
    new Date(Date.UTC(2021, 12, 14))
    let dateS = this.dateSubmit != undefined && this.dateSubmit != '' ? new Date(this.dateSubmit + ':00:00:00') : undefined;
    let dateNeedS = this.dateNeed != undefined && this.dateNeed != '' ? new Date(this.dateNeed + ':00:00:00') : undefined;
    this.CurrentTask.dateSubmit = dateS;
    // this.CurrentTask.dateNeedSubmit = this.dateNeedSubmit != undefined && this.dateNeedSubmit.date != '' ? this.dateNeedSubmit.date : dateNeedS;
    this.CurrentTask.dateNeedSubmit = this.dateNeedSubmit != undefined && this.dateNeedSubmit.date != '' ? new Date(this.dateNeedSubmit.date.getFullYear(), this.dateNeedSubmit.date.getMonth(), this.dateNeedSubmit.date.getDate(), 0, 0, 0, 0) : dateNeedS;

    this.CurrentTask.dateNeedSubmitStr = this.dateNeedSubmit != undefined ? this.dateNeedSubmit.moed : undefined;
    // // + '/'  this.dateNeed.replace(/-/gi, '/')));
    if (this.CurrentTask.dateNeedSubmit != undefined && this.CurrentTask.dateSubmit != undefined) {
      // var dateNeed = this.CurrentTask.dateNeedSubmitStr.substring(this.CurrentTask.dateNeedSubmitStr.indexOf(',') + 2)
      debugger;
      if (this.CurrentTask.dateNeedSubmit.getTime() < this.CurrentTask.dateSubmit.getTime()) {
        this.confirmationService.confirm({
          message: 'שימי ❤ כי תאריך ההגשה מאוחר מהמועד בו התלמידה היתה צריכה להגיש את המטלה, האם ברצונך להמשיך?',
          header: 'אזהרה',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: ' כן',
          rejectLabel: ' ביטול',
          key: "myDialog",
          accept: () => {
            this.SaveTaskToStudent();
          },
          reject: (type) => {
            if (type == ConfirmEventType.REJECT) {
              this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'הפעולה בוטלה' });
              this.displayModal = false;
              this.CurrentTask = new TaskToStudent();
              this.flagInvalid = false;
              this.dateNeedSubmit = undefined;
              this.dateSubmit = "";
              this.Student = undefined;
              this.Status = undefined;
              this.PaymentMethod1 = undefined;
              this.ReceivePayment = undefined;
              this.DisplayDate = false;
              this.dateNeed = "";
            }
          }
        });
      }
      else {
        this.SaveTaskToStudent();
      }
    }
    else {
      this.SaveTaskToStudent();
    }
  }

  //שמירת מטלה
  SaveTaskToStudent() {
    debugger;
    this.displayModal = false;
    this.CurrentTask.paymentMethodId = this.PaymentMethod1 != undefined ? this.PaymentMethod1.value : null;
    this.CurrentTask.paymentStatusId = this.Status != undefined ? this.Status.value : null;
    this.CurrentTask.receivePaymentId = this.ReceivePayment != undefined ? this.ReceivePayment.userPerSchoolID : null;
    this.CurrentTask.studentId = this.Student != undefined ? this.Student.idstudent : null;
    let sum = 0;
    if (this.taskService.CurrentTask.typeOfTaskCalculationId == 2) {
      if (this.CurrentTask.appScoreStudentPerQuestionsOfTasks != undefined)
        this.CurrentTask.appScoreStudentPerQuestionsOfTasks.forEach(element => {
          sum = sum + (element.score * element.percent / 100);
        });
      this.CurrentTask.grade = sum;
    }
    let date=new Date();
    if (this.CurrentTask.idtaskToStudent != undefined && this.CurrentTask.idtaskToStudent != 0) {
      this.CurrentTask.userUpdatedId = this.CurrentSchool.userId;
      if (date!=null|| date!=undefined)
      this.CurrentTask.dateUpdated = new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
    }
    else {
      this.CurrentTask.userCreatedId = this.CurrentSchool.userId;
      if (date!=null|| date!=undefined)
      this.CurrentTask.dateCreated = new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
      this.CurrentTask.taskExsistId = this.TaskExsistID;

    }

    this.CurrentTask.dateNeedSubmit=new Date(Date.UTC(this.CurrentTask.dateNeedSubmit.getFullYear(),this.CurrentTask.dateNeedSubmit.getMonth(),this.CurrentTask.dateNeedSubmit.getDate()));
    if (this.CurrentTask.dateSubmit!=null|| this.CurrentTask.dateSubmit!=undefined)
    this.CurrentTask.dateSubmit=new Date(Date.UTC(this.CurrentTask.dateSubmit.getFullYear(),this.CurrentTask.dateSubmit.getMonth(),this.CurrentTask.dateSubmit.getDate()));
    this.TaskToStudentService.AddOrUpdate(this.CurrentSchool.school.idschool, this.CurrentSchool.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook).idyearbookPerSchool, this.CurrentTask, this.taskService.CurrentTask.typeOfTaskCalculationId == 2,this.courseID)
      .subscribe(data => {
        debugger;
        if (this.changeIsActive == true) {
          this.changeIsActive = false;
          this.TaskToStudentService.UpdateActiveTask(this.CurrentSchool.school.idschool, this.CurrentSchool.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook).idyearbookPerSchool, this.TaskToStudentService.listTaskToStudent[this.indexStudent].idtaskToStudent, false)
            .subscribe(
              data => {
                if (data == true) {
                  this.TaskToStudentService.listTaskToStudent[this.indexStudent].isActiveTask = false;
                  this.indexStudent = -1;
                }
              }, er => { });
        }
        debugger;
        if (this.CurrentTask.idtaskToStudent != 0 && this.CurrentTask.idtaskToStudent != undefined) {
          if (this.VisibleTable == false) {
            let i = this.listTaskToStudentSpecific.findIndex(f => f.idtaskToStudent == this.CurrentTask.idtaskToStudent);
            if (i != undefined && i > -1)
              this.listTaskToStudentSpecific[i] = data;
          }
          let i = this.TaskToStudentService.listTaskToStudent.findIndex(f => f.idtaskToStudent == this.CurrentTask.idtaskToStudent);
          if (i != undefined && i > -1)
            this.TaskToStudentService.listTaskToStudent[i] = data;
          this.messageService.add({ key: "tc", severity: 'success', summary: 'העידכון הצליח', detail: 'המטלה עודכנה בהצלחה' });

        }
        else {
          this.TaskToStudentService.listTaskToStudent.push(data);
          this.messageService.add({ key: "tc", severity: 'success', summary: 'ההוספה הצליחה', detail: 'המטלה הוספה בהצלחה' });

        }
        this.CurrentTask = new TaskToStudent();
        this.dateNeed = "";

      },
        er => {
          this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'העידכון נכשל ,אנא נסה שנית', sticky: true });
          this.displayModal = false;
          this.CurrentTask = new TaskToStudent();
          this.dateNeed = "";

        })
  }

  //מחיקת מטלה
  DeleteTask(task: TaskToStudent) {
    debugger
    if (task.isActiveTask == true) {
      let i = this.TaskToStudentService.listTaskToStudent.findIndex(f => task.studentId != null && f.studentId == task.studentId && f.idtaskToStudent != task.idtaskToStudent);
      if (i != null && i > -1) {
        this.messageService.add({ severity: 'error', sticky: true, summary: 'שימי לב', detail: 'אין אפשרות למחוק מטלה לתלמיד כאשר המטלה המבוקשת היא הפעילה ויש לו עוד שיוכים לא פעילים למטלה זו.' });
        return;
      }
    }
    this.TaskToStudentService.DeleteTaskToStudent(this.CurrentSchool.school.idschool, this.CurrentSchool.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook).idyearbookPerSchool, task.idtaskToStudent)
      .subscribe(
        data => {
          if (data == true) {
            if (this.VisibleTable == false) {
              let i = this.listTaskToStudentSpecific.indexOf(task);
              if (i > -1)
                this.listTaskToStudentSpecific.splice(i, 1);
              if (this.listTaskToStudentSpecific.length == 0)
                this.VisibleTable = true;
            }
            this.messageService.add({ key: "tc", severity: 'success', summary: 'המחיקה הצליחה', detail: 'המטלה נמחקה בהצלחה' });
            let i = this.TaskToStudentService.listTaskToStudent.indexOf(task);
            if (i > -1)
              this.TaskToStudentService.listTaskToStudent.splice(i, 1);
          }

        }
        , eror => {
          this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'המחיקה נכשלה ,אנא נסה שנית' });

        });
  }

  //דיאלוג לשאלה אם רוצה למחוק
  confirmDeleteFile(TaskExsist: TaskToStudent) {
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

  //אם בחרו במועד אחר פתיחת לוח שנה
  CheckDateNeedSubmit() {
    debugger;
    if (this.dateNeedSubmit.moed == 'אחר')
      this.DisplayDate = true;
    else
      this.DisplayDate = false;
  }

  //פתיחת כל נסיונות המענה למטלה זו של תלמידה מסויימת
  OpenTaskToStudentSpecific(task: TaskToStudent) {
    debugger;
    this.listTaskToStudentSpecific = this.TaskToStudentService.listTaskToStudent.filter(f => f.studentId == task.studentId);
    this.listTaskToStudentSpecific = this.listTaskToStudentSpecific.sort((a, b) => new Date(a.dateNeedSubmitStr).getTime() - new Date(b.dateNeedSubmitStr).getTime());
    this.VisibleTable = false;

  }

  //הפיכת מטלה לפעילה
  ChangeActiveTask(isActive: boolean, TaskToStudent: TaskToStudent) {
    debugger;
    this.TaskToStudentService.UpdateActiveTask(this.CurrentSchool.school.idschool, this.CurrentSchool.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook).idyearbookPerSchool, TaskToStudent.idtaskToStudent, isActive)
      .subscribe(
        data => {
          if (data == true) {
            debugger;
            //הפיכת המטלה הקודמת ללא פעיל
            if (isActive == true) {
              var y = this.TaskToStudentService.listTaskToStudent.find(f => f.idtaskToStudent != TaskToStudent.idtaskToStudent && TaskToStudent.studentId == f.studentId && f.isActiveTask == true)
              if (y != null)
                y.isActiveTask = false;
            }

            //הפיכת המטלה המבוקשת ללא פעיל - פעיל
            var x = this.TaskToStudentService.listTaskToStudent.find(f => f.idtaskToStudent == TaskToStudent.idtaskToStudent);
            if (x != null)
              x.isActiveTask = isActive;

          }
        }, er => {
          debugger;
        });
  }

  exportPdf() {
    this.router.navigate([`Home/ExportTaskToStudentPdf`])
  }
  exportExcel() {
    debugger;
   //var fileName=this.data.find(f=>f.value==this.ADate).label;

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.TaskToStudentService.listTaskToStudent);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "");
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
