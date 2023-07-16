import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalServiceService {

  constructor() { }
  public sharePointPageObject = {
    webAbsoluteUrl: '',
    webRelativeUrl : '',
    userId: 0
  };  }
