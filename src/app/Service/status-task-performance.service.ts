import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StatusTaskPerformance } from '../Class/statusTaskPerformance';

@Injectable({
  providedIn: 'root'
})
export class StatusTaskPerformanceService {

  // Url="api/StatusTaskPerformance/";
  Url=environment.API_ENDPOINT+"api/StatusTaskPerformance/";

  
  constructor(public http:HttpClient) {
   }

   GetAllStatusTaskPerformanceBySchoolId(SchoolID:number):Observable<Array<StatusTaskPerformance>>{
    return this.http.get<Array<StatusTaskPerformance>>(this.Url+"GetAllStatusTaskPerformanceBySchoolId/"+SchoolID);
  

}
}