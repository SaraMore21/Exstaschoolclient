import { Component, OnInit } from '@angular/core';
import { FontService } from '../../../Service/font.service'
import { TaskExsistService } from 'src/app/Service/task-exsist.service';
import { SchoolService } from 'src/app/Service/school.service';
import { Router } from '@angular/router';
import { TaskToStudentService } from 'src/app/Service/task-to-student.service';
import { TaskService } from 'src/app/Service/task.service';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';
import { TaskToStudent } from 'src/app/Class/task-to-student';
import * as $ from 'jquery';
import * as html2pdf from 'html2pdf.js'

@Component({
  selector: 'app-export-grades-per-task-document',
  templateUrl: './export-grades-per-task-document.component.html',
  styleUrls: ['./export-grades-per-task-document.component.css'],
})

export class ExportGradesPerTaskDocumentComponent implements OnInit {

  chooseLogo: boolean = false
  header: string = 'דו"ח ציונים למטלה'
  editHeader: boolean = false
  footer: string = 'כותרת תחתונה'
  editFooter: boolean = false

  currentSchool: any
  mat: Array<Array<TaskToStudent>> = new Array<Array<TaskToStudent>>()
  num = 0
  currentArray: Array<TaskToStudent> = new Array<TaskToStudent>()

  constructor(public router: Router, public fontService: FontService, public GenericFunctionService: GenericFunctionService, public schoolService: SchoolService, public taskService: TaskService, public taskExistService: TaskExsistService, public taskToStudentService: TaskToStudentService) { }

  ngOnInit(): void {
    debugger
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    console.log("ListSchool:" + this.schoolService.ListSchool);
    this.currentSchool = this.schoolService.ListSchool.find(f => f.school.idschool == this.taskExistService.CurrentTaskExsist.schoolId);
    if (this.currentSchool != null && this.currentSchool.school.logo != null) {
      console.log("currentSchool:" + this.currentSchool);
      console.log("logo:" + this.currentSchool.school.logo);
    }
    if (this.currentSchool.appYearbookPerSchools.find(f => f.idyearbookPerSchool == this.taskService.ListTask[0].yearBookId).yearbookId != this.schoolService.SelectYearbook.idyearbook)
      this.GenericFunctionService.GoBackToLastPage();

    this.mat = this.createMat()
    this.currentArray = this.mat.slice(0, 1)[0]
    console.log(this.currentArray);
  }

  createMat(): Array<Array<TaskToStudent>> {
    console.log("taskToStudentService.listTaskToStudent.length:" + this.taskToStudentService.listTaskToStudent.length);
    let activeTaskToStudentList = this.taskToStudentService.listTaskToStudent.filter(t => t.isActiveTask == true)
    console.log("activeTaskToStudentList.length:" + activeTaskToStudentList.length);

    let mat: Array<Array<TaskToStudent>> = new Array<Array<TaskToStudent>>()
    this.num = Math.ceil(activeTaskToStudentList.length / 9)
    console.log("num:" + this.num);

    for (let i = 0; i < this.num; i++) {
      mat.push(new Array<TaskToStudent>())
      for (let j = 0; j < 9 && (i * 9 + j) < activeTaskToStudentList.length; j++) {
        mat[i].push(activeTaskToStudentList[i * 9 + j])
      }
    }
    console.log(mat);
    return mat;
  }

  enabledEditHeader() {
    this.editHeader = !this.editHeader;
  }

  enabledEditFooter() {
    this.editFooter = !this.editFooter;
  }

  exportPdf() {
    debugger;
    var html = $("#docsToPdf").html();
    var options = {
      pagesplit: true
    };
    html2pdf().from(html).set(options).save(`דוח_ציונים_למטלה_${this.taskService.CurrentTask.name}`);
  }

}
