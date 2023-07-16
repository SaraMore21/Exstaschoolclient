import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TypeTask } from '../Class/type-task';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TypeTaskService {


  // Url="api/TypeTask/";
  Url=environment.API_ENDPOINT+"api/TypeTask/";

  ListTypeTask:Array<TypeTask>;

  constructor(public http:HttpClient) { }


  GetAllTypeTaskBySchoolId(SchoolID:number,YearbookId:number):Observable<Array<TypeTask>>{
    return this.http.get<Array<TypeTask>>(this.Url+"GetAllTypeTaskBySchoolId/"+SchoolID);
  }

}
