import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(private http:HttpClient) { }
  getCodeTables() {
    return this.http
      .get(environment.API_ENDPOINT + 'General/GetCodeTable');
  }
  getTABCodeTables() {
    return this.http
      .get(environment.API_ENDPOINT + 'General/GetTABCodeTable');
  }
}
