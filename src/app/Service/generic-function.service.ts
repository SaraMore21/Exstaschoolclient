import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class GenericFunctionService {
  
  studentGeneral:boolean
  studentAddressDetails:boolean
  studentContactDetails:boolean
  studentFamilyDetails:boolean
  isEdit:boolean

  constructor(private location: Location) { 

  }

  uniqueBy(a, cond) {
    debugger
    return a.filter((n, i) => a.findIndex(e2 => cond(n, e2)) === i);
  }

  GoBackToLastPage() {
    debugger
    this.isEdit=false
    this.location.back();
  }
}
