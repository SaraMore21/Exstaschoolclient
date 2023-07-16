import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Profession } from '../Class/profession';
import { ObjectAndListSchoolToCoordinationCode } from 'src/app/Class/ObjectAndListSchoolToCoordinationCode';
import { url } from 'inspector';
@Injectable({
  providedIn: 'root'
})
export class ProfessionService {

  Url:string= environment.API_ENDPOINT+ "api/Profession/"
  // Url: string = "api/Profession/"

  nameProfession: string='';
  ListProfession: Array<Profession> = new Array<Profession>();
  ListProfessionPerS: Array<Profession> = new Array<Profession>();
  constructor(public http: HttpClient) { }

  // שליפת רשימת מקצועות לפי מוסד
  GetAllProfessionByIdSchool(Schools: Array<any>): Observable<Array<any>> {
    debugger;
    var ArraySchool: string = "";
    Schools.forEach(f => ArraySchool += f.school.idschool + ",");
    return this.http.get<Array<any>>(this.Url + "GetAllProfessionByIdSchool/" + ArraySchool)
  }
  // שליפת פרטי מקצוע לפי קוד מקצוע
  GetProfessionDetailsByProfessionId(professionId: number): Observable<any> {
    return this.http.get<any>(this.Url + "GetProfessionDetailsByProfessionId/" + professionId)
  }
  // עדכון מקצוע
  UpdateProfession(profession: any, userId: number, schoolId: number):Observable<Profession> {
    return this.http.post<Profession>(this.Url + "UpdateProfession/" + userId + "/" + schoolId, profession)
  }
  // הוספת מקצוע
  AddProfession(newProfession: any, userCreatedId: number, schoolId: number): Observable<any> {
    return this.http.put<any>(this.Url + "AddProfession/" + userCreatedId + "/" + schoolId, newProfession);
  }
  //מחיקת מקצוע
  DeleteProfession(ProfessionId: number): Observable<Number> {
    return this.http.delete<Number>(this.Url + "DeleteProfession/" + ProfessionId)
  }
  //הוספת מקצוע תואם
  AddCoordinationsProfession(object: ObjectAndListSchoolToCoordinationCode, CustomerId: number, UserId: number, YearbookId: number): Observable<any> {
    return this.http.put<any>(this.Url + "AddCoordinationsProfession/" + CustomerId + "/" + UserId + "/" + YearbookId, object);
  }
  //עריכת מקצוע תואמים
  UpdateCoordinationProfession(object: any, CustomerId: number, userId: number, yearbookId: number) {
    return this.http.post<any>(this.Url + "UpdateCoordinationProfession/" + CustomerId + "/" + userId + "/" + yearbookId, object);
  }

  GetAllProfessionsByCoordinationId(coordinationId:number):Observable<Array<Profession>>{
    return this.http.get<Array<Profession>>(this.Url+"GetAllProfessionsByCoordinationId/"+coordinationId)
  }

}



