import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExsistDocumentService {

    Url =environment.API_ENDPOINT+ "api/ExsistDocument/";
    // Url = "api/ExsistDocument/";

    constructor(private http: HttpClient) { }

    AddAndGetTheNextExsistDocument(SchoolID:number,userId:number):Observable<number> {
      debugger;
      return this.http.get<number>(this.Url+"AddAndGetTheNextExsistDocument/"+SchoolID+"/"+userId);
    }
}
