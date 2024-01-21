import { FilesAzureService } from './../../Service/files-azure.service';
import { ExcelService } from './../../Service/excel.service';
import { SchoolService } from './../../Service/school.service';
import { HttpEventType } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api/selectitem';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
// import { Subscription } from 'rxjs';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-upload-excel',
  templateUrl: './upload-excel.component.html',
  styleUrls: ['./upload-excel.component.css']
})
export class UploadExcelComponent implements OnInit,OnDestroy {
  private eventSubscription: Subscription;
  progress: number;
  message: string;
  tablesToRead = []
  tablesToDownload = []
  optionalTables = []
  optionalTables2: SelectItem[] = [];
  optionalTables3 = []
  optionalTables4: SelectItem[] = [];
  toDate: any;
  fromDate: any;
  isDisable: Boolean;
  //CurrentGroup: Group = new Group();
  checked: Boolean = false;
  display: boolean = false;
  data;
  CurrentSchool: any;
  IsScheduleDis: boolean = false;
  IsContactDis: boolean = false;
  groups: [{ id: 1, name: 'a', gg: 'jk' }, { id: 2, name: 'b', gg: 'lk' }, { id: 3, name: 'c', gg: 'sg' }];
  IsNew: boolean = false;
  IsOverride: boolean = false;
  fileToUpload: File;
  subscription: Subscription;
 
  constructor(private ExcelService: ExcelService, private router: Router, public schoolService: SchoolService) { 
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(["Login"])
      return;
    }

    // "אנשי קשר"
    this.optionalTables = ["תלמידים", "משתמשים", "מקצועות", "שיוך תלמיד קבוצה", "אנשי קשר", "קבוצות לימוד", "מערכת קבועה","שעות שיעורים לקבוצה","קורסי אב","קורסים"].sort();
    this.optionalTables.forEach(tbl => this.optionalTables2.push({ label: tbl, value: tbl }));

    this.optionalTables3 = ["תלמידים", "משתמשים", "קבוצות לימוד", "אנשי קשר" ,"נתוני בסיס","מקצועות","קורסי אב","קורסים","מערכת קבועה"];
    let i = 1;
    this.optionalTables3.forEach(tbl => { this.optionalTables4.push({ label: tbl, value: i.toString() }); i++; });

