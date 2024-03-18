import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {StudentPerCourse} from  '../Class/student-per-course';
import { GroupSemesterPerCourse } from '../Class/group-semester-per-course';


@Injectable({
  providedIn: 'root'
})
export class StudentPerCourseService {
  listStudentByCourse: Array<StudentPerCourse> = new Array<StudentPerCourse>();
  currentCourse:GroupSemesterPerCourse =new GroupSemesterPerCourse();
  Url:string= environment.API_ENDPOINT+ "api/StudentPerCourse/"

  constructor(public http:HttpClient) { }

  GetAllStudentByCourseId(CourseId: number): Observable<Array<StudentPerCourse>> {
    debugger;
    return this.http.get<Array<StudentPerCourse>>(this.Url + "GetAllStudentByCourseId/"+CourseId) ;
  }
  UpdateCoursePerStudent(course:StudentPerCourse):Observable<StudentPerCourse>{
    debugger
    return this.http.post<StudentPerCourse>(this.Url+"UpdateCoursePerStudent",course)
   }
   AddStudentToCourse(idStudent:number,idGroupSemesterPerCourse:number){
    debugger
    return this.http.post<StudentPerCourse>(this.Url+"AddStudentToCourse/"+ idStudent +"/"+idGroupSemesterPerCourse,null)
   }
   DeleteStudentInCourse(studentId: number, CourseId: number): Observable<boolean> {
    debugger
    return this.http.delete<boolean>(this.Url + "DeleteStudentPerCourse/" + studentId + "/" + CourseId);
   }
}
