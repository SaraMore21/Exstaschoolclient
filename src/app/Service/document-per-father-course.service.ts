import { DocumentsPerFatherCourse } from './../Class/documents-per-father-course';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentPerFatherCourseService {

  Url =environment.API_ENDPOINT+ "api/DocumentPerFatherCourse/";
  // Url = "api/DocumentPerFatherCourse/";

  constructor(private http: HttpClient) { }

  getLstDocumentPerFatherCourse(SchoolID: number, idFatherCourse: number): Observable<Array<DocumentsPerFatherCourse>> {
    debugger;
    return this.http.get<Array<DocumentsPerFatherCourse>>(this.Url + "GetLstDocumentPerFatherCourse/" + SchoolID + "/" + idFatherCourse)
  }

  UploadDocumentPerFatherCourse(SchoolID: number, idFatherCourse: number, DocumentsPerFatherCourse: DocumentsPerFatherCourse, numFiles: number = 0, uniqueCodeID: number = 0): Observable<DocumentsPerFatherCourse> {
    debugger;
    return this.http.post<DocumentsPerFatherCourse>(this.Url + "UploadDocumentPerFatherCourse/"+uniqueCodeID, DocumentsPerFatherCourse);
  }

  UploadFewDocumentsPerFatherCourse(idschool: number, FatherCourseId: number, ListDocumentsPerFatherCourse: DocumentsPerFatherCourse[],FolderName:string,uniqueCodeID: number , UserId: number , CustomerId:number): Observable<Array<DocumentsPerFatherCourse>> {
    debugger;
    return this.http.post<Array<DocumentsPerFatherCourse>>(this.Url + "UploadFewDocumentsPerFatherCourse/"+FolderName+"/"+ uniqueCodeID+"/"+UserId+"/"+CustomerId, ListDocumentsPerFatherCourse);
  }

  DeleteDocumentPerFatherCourse(iddocumentPerFatherCourse: number, idFatherCourse: number, uniqueCodeId:number) :Observable<string>{
    debugger;
    return this.http.delete(this.Url + "DeleteDocumentPerFatherCourse/" + iddocumentPerFatherCourse + "/" + idFatherCourse+ "/"+uniqueCodeId, { responseType: 'text' })
  }

  DeleteFewDocumentPerFatherCourse(FolderId: number ,requiredDocumentPerFatherCourseId:number, FatherCourseId: number, uniqueCodeDocumentId):Observable<DocumentsPerFatherCourse> {
    return this.http.delete<DocumentsPerFatherCourse>(this.Url + "DeleteFewDocumentPerFatherCourse/" + FolderId +"/"+ requiredDocumentPerFatherCourseId+"/"+FatherCourseId+"/"+uniqueCodeDocumentId);
  }

  SaveNameFile(idfile: number, NameFile: string, uniqeId:number) {
    return this.http.get(this.Url + "SaveNameFile/" + idfile +"/"+ NameFile+ "/"+uniqeId);
  }
}

