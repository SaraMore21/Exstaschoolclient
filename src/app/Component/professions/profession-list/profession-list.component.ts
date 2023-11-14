import { Profession } from './../../../Class/profession';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService, ConfirmEventType } from 'primeng/api';
import { ProfessionCategory } from 'src/app/Class/profession-category';
import { User } from 'src/app/Class/user';
import { UserPerSchool } from 'src/app/Class/user-per-school';
import { ProfessionService } from 'src/app/Service/profession.service';
import { SchoolService } from 'src/app/Service/school.service';
import { UserService } from 'src/app/Service/user.service';
import { ProfessionCategoryService } from 'src/app/Service/profession-category.service';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';
import { ObjectAndListSchoolToCoordinationCode } from 'src/app/Class/ObjectAndListSchoolToCoordinationCode';
import { SelectItem } from 'primeng/api';
import * as XLSX from 'xlsx';
import { StreetService } from 'src/app/Service/street.service';

@Component({
  selector: 'app-profession-list',
  templateUrl: './profession-list.component.html',
  styleUrls: ['./profession-list.component.css'],
  providers: [MessageService, ConfirmationService],
  encapsulation: ViewEncapsulation.None,

})

export class ProfessionListComponent implements OnInit {
  data: Array<SelectItem>
  ADate: SelectItem
  CurrentProfession: Profession = new Profession();
  displayModal: boolean = false
  CurrentSchool: any;
  IsAddCoordinationsCode: boolean = false;
  CurrentProfessionCategory: any;
  //אוביקט לשמירת הקוד תאום הנבחר
  CoordinationCode: string = '';
  ListUserPerCoordination: Array<User>;
  excelProfessionList: Array<any> = new Array<any>();
  constructor(
    public professionService: ProfessionService,
    public schoolService: SchoolService,
    public confirmationService: ConfirmationService,
    public messageService: MessageService,
    public userService: UserService,
    public GenericFunctionService: GenericFunctionService,
    public router: Router,
    private ngxService: NgxUiLoaderService,

  ) { }

  ngOnInit(): void {
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    debugger;
    if (this.professionService.ListProfession == null || this.professionService.ListProfession.length == 0)
      this.GetListProfession();
  }

  // שליפת כל המקצועות
  GetListProfession() {
    this.CurrentProfession.coordinator = new User();
    this.CurrentProfession.professionCategory = new ProfessionCategory();

    debugger
    this.professionService.GetAllProfessionByIdSchool(this.schoolService.ListSchool).subscribe(
      data => {
        debugger;
        this.professionService.ListProfession = data
        this.exportExcelAsync()
        for (let i = 0; i < this.professionService.ListProfession.length; i++) {
          this.professionService.ListProfession[i].index = i + 1
        }

      },
      err => { }
    )
  }

