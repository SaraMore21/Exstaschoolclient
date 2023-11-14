import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '../Class/student';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { StudentPerGroup } from '../Class/student-per-group';
import { TaskExsist } from '../Class/task-exsist';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  // ,  "proxyConfig": "proxy.conf.json"

  //רשימת התלמידים
  ListStudent: Array<Student> = new Array<Student>();
  ListStudentPerSY: Array<Student> = new Array<Student>();
  NameStudent: string = "";
  Url = environment.API_ENDPOINT + "api/Student/";
  // Url = "api/Student/";

  //רשימת התלמידים
  CurrentStudent: Student;
  flagAddOrUpdateContact: boolean = false;
  //משתנה המכיל את השנה של הליסט השלוף
  YearbookIdPerStudent: number;

  constructor(private http: HttpClient) { }

  // שליפת התלמידים למוסד
  GetListStudent(SchoolID: number): Observable<Array<Student>> {
    debugger;
    return this.http.get<Array<Student>>(this.Url + "ListStudents/" + SchoolID)
  }
  // שליפת התלמידים למוסד בשנתון
  GetListStudentsBySchoolIdAndYearbookId(Schools: Array<any>, YearbookId: number): Observable<Array<Student>> {
    debugger;
    var ArraySchool: string = "";
    Schools.forEach(f => ArraySchool += f.school.idschool + ",");
    this.YearbookIdPerStudent = YearbookId;
    return this.http.get<Array<Student>>(this.Url + "GetListStudentsBySchoolIdAndYearbookId/" + ArraySchool + "/" + YearbookId);
  }
  //פונקציה השולפת את פרטי התלמיד
  GetStudentDetailsByIDStudent(StudentID: number): Observable<any> {
    return this.http.get<any>(this.Url + "GetStudentDetailsByIDStudent/" + StudentID)
  }
  //מחיקת תלמיד
  DeleteStudent(StudentID: number): Observable<boolean> {
    return this.http.delete<boolean>(this.Url + "DeleteStudent/" + StudentID)
  }
  //הוספת תלמיד
  AddStudent(student: any, UserId: number, schoolId: number, YearbookId: number): Observable<any> {
    return this.http.put<any>(this.Url + "AddStudent/" + UserId + "/" + schoolId + "/" + YearbookId, student);
  }
  //עדכון תלמיד
  UpdateStudent(student: any, UserId: number, schoolId: number): Observable<any> {
    return this.http.post<any>(this.Url + "UpdateStudent/" + UserId + "/" + schoolId, student);
  }
  getData(page: number, pageSize: number, YearbookId: number,Schools:Array<any>): Observable<any[]> {
    debugger;
    var ArraySchool: string = "";
    Schools.forEach(f => ArraySchool += f.school.idschool + ",");
    this.YearbookIdPerStudent = YearbookId;
    const url = this.Url + `GetPartlyListStudent/${page}/${pageSize}/${YearbookId}/${ArraySchool}`
    return this.http.get<any>(url);
  }

  // UpdateProfilePathToStudent(SchoolID: number, idStudent: number, path: string, UserId: number) {
  //   debugger;
  //   path = encodeURIComponent(path);
  //   return this.http.get(this.Url + "UpdateProfilePathToStudent/" + idStudent + "/" + path + "/" + SchoolID + "/" + UserId, { responseType: 'text' });
  // }
  
  UpdateProfilePathToStudent(SchoolID: number, idStudent: number, UserId: number) {
    debugger;
    // path = encodeURIComponent(path);
    return this.http.post(this.Url + "UpdateProfilePathToStudent/" + idStudent + "/" + SchoolID + "/" + UserId, this.CurrentStudent,{ responseType: 'text' });
  }

  //שליפת קבוצות לתלמידה
  GetGroupsToStudent(StudentId: number, YearbookId: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(this.Url + "GetGroupsToStudent/" + StudentId + "/" + YearbookId);
  }
  //מחיקת שיוך קבוצה לתלמיד
  DeleteGroupToStudent(StudentPerGroupId: number): Observable<any> {
    return this.http.delete<any>(this.Url + "DeleteGroupToStudent/" + StudentPerGroupId);
  }
  //הוספת שיוך קבוצה לתלמיד
  AddGroupPerStudent(GroupPerStudent: StudentPerGroup): Observable<any> {
    return this.http.put<any>(this.Url + 'AddGroupPerStudent', GroupPerStudent);
  }
  //הוספת מטלות לתלמיד
  AddTaskToStudent(ListTask: Array<TaskExsist>, StudentId: number, userCreatedId: number): Observable<boolean> {
    return this.http.put<boolean>(this.Url + "AddTasksToStudent/" + StudentId + "/" + userCreatedId, ListTask)
  }
  //שליפת השיוך תלמידה בקבוצה 
  GetStudentPerGroupById(StudentPerGroupId:number):Observable<StudentPerGroup>{
    return this.http.get<StudentPerGroup>(this.Url+"GetStudentPerGroupById/"+StudentPerGroupId);
  }
  //שליפת אפשרויות סיבת עזיבה למוסד
  GetReasonForLeavingPerSchool(SchoolId):Observable<any>{
    return this.http.get<any>(`${this.Url}GetReasonForLeavingPerSchool/${SchoolId}`);
  }

  SearchInStudentList(str:string, YearbookId:number,Schools: Array<any> ): Observable<Array<Student>>
  {
    debugger
    var ArraySchool: string = "";
    Schools.forEach(f => ArraySchool += f.school.idschool + ",");
    this.YearbookIdPerStudent = YearbookId;
    return this.http.get<Array<Student>>(this.Url+"SearchInStudentList/"+str+"/"+YearbookId+"/"+ArraySchool)
  }
}
