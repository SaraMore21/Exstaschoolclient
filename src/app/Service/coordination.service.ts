import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Coordination } from '../Class/coordination'

@Injectable({
  providedIn: 'root'
})
export class CoordinationService {
  
  Url = environment.API_ENDPOINT + "api/Coordination/";

  listCoordinationsPerSchools:Array<Coordination>

  constructor(private http: HttpClient) { }

  GetAllCoordinationsByListSchoolId(ListSchoolId:Array<number>):Observable<Array<Coordination>>
  {
    return this.http.put<Array<Coordination>>(this.Url+"GetAllCoordinationsByListSchoolId/",ListSchoolId)
  }

}
