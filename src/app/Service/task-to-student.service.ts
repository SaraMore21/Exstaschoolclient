import { TaskToStudent } from './../Class/task-to-student';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { observable, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskToStudentService {

  // Url = "api/TaskToStudent/";
  Url = environment.API_ENDPOINT + "api/TaskToStudent/";

  listTaskToStudent: Array<TaskToStudent> = new Array<TaskToStudent>();
  
  constructor(public http: HttpClient) { }

  GetAllTaskToStudentByTaskExsistID(SchoolID: number, YearbookId: number, taskToStudentId: number): Observable<Array<TaskToStudent>> {
    debugger;
    return this.http.get<Array<TaskToStudent>>(this.Url + "GetAllTaskToStudentByTaskExsistID/" + taskToStudentId + "/" + SchoolID + "/" + YearbookId);
   
  }

  AddOrUpdate(idschool: number, idyearbookPerSchool: number, CurrentTask: any,  isAotomat: boolean): Observable<TaskToStudent> {
    return this.http.post<TaskToStudent>(this.Url + "AddOrUpdate/" + idschool + "/" + idyearbookPerSchool+"/"+isAotomat, CurrentTask);
  }

  DeleteTaskToStudent(SchoolID: number, YearbookId: number, TaskToStudentId: number): Observable<boolean> {
    return this.http.get<boolean>(this.Url + "DeleteTaskToStudent/" + SchoolID + "/" + TaskToStudentId);
  }

  UpdateActiveTask(SchoolID: number, YearbookId: number, TaskToStudentId: number, isActive: boolean): Observable<boolean> {
    return this.http.get<boolean>(this.Url + "UpdateActiveTask/" + SchoolID + "/" + TaskToStudentId + "/" + isActive);
  }
  EditScoreToStudents(listTaskToStudent: Array<TaskToStudent>): Observable<any> {
    return this.http.post<any>(this.Url + "EditScoreToStudents", listTaskToStudent);
  }
  GetScoreStudentInQuestionOfTask(IdQuestionOfTask: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(this.Url + "GetScoreStudentInQuestionOfTask/" + IdQuestionOfTask);
  }
  EditScoreQuestionToStudents(ListScoreInQuestion: Array<any>): Observable<Array<any>> {
    return this.http.post<Array<any>>(this.Url + "EditScoreQuestionToStudents", ListScoreInQuestion);
  }
}
