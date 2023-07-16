import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProfessionCategory } from '../Class/profession-category';

@Injectable({
  providedIn: 'root'
})
export class ProfessionCategoryService {

  Url:string= environment.API_ENDPOINT+ "api/ProfessionCategory/"
  // Url: string = "api/ProfessionCategory/"


  constructor(public http:HttpClient) { }

  GetAllProfessionCategories():Observable<Array<ProfessionCategory>>{
   return this.http.get<Array<ProfessionCategory>>(this.Url+"GetAllProfessionCategories")
  }
}
