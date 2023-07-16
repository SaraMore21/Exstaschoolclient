import { TaskExsist } from './../Class/task-exsist';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskExsistService {

  // Url = "api/TaskExsist/";
  Url = environment.API_ENDPOINT + "api/TaskExsist/";

  NameTaskExsist: string;

  SubmitedDate: Array<any> = new Array<any>();
  listTaskExsist: Array<TaskExsist> = new Array<TaskExsist>();
  CurrentTaskExsist: TaskExsist = new TaskExsist();

  constructor(public http: HttpClient) { }

  GetAllTaskExsistByTaskId(TaskId: number): Observable<Array<TaskExsist>> {
    return this.http.get<Array<TaskExsist>>(this.Url + "GetAllTaskExsistByTaskId/" + TaskId);
  }

  AddOrUpdate(idschool: number, idyearbookPerSchool: number, CurrentTask: any): Observable<any> {
    return this.http.post<any>(this.Url + "AddOrUpdate/" + idschool + "/" + idyearbookPerSchool, CurrentTask);
  }

  deleteTask(TaskExsistId: number, deleteTaskToStudents: boolean = false): Observable<boolean> {
    return this.http.get<boolean>(this.Url + "DeleteTaskExsist/" + TaskExsistId + '/' + deleteTaskToStudents);
  }

  getSumPercentsOfGroupSemesterPerCourse(CourseId: number): Observable<number> {
    return this.http.get<number>(this.Url + "getSumPercentsOfGroupSemesterPerCourse/" + CourseId);
  }

}
