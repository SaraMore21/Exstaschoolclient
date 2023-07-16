import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/Class/user'

import { UserPerSchool } from 'src/app/Class/user-per-school'

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // ,  "proxyConfig": "proxy.conf.json"

      // "integrity": "sha1-BjJjj42HfMghB9MKD/8aF8uhzQw=",

  // ListUser: Array<UserPerSchool> = new Array<UserPerSchool>();
  CurrentUser: any;
  ListUserByListSchoolAndYerbook:Array<User>=new Array<User>();
  ListUserPerSY:Array<User>=new Array<User>();
  //משתנה המכיל את השנה של הליסט השלוף
  YearbookIdPerUser:number;
  NameUser: string="";

  Url=environment.API_ENDPOINT+"api/User/";
  // Url: string = "api/User/"

  constructor(private http: HttpClient) { }


  //שליפת משתמשים לפי מוסד
  GetAllUserBySchoolId(SchoolId: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(this.Url + "GetAllUserBySchoolId/" + SchoolId);
  }

  //שליפת משתמשים לפי מוסד ושנה
  GetUsersBySchoolIDAndYearbookId(Schools: Array<any>, YearbookId: number): Observable<Array<any>> {
    debugger;
    var ArraySchool:string="";
    Schools.forEach(f=> ArraySchool+=f.school.idschool+",");
    this.YearbookIdPerUser=YearbookId;
    return this.http.get<Array<any>>(this.Url + "GetUsersBySchoolIDAndYearbookId/"+ArraySchool+"/"+ YearbookId);
  }

  //IDשליפת משתמש לפי
  GetUserDetailsByIDUser(UserId: number, SchoolId: number): Observable<any> {
    return this.http.get<any>(this.Url + "GetUserDetailsByIDUser/" + UserId + "/" + SchoolId)
  }
  GetListUserDetailsByIDUser(user: [number, number][] ){
    debugger;
    return this.http.put<Array<any>>(this.Url + "GetListUserDetailsByIDUser/" ,user)
  }

  //הוספת משתמש
  AddUser(User: any, UserCreatedId: number, SchoolId: number, yearbookId: number,emailAddress:string,message:string): Observable<any> {
    return this.http.put<any>(this.Url + "AddUser/" + UserCreatedId + "/" + SchoolId + "/" + yearbookId+"/"+emailAddress+"/"+message, User)
  }


  //עדכון משתמש
  UpdateUser(User: any, UserId: number): Observable<any> {
    return this.http.post<any>(this.Url + "UpdateUser/" + UserId, User)
  }

  //מחיקת משתמש
  DeleteUser(userId: any, SchoolId: number): Observable<number> {
    return this.http.delete<number>(this.Url + "DeleteUser/" + userId + "/" + SchoolId)
  }

  //שליחת מייל עם סיסמא
  // SendEmailWithPassword(emailAddress: any, message: any, body: any): Observable<boolean> {
  //   return this.http.get<boolean>(this.Url + "SendEmailWithPassword/" + emailAddress + "/" + message + "/" + body)
  // }
}
