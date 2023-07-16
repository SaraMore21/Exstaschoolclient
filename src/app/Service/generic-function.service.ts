import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class GenericFunctionService {

  constructor(private location: Location) { }

  uniqueBy(a, cond) {
    debugger
    return a.filter((n, i) => a.findIndex(e2 => cond(n, e2)) === i);
  }

  GoBackToLastPage() {
    debugger
    this.location.back();
  }
}
