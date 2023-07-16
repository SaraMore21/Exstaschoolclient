import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LearningStyleService {

  // Url:"api/LearningStyle/"
Url:string= environment.API_ENDPOINT+ "api/LearningStyle/"

ListLearningStyle:Array<any>;
  constructor(public http:HttpClient) { }

  GetAllLearningStyle(){

  }
}
