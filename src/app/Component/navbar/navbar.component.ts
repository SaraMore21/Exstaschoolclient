import { GenericFunctionService } from './../../Service/generic-function.service';
import { SchoolService } from './../../Service/school.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],

})
export class NavbarComponent implements OnInit {

  constructor(private router: Router, public SchoolService: SchoolService, public GenericFunctionService: GenericFunctionService) { }
  items: MenuItem[];
  visibleSidebar1: boolean = true;
  ngOnInit(): void {
    debugger;
    this.items = [
      { label: ' home ', icon: 'pi pi-fw pi-home', routerLink: '/Home' },
      // { label: ' נסיון ', icon: 'pi pi-user', routerLink: 'Try'},
      {
        label: ' תלמידים ', icon: 'pi pi-user', routerLink: 'StudentList'
        // ,items:[
        // {label :' אנשי קשר ' ,icon :'',routerLink:''},
        // {label:' מסמכים כללי ' ,icon :'' ,routerLink: ''}
        // ]
      },
      // { label: 'פעילות', icon: 'pi pi-comments', routerLink: '/Home/HimurimGame' },
      { label: ' משתמשים ', icon: 'pi pi-user ', routerLink: 'UserList' },
      { label: ' קבוצות ', icon: 'pi pi-users', routerLink: 'GroupList' },
      { label: ' קורסים ', icon: 'pi pi-users', routerLink: 'FatherCourseList' },
      { label: ' מטלות ', icon: 'pi pi-book', routerLink: 'ListTask' },
      { label: ' מקצועות ', icon: 'pi pi-book', routerLink: 'Professions' },

      // { label: ' מטלות ', icon: 'pi pi-book', routerLink: 'ListTask' },
      // { label: ' פרטי מוסד ', icon: 'pi pi-cog', routerLink: 'SchoolDetails' },
      { label: ' העלאת קבצי אקסל ', icon: 'pi pi-upload', routerLink: '/Home/UploadExcel' },
      { label: ' מסמכים כלליים למוסד ', icon: 'pi pi-book', routerLink: ('/Home/DocumentsPerSchool') },
      { label: ' מערכת יומית ', icon: '', routerLink: '/Home/DailySchedule' },
      { label: ' מערכת שעות ', icon: '', routerLink: '/Home/RegularSchedule' },
      { label: ' תמיכה ', icon: '', routerLink: '/Home/Support' },
      { label: ' נוכחות ', icon: 'pi pi-check-square', routerLink: '/Home/DailyAttendanceForGroup' }
      // { label: ' נוכחות יומית לקבוצה ', icon: '', routerLink: '/Home/DailyAttendanceForGroup' },
      // { label: 'לוח מודעות',icon:'',routerLink: 'BulletinBoard'},
    ]

  }

  //בפונקציה זו יש צורך לאפס את הרשימות שמשויכות לשנתון.
  ChangeYearbook() {
    debugger;
    this.SchoolService.LastYearbook = this.SchoolService.YearbookEzer;
    this.SchoolService.YearbookEzer = this.SchoolService.SelectYearbook;
    let currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }
}
