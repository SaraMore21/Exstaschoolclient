import { environment } from './../../environments/environment';
import { NumberSymbol } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import internal, { PassThrough } from 'stream';
import { Contact } from '../Class/contact';
import { ContactPerStudent } from '../Class/contact-per-student';
import { Student } from '../Class/student';
import { TypeContact } from '../Class/type-contact';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

 Url=environment.API_ENDPOINT+"api/Contact/";
//  Url: string = "api/Contact/"

 typeContactList:any=new Array<any>()
 currentContact:Contact= new Contact()
 currentContacPerStudent:ContactPerStudent = new ContactPerStudent()
 currentStudentForContact:any

  constructor(private http: HttpClient) { }

  //עדכון איש קשר
  UpdateContact(Contact:ContactPerStudent, UserId:number, SchoolId:number):Observable<any>{
    debugger
    return this.http.post<any>(this.Url+"UpdateContact/"+UserId+"/"+SchoolId,Contact)
  }

  //עדכון הקשר
  UpdateContactPerStudent(contactPerStudent:ContactPerStudent,UserId:number,  SchoolId:number):Observable<any>{
   debugger
    return this.http.post<any>(this.Url+"UpdateContactPerStudent/"+UserId+"/"+SchoolId,contactPerStudent)
  }

  //בדיקה האם קיים איש קשר כבר-לפי תז
  GetContactByTz(contactTz:string,SchoolId:number):Observable<Contact>{
    return this.http.get<Contact>(this.Url+"GetContactByTz/"+contactTz+"/"+SchoolId);
  }

  //הוספת איש קשר
  AddContact(Contact:Contact,UserId:number,SchoolId:number,StudentId:Number,TypeContactId:number):Observable<any>{
   debugger
  //  return this.http.get<any>(this.Url+"a");
    return this.http.post<any>(this.Url+"AddContact/"+UserId+"/"+SchoolId+"/"+StudentId+"/"+TypeContactId,Contact)
  }

  //הוספת שיוך של איש קשר לתלמיד
  AddContactPerPstudent(ContactId:number, StudentId:number, TypeContactId:number):Observable<any>{
    debugger
     return this.http.get<any>(this.Url+"AddContactPerPstudent/"+ContactId+"/"+StudentId+"/"+TypeContactId)
  }

  // עדכון איש קשר והוספת קשר
  UpdateContactAndAddContactPerStudent(Contact:Contact,TypeContactId:number,UserId:number,SchoolId:number,StudentId:number ):Observable<any>{
    debugger
    return this.http.post<any>(this.Url+"UpdateContactAndAddContactPerStudent/"+TypeContactId+"/"+UserId+"/"+SchoolId+"/"+StudentId,Contact )
  }
  //מחיקת איש קשר לתלמיד
  DeleteContactPerStudent(idcontactPerStudent:number):Observable<boolean>{
    return this.http.delete<boolean>(this.Url+"DeleteContactPerStudent/"+idcontactPerStudent);
  }
}
