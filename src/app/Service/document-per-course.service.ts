import { DocumentsPerCourse } from './../Class/documents-per-Course';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentPerCourseService {

  Url =environment.API_ENDPOINT+ "api/DocumentPerCourse/";
  // Url = "api/DocumentPerCourse/";

  constructor(private http: HttpClient) { }

  getLstDocumentPerCourse(SchoolID: number, idCourse: number): Observable<Array<DocumentsPerCourse>> {
    debugger;
    return this.http.get<Array<DocumentsPerCourse>>(this.Url + "GetLstDocumentPerCourse/" + SchoolID + "/" + idCourse)
  }

  UploadDocumentPerCourse(SchoolID: number, idCourse: number, DocumentsPerCourse: DocumentsPerCourse, numFiles: number = 0): Observable<DocumentsPerCourse> {
    debugger;
    return this.http.post<DocumentsPerCourse>(this.Url + "UploadDocumentPerCourse", DocumentsPerCourse);
  }

  UploadFewDocumentsPerCourse(idschool: number, CourseId: number, ListDocumentsPerCourse: DocumentsPerCourse[],FolderName:string): Observable<Array<DocumentsPerCourse>> {
    debugger;
    return this.http.post<Array<DocumentsPerCourse>>(this.Url + "UploadFewDocumentsPerCourse/"+FolderName, ListDocumentsPerCourse);
  }

  DeleteDocumentPerCourse(iddocumentPerCourse: number, idCourse: number) :Observable<string>{
    debugger;
    return this.http.delete(this.Url + "DeleteDocumentPerCourse/" + iddocumentPerCourse + "/" + idCourse, { responseType: 'text' })
  }

  DeleteFewDocumentPerCourse(FolderId: number ,requiredDocumentPerCourseId:number, CourseId: number):Observable<DocumentsPerCourse> {
    return this.http.delete<DocumentsPerCourse>(this.Url + "DeleteFewDocumentPerCourse/" + FolderId +"/"+ requiredDocumentPerCourseId);
  }

  SaveNameFile(idfile: number, NameFile: string) {
    return this.http.get(this.Url + "SaveNameFile/" + idfile +"/"+ NameFile);
  }

}

