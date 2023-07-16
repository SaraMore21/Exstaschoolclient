import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PresenceType } from '../Class/presence-type';

@Injectable({
  providedIn: 'root'
})
export class PresenceTypeService {
// Url="api/TypePresence/";
Url=environment.API_ENDPOINT+"api/TypePresence/";
ListPresenceType:Array<PresenceType>;
  constructor(public http:HttpClient) {
    
   }

GetAllPresence():Observable<Array<PresenceType>>{
  return this.http.get<Array<PresenceType>>(this.Url+"GetAllPresence/");
}
}