    // if (this.SchoolService.groups == undefined || this.mosadService.groups.length == 0) {
    //   this.mosadService.GetAllGroups();
    debugger;
    if (this.schoolService.ListSchool.length == 1)
      this.CurrentSchool = this.schoolService.ListSchool[0];
  }

  public uploadFile = (files) => {
    debugger;
    if (files.length === 0) {
      return;
    }
    let tableName: string = undefined
      ;
    // if(tableCode==1)
    // tableName="מערכת קבועה"
    // tableName="תלמידים"
    this.fileToUpload = <File>files[0];
    debugger;
    // this.CurrentGroup.Id


  }
  UploadExcelFile() {
    if (this.CurrentSchool == undefined || this.CurrentSchool.appYearbookPerSchools == undefined) {
      alert('התרחשה שגיאה בשנתון הבחור, אנא פנו למנהל האתר')
      return;
    }
    let yearbookPerSchool = this.CurrentSchool.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook)
    if (yearbookPerSchool == undefined || yearbookPerSchool.idyearbookPerSchool == undefined) {
      alert("למוסד שהזנת לא קיים שנתון תואם");
      return;
    }

    if (this.IsScheduleDis == true && (this.fromDate == undefined || this.toDate == undefined)) {
      alert("יש לבחור תאריך התחלה ותאריך סיום");
      return;
    }

    if (this.IsScheduleDis == true && this.fromDate >= this.toDate) {
      alert("תאריך סיום צריך להיות גדול מתאריך ההתחלה");
      return;
    }
    if (this.fileToUpload == undefined) {
      alert("יש לבחור קובץ");
      return;
    }
    this.eventSubscription=this.ExcelService.UploadExcelFile(this.fileToUpload, this.CurrentSchool.school.idschool, this.CurrentSchool.userId,
      this.tablesToRead, 1, yearbookPerSchool.idyearbookPerSchool, this.fromDate, this.toDate, this.IsNew, this.IsOverride)
      .subscribe(
        event => {
          this.isDisable = false;
          debugger;
          // this.data=event;
          debugger;
          // if (event.type === HttpEventType.UploadProgress)
          //   this.progress = Math.round(100 * event.loaded / event.total);
          // else if (event.type === HttpEventType.Response)


          //  {
          //   this.message = 'Upload success.';
          //   alert("finished!!!!")
          // }
        },
        er => {
          debugger;
          // alert("אופסס, ארעה תקלה,נסו שוב.")
          this.display = true;

        }

      );
    debugger
    this.isDisable = true;

    alert("העלאה החלה, ישלח אליכם מייל בסיום")
    this.router.navigate(['Home']);
  }

  IsSchedule() {
    debugger;
    if (this.tablesToRead.findIndex(f => f == "מערכת קבועה") != -1)
      this.IsScheduleDis = true;
    else
      this.IsScheduleDis = false;

    if (this.tablesToRead.findIndex(f => f == "אנשי קשר") != -1)
      this.IsContactDis = true;
    else
      this.IsContactDis = false;

  }
  isPresence() {
    // debugger;
    return this.tablesToRead.findIndex(f => f == "נוכחות קבוצתית") != -1;
  }

  // downloadExcel() {
  //   debugger;
  //   window.open('/assets/Excel/try.xlsx', '_blank');
  // }
  // //   Upload() {
  // //     let fileReader = new FileReader();
  // //       fileReader.onload = (e) => {
  // //           this.arrayBuffer = fileReader.result;
  // //           var data = new Uint8Array(this.arrayBuffer);
  // //           var arr = new Array();
  // //           for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
  // //           var bstr = arr.join("");
  // //           var workbook = XLSX.read(bstr, {type:"binary"});
  // //           var first_sheet_name = workbook.SheetNames[0];
  // //           var worksheet = workbook.Sheets[first_sheet_name];
  // //           console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
  // //       }
  // //       fileReader.readAsArrayBuffer(this.file);
  // // }

  // // exportexcel(): void {
  // //   const data = this.groups.map(c => ({ 'Id': c.id, 'NAme': c.name }));
  // //   const ws = XLSX.utils.json_to_sheet(data);

  // //   let element = document.getElementById('excel-table');
  // //   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
  // //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  // //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  // //   XLSX.writeFile(wb, this.fileName);
  // // }


  // exportExcel() {
  //   //    var data: [
  //   //       { A: 'User Data' }, // title
  //   //       { A: '#', B: 'First Name', C: 'Last Name', D: 'Handle' }, // table header
  //   //     ]
  //   //   this.ListStudent.forEach(student => {
  //   //     data.push({
  //   //       A: user.id,
  //   //       B: student.firstName,
  //   //       C: user.lastName,
  //   //       D: user.handle
  //   //     });
  //   //   });
  //   //   edata.push(udt);



  //   //  var data1= [
  //   //     // { id: 1, name: "Nivia Graffiti Basketball", brand: "Nivia", color: "Mixed", price: 391.00 },
  //   //     // { id: 2, name: "Strauss Official Basketball", brand: "Strauss", color: "Orange", price: 391.00 },
  //   //     // { id: 3, name: "Spalding Rebound Rubber Basketball", brand: "Spalding", color: "Brick", price: 675.00 },
  //   //     // { id: 4, name: "Cosco Funtime Basket Ball, Size 6 ", brand: "Cosco", color: "Orange", price: 300.00 },
  //   //     // { id: 5, name: "Nike Dominate 8P Basketball", brand: "Nike", color: "brick", price: 1295 },
  //   //     // { id: 6, name: "Nivia Europa Basketball", brand: "Nivia", color: "Orange", price: 280.00 }
  //   //  ]
  //   //  this.ListStudent.forEach(element => {
  //   //  data1.push(element.id,element.firstName,element.mosadName,
  //   //   element.groups.forEach(element1 => {
  //   //     element1.Name
  //   //   })
  //   //   )
  //   //  });
  // //   let workbook = new Workbook();
  // //   let worksheet = workbook.addWorksheet('Car Data');
  // // this.ListStudent.forEach(d => {
  // //   let row = worksheet.addRow(d);
  // // });

  //     import("xlsx").then(xlsx => {
  //       // debugger;
  //       // const worksheet = xlsx.utils.json_to_sheet(this.groups);
  //       // const workbook =Workbook.call('src/assets/Excel/try.xlsx');
  //       // // workbook.sheet
  //       // // const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  //       // const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
  //       // this.saveAsExcelFile(excelBuffer, "Students");
  //     });
  //   }

  //   saveAsExcelFile(buffer: any, fileName: string): void {
  //     import("file-saver").then(FileSaver => {
  //       let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  //       let EXCEL_EXTENSION = '.xlsx';
  //       const data: Blob = new Blob([buffer], {
  //         type: EXCEL_TYPE
  //       });
  //       FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  //     });

  //   }
  //   setLoadData(val) {

  //     // this.loadData$.next(val);

  //   }
  //   reload() {
  //     // this.router.routeReuseStrategy.shouldReuseRoute = () => false; this.router.onSameUrlNavigation = 'reload'; this.router.navigate(['./'], { relativeTo: this.route });
  //   }

  DownloadExcelFile() {
    debugger;
     this.tablesToDownload.forEach(f => {
      // debugger;
      // var a = document.getElementById(f);
      // a.click();

      switch (f)
      {
        case "7":
          this.ExcelService.downloadFatherCourseExcel(this.CurrentSchool.school.idschool)
         // .subscribe(d=>{alert("הקובץ נשלח בהצלחה למייל שהוזן")})
          .subscribe((data: Blob) => {
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'קורסי אב.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
          }
          )
          break;
          case "8":
          this.ExcelService.downloadCourseExcel(this.CurrentSchool.school.idschool,this.schoolService.SelectYearbook.idyearbook)
         // .subscribe(d=>{alert("הקובץ נשלח בהצלחה למייל שהוזן")})
          .subscribe((data: Blob) => {
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'קורסים.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
          }
          )
          break;
          case "9":
          this.ExcelService.downloadScheduleRegularExcel(this.CurrentSchool.school.idschool,this.schoolService.SelectYearbook.idyearbook)
         // .subscribe(d=>{alert("הקובץ נשלח בהצלחה למייל שהוזן")})
          .subscribe((data: Blob) => {
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'מערכת  קבועה.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
          }
          )
      }
    })

  }


  generateExcel() {
    // Create a worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
      ['Data Validation Example'],
      ['Select an option:'],
    ]);
  
    // Define the data validation (dropdown) for a specific cell (e.g., A3)
    worksheet['!dataValidations'] = [{
      sqref: 'A3',
      formula1: '"Option 1,Option 2,Option 3"',
      showDropDown: true,
    }];
  
    // Create a workbook
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Sheet 1': worksheet },
      SheetNames: ['Sheet 1'],
    };
  
    // Generate the Excel file
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    // Save the file
    FileSaver.saveAs(data, 'excel_with_dropdown.xlsx');
  }

  
}
