import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConvertDateToStringService {

  constructor() { }
    //String ל Date המרת תאריך מסוג 
    formatDate(date) {
      let month = date.getMonth() + 1;
      let day = date.getDate();
  
      if (month < 10) {
        month = '0' + month;
      }
  
      if (day < 10) {
        day = '0' + day;
      }
  
      return date.getFullYear() + '-' + month + '-' + day;
    }
}
