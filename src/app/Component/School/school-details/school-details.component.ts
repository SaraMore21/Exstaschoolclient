import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { SchoolService } from 'src/app/Service/school.service';
import { YearbookPerSchool } from 'src/app/Class/yearbook-per-school';
import {
  NgbCalendar,
  NgbCalendarHebrew, NgbDate,
  NgbDatepickerI18n,
  NgbDatepickerI18nHebrew,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
@Component({
  selector: 'app-school-details',
  templateUrl: './school-details.component.html',
  styleUrls: ['./school-details.component.css'],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew }],
    encapsulation: ViewEncapsulation.None,

})
export class SchoolDetailsComponent implements OnInit {
Name:string;
FromDate: NgbDateStruct;
ToDate: NgbDateStruct;
  constructor(public schoolService:SchoolService,private calendar: NgbCalendar, public i18n: NgbDatepickerI18n,public router:Router) {
    this.dayTemplateData = this.dayTemplateData.bind(this);
  }

  ngOnInit(): void {
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
  }
  dayTemplateData(date: NgbDate) {
    return {
      gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date)
    };
  }
  AddYearbook(){
  //   debugger;
  //   var t, f;
  //   var ToDate = this.ToDate != null ? new NgbDate(this.ToDate.year, this.ToDate.month, this.ToDate.day) : null;
  //  ToDate = ToDate != null ? (this.calendar as NgbCalendarHebrew).toGregorian(ToDate) : null;
  //  t = ToDate != null ? ToDate.year + '-' + ToDate.month + '-' + ToDate.day : null;

  //  var FromDate = this.FromDate != null ? new NgbDate(this.FromDate.year, this.FromDate.month, this.FromDate.day) : null;
  //  FromDate = FromDate != null ? (this.calendar as NgbCalendarHebrew).toGregorian(FromDate) : null;
  //  f = FromDate != null ? FromDate.year + '-' + FromDate.month + '-' + FromDate.day : null;

  // this.schoolService.AddYearbook(f,t,this.Name,?,?).subscribe(data=>{
  //   debugger;
  //   //this.schoolService.Yearbooks=new Yearbook()
  //   this.schoolService.Yearbooks.push(data);
  // //  this.schoolService.SelectYearbook=data;
  // },er=>{})
  //  this.schoolService.SetYearbook=false;

  }
}
