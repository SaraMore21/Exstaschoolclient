import { DocumentsPerProfessionComponent } from './Component/professions/documents-per-profession/documents-per-profession.component';
import { DocumentsPerUserComponent } from './Component/users/documents-per-user/documents-per-user.component';
import { DocumentsPerTaskExsistComponent } from './Component/Task/documents-per-task-exsist/documents-per-task-exsist.component';
import { DocumentsPerFatherCourseComponent } from './Component/Course/documents-per-father-course/documents-per-father-course.component';
import { ListTaskToStudentComponent } from './Component/Task/list-task-to-student/list-task-to-student.component';
import { ListTaskExsistComponent } from './Component/Task/list-task-exsist/list-task-exsist.component';
import { DocumentsPerGroupComponent } from './Component/Group/documents-per-group/documents-per-group.component';
import { UploadExcelComponent } from './Component/upload-excel/upload-excel.component';
import { NgModule, ViewChildren } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Component/home/home.component';
import { LoginComponent } from './Component/login/login.component';
import { AddOrUpdateComponent } from './Component/Student/add-or-update/add-or-update.component';
import { StudentListComponent } from './Component/Student/student-list/student-list.component';
import { GroupListComponent } from './Component/Group/group-list/group-list.component';
import { StudentsPerGroupComponent } from './Component/Group/students-per-group/students-per-group.component';
import { ListCourseComponent } from './Component/Course/list-course/list-course.component'
import { DocumentsPerStudentComponent } from './Component/Student/documents-per-student/documents-per-student.component';
import { UserListComponent } from './Component/users/user-list/user-list.component'
import { AddOrUpdateUserComponent } from './Component/users/add-or-update-user/add-or-update-user.component';
import { ListTaskComponent } from './Component/Task/list-task/list-task.component';
import { DocumentsPerCourseComponent } from './Component/Course/documents-per-course/documents-per-course.component';
import { DocumentsPerSchoolComponent } from './Component/School/documents-per-school/documents-per-school.component';
import { SchoolDetailsComponent } from './Component/School/school-details/school-details.component';
import { ProfessionListComponent } from './Component/professions/profession-list/profession-list.component'
import { ContactsComponent } from './Component/contacts/contacts.component';
import { DocumentsPerTaskComponent } from './Component/Task/documents-per-task/documents-per-task.component';
import { ListFatherCourseComponent } from './Component/Course/list-father-course/list-father-course.component';
import { GroupPerStudentComponent } from './Component/Student/group-per-student/group-per-student.component';
import { EditDailyScheduleComponent } from './Component/Schedule/edit-daily-schedule/edit-daily-schedule.component';
import { ExportGradesPerTaskDocumentComponent } from './Component/Task/export-grades-per-task-document/export-grades-per-task-document.component';
import { DailyScheduleComponent } from './Component/Schedule/daily-schedule/daily-schedule.component';
import { ScheduleRegularComponent } from './Component/Schedule/schedule-regular/schedule-regular.component';
import { EditorComponent } from './Component/editor/editor.component';
// import { ExportGradesPerTaskDocumentComponent } from './Component/export-grades-per-task-document/export-grades-per-task-document.component';
import { SupportComponent } from './Component/support/support.component';
import { BulletinBoardComponent } from './Component/bulletin-board/bulletin-board.component';
import { DailyAttendanceForGroupComponent } from './Component/Attendance/daily-attendance-for-group/daily-attendance-for-group.component';
import { PresencePerGroupComponent } from './Component/Presence/presence-per-group/presence-per-group.component';
import { GeneralSettingComponent } from './Component/general-setting/general-setting.component';
import { ReportGeneratorComponent } from './Component/report-generator/report-generator.component';
import { PrecentByStudentFromDateTODAteComponent } from './Component/precent-by-student-from-date-todate/precent-by-student-from-date-todate.component';

const routes: Routes = [
  { path: '', redirectTo: 'Login', pathMatch: 'full' },
  // { path: '', component: EditorComponent },
  { path: 'Login', component: LoginComponent },
  {
    path: 'Home', component: HomeComponent, children: [
      { path: 'StudentList', component: StudentListComponent },
      { path: 'UserList', component: UserListComponent },
      { path: 'UploadExcel', component: UploadExcelComponent },
      { path: 'AddOrUpdateStudent/:id', component: AddOrUpdateComponent },
      { path: 'GroupList', component: GroupListComponent },
      { path: 'FatherCourseList', component: ListFatherCourseComponent },
      { path: 'ListTask', component: ListTaskComponent },
      { path: 'ListTaskExsist/:id', component: ListTaskExsistComponent },
      { path: 'ListTaskToStudent/:id', component: ListTaskToStudentComponent },
      { path: 'ExportTaskToStudentPdf', component: ExportGradesPerTaskDocumentComponent },
      { path: 'SchoolDetails', component: SchoolDetailsComponent },
      { path: 'StudentsPerGroup/:id', component: StudentsPerGroupComponent },
      { path: 'AddOrUpdateUser/:id/:schoolId', component: AddOrUpdateUserComponent },
      { path: 'DocumentsPerStudent/:id/:schoolId/:YearbookPerSchool', component: DocumentsPerStudentComponent },
      { path: 'DocumentsPerGroup/:id/:schoolId/:YearbookPerSchool', component: DocumentsPerGroupComponent },
      { path: 'DocumentsPerCourse/:id/:schoolId/:YearbookPerSchool', component: DocumentsPerCourseComponent },
      { path: 'DocumentsPerSchool', component: DocumentsPerSchoolComponent },
      { path: 'DocumentsPerTask/:id/:schoolId/:uniqueCodeID', component: DocumentsPerTaskComponent },
      { path: 'DocumentsPerFatherCourse/:id/:schoolId/:uniqueCodeID', component: DocumentsPerFatherCourseComponent },
      { path: 'DocumentsPerTaskExsist/:id/:schoolId/:YearbookPerSchool', component: DocumentsPerTaskExsistComponent },
      { path: 'DocumentPerUser/:id/:schoolId/:uniqueCodeID/:YearbookID', component: DocumentsPerUserComponent },
      { path: 'DocumentPerProfession/:id/:schoolId/:uniqueCodeID', component: DocumentsPerProfessionComponent },
      { path: 'Professions', component: ProfessionListComponent },
      { path: 'Contacts', component: ContactsComponent },
      { path: 'ListCourse/:FatherCourseId/:schoolId/:YearbookPerSchool/:name', component: ListCourseComponent },
      { path: 'GroupPerStudent/:StudentId/:SchoolId', component: GroupPerStudentComponent },
      { path: 'EditDailySchedule', component: EditDailyScheduleComponent },
      { path: 'DailySchedule', component: DailyScheduleComponent },
      { path: 'RegularSchedule', component: ScheduleRegularComponent },
      { path: 'Support', component: SupportComponent },
      { path: 'BulletinBoard',component:BulletinBoardComponent},
      { path: 'DailyAttendanceForGroup',component:DailyAttendanceForGroupComponent},
      { path: 'Presence',component:PresencePerGroupComponent},
      { path: 'GeneralSettings',component:GeneralSettingComponent},
      { path: 'ReportGenerator',component:ReportGeneratorComponent},
      { path: 'PrecentByStudentFromDateTODAte',component:PrecentByStudentFromDateTODAteComponent },
      
    ]
  },
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
