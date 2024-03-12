import { Component, OnInit } from '@angular/core';
import { SchoolService } from 'src/app/Service/school.service';

@Component({
  selector: 'app-report-generator',
  templateUrl: './report-generator.component.html',
  styleUrls: ['./report-generator.component.css']
})
export class ReportGeneratorComponent implements OnInit {
schoolIds:string=""
src:string
  constructor(public schoolService:SchoolService) { }

  ngOnInit(): void {
    debugger
 
    this.schoolService.ListSchool.forEach(s=>
      this.schoolIds += s.school.idschool + ","
      )
this.schoolIds=this.schoolIds.slice(0,this.schoolIds.length-1)
this.src="https://reportgeneratorclient.azurewebsites.net/Home/"+this.schoolIds
  }

}
