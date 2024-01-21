import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AttendanceMarking } from '../Class/attendance-marking';

@Injectable({
  providedIn: 'root'
})
export class AttendanceMarkingService {
  // Url="api/TypePresence/";
  Url=environment.API_ENDPOINT+ "api/AttendanceMarking/";
  ListAttendanceMarking:Array<AttendanceMarking>;
  constructor(public http:HttpClient) { }
  GetAllPresence():Observable<Array<AttendanceMarking>>{
    debugger
    return this.http.get<Array<AttendanceMarking>>(this.Url+"GetAllPresence/");
  }
}



