import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QuestionsOfTasks } from '../Class/questions-of-tasks';

@Injectable({
  providedIn: 'root'
})
export class QuestionsOfTaskService {

  Url:string= environment.API_ENDPOINT+ "api/QuestionsOfTask/"
  // Url:string="api/QuestionsOfTask/";
  constructor(private http:HttpClient) { }

  GetQuestionOfTask(TaskId:number):Observable<Array<QuestionsOfTasks>>{
  return this.http.get<Array<QuestionsOfTasks>>(this.Url+"GetQuestionOfTask/"+TaskId);
  }
}
