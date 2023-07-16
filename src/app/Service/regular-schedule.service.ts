import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ScheduleRegular } from '../Class/schedule-regular';
import { SchoolService } from './school.service';

@Injectable({
  providedIn: 'root'
})
export class RegularScheduleService {

  constructor(private http: HttpClient, private schoolService: SchoolService) { }

  Url = environment.API_ENDPOINT + "api/ScheduleRegular/";
  listRegularSchedulePerGroup: any
  schoolId: number
  selectedGroup: any
  date: Date = new Date()
  dateStr: string

  GetRegularSchedulePerGroup(): Observable<any> {
    debugger
    let day = this.date.getDate() < 10 ? `0${this.date.getDate()}` : this.date.getDate()
    let month = (this.date.getMonth() + 1) < 10 ? `0${(this.date.getMonth() + 1)}` : (this.date.getMonth() + 1)
    let year = this.date.getFullYear()
    this.dateStr = day + '-' + month + '-' + year
    console.log(this.dateStr);
    this.selectedGroup.idgroupPerYearbook
    debugger
    return this.http.get<any>(`${this.Url}GetScheduleRegularPerWeek/${this.dateStr}/${this.selectedGroup.idgroupPerYearbook}`)
    // return this.http.get<any>(`${this.Url}GetScheduleRegularPerWeek/${this.dateStr}/10`)
  }
  //עריכת מערכת קבועה
  UpdateScheduleRegularByWebsite(ScheduleRegular:ScheduleRegular,userId:number,date:string):Observable<ScheduleRegular>{
    return this.http.post<ScheduleRegular>(`${this.Url}UpdateScheduleRegularByWebsite/${userId}/${date}`,ScheduleRegular);
  }
}
