import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, scheduled } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Course } from '../Class/course';
import { GroupSemesterPerCourse } from '../Class/group-semester-per-course';
import { School } from '../Class/school';
import { User } from '../Class/user';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  ListCourseByListSchoolAndYearbook: Array<any>;
  ListCoursePerSY: Array<any>;
  ListCourse: Array<any>;
  NameCourse: string;
  Url = environment.API_ENDPOINT + "api/Course/";
  // Url = "api/Course/";

  constructor(private http: HttpClient) { }

  //IDשליפת קורסים לפי קורס אב
  GetAllCourseByFatherCourseId(fatherCourseId: number): Observable<Array<GroupSemesterPerCourse>> {
    return this.http.get<Array<GroupSemesterPerCourse>>(this.Url + "GetAllCourseByFatherCourseId/" + fatherCourseId);
  }

  GetAllCourseBySchoolDAndYearbookId(Schools: Array<any>, YearbookId: number): Observable<Array<any>> {
    var ArraySchool: string = "";
    Schools.forEach(f => ArraySchool += f.school.idschool + ",");
    return this.http.get<Array<any>>(this.Url + "GetAllCourseBySchoolDAndYearbookId/" + ArraySchool + "/" + YearbookId)
  }
  //שליפת קורסים עפ"י מוסד
  GetAllCourseBySchoolId(SchoolId: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(this.Url + "GetAllCourseBySchoolId/" + SchoolId)
  }
  //שליפת סמסטרים בשנתון
  GetAllSemester(YearbookId: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(this.Url + "GetAllSemester/" + YearbookId)
  }
  // //הוספת קורס-ברמה הפשוטה
  // AddCourse(Course: Course, SchoolId: number, SemesterId: number, CourseId: number, GroupId: number, SemesterFromDate: any, SemesterToDate: any, TeacherId: number, YearbookId: number,UserCreatedId:number): Observable<any> {
  //   return this.http.put<any>(this.Url + "AddCourse/" + SchoolId + "/" + SemesterId + "/" + CourseId + "/" + GroupId + "/" + SemesterFromDate + "/" + SemesterToDate + "/" + TeacherId + "/" + YearbookId+"/"+UserCreatedId, Course)
  // }
  //מחיקת קורס
  DeleteCourse(GroupSemesterPerCourseId: number): Observable<number> {
    return this.http.delete<number>(this.Url + "DeleteCourse/" + GroupSemesterPerCourseId);
  }
  //שליפת שיוכי מורה לקורס
  GetUsersPerCourse(CourseId: number): Observable<any> {
    debugger;
    return this.http.get<any>(this.Url + "GetUsersPerCourse/" + CourseId);
  }
  EditCourse(CourseId: number, CourseCode: string, ListUsersPerCourse: Array<any>): Observable<any> {
    return this.http.post<any>(this.Url + "EditCourse/" + CourseId + "/" + CourseCode, ListUsersPerCourse);
  }
  AddFatherCourse(FatherCourse: Course): Observable<Course> {
    return this.http.put<Course>(this.Url + "AddFatherCourse", FatherCourse);
  }
  AddCourse(course: GroupSemesterPerCourse, TeacherId: number): Observable<GroupSemesterPerCourse> {
    return this.http.put<GroupSemesterPerCourse>(this.Url + "AddCourse/" + TeacherId, course);
  }
  //GroupId שליפת הקורסים לקבוצה לפי  
  GetCoursesForGroup(GroupId: number, scheduleDate: string): Observable<Array<GroupSemesterPerCourse>> {
    return this.http.get<Array<GroupSemesterPerCourse>>(this.Url + "GetCoursesForGroup/" + GroupId + "/" + scheduleDate);
  }
  //שליפת המורה המשוייכת לקורס בטווח תאריכים
  GetUserPerCourse(CourseId:number,Date:string):Observable<User>{
     return this.http.get<User>(`${this.Url}GetUserPerCourse/${CourseId}/${Date}`);
  }
  //הוספת קורס תואם
  AddCoordinatedCourse(course:Course, yearbookId:number): Observable<Array<GroupSemesterPerCourse>>{
    return this.http.put<Array<GroupSemesterPerCourse>>(this.Url+"AddCoordinatedCourse/"+yearbookId,course)
  }
}
