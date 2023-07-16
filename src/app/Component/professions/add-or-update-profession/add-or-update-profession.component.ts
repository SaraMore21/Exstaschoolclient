import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Profession } from 'src/app/Class/profession';
import { ProfessionService } from 'src/app/Service/profession.service';
import { SchoolService } from 'src/app/Service/school.service';

@Component({
  selector: 'app-add-or-update-profession',
  templateUrl: './add-or-update-profession.component.html',
  styleUrls: ['./add-or-update-profession.component.css']
})
export class AddOrUpdateProfessionComponent implements OnInit {

  professionId:number
  CurrentProfession:Profession

  constructor(
    public schoolService:SchoolService,
    public professionService:ProfessionService,
    public router:Router,
    public active: ActivatedRoute
  ){
    this.active.params.subscribe(c => { this.professionId = c["id"] })
  }

  ngOnInit(): void {
    debugger;
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
  if (this.professionId != 0)
    this.GetProfessionDetailsByProfessionId();
  else
    this.SetDetails();
  }

  GetProfessionDetailsByProfessionId(){
    this.professionService.GetProfessionDetailsByProfessionId(this.professionId).subscribe(data => {
      debugger;
      this.CurrentProfession = data;

      this.SetDetails()
    }
      , err => { })
  }

  SetDetails(){

  }

  SaveProfession(){

  }
}
