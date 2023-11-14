import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  Url =environment.API_ENDPOINT+ "api/Excel/";
  // Url = "api/Excel/";

  constructor(private http: HttpClient) { }

  UploadExcelFile(fileToUpload: File, mosadId: number,userId: number, tablesToRead: string[],
    groupId: number, idyearbookPerSchool:number, fromdate: Date, todate:Date, IsNew: boolean,IsOverride: boolean):Observable<any> {
    debugger;
    if(IsNew== undefined)
    IsNew= false;
    if(IsOverride== undefined)
    IsOverride= false;
    // var isSchedule = tablesToRead.findIndex(f => f == 'מערכת קבועה') != -1;
    // var isPresence = tablesToRead.findIndex(f => f == 'נוכחות קבוצתית') != -1;
    if(fromdate== undefined ||todate ==undefined)
    {
      fromdate = new Date();
      todate = new Date();
    }

    var path = 'UploadExcelFile/'+mosadId+'/' + userId + '/' +idyearbookPerSchool+'/'+ fromdate.toLocaleString() +'/'+todate.toLocaleString() +'/'+IsNew +'/'+IsOverride; //+ mosadId + '/false'
    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);

    formData.append('tablesToRead', JSON.stringify(tablesToRead))



    return this.http.post(this.Url + path, formData, { reportProgress: true, observe: 'events' });

  }

  download(url: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob'
    })
  }

 downloadFatherCourseExcel(idschool:string):Observable<any>{
  //const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
  const headers = new HttpHeaders({ 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return this.http.get<any>(this.Url+"downloadFatherCourseExcel/"+idschool,{ headers, responseType: 'blob' as 'json' })
 }

 downloadCourseExcel(idschool:string,idyearbook:number):Observable<any>{
  //const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
  const headers = new HttpHeaders({ 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return this.http.get<any>(this.Url+"downloadCourseExcel/"+idschool+"/"+idyearbook,{ headers, responseType: 'blob' as 'json' })
 }
}
