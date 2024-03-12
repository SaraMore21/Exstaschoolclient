import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';
import { SchoolService } from 'src/app/Service/school.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  a:any;

  constructor(public schoolService:SchoolService,private router:Router,public SchoolService: SchoolService, public GenericFunctionService: GenericFunctionService) { }

  ngOnInit(): void {
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }


  }

  ChangeYearbook() {
    debugger;
    this.SchoolService.LastYearbook = this.SchoolService.YearbookEzer;
    this.SchoolService.YearbookEzer = this.SchoolService.SelectYearbook;
    let currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }
}
