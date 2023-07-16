import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CheckType } from '../Class/check-type';


@Injectable({
  providedIn: 'root'
})
export class CheckTypeService {
  // Url="api/CheckType/";
  Url=environment.API_ENDPOINT+"api/CheckType/";

  ListCheckType:Array<CheckType>;

  constructor(public http:HttpClient) { 
    this.GetAll().subscribe(d=>this.ListCheckType=d)
   
  }
  GetAll():Observable<Array<CheckType>>{
    return this.http.get<Array<CheckType>>(this.Url+"GetAll/");
  }

}
