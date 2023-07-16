import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HebrewCalanderService {

  s: string

  dict1 = [
    { value: 1, label: "Tishrei" },
    { value: 2, label: "Cheshvan" },
    { value: 3, label: "Kislev" },
    { value: 4, label: "Tevet" },
    { value: 5, label: "Sh'vat" },
    { value: 6, label: "Adar" },
    { value: 7, label: "Nisan" },
    { value: 8, label: "Iyyar" },
    { value: 9, label: "Sivan" },
    { value: 10, label: "Tamuz" },
    { value: 11, label: "Av" },
    { value: 12, label: "Elul" }
  ];

  dict2 = [
    { value: 1, label: "Tishrei" },
    { value: 2, label: "Cheshvan" },
    { value: 3, label: "Kislev" },
    { value: 4, label: "Tevet" },
    { value: 5, label: "Sh'vat" },
    { value: 6, label: "Adar I" },
    { value: 7, label: "Adar II" },
    { value: 8, label: "Nisan" },
    { value: 9, label: "Iyyar" },
    { value: 10, label: "Sivan" },
    { value: 11, label: "Tamuz" },
    { value: 12, label: "Av" },
    { value: 13, label: "Elul" }
  ];

  constructor(private http: HttpClient) { }

  getHebrew(da: Date): Observable<any> {
    debugger
    let y: number = new Date(da).getFullYear();
    let m: number = new Date(da).getMonth();
    let d: number = new Date(da).getDate();
    m = (m + 1) % 13;
    this.s = "https://www.hebcal.com/converter/?cfg=json&gy=" + y + "&gm=" + m + "&gd=" + d + "&g2h=1";
    var a= this.http.get<any>(this.s);
    return a;
  }
}
