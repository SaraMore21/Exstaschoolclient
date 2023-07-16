import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { User } from 'src/app/Class/user';
import { SchoolService } from 'src/app/Service/school.service';
import { UserService } from 'src/app/Service/user.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SelectItem } from 'primeng/api';
import * as XLSX from 'xlsx';
import { StreetService } from 'src/app/Service/street.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class UserListComponent implements OnInit {
  data: Array<SelectItem>
  ADate: SelectItem
  excelUserList: Array<any> = new Array<any>()
  constructor(
    public userService: UserService,
    public schoolService: SchoolService,
    public router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private ngxService: NgxUiLoaderService,
    private StreetService: StreetService
  ) { }

  ngOnInit(): void {
    debugger;
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.GetListUsers();
  }
  //שליפת רשימת המשתמשים
  GetListUsers() {
    this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
      debugger; this.userService.ListUserByListSchoolAndYerbook = data
      for (let i = 0; i < this.userService.ListUserByListSchoolAndYerbook.length; i++) {
        this.userService.ListUserByListSchoolAndYerbook[i].index = i + 1
      }
    }, er => { })
  }
  //מעבר לקומפוננטת הוספת משתמש
  AddUser() {
    this.router.navigate(["Home/AddOrUpdateUser/" + 0, 0])
  }
  //מעבר לקומפוננטת עריכת פרטי משתמש
  EditDetailsUser(idUser: number, SchoolId: number) {
    // debugger;
    this.router.navigate(["Home/AddOrUpdateUser/" + idUser, SchoolId])
  }
  //מחיקת משתמש
  DeletUser(user: User) {
    debugger;
    this.confirmationService.confirm({
      message: 'האם הנך בטוח כי ברצונך למחוק משתמש זה   ?  ',
      header: 'מחיקת משתמש',
      icon: 'pi pi-info-circle',
      acceptLabel: ' מחק ',
      rejectLabel: ' ביטול ',
      accept: () => {
        debugger;
        this.ngxService.start();
        this.userService.DeleteUser(user.iduser, user.schoolId).subscribe(data => {
          if (data == 1) {
            var i = this.userService.ListUserByListSchoolAndYerbook.findIndex(f => f.iduser == user.iduser && f.schoolId == user.schoolId);
            if (i != -1)
              this.userService.ListUserByListSchoolAndYerbook.splice(i, 1);
            i = this.userService.ListUserPerSY.findIndex(f => f.iduser == user.iduser && f.schoolId == user.schoolId);
            if (i != -1)
              this.userService.ListUserPerSY.splice(i, 1);
            this.messageService.add({ severity: 'success', summary: 'המחיקה הצליחה', detail: 'המשתמש הוסר בהצלחה' });
          }
          else
            if (data == 3) {
              this.messageService.add({ severity: 'error', summary: 'המחיקה נכשלה', detail: 'לא ניתן להשלים את הפעולה, מאחר ולמשתמש זה ישנם שיוכים מקושרים  ', sticky: true });
            }
            else
              this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'המחיקה נכשלה ,אנא נסה שנית', sticky: true });

          this.ngxService.stop();


        }, er => {
          debugger;
          this.ngxService.stop();
          this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'המחיקה נכשלה ,אנא נסה שנית', sticky: true });
        });
      },
      reject: () => {
      }
    })
  }

  GoToDocumentsPerUser(user: User) {
    debugger;
    if (user.uniqueCodeId == null)
      user.uniqueCodeId = 0;
    this.userService.NameUser = user.lastName + " " + user.firstName;
    this.router.navigate(['Home/DocumentPerUser', user.userPerSchoolID, user.schoolId, user.uniqueCodeId, this.userService.YearbookIdPerUser]);
  }
  ChangeCity(s) {

    if ((this.StreetService.StreetsPerCity == null || this.StreetService.StreetsPerCity.length == 0 || this.StreetService.StreetsPerCity[0].cityId != s.City.value) && (s != null && s.City != null))
      this.StreetService.GetStreetsByCityId(s.City.value).subscribe(data => { this.StreetService.StreetsPerCity = data }, er => { })
  }
  exportExcelAsync() {
   
    debugger
    return new Promise((resolve, reject) => {
    
     var users:[number, number][]= [];
     
      
      this.userService.ListUserByListSchoolAndYerbook.forEach(u => 
        users.push([u.iduser,u.schoolId])
      
       );
       debugger
        let idschool:number=this.userService.ListUserByListSchoolAndYerbook[1].schoolId
        let tz:any=this.userService.ListUserByListSchoolAndYerbook[1].tz
        this.userService.GetListUserDetailsByIDUser(users).subscribe(dd => {
          console.log(dd)
          let city
          let neigborhood
          let street
         dd.forEach(d=>{
            

        
          if (d.address != null) {
            city = this.schoolService.Cities.find((f) => f.value == d.address.cityId);
            neigborhood = this.schoolService.Neigborhoods.find(
              (f) => f.value == d.address.neighborhoodId
            );
          }
         
          if (city) {
            this.ChangeCity(d);
            street = this.StreetService.StreetsPerCity.find(
              (f) => f.idstreet == d.address.streetId
            );
          }
          let citizenship
          let country
          let countryofImmigration
          if (d.birth != null) {
            citizenship = this.schoolService.Countries.find(
              (f) => f.value == d.birth.citizenshipId
            );
            country = this.schoolService.Countries.find(
              (f) => f.value == d.birth.birthCountryId
            );
            countryofImmigration =
              this.schoolService.Countries.find(
                (f) => f.value == d.birth.countryIdofImmigration
              );
          }
          let gender = this.schoolService.Genders.find(
            (f) => f.value == d.genderId
          );
          this.excelUserList.push(
            {
              'tz': d.tz,
              'typeTz':'',
              // 'typeTz': d.typeIdentity != null ? d.typeIdentity.name : '',
              
              // 'code': u.userCode, 'typeTz': typeIdentity != null ? typeIdentity.name : '',
              'code': '',
              'fname': d.firstName,
              'lname': d.lastName,
              'gender': gender!=null?gender.name:'',
              'eBirthdate': d.birth.birthDate != null ? d.birth.birthDate : '',
            
              // 'hBirthdate': u.birthץ != null ? u.birth.birthHebrewDate : '',
              'hBirthdate': d.birth != null ? d.birth.birthHebrewDate : '',
              'birthCountry': country != null ? country.name : '',
              'citizenship': citizenship != null ? citizenship.name : '',
              'imigrationDate': d.birth != null ? d.birth.dateOfImmigration : '',
              'imigrationCountry': countryofImmigration != null ? countryofImmigration.name : '',
              // 'famStatus': status != null ? status.name : '',
              'foreginFname': d.foreignFirstName,
              'foreginLname': d.foreignLastName,
              // 'prevLname': d.previusName,
              'phone1': d.contactInformation != null ? d.contactInformation.telephoneNumber1 : '',
              'phone2': d.contactInformation != null ? d.contactInformation.telephoneNumber2 : '',
              'cell1': d.contactInformation != null ? d.contactInformation.phoneNumber1 : '',
              'cell2': d.contactInformation != null ? d.contactInformation.phoneNumber2 : '',
              'cell3': d.contactInformation != null ? d.contactInformation.phoneNumber3 : '',
               'fax': d.contactInformation != null ? d.contactInformation.faxNumber : '',
              'email': d.contactInformationl != null ? d.contactInformation.email : '',

           
              // 'guardianTypeTz': apotropusTypeIdentity != null ? apotropusTypeIdentity.name : '',
              // 'active': d.isActive ? 'פעיל' : 'לא פעיל',
              // 'studentStatus': studentStatus != null ? studentStatus.name : '',
              // 'reason': s.reasonForLeaving,
              'city': city != null ? city.name : '',
              // 'neighborhood': neigborhood != null ? neigborhood.name : '',

              'street': street != null ? street.name : '',
              'building': d.address != null ? d.address.houseNumber : '',
              'apartment': d.address != null ? d.address.apartmentNumber : '',
              'poBox': d.address != null ? d.address.poBox : '',
              'zip': d.address != null ? d.address.zipCode : '',
              'moreDetails':d.contactInformationl!=null? d.contactInformationl.comment: '',
              'note': d.note,
            
            }
          )
         
        })

      })
    })
  }
  sendToExportExcel() {
    if (this.excelUserList.length == 0) {
      this.exportExcelAsync()
        .then(() => {
          debugger
          this.exportExcel()
        }
        )
    }
    else
      this.exportExcel()
  }
  exportExcel() {

    debugger;
    //var fileName=this.data.find(f=>f.value==this.ADate).label;
    let Heading = [['מספר זיהוי', 'סוג זיהוי', 'קוד', 'פרטי', 'משפחה', 'מין', 'תאריך לידה לועזי', '	תאריך עברי',
      'ארץ לידה', 'אזרחות', ' תאריך עליה', 'ארץ עליה', '	פרטי בלועזית	משפחה', ' בלועזית	שם משפחה קודם', 'טלפון1', '	טלפון2', 'נייד1', '	נייד2', 'נייד3', '	פקס', '	מייל', '	עיר',
      '	רחוב', '	בנין', '	דירה', '	ת.ד.', '	מיקוד', 'פרטים נוספים', 'הערה'
    ]];


    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheet, Heading);

    //Starting in the second row to avoid overriding and skipping headers
    XLSX.utils.sheet_add_json(worksheet, this.excelUserList, { origin: 'A2', skipHeader: true });
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    if (!workbook.Workbook) workbook.Workbook = {};
    if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
    if (!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
    workbook.Workbook.Views[0].RTL = true;
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, "User");
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
