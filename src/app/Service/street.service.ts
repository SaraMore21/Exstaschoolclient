import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Street } from '../Class/street';

@Injectable({
  providedIn: 'root'
})
export class StreetService {

// Url:string="api/Street/";
Url=environment.API_ENDPOINT+"api/Street/";

StreetsPerCity:Array<Street>=new Array<Street>();
  constructor(private http:HttpClient) { }

  GetStreetsByCityId(cityId:number):Observable<Array<Street>>{
   return this.http.get<Array<Street>>(this.Url+"GetStreetsByCityId/"+cityId)
  }
}
