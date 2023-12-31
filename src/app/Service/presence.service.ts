import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {Lesson} from '../class/lesson'
import {AttendencePerDay} from '../class/attendancePerDay'
import { Presence } from '../class/presence';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  ListAttendencePerDay:Array<AttendencePerDay> ;
  // Url:"api/Presence/"
  Url:string= environment.API_ENDPOINT+ "api/Presence/"
  constructor(public http:HttpClient) { }
  // pad(n) {return n < 10 ? "0"+n : n;}
  GetLessonsByDate(date:Date,idGroup:number):Observable<Array<Lesson>>{
   debugger
   
 
 // let result = this.pad(this.pad(date.getMonth()+1))+"."+date.getDate()+"."+date.getFullYear();
  let result = date.getMonth()+1+"."+date.getDate()+"."+date.getFullYear();
   
   console.log(this.Url+"GetLessonsByDate/"+result+"/"+idGroup);
  debugger
   
    return this.http.get<Array<Lesson>>(this.Url+"GetLessonsByDate/"+result+"/"+idGroup)
  }
  GetNochectByDateIdgroup(date:Date,idGroup:number):Observable<Array<AttendencePerDay>>{
    // debugger;
    let result = date.getMonth()+1+"."+date.getDate()+"."+date.getFullYear();
    
    console.log(this.Url+"GetLessonsByDate/"+result+"/"+idGroup);

    return this.http.post<Array<AttendencePerDay>>(this.Url+"GetNochectByDateIdgroup/"+result+"/"+idGroup,null)

  }

 addOrUpdateAttendance(date:Date,userId:number,presence:Array<Presence>):Observable<Presence>{
  debugger
  let result = date.getMonth()+1+"."+date.getDate()+"."+date.getFullYear();
  return this.http.post<Presence>(this.Url+"addOrUpdateAttendance/"+result+"/"+userId,presence)
 }
}
