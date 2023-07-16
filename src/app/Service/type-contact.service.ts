import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
 export class TypeContactService {

  Url=environment.API_ENDPOINT+"api/TypeContact/";
  // Url: string = "api/TypeContact/"

  constructor(private http: HttpClient) { }

  // שליפת סוג קשר לפי מוסד
  GetTypeContactBySchoolID(SchoolId: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(this.Url + "GetTypeContactBySchoolID/" + SchoolId)
  }
}
