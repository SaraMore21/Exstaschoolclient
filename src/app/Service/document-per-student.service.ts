import { DocumentsPerStudent } from './../Class/documents-per-student';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentPerStudentService {

  Url =environment.API_ENDPOINT+ "api/DocumentPerStudent/";
  // Url = "api/DocumentPerStudent/";

  constructor(private http: HttpClient) { }

  getLstDocumentPerStudent(SchoolID: number, idStudent: number): Observable<Array<DocumentsPerStudent>> {
    debugger;
    return this.http.get<Array<DocumentsPerStudent>>(this.Url + "GetLstDocumentPerStudent/" + SchoolID + "/" + idStudent)
  }

  UploadDocumentPerStudent(SchoolID: number, idStudent: number, DocumentsPerStudent: DocumentsPerStudent, numFiles: number = 0): Observable<DocumentsPerStudent> {
    debugger;
    return this.http.post<DocumentsPerStudent>(this.Url + "UploadDocumentPerStudent", DocumentsPerStudent);
  }

  UploadFewDocumentsPerStudent(idschool: number, StudentId: number, ListDocumentsPerStudent: DocumentsPerStudent[],FolderName:string): Observable<Array<DocumentsPerStudent>> {
    debugger;
    return this.http.post<Array<DocumentsPerStudent>>(this.Url + "UploadFewDocumentsPerStudent/"+FolderName, ListDocumentsPerStudent);
  }

  DeleteDocumentPerStudent(iddocumentPerStudent: number, idStudent: number) :Observable<string>{
    debugger;
    return this.http.delete(this.Url + "DeleteDocumentPerStudent/" + iddocumentPerStudent + "/" + idStudent, { responseType: 'text' })
  }

  DeleteFewDocumentPerStudent(FolderId: number ,requiredDocumentPerStudentId:number, StudentId: number):Observable<DocumentsPerStudent> {
    return this.http.delete<DocumentsPerStudent>(this.Url + "DeleteFewDocumentPerStudent/" + FolderId +"/"+ requiredDocumentPerStudentId);
  }

  SaveNameFile(idfile: number, NameFile: string) {
    return this.http.get(this.Url + "SaveNameFile/" + idfile +"/"+ NameFile);
  }
}
