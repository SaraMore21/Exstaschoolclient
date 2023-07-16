import { ObjectWithTaskAndListSchools } from './../Component/Task/list-task/list-task.component';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Task } from '../Class/task';
import { QuestionsOfTasks } from '../Class/questions-of-tasks';

@Injectable({
  providedIn: 'root'
})
export class TaskService {


  // Url="api/Task/";
  Url=environment.API_ENDPOINT+"api/Task/";


  CurrentTask: Task = new Task();
  ListTask:Array<Task>;
  nameTask:string;
  //רשימת שאלות למטלה
  ListQuestionsOfTasks: Array<QuestionsOfTasks> = new Array<QuestionsOfTasks>();
  constructor(public http:HttpClient) { }

  AddOrUpdate(idschool: number, idyearbookPerSchool: number, CurrentTask: any):Observable<Task> {
    return this.http.post<Task>(this.Url+"AddOrUpdate/"+idschool+"/"+idyearbookPerSchool,CurrentTask);
 }
  GetAllTaskBySchoolId(Schools: Array<any>,YearbookId:number):Observable<Array<Task>>{
    var ArraySchool:string="";
    Schools.forEach(f=> ArraySchool+=f.school.idschool+",");
    return this.http.get<Array<Task>>(this.Url+"GetAllTaskBySchoolId/"+ArraySchool+"/"+YearbookId);
  }

  deleteTask(SchoolID:number,YearbookId:number,TaskId:number):Observable<boolean>{
    return this.http.get<boolean>(this.Url+"DeleteTask/"+SchoolID+"/"+TaskId);
  }

  AddOrUpdateTasksOfSpecificCodeByCustomer(YearbookId:number,obj:ObjectWithTaskAndListSchools, customer:number):Observable<any>{
    return this.http.post<any>(this.Url+"AddOrUpdateTasksOfSpecificCodeByCustomer/"+YearbookId+'/'+ customer,obj);
  }
}
