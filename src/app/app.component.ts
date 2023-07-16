import { Component } from '@angular/core';
import { GlobalService } from './Service/global.service';
import { ChaceService} from './Service/chace.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent {
  constructor(public globalService:GlobalService,public chaceService:ChaceService) { }
a:any;
  ngOnInit(): void {
    // this.globalService.getCodeTables().subscribe(data => {
    //   if (data) {
    //   const r = this.groupBy(data, 'table');
    //   for (const item in r) {
    //   // let item = r[i];
    //   this.chaceService.setCacth(`` + item + ``, r[item]);
    //   }
    //   // .forEach(function (item) {
    //   // this.cache.setCacth(`` + item["0"].table + ``, item);
    //   // });

    //   }
    //   });
  }
  title = 'ExtraSchoolClient';
  groupBy(xs, key) {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

    // ,
  // "browser": {
  //   "fs": false,
  //   "path": false,
  //   "os": false,
  //   "crypto": false
  // }
}
