import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FatherCourse } from '../Class/father-course';

@Injectable({
  providedIn: 'root'
})
export class FatherCourseService {
  // Url="api/FatherCourse/";
  Url = environment.API_ENDPOINT + "api/FatherCourse/";

  ListFatherCourse: Array<FatherCourse>;
  NameCourse: string = "";
  constructor(private http: HttpClient) { }
  //שליפת קורסי אב ע"פ מוסדות ושנתון
  GetListFatherCoursesBySchoolAndYearbook(Schools: Array<any>, YearbookId: number): Observable<Array<FatherCourse>> {
    var ArraySchool: string = "";
    Schools.forEach(f => ArraySchool += f.school.idschool + ",");
    return this.http.get<Array<FatherCourse>>(this.Url + "GetListFatherCoursesBySchoolAndYearbook/" + ArraySchool + "/" + YearbookId)
  }
  //הוספה /עדכון קורס אב
  AddOrUpdateFatherCourse(FatherCourse: FatherCourse, UserCreatedId: number): Observable<FatherCourse> {
    return this.http.put<FatherCourse>(this.Url + "AddOrUpdateFatherCourse/" + UserCreatedId, FatherCourse)
  }
  //הוספת קורס אב
  AddFatherCourse(FatherCourse: FatherCourse): Observable<FatherCourse> {
    debugger
    return this.http.put<FatherCourse>(this.Url + "AddFatherCourse", FatherCourse);
  }
  //עריכת קורס אב
  EditFatherCourse(FatherCourse: FatherCourse): Observable<FatherCourse> {
    return this.http.post<FatherCourse>(this.Url + "EditFatherCourse", FatherCourse);
  }
  //מחיקת קורס אב
  DeleteFatherCrouse(fatherCourseId: number): Observable<boolean> {
    return this.http.delete<boolean>(this.Url + "DeleteFatherCrouse/" + fatherCourseId);
  }

  //הוספת קורס אב למוסדות תואמים ע"פ קוד תיאום
  AddCoordinationsFatherCourse(YearbookId: number, Object: any, CustomerId: number): Observable<any> {
    return this.http.put<any>(this.Url + "AddCoordinationsFatherCourse/" + YearbookId + "/" + CustomerId, Object)
  }

//עריכת קורס תואם כולל הקורסים המקבילים לו
EditCoordinatorCourseFather(FatherCourse:FatherCourse,UserId:number,CoustomerId:number):Observable<any>{
  return this.http.post<any>(this.Url+"EditCoordinatorCourseFather/"+UserId+"/"+CoustomerId,FatherCourse);
}
getFatherCourseById(fatherCourseId: number):Observable<FatherCourse> {
  return this.http.get<FatherCourse>(this.Url + "getFatherCourseById/"+fatherCourseId)
}
}
