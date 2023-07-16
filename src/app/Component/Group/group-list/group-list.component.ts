import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from 'src/app/Service/group.service';
import { SchoolService } from 'src/app/Service/school.service';
import { UserService } from 'src/app/Service/user.service';
import { AgeGroupService } from 'src/app/Service/age-group.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Group } from 'src/app/Class/group';
import { UserPerGroup } from 'src/app/Class/user-per-group'
import { ConvertDateToStringService } from 'src/app/Service/convert-date-to-string.service';
import { AgeGroup } from 'src/app/Class/age-group';
import { User } from 'src/app/Class/user';
import { SelectItem } from 'primeng/api';
import * as XLSX from 'xlsx';
import { StreetService } from 'src/app/Service/street.service';
import { log } from 'console';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService]
})

export class GroupListComponent implements OnInit {
  data: Array<SelectItem>
  ADate: SelectItem
  Group: any;
  edit: boolean = false;
  CurrentGroup: any;
  ListGroup: Array<any> = new Array<any>();
  SelectNameGroup: Group = new Group();
  ListUsersPerGroup: any;
  Showedit: boolean = false;
  currIndex:number;
  excelGroupList: Array<any> = new Array<any>();
  isCoordinatedGroup:boolean=false
  coordinationCode:string
  AgeGroupPerCoordinatedSchool:Array<AgeGroup>
  //TypeGroupPerCoordinatedSchool:Array<any>

  constructor(
    public userService: UserService,
    public groupService: GroupService,
    public schoolService: SchoolService,
    public ageGroupService: AgeGroupService,
    public router: Router,
    public convertDateToStringService: ConvertDateToStringService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private GenericFunctionService:GenericFunctionService
  ) { }

  ngOnInit(): void {
    
    debugger;
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }

    if (this.ageGroupService.AgeGroups == null || this.ageGroupService.AgeGroups.length == 0)
      this.GetAllAgeGroupsBySchools();
    else {
      if (this.groupService.ListGroupsByListSchoolAndYerbook == null || this.groupService.ListGroupsByListSchoolAndYerbook.length == 0)
        this.GetGroupsByIdSchool();
      else {
        
        var yearbook;
        this.schoolService.ListSchool.find(f => f.appYearbookPerSchools.find(f => {
          if (f.idyearbookPerSchool == this.groupService.ListGroupsByListSchoolAndYerbook[0].yearbookId) yearbook = f;
        }));
        if (yearbook.yearbookId != this.schoolService.SelectYearbook.idyearbook)
          this.GetGroupsByIdSchool();
      }
     
    }

