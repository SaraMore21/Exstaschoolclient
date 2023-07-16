import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChaceService {

  constructor() { }
  public cache = [];



  setCacth(key, model) {
  this.cache[key] = JSON.parse(JSON.stringify(model)); // Object.assign({}, model); //model;
  }
 
  getCache(key) {
  let a;
  return new Observable(observable => {
  observable.next(a = JSON.parse(JSON.stringify(this.cache[key]))); // Object.assign({},this.cache[key]));
  observable.complete();
  });
  }
 
  getCacheSync(key) {
  if (!this.cache[key]) { return null; }
  return JSON.parse(JSON.stringify(this.cache[key]));
  }
 
  getIsCache(key) {
  return this.cache[key] != null ? true : false;
  }
}
