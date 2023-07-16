import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AgeGroup } from '../Class/age-group';

@Injectable({
  providedIn: 'root'
})
export class AgeGroupService {

// Url:string="api/AgeGroup/"
Url=environment.API_ENDPOINT+"api/AgeGroup/";

 AgeGroups: Array<AgeGroup> = new Array<AgeGroup>();
 AgeGroupsPerSchool: Array<AgeGroup> = new Array<AgeGroup>();
 AgeGroupPerCoordinatedSchool:Array<string>=new Array<string>();

  constructor(private http:HttpClient) { }
//שליפת שכבת גיל למוסדות
  GetAllAgeGroupsBySchools(ListSchool: Array<any>): Observable<Array<AgeGroup>> {
    var ArraySchool="";
    ListSchool.forEach(f=>ArraySchool+=f.school.idschool+",");
    return this.http.get<Array<AgeGroup>>(this.Url + "GetAllAgeGroupsBySchools/" + ArraySchool);
  }

  GetAllAgeGroupsByCoordinationCode(coordinationCode:string): Observable<Array<string>>
  {
    return this.http.get<Array<string>>(this.Url + "GetAllAgeGroupsByCoordinationCode/"+coordinationCode)
  }
}