    if(this.groupService.ListGroupsByListSchoolAndYerbook){
    for(let i=0; i<this.groupService.ListGroupsByListSchoolAndYerbook.length;i++)
    {
        this.groupService.ListGroupsByListSchoolAndYerbook[i].index=i+1
    }
    this.currIndex= this.groupService.ListGroupsByListSchoolAndYerbook.length+1
  }
  }
  //שליפת הקובצות הפעילות בשנה זו במוסד
  GetGroupsByIdSchool() {

    return this.groupService.GetGroupsByIdSchool(this.schoolService.ListSchool, this.schoolService.SelectYearbook != null ? this.schoolService.SelectYearbook.idyearbook : null).subscribe(data => {
      debugger; this.groupService.ListGroupsByListSchoolAndYerbook = data;
      for(let i=0; i<this.groupService.ListGroupsByListSchoolAndYerbook.length;i++)
      {
          this.groupService.ListGroupsByListSchoolAndYerbook[i].index=i+1
      }


      // this.groupService.ListGroupsByListSchoolAndYerbook.forEach(element => {
      //   element.Yearbook = this.schoolService.Yearbooks.find(f => f.value == element.group.yearbookId);
      //   element.AgeGroup = this.ageGroupService.AgeGroups.find(f => f.idageGroup == element.group.ageGroupId);
      //   element.TypeGroup = this.schoolService.TypeGroups.find(f => f.value == element.group.typeGroupId);
      // });
    }, er => { })
  }
  //מעבר למסמכים לתלמידה
  GoToDocumentsPerGroup(group: any) {
    debugger;
    this.groupService.NameGroup = group.group.nameGroup;
    this.router.navigate(['Home/DocumentsPerGroup', group.idgroupPerYearbook, group.schoolID, this.schoolService.SelectYearbook.idyearbook]);
  }
  //שליחה לקומפוננטה שליפת תלמידים בקבוצה
  StudentPerGroup(group: any) {
    this.router.navigate(["Home/StudentsPerGroup/" + group.idgroupPerYearbook]);
  }
  //מחיקת קבוצה
  DeleteGroup(group: any) {
    debugger;
    this.confirmationService.confirm({
      message: 'האם הנך בטוח כי ברצונך למחוק קבוצה זו   ?  ',
      header: 'מחיקת קבוצה',
      icon: 'pi pi-info-circle',
      acceptLabel: ' מחק ',
      rejectLabel: ' ביטול ',
      accept: () => {
        this.groupService.DeleteGroup(group.idgroupPerYearbook, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
          if (data == 1 || data == 2) {
            var i = this.groupService.ListGroupsByListSchoolAndYerbook.findIndex(f => f.idgroupPerYearbook == group.idgroupPerYearbook);
            this.messageService.add({ severity: 'success', summary: 'המחיקה הצליחה', detail: 'הקבוצה הוסרה בהצלחה' });
            this.groupService.ListGroupsByListSchoolAndYerbook.splice(i, 1);
          }
          else
            this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'המחיקה נכשלה ,אנא נסה שנית', sticky: true });
          if (data == 2) {
            var j = this.ListGroup.findIndex(f => f.idgroup == group.groupId);
            this.ListGroup.splice(j, 1);
          }
        }, er => { this.messageService.add({ severity: 'error', summary: 'ארעה תקלה', detail: 'המחיקה נכשלה ,אנא נסה שנית', sticky: true }); });
      },
      reject: () => {
      }
    });
  }

  //פתיחת דיאלוג עריכת קבוצה
  EditDetailsGroup(G: any) {
    debugger;
    this.edit = true; this.Showedit = true;
    this.CurrentGroup = { ...G };
    console.log("cg:");
    
    console.log(this.CurrentGroup);
    if (this.ageGroupService.AgeGroups != null && this.ageGroupService.AgeGroupsPerSchool == null || this.ageGroupService.AgeGroupsPerSchool.length == 0 || this.ageGroupService.AgeGroupsPerSchool[0].schoolId != this.CurrentGroup.group.schoolId) {
      this.ageGroupService.AgeGroupsPerSchool = new Array<AgeGroup>();
      this.ageGroupService.AgeGroups.forEach(f => {
        if (f.schoolId == this.CurrentGroup.group.schoolId)
          this.ageGroupService.AgeGroupsPerSchool.push(f);
      })
    }

    // element.Yearbook = this.schoolService.Yearbooks.find(f => f.value == element.group.yearbookId);
    this.CurrentGroup.AgeGroup = this.ageGroupService.AgeGroups.find(f => f.idageGroup == this.CurrentGroup.group.ageGroupId);
    this.CurrentGroup.TypeGroup = this.schoolService.TypeGroups.find(f => f.value == this.CurrentGroup.group.typeGroupId);

    if (this.ListGroup == null || this.ListGroup.length == 0 || (this.ListGroup.length == 1 && this.ListGroup[0].idgroup == 0) || this.ListGroup.find(f => f.schoolId != undefined).schoolId != G.group.schoolId)
      this.groupService.GetAllNameGroup(G.group.schoolId).subscribe(data => {
        this.ListGroup = data;
     
        var group = new Group();
        group.idgroup = 0;
        group.nameGroup = "אחר";
        this.ListGroup.push(group);
        this.ListGroup.sort((a, b) => a.idgroup - b.idgroup);
        debugger
        this.SelectNameGroup = this.ListGroup.find(f => f.idgroup == G.groupId)
      }, er => { })
    else
    {
      debugger
      this.SelectNameGroup = this.ListGroup.find(f => f.idgroup == G.groupId)
    }
    if (this.CurrentGroup.User == null)
      this.groupService.GetUsersPerGroupByGroupId(G.idgroupPerYearbook).subscribe(data1 => {
        debugger;
        if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
          this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
            debugger;
            this.userService.ListUserByListSchoolAndYerbook = data;
            this.userService.ListUserPerSY = new Array<User>();
            if (this.CurrentGroup && this.CurrentGroup.group) {
              this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentGroup.group.schoolId);
              this.PushUserPerGroup(data1);
            }
          }, er => { });
        else {
          if (this.CurrentGroup && this.CurrentGroup.group && (this.userService.ListUserPerSY == null || this.userService.ListUserPerSY.length == 0 || this.userService.ListUserPerSY[0].schoolId != this.CurrentGroup.group.schoolId)) {
            this.userService.ListUserPerSY = new Array<User>();
            this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentGroup.group.schoolId)
          }
          this.PushUserPerGroup(data1);
        }
      }
        , er => { })
  }
  //שליחה לסרבר לפי ההתאמה -הוספת קורס לשנתון/למוסד/הוספה
  SaveEditOrAdd() {
    debugger;

    //#region הוספה
    if (this.CurrentGroup.idgroupPerYearbook == null) {
      //#region הוספת קבוצה לשנתון
      if (this.SelectNameGroup.idgroup != 0) {
        debugger;
        this.CurrentGroup.userId = this.CurrentGroup.User != null ? this.CurrentGroup.User.userPerSchoolID : null;
        var school = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentGroup.School.school.idschool);
        this.groupService.AddGroupInYearbook(this.CurrentGroup.User != null ? this.CurrentGroup.User.userPerSchoolID : null, this.SelectNameGroup.idgroup, school.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook).idyearbookPerSchool, school.userId).subscribe(data => {
          debugger;
          if (data == null)
            this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'ההוספה נכשלה לא ניתן להוסיף קבוצה קיימת' });
          else {
            debugger;
            data.index=this.currIndex
            this.currIndex+=1
            this.groupService.ListGroupsByListSchoolAndYerbook.push(data);
            data.AgeGroup = this.ageGroupService.AgeGroups.find(f => f.idageGroup == data.group.ageGroupId);
            data.TypeGroup = this.schoolService.TypeGroups.find(f => f.value == data.group.typeGroupId);
            this.messageService.add({ severity: 'success', summary: 'ההוספה הצליחה', detail: 'הקבוצה נוספה בהצלחה' })
          }
        }, er => { })
      }
      //#endregion
      //#region הוספת קבוצה למוסד ולשנתון
      else {
        this.CurrentGroup.userId = this.CurrentGroup.User != null ? this.CurrentGroup.User.userPerSchoolID : null;
        this.CurrentGroup.yearbookId = this.schoolService.SelectYearbook != null ? this.schoolService.SelectYearbook : null;
        this.CurrentGroup.ageGroupId = this.CurrentGroup.AgeGroup != null ? this.CurrentGroup.AgeGroup.idageGroup : null;
        this.CurrentGroup.typeGroupId = this.CurrentGroup.TypeGroup != null ? this.CurrentGroup.TypeGroup.value : null;
        this.groupService.AddGroup(this.CurrentGroup, this.CurrentGroup.School.userId, this.CurrentGroup.School.school.idschool, this.CurrentGroup.School.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook).idyearbookPerSchool, this.CurrentGroup.User.userPerSchoolID).subscribe(data => {
          debugger;
          if (data != null) {
            data.AgeGroup = this.ageGroupService.AgeGroups.find(f => f.idageGroup == data.group.ageGroupId);
            data.TypeGroup = this.schoolService.TypeGroups.find(f => f.value == data.group.typeGroupId);
            data.schoolName = this.CurrentGroup.School.school.name;
            data.index = this.currIndex
            this.currIndex+=1
            this.groupService.ListGroupsByListSchoolAndYerbook.push(data);
            
            this.ListGroup.push(data.group);
            this.messageService.add({ severity: 'success', summary: 'ההוספה הצליחה', detail: 'הקבוצה נוספה בהצלחה' })
          }
          else
            this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'ההוספה נכשלה אנא נסה שנית' });
        }, er => {
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'ההוספה נכשלה אנא נסה שנית' });
        })
      }
      //#endregion
    }
    //#endregion
    //#region עריכה
    else {

      var s = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentGroup.group.schoolId)
      var yearbook = s.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook);

      debugger;
      //#region  בדיקות תקינות על השיוכי מורה לקורס
      if (this.ListUsersPerGroup == null || this.ListUsersPerGroup.length == 0) {
        this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'לא קיים שיוך מורה לקורס' }); return;
      }
      this.ListUsersPerGroup = this.ListUsersPerGroup.sort((a, b) => new Date(a.fromDate + " 00:00:00").getTime() - new Date(b.fromDate + " 00:00:00").getTime());
      for (var i = 0; i < this.ListUsersPerGroup.length; i++) {
        if (this.ListUsersPerGroup[i].user == null || this.ListUsersPerGroup[i].fromDate == "" || this.ListUsersPerGroup[i].fromDate == null || this.ListUsersPerGroup[i].toDate == "" || this.ListUsersPerGroup[i].toDate == null) {
          this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'שיוך לא תקין-אחד הנתונים רייק' }); return;
        }
        if (this.ListUsersPerGroup[i].fromDate > this.ListUsersPerGroup[i].toDate) {
          this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'תאריך סיום קטן מתאריך התחלה' }); return;
        }
        if (this.ListUsersPerGroup[i + 1] && new Date(this.ListUsersPerGroup[i].toDate) >= new Date(this.ListUsersPerGroup[i + 1].fromDate)) {
          this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'ישנו תאריך הקיים בכמה שיוכים' }); return;
        }
        if (this.ListUsersPerGroup[i + 1] && new Date(new Date(this.ListUsersPerGroup[i].toDate).getFullYear(), new Date(this.ListUsersPerGroup[i].toDate).getMonth(), new Date(this.ListUsersPerGroup[i].toDate).getDate() + 1) < new Date(this.ListUsersPerGroup[i + 1].fromDate + " 00:00:00")) {
          this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'ישנו תאריך שלא קיים באף שיוך' }); return;
        }
        if (this.ListUsersPerGroup[i + 1] && this.ListUsersPerGroup[i + 1].user && this.ListUsersPerGroup[i].user.userPerSchoolID == this.ListUsersPerGroup[i + 1].user.userPerSchoolID) {
          this.ListUsersPerGroup[i + 1].fromDate = this.ListUsersPerGroup[i].fromDate;
          this.ListUsersPerGroup.splice(this.ListUsersPerGroup[i], 1);
          i--;
        }
      }
      if (new Date(this.ListUsersPerGroup[this.ListUsersPerGroup.length - 1].toDate + " 00:00:00").getTime() != new Date(yearbook.toDate).getTime() || new Date(this.ListUsersPerGroup[0].fromDate + " 00:00:00").getTime() != new Date(yearbook.fromDate).getTime()) {
        this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: ' התאריכים שנבחרו אינם תואמים לתאריכים של שנה זו' + " בין " + this.convertDateToStringService.formatDate(new Date(yearbook.fromDate)) + " עד " + this.convertDateToStringService.formatDate(new Date(yearbook.toDate)) }); return;
      }
      //#endregion
      this.groupService.EditGroup(this.CurrentGroup.idgroupPerYearbook, this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentGroup.group.schoolId).userId, this.ListUsersPerGroup).subscribe(data => {
        debugger;
       let  editedGroup:Group=new Group()
      if(this.SelectNameGroup.nameGroup && this.SelectNameGroup.nameGroup!='אחר' )
           this.CurrentGroup.nameGroup=this.SelectNameGroup.nameGroup
      
       editedGroup.ageGroupId=this.CurrentGroup.AgeGroup.idageGroup
        editedGroup.idgroup=this.CurrentGroup.group.idgroup
        editedGroup.typeGroupId=this.CurrentGroup.TypeGroup.value
        editedGroup.nameGroup=this.CurrentGroup.nameGroup

        this.groupService.EditGroup2(this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentGroup.group.schoolId).userId,editedGroup).subscribe(data1 => {
          this.CurrentGroup.group=data1
         // this.CurrentGroup.nameGroup=data1.nameGroup
         // this.CurrentGroup.group.ageGroupName
         // this.CurrentGroup.group.typeGroupName

          this.groupService.ListGroupsByListSchoolAndYerbook.splice(this.groupService.ListGroupsByListSchoolAndYerbook.findIndex(g=>g.groupId==this.CurrentGroup.groupId),1,this.CurrentGroup)
          //this.ListGroup.splice(this.ListGroup.findIndex(g=>g.groupId==this.CurrentGroup.groupId),1,this.CurrentGroup.group)
        },err=>{console.log(err)});
       
          
        debugger;
        if (data = true)
          this.messageService.add({ severity: 'success', summary: 'העדכון הצליח', detail: 'הקבוצה עודכנה בהצלחה' })
        else
          this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'העדכון נכשל אנא נסה שנית' });
      }, er => {
        this.messageService.add({ key: 'tc', severity: 'error', summary: 'שגיאה', detail: 'העדכון נכשל אנא נסה שנית' });
      })

    }
    //#endregion
    this.edit = false;
  }
  //פתיחת דיאלוג הוספת קבוצה
  AddGroup(group: any) {
    debugger;
    this.edit = true; this.Showedit = false;
    this.CurrentGroup = { ...group };
    this.SelectNameGroup = new Group();
    if (this.schoolService.ListSchool.length == 1) {
      this.CurrentGroup.School = this.schoolService.ListSchool[0];
      this.ChangeSchool();
    }
  }
  //מחיקת שיוך מורה לקבוצה
  DeleteUserPerGroup(UPG: UserPerGroup) {
    debugger;
    this.ListUsersPerGroup.splice(this.ListUsersPerGroup.findIndex(f => f.IduserPerGroup == UPG.iduserPerGroup && f.fromDate == UPG.fromDate && f.toDate == UPG.toDate && f.userId == UPG.userId && f.user == UPG.user), 1)
  }
  //הוספת שיוך מורה לקבוצה
  newUserPerGroup() {
    this.ListUsersPerGroup.push(new UserPerGroup());
  }
  //שליפת שכבות גיל למוסדות
  GetAllAgeGroupsBySchools() {
    this.ageGroupService.GetAllAgeGroupsBySchools(this.schoolService.ListSchool).subscribe(data => {
      this.ageGroupService.AgeGroups = data;
      this.GetGroupsByIdSchool();

    }, er => { });
  }
  //לאחר הזנת מוסד בהוספה
  ChangeSchool() {
    debugger;
    // this.userService.GetAllUserBySchoolId(this.CurrentGroup.School.school.idschool).subscribe(data => { this.userService.ListUser = data }, er => { });
    if (this.userService.ListUserByListSchoolAndYerbook == null || this.userService.ListUserByListSchoolAndYerbook.length == 0 || this.userService.YearbookIdPerUser != this.schoolService.SelectYearbook.idyearbook)
      this.userService.GetUsersBySchoolIDAndYearbookId(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
        debugger;
        this.userService.ListUserByListSchoolAndYerbook = data;
        this.userService.ListUserPerSY = new Array<User>();
        if (this.CurrentGroup && this.CurrentGroup.School && this.CurrentGroup.School.school && this.CurrentGroup.School.school)
          this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentGroup.School.school.idschool);
      }, er => { });
    else {
      if ((this.CurrentGroup && this.CurrentGroup.School && this.CurrentGroup.School.school) && (this.userService.ListUserPerSY == null || this.userService.ListUserPerSY.length == 0 || this.userService.ListUserPerSY[0].schoolId != this.CurrentGroup.School.school.idschool)) {
        this.userService.ListUserPerSY = new Array<User>();
        this.userService.ListUserPerSY = this.userService.ListUserByListSchoolAndYerbook.filter(f => f.schoolId == this.CurrentGroup.School.school.idschool)
      }
    }
    this.groupService.GetAllNameGroup(this.CurrentGroup.School.school.idschool).subscribe(data => {
      this.ListGroup = data
      var group = new Group();
      group.idgroup = 0;
      group.nameGroup = "אחר";
      this.ListGroup.push(group);
      this.ListGroup.sort((a, b) => a.idgroup - b.idgroup);
    }, er => { })
    if (this.ageGroupService.AgeGroups != null && this.ageGroupService.AgeGroupsPerSchool == null || this.ageGroupService.AgeGroupsPerSchool.length == 0 || this.ageGroupService.AgeGroupsPerSchool[0].schoolId != this.CurrentGroup.School.school.idschool) {
      this.ageGroupService.AgeGroupsPerSchool = new Array<AgeGroup>();
      this.ageGroupService.AgeGroups.forEach(f => {
        if (f.schoolId == this.CurrentGroup.School.school.idschool)
          this.ageGroupService.AgeGroupsPerSchool.push(f);
      })
    }
  }

  PushUserPerGroup(ListUPG: any) {
    this.ListUsersPerGroup = ListUPG;
    this.ListUsersPerGroup.forEach(element => {
      element.user = this.userService.ListUserPerSY.find(f => element && element.user && f.iduser == element.user.iduser)
      element.fromDate = this.convertDateToStringService.formatDate(new Date(element.fromDate))
      element.toDate = this.convertDateToStringService.formatDate(new Date(element.toDate))
    });
  }
}
