import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddOrUpdateProfessionComponent } from './Component/professions/add-or-update-profession/add-or-update-profession.component';
import { ReactiveFormsModule } from '@angular/forms';

//Component
import { LoginComponent } from './Component/login/login.component';
import { StudentListComponent } from './Component/Student/student-list/student-list.component';
import { NavbarComponent } from './Component/navbar/navbar.component';
import { HomeComponent } from './Component/home/home.component';
import { UploadExcelComponent } from './Component/upload-excel/upload-excel.component';
import { SchoolDetailsComponent } from './Component/School/school-details/school-details.component';
import { ProfessionListComponent } from './Component/professions/profession-list/profession-list.component';

// PrimeNg
import { AccordionModule } from 'primeng/accordion';
import { SidebarModule } from 'primeng/sidebar';
import { MenuItem } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabMenuModule } from 'primeng/tabmenu';
import { SlideMenuModule } from 'primeng/slidemenu';
import { PrimeIcons } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { PanelMenuModule } from 'primeng/panelmenu';
import { StepsModule } from 'primeng/steps';
import { TooltipModule } from 'primeng/tooltip';
import { RadioButtonModule } from 'primeng/radiobutton';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { RippleModule } from 'primeng/ripple';
import {ProgressBarModule} from 'primeng/progressbar';


import { NgxUiLoaderModule } from 'ngx-ui-loader';


import { GroupListComponent } from './Component/Group/group-list/group-list.component';
import { StudentsPerGroupComponent } from './Component/Group/students-per-group/students-per-group.component';
import { ListCourseComponent } from './Component/Course/list-course/list-course.component';
// import { CourseComponent } from './Component/course/course.component';
import { DocumentsPerStudentComponent } from './Component/Student/documents-per-student/documents-per-student.component';
// import { UserComponent } from './Component/user/user.component';
// import { UserListComponent } from './Component/user/user-list/user-list.component';
import { UserListComponent } from './Component/users/user-list/user-list.component';
import { AddOrUpdateUserComponent } from './Component/users/add-or-update-user/add-or-update-user.component';
import { ListTaskComponent } from './Component/Task/list-task/list-task.component';
import { DocumentsPerGroupComponent } from './Component/Group/documents-per-group/documents-per-group.component';
import { DocumentsPerCourseComponent } from './Component/Course/documents-per-course/documents-per-course.component';
import { DocumentsPerSchoolComponent } from './Component/School/documents-per-school/documents-per-school.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import {ProgressSpinnerModule} from 'primeng/progressspinner';

import { InputSwitchModule } from 'primeng/inputswitch';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ListTaskExsistComponent } from './Component/Task/list-task-exsist/list-task-exsist.component';
import { ListTaskToStudentComponent } from './Component/Task/list-task-to-student/list-task-to-student.component';
import { ContactsComponent } from './Component/contacts/contacts.component';
import { DocumentsPerTaskComponent } from './Component/Task/documents-per-task/documents-per-task.component';
import { ListFatherCourseComponent } from './Component/Course/list-father-course/list-father-course.component';
import { BlockUIModule } from 'primeng/blockui';
import { PanelModule } from 'primeng/panel';
import { DocumentsPerFatherCourseComponent } from './Component/Course/documents-per-father-course/documents-per-father-course.component';
import { FieldsetModule } from 'primeng/fieldset';
import { KeyFilterModule } from 'primeng/keyfilter';
import { DocumentsPerTaskExsistComponent } from './Component/Task/documents-per-task-exsist/documents-per-task-exsist.component';
import { DocumentsPerUserComponent } from './Component/users/documents-per-user/documents-per-user.component';
import { DocumentsPerProfessionComponent } from './Component/professions/documents-per-profession/documents-per-profession.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { GroupPerStudentComponent } from './Component/Student/group-per-student/group-per-student.component';
import { DailyScheduleComponent } from './Component/Schedule/daily-schedule/daily-schedule.component';
import { EditDailyScheduleComponent } from './Component/Schedule/edit-daily-schedule/edit-daily-schedule.component';
import { ExportGradesPerTaskDocumentComponent } from './Component/Task/export-grades-per-task-document/export-grades-per-task-document.component';
import { EditorComponent } from './Component/editor/editor.component';
import { ScheduleRegularComponent } from './Component/Schedule/schedule-regular/schedule-regular.component'; 
import { AddOrUpdateComponent } from './Component/Student/add-or-update/add-or-update.component';
import { HebrewCalanderService } from 'src/app/Service/hebrew-calander.service';
import { SupportComponent } from './Component/support/support.component';
import { BulletinBoardComponent } from './Component/bulletin-board/bulletin-board.component';
import { DailyAttendanceForGroupComponent } from './Component/Attendance/daily-attendance-for-group/daily-attendance-for-group.component';
import { PresencePerGroupComponent } from './Component/Presence/presence-per-group/presence-per-group.component';
import { GeneralSettingComponent } from './Component/general-setting/general-setting.component';
import { ReportGeneratorComponent } from './Component/report-generator/report-generator.component';
import { PrecentByStudentFromDateTODAteComponent } from './Component/precent-by-student-from-date-todate/precent-by-student-from-date-todate.component';


// import { QuillModule } from 'quill';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    // PrimeNG
    SidebarModule,
    PasswordModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ToastModule,
    TableModule,
    DividerModule,
    AppRoutingModule,
    AccordionModule,
    HttpClientModule,
    MenuModule,
    ConfirmDialogModule,
    MultiSelectModule,
    TabMenuModule,
    SlideMenuModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    TriStateCheckboxModule,
    PanelMenuModule,
    StepsModule,
    TooltipModule,
    RadioButtonModule,
    NgbModule,
    InputSwitchModule,
    NgxUiLoaderModule,
    ToggleButtonModule,
    CheckboxModule,
    BlockUIModule,
    PanelModule,
    FieldsetModule,
    KeyFilterModule,
    MessagesModule,
    MessageModule,
    InputNumberModule,
    OverlayPanelModule,
    ScrollPanelModule,
    RippleModule,
    ReactiveFormsModule,
    ProgressSpinnerModule,
    ProgressBarModule
    // QuillModule.forRoot()

    // PrimeIcons
  ],

  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    StudentListComponent,
    NavbarComponent,
    UploadExcelComponent,
    AddOrUpdateComponent,
    GroupListComponent,
    StudentsPerGroupComponent,
    DocumentsPerStudentComponent,
    ListCourseComponent,
    ListTaskComponent,
    UserListComponent,
    DocumentsPerGroupComponent,
    DocumentsPerCourseComponent,
    AddOrUpdateUserComponent,
    DocumentsPerSchoolComponent,
    SchoolDetailsComponent,
    ListTaskExsistComponent,
    ProfessionListComponent,
    ListTaskToStudentComponent,
    AddOrUpdateProfessionComponent,
    ContactsComponent,
    DocumentsPerTaskComponent,
    ListFatherCourseComponent,
    DocumentsPerFatherCourseComponent,
    DocumentsPerTaskExsistComponent,
    DocumentsPerUserComponent,
    DocumentsPerProfessionComponent,
    GroupPerStudentComponent,
    DailyScheduleComponent,
    EditDailyScheduleComponent,
    ExportGradesPerTaskDocumentComponent,
    EditorComponent,
    ScheduleRegularComponent,
    SupportComponent,
    BulletinBoardComponent,
    DailyAttendanceForGroupComponent,
    PresencePerGroupComponent,
    GeneralSettingComponent,
    ReportGeneratorComponent,
    PrecentByStudentFromDateTODAteComponent,
  ],
  bootstrap: [AppComponent],
})

export class AppModule { }