  // פתיחת דיילוג עריכה
  OpenUpdate(profession: Profession) {

    this.professionService.GetProfessionDetailsByProfessionId(profession.idprofession).subscribe(
      (data1) => {
        debugger;
        if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
          this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
            debugger;
            this.userService.ListUserByListSchoolAndYerbook = data;
            this.userService.ListUserPerSY = new Array<User>();
            this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == profession.schoolId);
            this.CurrentProfession = data1;
            this.CurrentProfessionCategory = this.schoolService.ProfessionCategories.find(f => f.value == this.CurrentProfession.professionCategoryId);
            // this.CurrentProfession.coordinator=this.userService.ListUserPerSY.find(f=>f.userPerSchoolID==this.CurrentProfession.coordinatorId)
          }, er => { });
        else if (this.userService.ListUserPerSY == null || this.userService.ListUserPerSY.length == 0 || this.userService.ListUserPerSY[0].schoolId != profession.schoolId) {
          this.userService.ListUserPerSY = new Array<User>();
          this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == profession.schoolId)
          this.CurrentProfession = data1;
          this.CurrentProfessionCategory = this.schoolService.ProfessionCategories.find(f => f.value == this.CurrentProfession.professionCategoryId);
          // this.CurrentProfession.coordinator=this.userService.ListUserPerSY.find(f=>f.userPerSchoolID==this.CurrentProfession.coordinatorId)
        }
        else
          this.CurrentProfession = data1;
        this.CurrentProfessionCategory = this.schoolService.ProfessionCategories.find(f => f.value == this.CurrentProfession.professionCategoryId);
        // this.CurrentProfession.coordinator=this.userService.ListUserPerSY.find(f=>f.userPerSchoolID==this.CurrentProfession.coordinatorId)
      },
      (err) => { }
    );

    this.displayModal = true;
  }

  // פתיחת דיילוג הוספה
  OpenAdd() {
    this.CurrentSchool = null;
    this.CurrentProfession = new Profession()
    this.CurrentProfession.coordinator = new User()
    this.CurrentProfession.professionCategory = new ProfessionCategory()
    this.displayModal = true
    if (this.schoolService.ListSchool.length == 1) {
      this.CurrentSchool = this.schoolService.ListSchool[0];
      this.ChangeSchool();
    }
  }

  //שמירת הוספה / עריכה
  SaveProfession() {
    if (this.CurrentProfession.idprofession == undefined) {
      debugger
      if (this.IsAddCoordinationsCode == true)
        this.AddCoordinationsProfession();
      else
        this.AddProfession();
    }
    else {
      if (this.CurrentProfession.uniqueCodeId != null)
        this.confirmationService.confirm({
          message: 'מקצוע זה נפתח למוסדות נוספים, האם ברצונכם לערוך את המקצוע בכל המוסדות או רק את המקצוע הזה?',
          header: 'שימי ♥',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: ' ערוך את כל המקצועות',
          rejectLabel: 'ערוך מקצוע זה בלבד',
          acceptIcon: 'pi',
          rejectIcon: 'pi',
          accept: () => {
            this.UpdateCoordinationProfession();
          },
          reject: (type) => {
            switch (type) {
              case ConfirmEventType.CANCEL:
                break;
              case ConfirmEventType.REJECT:
                this.UpdateProfession();
            }
          }
        });
      else
        this.UpdateProfession();
    }
  }

  // הוספת מקצוע
  AddProfession() {
    this.displayModal = false
    this.ngxService.start();
    debugger
    this.CurrentProfession.coordinatorId = this.CurrentProfession != null && this.CurrentProfession.coordinator.userPerSchoolID != null ? this.CurrentProfession.coordinator.userPerSchoolID : null
    this.CurrentProfession.professionCategoryId = this.CurrentProfessionCategory != null ? this.CurrentProfessionCategory.value : null;
    this.professionService.AddProfession(this.CurrentProfession, this.CurrentSchool.userId, this.CurrentSchool.school.idschool).subscribe(
      data => {
        if (data == null) {

          this.messageService.add({
            // key: 'tc',
            severity: 'error',
            summary: 'ההוספה נכשלה',
            detail: '   מקצוע זה קיים כבר במוסד זה',
          })
        }

        var x = data.coordinator
        debugger

        if (data != null) {
          if (this.professionService.ListProfessionPerS != null && this.professionService.ListProfessionPerS[0] && this.professionService.ListProfessionPerS[0].schoolId == data.schoolId)
            this.professionService.ListProfessionPerS.push(data);
          this.professionService.ListProfession.push(data)
          this.messageService.add({
            severity: 'success',
            summary: 'ההוספה הצליחה',
            detail: 'המקצוע נוסף בהצלחה',
          });
        }
        else {
          this.messageService.add({
            key: 'tc',
            severity: 'error',
            summary: 'שגיאה',
            detail: ' ההוספה נכשלה ',
          });
        }
      },
      err => {
        debugger
        this.messageService.add({
          key: 'tc',
          severity: 'error',
          summary: 'שגיאה',
          detail: ' ההוספה נכשלה אנא נסה שנית ',
        });
      }
    )
    this.ngxService.stop()

  }

  //עדכון מקצוע
  UpdateProfession() {
    this.ngxService.start();
    this.CurrentProfession.coordinatorId = this.CurrentProfession != null && this.CurrentProfession.coordinator.userPerSchoolID != null ? this.CurrentProfession.coordinator.userPerSchoolID : null
    this.CurrentProfession.professionCategoryId = this.CurrentProfessionCategory != null ? this.CurrentProfessionCategory.value : null;
    this.professionService.UpdateProfession(this.CurrentProfession, this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentProfession.schoolId).userId, this.CurrentProfession.schoolId).subscribe(
      data => {
        debugger
        if (data == null)
          this.messageService.add({
            severity: 'error',
            summary: 'העדכון נכשל',
            detail: 'לא ניתן לערוך מקצוע לשם זה כיוון שקיים כבר במוסד זה מקצוע בשם המבוקש',
          });
        else {
          var i = this.professionService.ListProfession.findIndex(f => f.idprofession == data.idprofession)
          if (i != -1) this.professionService.ListProfession[i] = data;
          this.professionService.ListProfession = [...this.professionService.ListProfession];
          debugger;
          this.messageService.add({
            severity: 'success',
            summary: 'העדכון הצליח',
            detail: 'המקצוע עודכן בהצלחה',
          });
        }
      },
      err => {
        this.messageService.add({
          key: 'tc',
          severity: 'error',
          summary: 'שגיאה',
          detail: 'העדכון נכשל אנא נסה שנית',
        });

      }
    )
    this.displayModal = false
    this.ngxService.stop()
  }
  //עדכון מקצועות תואמים
  UpdateCoordinationProfession() {
    this.CurrentProfession.coordinatorId = this.CurrentProfession != null && this.CurrentProfession.coordinator.userPerSchoolID != null ? this.CurrentProfession.coordinator.userPerSchoolID : null
    this.CurrentProfession.professionCategoryId = this.CurrentProfessionCategory != null ? this.CurrentProfessionCategory.value : null;
    var object = new ObjectAndListSchoolToCoordinationCode();
    this.CurrentProfession.professionCategory.idProfessionCategory = this.CurrentProfession.professionCategoryId;
    var School = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentProfession.schoolId)
    object.Profession = this.CurrentProfession;
    object.ListSchool = this.schoolService.ListSchool.filter(f => f.school.coordinationCode == School.school.coordinationCode);

    this.professionService.UpdateCoordinationProfession(object, this.schoolService.CustomerId, this.schoolService.userId, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
      debugger;
      if (data == null)
        this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'אין אפשרות לערוך מקצוע בשם זה כיוון שמקצוע בשם זה כבר קיים באחד מהמוסדות המבוקשים' });
      else {
        data.item1.forEach(element => {
          let i = this.professionService.ListProfession.findIndex(f => f.idprofession == element.idprofession)
          this.professionService.ListProfession[i] = { ...element };
          this.professionService.ListProfession = [...this.professionService.ListProfession];
        });

        if (this.userService.ListUserByListSchoolAndYerbook != null && this.userService.ListUserByListSchoolAndYerbook.length != 0) {
          for (let index = 0; index < this.userService.ListUserByListSchoolAndYerbook.length; index++) {
            if (this.schoolService.ListSchool.findIndex(i => i.school.idschool == this.userService.ListUserByListSchoolAndYerbook[index].schoolId) != -1 && this.userService.ListUserByListSchoolAndYerbook[index].userPerSchoolID == this.CurrentProfession.coordinatorId)
              this.userService.ListUserByListSchoolAndYerbook[index].uniqueCodeId = data.item3;
            if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY[index] && this.schoolService.ListSchool.findIndex(i => i.school.idschool == this.userService.ListUserPerSY[index].schoolId) != -1 && this.userService.ListUserPerSY[index].userPerSchoolID == this.CurrentProfession.coordinatorId)
              this.userService.ListUserPerSY[index].uniqueCodeId = data.item3;
          }
          this.userService.ListUserByListSchoolAndYerbook.push(...data.item2);
          if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY.length != 0)
            this.userService.ListUserPerSY.push(...data.item2.filter(f => f.schoolId == this.userService.ListUserPerSY[0].schoolId))
        }

        let arrayNewUser = new Array<any>();
        if (data.item4 != null && data.item4.length != 0) {
          arrayNewUser.push('שימי לב-למוסדות אלו נוספו משתמש תואם:' + '\n');
          data.item4.forEach(element => {
            arrayNewUser.push(element.schoolName + '\n');
          })
        }
        this.messageService.add({
          severity: 'success', summary: 'העדכון הצליח', sticky: true, key: "tc", detail: 'המקצוע עודכן בהצלחה לכל המוסדות המשוייכים לקוד תאום המבוקש\n' +
            arrayNewUser
        });

      }

    }, er => {
      this.messageService.add({ severity: "error", summary: 'שגיאה', sticky: true, key: "tc", detail: 'ארעה שגיאה, אנא נסה שנית' });
    })
    this.displayModal = false;
  }

  //מחיקת מקצוע
  DeletProfession(professionId: number,event: Event=null) {
    debugger;
    this.confirmationService.confirm({
      message: 'האם הנך בטוח כי ברצונך למחוק מקצוע זה   ?  ',
      header: 'מחיקת מקצוע',
      icon: 'pi pi-info-circle',
      acceptLabel: ' מחק ',
      rejectLabel: ' ביטול ',
      accept: () => {
        debugger;
        this.ngxService.start()
        this.professionService.DeleteProfession(professionId).subscribe(data => {
          if (data == 0) {
            var i = this.professionService.ListProfession.findIndex(f => f.idprofession == professionId);
            this.professionService.ListProfession.splice(i, 1);
            this.messageService.add({ severity: 'success', summary: 'המחיקה הצליחה', detail: 'לא נמצאו קורסים המשוייכים למקצוע זה', sticky: true });
          }
          else
            if (data == 1) {
              this.messageService.add({ severity: 'error', summary: 'מחיקה נכשלה', detail: 'נמצאו קורסים פעילים המשוייכם למקצוע זה', sticky: true });
            }
            else
              if (data == 2) {
                this.messageService.add({ severity: 'success', summary: ' פעולה בוצעה בהצלחה', detail: 'נמצאו קורסים לא פעילים המשוייכים למקצוע זה, מקצוע נהפך ללא פעיל', sticky: true });
              }
              else
                this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'המחיקה נכשלה ,אנא נסה שנית', sticky: true });
        }, er => { this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'המחיקה נכשלה ,אנא נסה שנית', sticky: true }); });
        this.ngxService.stop()
      },
      reject: () => {
      }
    })
    if (event!=null)
    event.stopPropagation();
  }
  //שליפת הנתונים הנדרשים-בעת שיוני מוסד
  ChangeSchool() {
    debugger
    if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        debugger;
        this.userService.ListUserByListSchoolAndYerbook = data;
        this.userService.ListUserPerSY = new Array<User>();
        this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentSchool.school.idschool);
      }, er => { });
    else if (this.userService.ListUserPerSY == null || this.userService.ListUserPerSY.length == 0 || this.userService.ListUserPerSY[0].schoolId != this.CurrentSchool.school.idschool) {
      this.userService.ListUserPerSY = new Array<User>();
      this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentSchool.school.idschool)
    }
  }
  //פתיחת דיאלוג הוספת מקצוע תואם
  OpenAddCoordinationsProfession() {
    this.IsAddCoordinationsCode = true;
    this.displayModal = true;
  }
  //הוספת מקצוע תואם
  AddCoordinationsProfession() {
    debugger;
    this.CurrentProfession.coordinatorId = this.CurrentProfession != null && this.CurrentProfession.coordinator.userPerSchoolID != null ? this.CurrentProfession.coordinator.userPerSchoolID : null
    this.CurrentProfession.professionCategoryId = this.CurrentProfessionCategory != null ? this.CurrentProfessionCategory.value : null;
    var object = new ObjectAndListSchoolToCoordinationCode();
    // this.CurrentProfession.professionCategory.idProfessionCategory = this.CurrentProfession.professionCategoryId;
    object.Profession = this.CurrentProfession;
    object.ListSchool = this.schoolService.ListSchool.filter(f => f.school.coordinationCode == this.CoordinationCode);
    this.professionService.AddCoordinationsProfession(object, this.schoolService.CustomerId, this.schoolService.userId, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
      debugger;
      if (data == null)
        this.messageService.add({ key: "tc", severity: 'warn', summary: 'שימי לב', detail: 'מקצוע זה קיים כבר באחד המוסדות המבוקשים' });
      else {
        this.professionService.ListProfession.push(...data.item1);
        if (this.userService.ListUserByListSchoolAndYerbook != null && this.userService.ListUserByListSchoolAndYerbook.length != 0) {
          for (let index = 0; index < this.userService.ListUserByListSchoolAndYerbook.length; index++) {
            if (this.schoolService.ListSchool.findIndex(i => i.school.idschool == this.userService.ListUserByListSchoolAndYerbook[index].schoolId) != -1 && this.userService.ListUserByListSchoolAndYerbook[index].userPerSchoolID == this.CurrentProfession.coordinator.userPerSchoolID)
              this.userService.ListUserByListSchoolAndYerbook[index].uniqueCodeId = data.item3;
            if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY[index] && this.schoolService.ListSchool.findIndex(i => i.school.idschool == this.userService.ListUserPerSY[index].schoolId) != -1 && this.userService.ListUserPerSY[index].userPerSchoolID == this.CurrentProfession.coordinator.userPerSchoolID)
              this.userService.ListUserPerSY[index].uniqueCodeId = data.item3;
          }
          this.userService.ListUserByListSchoolAndYerbook.push(...data.item2);
          if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY.length != 0)
            this.userService.ListUserPerSY.push(...data.item2.filter(f => f.schoolId == this.userService.ListUserPerSY[0].schoolId))
        }

        let arrayNewUser = new Array<any>();
        if (data.item2 != null && data.item2.length != 0) {
          arrayNewUser.push('שימי לב-למוסדות אלו נוספו משתמש תואם:' + '\n');
          data.item2.forEach(element => {
            arrayNewUser.push(element.schoolName + '\n');
          })
        }
        this.messageService.add({
          severity: 'success', summary: 'ההוספה הצליחה', sticky: true, key: "tc", detail: 'הקורס נוסף בהצלחה למוסדות המשוייכים לקוד תאום המבוקש\n' + arrayNewUser
        });

      }

    }, er => { })
    this.IsAddCoordinationsCode = false;
    this.displayModal = false;
  }
  //בעת שינוי קוד-שליפת הנתונים הנדרשים
  ChangeCoordinationCode() {
    var listSchoolCoordination = this.schoolService.ListSchool.filter(f => f.school.coordinationCode == this.CoordinationCode);
    if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        this.userService.ListUserByListSchoolAndYerbook = data;
        this.ListUserPerCoordination = this.userService.ListUserByListSchoolAndYerbook.filter(f => listSchoolCoordination.find(i => i.school.idschool == f.schoolId) != null);
        this.ListUserPerCoordination = this.GenericFunctionService.uniqueBy(this.ListUserPerCoordination, (o1, o2) => o1.iduser === o2.iduser);
      }, er => { });
    else {
      this.ListUserPerCoordination = this.userService.ListUserByListSchoolAndYerbook.filter(f => listSchoolCoordination.find(i => i.school.idschool == f.schoolId) != null);
      this.ListUserPerCoordination = this.GenericFunctionService.uniqueBy(this.ListUserPerCoordination, (o1, o2) => o1.iduser === o2.iduser);
    }
  }

  GoToDocumentsPerProfession(Profession: Profession) {
    debugger;
    if (Profession.uniqueCodeId == null)
      Profession.uniqueCodeId = 0;
    this.professionService.nameProfession = Profession.name;
    this.router.navigate(['Home/DocumentPerProfession', Profession.idprofession, Profession.schoolId, Profession.uniqueCodeId]);



  }

  exportExcelAsync() {

    debugger;

    this.professionService.ListProfession.forEach(p => {

      this.excelProfessionList.push(
        {
          'nameProfession': p.name,
          'category':  p.professionCategory!=null?p.professionCategory.name:'',
          'coordinatorName': p.coordinator!=null?p.coordinator.fullName:'',
          'cordinatorTz': p.coordinator!=null?p.coordinator.tz:'',
          'school': p.schoolName
         

        })
    })

  }



  // sendToExportExcel() {
  //   debugger
  //   if (this.excelProfessionList.length == 0)
  //     this.exportExcelAsync()

  //   else
  //     this.exportExcel()
  // }
  exportExcel() {



    debugger;
    //var fileName=this.data.find(f=>f.value==this.ADate).label;
    let Heading = [['שם מקצוע', 'קטגוריה', 'שם רכז מקצוע','מ.ז רכז מקצוע','מוסד']];

    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheet, Heading);

    //Starting in the second row to avoid overriding and skipping headers
    XLSX.utils.sheet_add_json(worksheet, this.excelProfessionList, { origin: 'A2', skipHeader: true });
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    if (!workbook.Workbook) workbook.Workbook = {};
    if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
    if (!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
    workbook.Workbook.Views[0].RTL = true;
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, "Profession");
  }
  saveAsExcelFile(buffer: any, fileName: string): void {
    console.log(
      this.data

    );
    //fileName=this.data.find(f=>f.value==this.ADate).label;
    import("file-saver").then(FileSaver => {
      let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
      });
      FileSaver.saveAs(data, fileName);
    });
  }
}
