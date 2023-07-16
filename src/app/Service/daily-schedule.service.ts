import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GroupSemesterPerCourse } from '../Class/group-semester-per-course';
import { DailySchedule } from '../Class/daily-schedule';

import { User } from '../Class/user';
import { Time } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DailyScheduleService {

  Url = environment.API_ENDPOINT + "api/DailySchedule/";
  listDailySchedule: Array<DailySchedule> = new Array<DailySchedule>()
  selectedGroup: any
  date: Date = new Date()
  dateStr: string;
  schoolId: number;
  currentDailySchedule: DailySchedule

  constructor(private http: HttpClient) { }

  GetDailySchedulePerGroup(): Observable<Array<DailySchedule>> {
    debugger;
    let day = this.date.getDate() < 10 ? '0' + this.date.getDate() : this.date.getDate()
    let month = (this.date.getMonth() + 1) < 10 ? '0' + (this.date.getMonth() + 1) : (this.date.getMonth() + 1)
    let year = this.date.getFullYear()
    this.dateStr = day + '-' + month + '-' + year
    debugger
    console.log(this.dateStr);
    debugger
    return this.http.get<Array<DailySchedule>>(`${this.Url}GetDailySchedulePerGroup/${this.selectedGroup.idgroupPerYearbook}/${this.dateStr}`)
  }
  //שליפת המורות הזמינות לשיעור המבוקש
  GetAvailableTeachers(scheduleDate: string, numLesson: number, SchoolId: number, CourseId: number): Observable<Array<User>> {
    return this.http.get<Array<User>>(this.Url + "GetAvailableTeachers/" + scheduleDate + "/" + numLesson + "/" + SchoolId + "/" + CourseId);
  }
  //שליפת מורה לפי הקורס הנבחר
  GetTeacherBySelectCourse(GroupSemesterPerCourseId: number, scheduleDate: string): Observable<User> {
    return this.http.get<User>(this.Url + "GetTeacherBySelectCourse/" + GroupSemesterPerCourseId + "/" + scheduleDate);
  }
  //עריכת מערכת יומית-שמירת פרטי השיעור 
  EditDailySchedule(DailySchedule: DailySchedule): Observable<DailySchedule> {
    return this.http.post<DailySchedule>(`${this.Url}EditDailySchedule`, DailySchedule);
  }
  //הוספת מערכת יומית
  AddDailySchedule(): Observable<any> {
    return this.http.put<any>(`${this.Url}AddDailySchedule`, this.currentDailySchedule);
  }
  //שליפת מספרי השיעורים הפנויים 
  GetNumLessonAvailable(GroupId: number, scheduleDate: string): Observable<Array<any>> {
    //  return this.http.get<Array<any>>(`${this.Url} GetNumLessonAvailable/ ${GroupId}/${scheduleDate}`);
    return this.http.get<Array<any>>(this.Url + "GetNumLessonAvailable/" + GroupId + "/" + scheduleDate);
  }

  GetAvailableTeachersByHourRange(ScheduleDate: string, StartTime: string, EndTime: string, SchoolId: number, CourseId: number): Observable<Array<User>> {
    return this.http.get<Array<User>>(`${this.Url}GetAvailableTeachersByHourRange/${ScheduleDate}/${StartTime}/${EndTime}/${SchoolId}/${CourseId}`);
  }
  //שליפת נתוני מערכת יומית לפי מערכת קבועה 
  GetDailyScheduleDetailsByScheduleRegular(GroupId:number,ScheduleDate:string,startTime:string,endTime:string):Observable<any>{
    return this.http.get<any>(`${this.Url}GetDailyScheduleDetailsByScheduleRegular/${GroupId}/${ScheduleDate}/${startTime}/${endTime}`);
  }
  //מחיקת מערכת יומית
  DeleteDailySchedule(IdDailySchedule:number):Observable<any>{
    return this.http.delete<any>(`${this.Url}DeleteDailySchedule/${IdDailySchedule}`)
  }
}
