import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SchoolService } from 'src/app/Service/school.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  a:any;

  constructor(public schoolService:SchoolService,private router:Router) { }

  ngOnInit(): void {
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }


  }

}
