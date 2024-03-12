import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentPerCourse } from 'src/app/Class/student-per-course';
import {StudentPerCourseService} from 'src/app/Service/student-per-course.service';
import { StudentService } from 'src/app/Service/student.service';
import { SchoolService } from 'src/app/Service/school.service';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import {MessageService } from 'primeng/api';


import { Course } from 'src/app/Class/course';
@Component({
  selector: 'app-list-course-to-student',
  templateUrl: './list-course-to-student.component.html',
  styleUrls: ['./list-course-to-student.component.css'],
  providers: [
    [MessageService],
  ],
})

export class ListCourseToStudentComponent implements OnInit {
  [x: string]: any;

  constructor(private active: ActivatedRoute,public StudentPerCourseService:StudentPerCourseService,public studentService:StudentService,public schoolService:SchoolService,  public genericFunctionService: GenericFunctionService,private ngxService: NgxUiLoaderService,private messageService: MessageService) { }
  CourseID: number = 0;
  CurrentCourse:StudentPerCourse=new StudentPerCourse();
  CurrentSchool: any;
  Student:any;
  displayModal: boolean = false;
  VisibleTable:boolean=false;
  AddSPC: boolean = false;

  ListStudentNotInCourse: Array<StudentPerCourse> = new Array<StudentPerCourse>();
  ngOnInit(): void {
    debugger
    this.active.params.subscribe(c => { this.CourseID = c["id"] })
    this.GetAllStudentByCourseId();
  
   }

  GetAllStudentByCourseId() {
 debugger
    this.StudentPerCourseService.GetAllStudentByCourseId(this.CourseID)
      .subscribe(data => { this.StudentPerCourseService.listStudentByCourse = data
        this.VisibleTable=true
        debugger
      }, er => { })
  }
  EditDetailscoursPerStudent(course: StudentPerCourse) {
    debugger
    this.CurrentCourse = Object.assign({}, course);
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // this.CurrentTask.appScoreStudentPerQuestionsOfTasks = [...task.appScoreStudentPerQuestionsOfTasks];
    // var t= (task.appScoreStudentPerQuestionsOfTasks);

    


    // if (this.studentService.ListStudent == null || this.studentService.ListStudent.length == 0 || this.studentService.YearbookIdPerStudent != this.schoolService.SelectYearbook.idyearbook)
    //   this.studentService.GetListStudentsBySchoolIdAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook)
    //     .subscribe(data => {
    //       debugger; this.studentService.ListStudent = data;
    //       this.studentService.ListStudentPerSY = this.studentService.ListStudent.filter(f => f.schoolId == this.CurrentSchool.school.idschool);
    //       this.Student = this.studentService.ListStudentPerSY.find(f => f.idstudent == this.CurrentCourse.studentId);

    //     }, er => { ; console.log(er) });
    // else {
    //   if (this.studentService.ListStudentPerSY == null || this.studentService.ListStudentPerSY.length == 0 || this.studentService.ListStudentPerSY[0].schoolId != this.CurrentSchool.school.idschool)
    //     this.studentService.ListStudentPerSY = this.studentService.ListStudent.filter(f => f.schoolId == this.CurrentSchool.school.idschool);
    //   this.Student = this.studentService.ListStudentPerSY.find(f => f.idstudent == this.CurrentCourse.studentId);
    // }
    this.displayModal = true;
}
save() {
  debugger
  this.displayModal = false;
  this.StudentPerCourseService.UpdateCoursePerStudent(this.CurrentCourse).subscribe(data => {
    debugger;
    const index = this.StudentPerCourseService.listStudentByCourse.findIndex(s => s.idstudentsPerCourse === data.idstudentsPerCourse);
    if (index !== -1) {
      this.StudentPerCourseService.listStudentByCourse[index] = data;
    }
  });
}
saveGrade(course:StudentPerCourse,event){
  debugger
  course.grade=event.target.value
  this.displayModal = false;
  this.StudentPerCourseService.UpdateCoursePerStudent(course).subscribe(data => {
    debugger;
    const index = this.StudentPerCourseService.listStudentByCourse.findIndex(s => s.idstudentsPerCourse === data.idstudentsPerCourse);
    if (index !== -1) {
      this.StudentPerCourseService.listStudentByCourse[index] = data;
    }
  });
  
}

saveFinalScore(course:StudentPerCourse,event){
  debugger
  course.finalScore=event.target.value
  this.displayModal = false;
  this.StudentPerCourseService.UpdateCoursePerStudent(course).subscribe(data => {
    debugger;
    const index = this.StudentPerCourseService.listStudentByCourse.findIndex(s => s.idstudentsPerCourse === data.idstudentsPerCourse);
    if (index !== -1) {
      this.StudentPerCourseService.listStudentByCourse[index] = data;
    }
  });
}
ShowListStudentToAdd() {
  debugger
 this.AddSPC = true;
 if (this.ListStudentNotInCourse == null || this.ListStudentNotInCourse.length == 0) {
   if (this.studentService.ListStudent == null || this.studentService.ListStudent.length == 0)
     this.studentService.GetListStudentsBySchoolIdAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
       this.studentService.ListStudent = data;
       let SPC;
       this.studentService.ListStudent.forEach(element => {
         if (this.StudentPerCourseService.listStudentByCourse.find(f => f.studentId == element.idstudent) == null) {
           SPC = new StudentPerCourse(); SPC.student = element;
           this.ListStudentNotInCourse.push(SPC);
           console.log("this.ListStudentNotInCourse" +" "+this.ListStudentNotInCourse)
         }
       });
     }, er => { })
   else {
     this.studentService.ListStudent.forEach(element => {
       if (this.StudentPerCourseService.listStudentByCourse.find(f => f.studentId == element.idstudent) == null) {
         let SPC:StudentPerCourse;
         SPC = new StudentPerCourse(); 
         SPC.studentId = element.idstudent;
         SPC.studentTz=element.tz;
         SPC.studentName=element.firstName+" "+element.lastName
         this.ListStudentNotInCourse.push(SPC);
       }
     });
   }
 }
}
AddStudentPerCourse(idStudent,idGroupSemesterPerCourse){
    
  debugger
  this.ngxService.start();
  this.StudentPerCourseService.AddStudentToCourse(idStudent,idGroupSemesterPerCourse)
  .subscribe(
    
    (data) => {
      var i =  this.ListStudentNotInCourse.findIndex(f => f.studentId == idStudent);
      this.ListStudentNotInCourse.splice(i, 1);
     
      debugger
       
            this.messageService.add({
              severity: 'success',
              summary: ' ההוספה הצליחה',
              detail: 'התלמיד נוסף בהצלחה',
            });

      this.ngxService.stop();
      debugger;
      // this.router.navigate(['Home/AddOrUpdateStudent/',this.studentService.CurrentStudent.idstudent]);
    },
    (err) => {
      this.messageService.add({
        key: 'tc',
        severity: 'error',
        summary: 'שגיאה',
        detail: 'ההוספה נכשלה אנא נסה שנית',
      });
      this.ngxService.stop();
    }
  );

}



 AddListStudentToCourse(idGroupSemesterPerCourse:number)
  {
    debugger
    let i=0
    while (i < this.ListStudentNotInCourse.length){
      if (!this.ListStudentNotInCourse[i].checked) 
          i++
      else{
        this.AddStudentPerCourse(this.ListStudentNotInCourse[i].studentId,idGroupSemesterPerCourse);
        i++
      }
         
      
    }
  }



}





