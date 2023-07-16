import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { School } from '../Class/school';
import { YearbookPerSchool } from '../Class/yearbook-per-school';
import { Yearbook } from '../Class/yearbook';
import { AgeGroup } from '../Class/age-group';
import { ProfessionCategory } from '../Class/profession-category';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  // School:School=new School();
  // UserId:number;

  //#region
  AllTable: any;
  Cities: any = new Array<any>();
  TypeIdentitys: any = new Array<any>();
  Neigborhoods: any = new Array<any>();
  // Streets:any=new Array<any>();
  Genders: any = new Array<any>();
  Citizenships: any = new Array<any>();
  Countries: any = new Array<any>();
  LearningStyle: any = new Array<any>();
  Yearbooks: any = new Array<any>();
  // AgeGroups:any=new Array<any>();
  TypeGroups: any = new Array<any>();
  PaymentMethod: any = new Array<any>();
  PaymentStatus: any = new Array<any>();
  SelectYearbook: Yearbook;
  LastYearbook: Yearbook;
  YearbookEzer: Yearbook;
  SetYearbook: boolean = false;
  Status: any = new Array<any>();
  StatusStudent: any = new Array<any>();
  reasonForLeaving: any = new Array<any>();
  TypeContact: any = new Array<any>();
  TypeTask: any = new Array<any>();
  ProfessionCategories: Array<any> = new Array<any>();
  TypeOfTaskCalculations: Array<any> = new Array<any>();
  //SelectYearbook:YearbookPerSchool;
  //LastYearbook:YearbookPerSchool;
  //YearbookEzer:YearbookPerSchool;

  ListYearbook: Array<Yearbook>;
  ListSchool: Array<any>;
  CustomerId: number;
  IsCustomer: boolean = false;
  //האם להציג את הכפתור של פתיחת מטלה למוסדות תואמים -כלומר זה לקוח שיש לו מוסדות תואמים
  isCoordinationSchools: boolean = false;
  //רשימת כל הקודי תאום של הלקוח
  listCoordinationsCode: Array<string> = new Array<string>();
  userId: number = 0;

  //#endregion

  // Url = "api/School/";
  Url: string = environment.API_ENDPOINT + "api/School/";
  NameSchool: string = '';

  constructor(private http: HttpClient) { }


  //שליפת מוסדות המקושרים למשתמש זה
  GetSchoolByUserCodeAndPassword(UserCode: string, UserPassword: string): Observable<any> {
    return this.http.get<any>(this.Url + "GetSchoolByUserCodeAndPassword/" + UserCode + "/" + UserPassword);
    //  return this.http.post<Mosad>(this.url + "LoginAdminUser", { userName: username, password: password });
  }

  //שליחת סיסמא למייל ע"פ שם משתמש
  GetPasswordToEmailByUserCode(UserCode: string, Email: string): Observable<Array<string>> {
    return this.http.get<Array<string>>(this.Url + "GetPasswordToEmailByUserCode/" + UserCode + "/" + Email);
  }

  GetAllTable(): Observable<Array<any>> {
    return this.http.get<Array<any>>(this.Url + "TableCode");
  }
  //בחירת שנתון ברירת מחדל-התואם לתאריך
  GetAllYearbook(SchoolId: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(this.Url + "GetAllYearbook/" + SchoolId);
  }
  AddYearbook(fromDate: string, toDate: string, Name: string, UserCreatedId: number, SchoolId: number): Observable<YearbookPerSchool> {
    return this.http.get<YearbookPerSchool>(this.Url + "AddYearbook/" + fromDate + "/" + toDate + "/" + Name + "/" + UserCreatedId + "/" + SchoolId);
  }
  GetAllSchoolAndYearbookPerCustomer(UserCode: string, UserPassword: string): Observable<any> {
    return this.http.get<any>(this.Url + "GetAllSchoolAndYearbookPerCustomer/" + UserCode + "/" + UserPassword);
  }

}
