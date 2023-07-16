import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { post } from 'jquery';
import { Observable, scheduled } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Group } from '../Class/group';
import { StudentPerGroup } from '../Class/student-per-group';
import { UserPerGroup } from '../Class/user-per-group';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  Url: string = environment.API_ENDPOINT + "api/Group/"
  // Url="api/Group/";

  NameGroup: string = '';
  ListGroupsByListSchoolAndYerbook: any;
  ListGroupPerSY: Array<any> = new Array<any>();
  listCoordinatedGroup:Array<any>=new Array<any>()
  constructor(public http: HttpClient) { }

  GetGroupsByIdSchool(Schools: Array<any>, YearbookId: number): Observable<Array<any>> {
    debugger;
    var ArraySchool: string = "";
    Schools.forEach(f => ArraySchool += f.school.idschool + ",");
    return this.http.get<Array<any>>(this.Url + "GetGroupsByIdSchool/" + ArraySchool + "/" + YearbookId);
  }

  GetGroupsByCoordinationCode(coordinationCode:string): Observable<Array<any>>{
    debugger
    return this.http.get<Array<any>>(this.Url + "GetGroupsByCoordinationCode/" + coordinationCode);
  }

  GetStudentPerGroup(GroupId: number, YearbookId: number): Observable<Array<StudentPerGroup>> {
    debugger;
    return this.http.get<Array<StudentPerGroup>>(this.Url + "GetStudentPerGroup/" + GroupId + "/" + YearbookId);
  }
  //מחיקת קבוצה
  DeleteGroup(GroupId: number, yearbookId: number): Observable<number> {
    return this.http.delete<number>(this.Url + "DeleteGroup/" + GroupId + "/" + yearbookId)
  }
  //עדכון פרטי קבוצה
  EditGroup(IdgroupPerYearbook: any, UserUpdateId: number, ListUsersPerGroup: Array<UserPerGroup>): Observable<any> {
    return this.http.post<any>(this.Url + "EditGroup/" + IdgroupPerYearbook + "/" + UserUpdateId, ListUsersPerGroup)
  }   
  EditGroup2(userUpdatedId:number,group:Group):Observable<any>{
    return this.http.post<any>(this.Url +"EditGroup2/"+userUpdatedId,group)

  }


  //הוספת קבוצה
  AddGroup(group: any, UserCreatedId: number, SchoolId: number, YearbookId: number, UserId: number): Observable<any> {
    return this.http.put<any>(this.Url + "AddGroup/" + UserCreatedId + "/" + SchoolId + "/" + YearbookId + "/" + UserId, group);
  }
  AddStudentInGroup(StudentId: number, GroupId: number, YearbookId: number, FromDate: string, ToDate: string, UserCreatedId: number): Observable<any> {
    return this.http.get<any>(this.Url + "AddStudentInGroup/" + StudentId + "/" + GroupId + "/" + YearbookId + "/" + FromDate + "/" + ToDate + "/" + UserCreatedId);
  }
  //שליפת כל הקבוצות במוסד במשך כל השנים
  GetAllNameGroup(SchoolId: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(this.Url + "GetAllNameGroup/" + SchoolId);
  }
  //הוספת שיוך שנתון קבוצה
  AddGroupInYearbook(UserId: number, GroupId: number, YearbookId: any, UserCreatedId: number): Observable<any> {
    return this.http.get<any>(this.Url + "AddGroupInYearbook/" + UserId + "/" + GroupId + "/" + YearbookId + "/" + UserCreatedId);
  }
  //שליפת שיוכי מורה לקבוצה בטווח התאריכים המבוקש
  GetUsersPerGroupByGroupId(GroupId: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(this.Url + "GetUsersPerGroupByGroupId/" + GroupId);
  }
  //מחיקת תלמיד מקבוצה
  DeleteStudentInGroup(StudentId: number, GroupId: number): Observable<StudentPerGroup> {
    return this.http.delete<StudentPerGroup>(this.Url + "DeleteStudentInGroup/" + StudentId + "/" + GroupId);
  }
  //עריכת תלמיד בקבוצה
  EditStudentInGroup(StudentPerGroup: StudentPerGroup, FromDate: Date, ToDate: Date, UserUpdateId: number): Observable<any> {
    return this.http.post<any>(this.Url + "EditStudentInGroup/" + FromDate + "/" + ToDate + "/" + UserUpdateId, StudentPerGroup);
  }

  AddCoordinatedGroup(group:Group, UserCreatedId:number,  YearbookId:number,  userId:number):Observable<Array<any>>
  {
    return this.http.post<Array<any>>(this.Url+ "AddCoordinatedGroup/"+UserCreatedId+"/"+YearbookId+"/"+userId,group)
  }
}
