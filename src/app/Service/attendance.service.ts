import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Group } from '../Class/group';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  // Url:string="api/Attendance/"
  Url = environment.API_ENDPOINT + "api/Attendance/";

  constructor(private http: HttpClient) { }
//שליפת נוכחות יומית לקבוצה בתאריך
  GetDailyAttendanceForGroup(groupId:number,date:string): Observable<any> {
    return this.http.get<any>(`${this.Url}GetDailyAttendanceForGroup/${groupId}/${date}`);
  }
}
