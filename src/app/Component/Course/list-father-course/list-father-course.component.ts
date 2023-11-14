import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FatherCourse } from 'src/app/Class/father-course';
import { Profession } from 'src/app/Class/profession';
import { FatherCourseService } from 'src/app/Service/father-course.service';
import { ProfessionService } from 'src/app/Service/profession.service';
import { SchoolService } from 'src/app/Service/school.service';
import { ConfirmationService, MessageService, Message, ConfirmEventType } from 'primeng/api';
import { Course } from 'src/app/Class/course';
import { GenericFunctionService } from 'src/app/Service/generic-function.service';
import { UserService } from 'src/app/Service/user.service';
import { INSPECT_MAX_BYTES } from 'buffer';
import { fchmod } from 'fs';
import { SelectItem } from 'primeng/api';
import { CoordinationService } from 'src/app/Service/coordination.service';
@Component({
  selector: 'app-list-father-course',
  templateUrl: './list-father-course.component.html',
  styleUrls: ['./list-father-course.component.css'],
  providers: [MessageService, ConfirmationService]

})
export class ListFatherCourseComponent implements OnInit {
  data: Array<SelectItem>
  ADate: SelectItem
  edit: boolean = false;
  CurrentCourse: FatherCourse;
  SelectProfession: Profession;
  SelectLearningStyle: any;
  add: boolean = false;
  CurrentSchool: any;
  IsAddCoordinationsCode
  //אוביקט לשמירת הקוד תאום הנבחר
  CoordinationCode: any;
  //אוביקט -רשימת המקצועות למוסדות התואמים(לפי קוד תיאום)
  ListProfessionPerCoordinationSchool: Array<Profession>;
  currIndex:number

  constructor(public fatherCourseService: FatherCourseService, public userService: UserService, public schoolService: SchoolService, public professionService: ProfessionService, public router: Router,
    public messageService: MessageService, public confirmationService: ConfirmationService, public GenericFunctionService: GenericFunctionService, public coordinationService: CoordinationService) { }

  ngOnInit(): void {
    console.log(this.coordinationService.listCoordinationsPerSchools);
    
    if (this.schoolService.ListSchool == null || this.schoolService.ListSchool.length == 0) {
      this.router.navigate(['Login']);
      return;
    }
    if (this.fatherCourseService.ListFatherCourse == null || this.fatherCourseService.ListFatherCourse.length == 0 || this.schoolService.ListSchool.find(f => f.school.idschool == this.fatherCourseService.ListFatherCourse[0].schoolId).appYearbookPerSchools.find(f => f.idyearbookPerSchool == this.fatherCourseService.ListFatherCourse[0].yearbookId).yearbookId != this.schoolService.SelectYearbook.idyearbook)
      this.GetAllFatherCourse();
  }
  //שליפת הקורסים בשנה המבוקשת לפי מוסד
  GetAllFatherCourse() {
    debugger;
    this.fatherCourseService.GetListFatherCoursesBySchoolAndYearbook(this.schoolService.ListSchool, this.schoolService.SelectYearbook.idyearbook).subscribe(data => {
      this.fatherCourseService.ListFatherCourse = data
      for(let i=0;i<this.fatherCourseService.ListFatherCourse.length;i++){
        this.fatherCourseService.ListFatherCourse[i].index=i+1
      }
      this.currIndex=this.fatherCourseService.ListFatherCourse.length+1
    }, er => { })
  }
  //פתיחת דיאלוג עריכת קורס
  EditDetailsFatherCrouse(course: FatherCourse,event: Event=null) {
    debugger;
    this.edit = true; this.add = false;
    this.CurrentCourse = { ...course };
    this.CurrentSchool = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentCourse.schoolId);
    if (this.professionService.ListProfession == null || this.professionService.ListProfession.length == 0)
      this.professionService.GetAllProfessionByIdSchool(this.schoolService.ListSchool).subscribe(data => {
        this.professionService.ListProfession = data;
        this.professionService.ListProfessionPerS = this.professionService.ListProfession.filter(f => f.schoolId == course.schoolId);
        this.SelectProfession = this.professionService.ListProfessionPerS.find(f => f.idprofession == course.professionId);
      }, er => { })
    else if (this.professionService.ListProfessionPerS == null || this.professionService.ListProfessionPerS.length == 0 || this.professionService.ListProfessionPerS[0].schoolId != course.schoolId)
      this.professionService.ListProfessionPerS = this.professionService.ListProfession.filter(f => f.schoolId == course.schoolId);
    this.SelectProfession = this.professionService.ListProfessionPerS.find(f => f.idprofession == course.professionId);

    this.SelectLearningStyle = this.schoolService.LearningStyle.find(f => f.value == course.learningStyleId);
    if (event!=null)
    event.stopPropagation();
  }
  //פתיחת דיאלוג הוספת קורס אב
  AddCrouseFather() {
    debugger;
    this.edit = true;
    this.add = true;
    this.CurrentCourse = new FatherCourse(); this.SelectProfession = null; this.SelectLearningStyle = null;
    if (this.schoolService.ListSchool != null && this.schoolService.ListSchool.length == 1) {
      this.CurrentSchool = this.schoolService.ListSchool[0];
      this.ChangeSchool();
    }
    else this.CurrentSchool = null;
  }
  //שמירת עריכת קורס
  SaveEditFatherCourse() {
  

    this.CurrentCourse.userUpdatedId = this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentCourse.schoolId).useId;
    this.CurrentCourse.dateUpdate = new Date();
    this.fatherCourseService.EditFatherCourse(this.CurrentCourse).subscribe(data => {
      debugger;
      if (data != null) {
        var i = this.fatherCourseService.ListFatherCourse.findIndex(f => f.idcourse == data.idcourse);
        data.index=this.CurrentCourse.index
        this.fatherCourseService.ListFatherCourse[i] = data;
        this.fatherCourseService.ListFatherCourse = [...this.fatherCourseService.ListFatherCourse];
        this.messageService.add({ key: "tc", severity: 'success', summary: 'העדכון הצליח', detail: 'הקורס עודכן בהצלחה' });
      }
      else
        this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'אין אפשרות לערוך קורס זה כיוון שקורס בשם זה כבר קיים במוסד המבוקש' });

    }, er => {
      this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'ארעה שגיאה, אנא נסה שנית' });
    })
  }
  //שמירת-הוספה/עריכת -קורס אב/קורס אב תואם
  SaveEditOrAdd() {
    debugger;

      

    this.CurrentCourse.learningStyleId = this.SelectLearningStyle.value;
    this.CurrentCourse.professionId = this.SelectProfession.idprofession;
    this.CurrentCourse.professionName = this.SelectProfession.name;
    //#region הוספת קורסי-אב תואמים
    if (this.IsAddCoordinationsCode == true) {
      var object = new ObjectFatherCoursekAndListSchools();
      object.FatherCourse = this.CurrentCourse;
      object.ListSchool = this.schoolService.ListSchool.filter(f => f.school.coordinationCode == this.CoordinationCode);
      this.fatherCourseService.AddCoordinationsFatherCourse(this.schoolService.SelectYearbook.idyearbook, object, this.schoolService.CustomerId).subscribe(data => {
        debugger;
        if (data == null)
          this.messageService.add({ key: "tc", severity: 'warn', summary: 'שימי לב', detail: 'קורס זה קיים כבר באחד המוסדות המבוקשים' });
        else {
          this.fatherCourseService.ListFatherCourse.push(...data.item1);
          if (this.professionService.ListProfession != null && this.professionService.ListProfession.length != 0) {
            this.professionService.ListProfession.forEach(element => {
              if (this.schoolService.ListSchool.findIndex(i => i.school.idschool == element.schoolId) != -1 && element.name == this.CurrentCourse.professionName)
                element.uniqueCodeId = data.item4;
            });
            this.professionService.ListProfession.push(...data.item2);
          }
          var coordinator = this.professionService.ListProfession.find(f => f.idprofession == this.CurrentCourse.professionId).coordinator;
          var userPerSchoolId = coordinator != null ? coordinator.userPerSchoolID : null;
          if (this.userService.ListUserByListSchoolAndYerbook != null && this.userService.ListUserByListSchoolAndYerbook.length != 0) {
            for (let index = 0; index < this.userService.ListUserByListSchoolAndYerbook.length; index++) {
              if (this.schoolService.ListSchool.findIndex(i => i.school.idschool == this.userService.ListUserByListSchoolAndYerbook[index].schoolId) != -1 && this.userService.ListUserByListSchoolAndYerbook[index].userPerSchoolID == userPerSchoolId)
                this.userService.ListUserByListSchoolAndYerbook[index].uniqueCodeId = data.item5;
              if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY[index] && this.schoolService.ListSchool.findIndex(i => i.school.idschool == this.userService.ListUserPerSY[index].schoolId) != -1 && this.userService.ListUserPerSY[index].userPerSchoolID == userPerSchoolId)
                this.userService.ListUserPerSY[index].uniqueCodeId = data.item5;
            }
            this.userService.ListUserByListSchoolAndYerbook.push(...data.item3);
            if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY.length != 0)
              this.userService.ListUserPerSY.push(...data.item3.filter(f => f.schoolId == this.userService.ListUserPerSY[0].schoolId))
          }

          let arrayNewProfession = new Array<any>();
          if (data.item2 != null && data.item2.length != 0) {
            arrayNewProfession.push('שימי לב-למוסדות אלו נוספו מקצוע תואם:' + '\n');
            data.item2.forEach(element => {
              arrayNewProfession.push(element.schoolName + '\n')
            })
          }
          let arrayNewUser = new Array<any>();
          if (data.item3 != null && data.item3.length != 0) {
            arrayNewUser.push('שימי לב-למוסדות אלו נוספו משתמש תואם:' + '\n');
            data.item3.forEach(element => {
              arrayNewUser.push(element.schoolName + '\n');
            })
          }
          this.messageService.add({
            severity: 'success', summary: 'ההוספה הצליחה', sticky: true, key: "tc", detail: 'הקורס נוסף בהצלחה למוסדות המשוייכים לקוד תאום המבוקש\n' +
              arrayNewProfession + arrayNewUser
          });
        }
      }, er => {
        this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'ארעה שגיאה, אנא נסה שנית' });

      });
      this.IsAddCoordinationsCode = false;
    }
    //#endregion
    //this.CurrentCourse.code=
    //#region הוספת קורס אב
    else if (this.add == true) {
      this.add = false;
      this.CurrentCourse.schoolId = this.CurrentSchool.school.idschool;
      this.CurrentCourse.yearbookId = this.CurrentSchool.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook).idyearbookPerSchool;
      this.CurrentCourse.userCreatedId = this.CurrentSchool.userId;
      this.CurrentCourse.dateCreate = new Date();
      this.fatherCourseService.AddFatherCourse(this.CurrentCourse).subscribe(data => {
        if (data != null) {
          debugger;
          data.index=this.currIndex
          this.currIndex+=1
          this.fatherCourseService.ListFatherCourse.push(data);
          this.messageService.add({ key: "tc", severity: 'success', summary: 'ההוספה הצליחה', detail: 'הקורס נוסף בהצלחה' });
        }
        else
          this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'לא ניתן להוסיף קורס אב שכבר קיים' });
      }, er => {
        this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'ארעה שגיאה, אנא נסה שנית' });
      })

    }
    //#endregion
    //#region עריכה
    else {
      if (this.CurrentCourse.uniqueCodeId == null || this.CurrentCourse.uniqueCodeId == 0)
        this.SaveEditFatherCourse();
      else
        this.confirmationService.confirm({
          message: 'קורס זה נפתח למוסדות נוספים, האם ברצונכם לערוך את הקורס בכל המוסדות או רק את הקורס הזה?',
          header: 'שימי ♥',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: ' ערוך את כל הקורסים',
          rejectLabel: 'ערוך קורס זה בלבד',
          acceptIcon: 'pi',
          rejectIcon: 'pi',

          accept: () => {
            debugger;
            //#region עריכת קורס תואם כולל הקורסים המקבילים לו
            this.fatherCourseService.EditCoordinatorCourseFather(this.CurrentCourse, this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentCourse.schoolId).userId, this.schoolService.CustomerId).subscribe(data => {
              debugger;
              if (data == null)
                this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'אין אפשרות לערוך קורס זה כיוון שקורס בשם זה כבר קיים באחד מהמוסדות המבוקשים' });
              else {
                data.item1.forEach(FC => {
                  var i = this.fatherCourseService.ListFatherCourse.findIndex(f => f.idcourse == FC.idcourse);
                  if (i != -1) this.fatherCourseService.ListFatherCourse[i] = { ...FC };
                });
                this.fatherCourseService.ListFatherCourse = [...this.fatherCourseService.ListFatherCourse];
                if (this.professionService.ListProfession != null && this.professionService.ListProfession.length != 0) {
                  this.professionService.ListProfession.forEach(element => {
                    if (this.schoolService.ListSchool.findIndex(i => i.school.idschool == element.schoolId) != -1 && element.name == this.CurrentCourse.professionName)
                      element.uniqueCodeId = data.item3;
                  });
                  this.professionService.ListProfession.push(...data.item2);
                }
                var coordinator = this.professionService.ListProfession.find(f => f.idprofession == this.CurrentCourse.professionId).coordinator;
                var userPerSchoolId = coordinator != null ? coordinator.userPerSchoolID : null;
                if (this.userService.ListUserByListSchoolAndYerbook != null && this.userService.ListUserByListSchoolAndYerbook.length != 0) {
                  for (let index = 0; index < this.userService.ListUserByListSchoolAndYerbook.length; index++) {
                    if (this.schoolService.ListSchool.findIndex(i => i.school.idschool == this.userService.ListUserByListSchoolAndYerbook[index].schoolId) != -1 && this.userService.ListUserByListSchoolAndYerbook[index].userPerSchoolID == userPerSchoolId)
                      this.userService.ListUserByListSchoolAndYerbook[index].uniqueCodeId = data.item5;
                    if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY[index] && this.schoolService.ListSchool.findIndex(i => i.school.idschool == this.userService.ListUserPerSY[index].schoolId) != -1 && this.userService.ListUserPerSY[index].userPerSchoolID == userPerSchoolId)
                      this.userService.ListUserPerSY[index].uniqueCodeId = data.item5;
                  }
                  this.userService.ListUserByListSchoolAndYerbook.push(...data.item4);
                  if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY.length != 0)
                    this.userService.ListUserPerSY.push(...data.item4.filter(f => f.schoolId == this.userService.ListUserPerSY[0].schoolId))
                }

                let arrayNewProfession = new Array<any>();
                if (data.item2 != null && data.item2.length != 0) {
                  arrayNewProfession.push('שימי לב-למוסדות אלו נוספו מקצוע תואם:' + '\n');
                  data.item2.forEach(element => {
                    arrayNewProfession.push(element.schoolName + '\n')
                  })
                }
                let arrayNewUser = new Array<any>();
                if (data.item4 != null && data.item4.length != 0) {
                  arrayNewUser.push('שימי לב-למוסדות אלו נוספו משתמש תואם:' + '\n');
                  data.item4.forEach(element => {
                    arrayNewUser.push(element.schoolName + '\n');
                  })
                }
                this.messageService.add({
                  severity: 'success', summary: 'ההוספה הצליחה', sticky: true, key: "tc", detail: 'הקורס עודכן בהצלחה לכל המוסדות המשוייכים לקוד תאום המבוקש\n' +
                    arrayNewProfession + arrayNewUser
                });
              }

            }, er => {
              this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'ארעה שגיאה, אנא נסה שנית' });
            })
            //#endregion
          },
          reject: (type) => {
            switch (type) {
              case ConfirmEventType.CANCEL:
                break;
              case ConfirmEventType.REJECT:
                debugger;
                //#region עריכת קורס אב
                this.SaveEditFatherCourse();
              //#endregion
            }
          }
        });
    }
    //#endregion
    this.edit = false;
  }






//הפונקציה בלי רוב השינויים
// SaveEditOrAdd() {
//   debugger;

    

//   this.CurrentCourse.learningStyleId = this.SelectLearningStyle.value;
//   this.CurrentCourse.professionId = this.SelectProfession.idprofession;
//   this.CurrentCourse.professionName = this.SelectProfession.name;
//   //#region הוספת קורסי-אב תואמים
//   if (this.IsAddCoordinationsCode == true) {
//     var object = new ObjectFatherCoursekAndCoordinationId();
//     //this.CurrentCourse.coordinationTypeId=this.CoordinationCode
//     object.FatherCourse = this.CurrentCourse;
//    // object.ListSchool = this.schoolService.ListSchool.filter(f => f.school.coordinationCode == this.CoordinationCode);
//    object.CoordinationId = this.CoordinationCode
//     this.fatherCourseService.AddCoordinationsFatherCourse(this.schoolService.SelectYearbook.idyearbook, object, this.schoolService.CustomerId).subscribe(data => {
//       debugger;
//       if (data == null)
//         this.messageService.add({ key: "tc", severity: 'warn', summary: 'שימי לב', detail: 'קורס זה קיים כבר באחד המוסדות המבוקשים' });
//       else {
//         this.fatherCourseService.ListFatherCourse.push(...data.item1);
//         if (this.professionService.ListProfession != null && this.professionService.ListProfession.length != 0) {
//           this.professionService.ListProfession.forEach(element => {
//             if (this.schoolService.ListSchool.findIndex(i => i.school.idschool == element.schoolId) != -1 && element.name == this.CurrentCourse.professionName)
//               element.uniqueCodeId = data.item4;
//           });
//           this.professionService.ListProfession.push(...data.item2);
//         }
//         var coordinator = this.professionService.ListProfession.find(f => f.idprofession == this.CurrentCourse.professionId).coordinator;
//         var userPerSchoolId = coordinator != null ? coordinator.userPerSchoolID : null;
//         if (this.userService.ListUserByListSchoolAndYerbook != null && this.userService.ListUserByListSchoolAndYerbook.length != 0) {
//           for (let index = 0; index < this.userService.ListUserByListSchoolAndYerbook.length; index++) {
//             if (this.schoolService.ListSchool.findIndex(i => i.school.idschool == this.userService.ListUserByListSchoolAndYerbook[index].schoolId) != -1 && this.userService.ListUserByListSchoolAndYerbook[index].userPerSchoolID == userPerSchoolId)
//               this.userService.ListUserByListSchoolAndYerbook[index].uniqueCodeId = data.item5;
//             if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY[index] && this.schoolService.ListSchool.findIndex(i => i.school.idschool == this.userService.ListUserPerSY[index].schoolId) != -1 && this.userService.ListUserPerSY[index].userPerSchoolID == userPerSchoolId)
//               this.userService.ListUserPerSY[index].uniqueCodeId = data.item5;
//           }
//           this.userService.ListUserByListSchoolAndYerbook.push(...data.item3);
//           if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY.length != 0)
//             this.userService.ListUserPerSY.push(...data.item3.filter(f => f.schoolId == this.userService.ListUserPerSY[0].schoolId))
//         }

//         let arrayNewProfession = new Array<any>();
//         if (data.item2 != null && data.item2.length != 0) {
//           arrayNewProfession.push('שימי לב-למוסדות אלו נוספו מקצוע תואם:' + '\n');
//           data.item2.forEach(element => {
//             arrayNewProfession.push(element.schoolName + '\n')
//           })
//         }
//         let arrayNewUser = new Array<any>();
//         if (data.item3 != null && data.item3.length != 0) {
//           arrayNewUser.push('שימי לב-למוסדות אלו נוספו משתמש תואם:' + '\n');
//           data.item3.forEach(element => {
//             arrayNewUser.push(element.schoolName + '\n');
//           })
//         }
//         this.messageService.add({
//           severity: 'success', summary: 'ההוספה הצליחה', sticky: true, key: "tc", detail: 'הקורס נוסף בהצלחה למוסדות המשוייכים לקוד תאום המבוקש\n' +
//             arrayNewProfession + arrayNewUser
//         });
//       }
//     }, er => {
//       this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'ארעה שגיאה, אנא נסה שנית' });

//     });
//     this.IsAddCoordinationsCode = false;
//   }
//   //#endregion
//   //this.CurrentCourse.code=
//   //#region הוספת קורס אב
//   else if (this.add == true) {
//     this.add = false;
//     this.CurrentCourse.schoolId = this.CurrentSchool.school.idschool;
//     this.CurrentCourse.yearbookId = this.CurrentSchool.appYearbookPerSchools.find(f => f.yearbookId == this.schoolService.SelectYearbook.idyearbook).idyearbookPerSchool;
//     this.CurrentCourse.userCreatedId = this.CurrentSchool.userId;
//     this.CurrentCourse.dateCreate = new Date();
//     this.fatherCourseService.AddFatherCourse(this.CurrentCourse).subscribe(data => {
//       if (data != null) {
//         debugger;
//         data.index=this.currIndex
//         this.currIndex+=1
//         this.fatherCourseService.ListFatherCourse.push(data);
//         this.messageService.add({ key: "tc", severity: 'success', summary: 'ההוספה הצליחה', detail: 'הקורס נוסף בהצלחה' });
//       }
//       else
//         this.messageService.add({ key: "tc", severity: 'warn', summary: 'שגיאה', detail: 'לא ניתן להוסיף קורס אב שכבר קיים' });
//     }, er => {
//       this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'ארעה שגיאה, אנא נסה שנית' });
//     })

//   }
//   //#endregion
//   //#region עריכה
//   else {
//     if (this.CurrentCourse.uniqueCodeId == null || this.CurrentCourse.uniqueCodeId == 0)
//       this.SaveEditFatherCourse();
//     else
//       this.confirmationService.confirm({
//         message: 'קורס זה נפתח למוסדות נוספים, האם ברצונכם לערוך את הקורס בכל המוסדות או רק את הקורס הזה?',
//         header: 'שימי ♥',
//         icon: 'pi pi-exclamation-triangle',
//         acceptLabel: ' ערוך את כל הקורסים',
//         rejectLabel: 'ערוך קורס זה בלבד',
//         acceptIcon: 'pi',
//         rejectIcon: 'pi',

//         accept: () => {
//           debugger;
//           //#region עריכת קורס תואם כולל הקורסים המקבילים לו
//           this.fatherCourseService.EditCoordinatorCourseFather(this.CurrentCourse, this.schoolService.ListSchool.find(f => f.school.idschool == this.CurrentCourse.schoolId).userId, this.schoolService.CustomerId).subscribe(data => {
//             debugger;
//             if (data == null)
//               this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'אין אפשרות לערוך קורס זה כיוון שקורס בשם זה כבר קיים באחד מהמוסדות המבוקשים' });
//             else {
//               data.item1.forEach(FC => {
//                 var i = this.fatherCourseService.ListFatherCourse.findIndex(f => f.idcourse == FC.idcourse);
//                 if (i != -1) this.fatherCourseService.ListFatherCourse[i] = { ...FC };
//               });
//               this.fatherCourseService.ListFatherCourse = [...this.fatherCourseService.ListFatherCourse];
//               if (this.professionService.ListProfession != null && this.professionService.ListProfession.length != 0) {
//                 this.professionService.ListProfession.forEach(element => {
//                   if (this.schoolService.ListSchool.findIndex(i => i.school.idschool == element.schoolId) != -1 && element.name == this.CurrentCourse.professionName)
//                     element.uniqueCodeId = data.item3;
//                 });
//                 this.professionService.ListProfession.push(...data.item2);
//               }
//               var coordinator = this.professionService.ListProfession.find(f => f.idprofession == this.CurrentCourse.professionId).coordinator;
//               var userPerSchoolId = coordinator != null ? coordinator.userPerSchoolID : null;
//               if (this.userService.ListUserByListSchoolAndYerbook != null && this.userService.ListUserByListSchoolAndYerbook.length != 0) {
//                 for (let index = 0; index < this.userService.ListUserByListSchoolAndYerbook.length; index++) {
//                   if (this.schoolService.ListSchool.findIndex(i => i.school.idschool == this.userService.ListUserByListSchoolAndYerbook[index].schoolId) != -1 && this.userService.ListUserByListSchoolAndYerbook[index].userPerSchoolID == userPerSchoolId)
//                     this.userService.ListUserByListSchoolAndYerbook[index].uniqueCodeId = data.item5;
//                   if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY[index] && this.schoolService.ListSchool.findIndex(i => i.school.idschool == this.userService.ListUserPerSY[index].schoolId) != -1 && this.userService.ListUserPerSY[index].userPerSchoolID == userPerSchoolId)
//                     this.userService.ListUserPerSY[index].uniqueCodeId = data.item5;
//                 }
//                 this.userService.ListUserByListSchoolAndYerbook.push(...data.item4);
//                 if (this.userService.ListUserPerSY != null && this.userService.ListUserPerSY.length != 0)
//                   this.userService.ListUserPerSY.push(...data.item4.filter(f => f.schoolId == this.userService.ListUserPerSY[0].schoolId))
//               }

//               let arrayNewProfession = new Array<any>();
//               if (data.item2 != null && data.item2.length != 0) {
//                 arrayNewProfession.push('שימי לב-למוסדות אלו נוספו מקצוע תואם:' + '\n');
//                 data.item2.forEach(element => {
//                   arrayNewProfession.push(element.schoolName + '\n')
//                 })
//               }
//               let arrayNewUser = new Array<any>();
//               if (data.item4 != null && data.item4.length != 0) {
//                 arrayNewUser.push('שימי לב-למוסדות אלו נוספו משתמש תואם:' + '\n');
//                 data.item4.forEach(element => {
//                   arrayNewUser.push(element.schoolName + '\n');
//                 })
//               }
//               this.messageService.add({
//                 severity: 'success', summary: 'ההוספה הצליחה', sticky: true, key: "tc", detail: 'הקורס עודכן בהצלחה לכל המוסדות המשוייכים לקוד תאום המבוקש\n' +
//                   arrayNewProfession + arrayNewUser
//               });
//             }

//           }, er => {
//             this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: 'ארעה שגיאה, אנא נסה שנית' });
//           })
//           //#endregion
//         },
//         reject: (type) => {
//           switch (type) {
//             case ConfirmEventType.CANCEL:
//               break;
//             case ConfirmEventType.REJECT:
//               debugger;
//               //#region עריכת קורס אב
//               this.SaveEditFatherCourse();
//             //#endregion
//           }
//         }
//       });
//   }
//   //#endregion
//   this.edit = false;
// }









  

  //שליפת נתונים בעת שינוי מוסד
  ChangeSchool() {
    debugger;
    if (this.professionService.ListProfession == null || this.professionService.ListProfession.length == 0)
      this.professionService.GetAllProfessionByIdSchool(this.schoolService.ListSchool).subscribe(data => {
        this.professionService.ListProfession = data;
        this.professionService.ListProfessionPerS = this.professionService.ListProfession.filter(f => f.schoolId == this.CurrentSchool.school.idschool);
      }, er => { })
    else if (this.professionService.ListProfessionPerS == null || this.professionService.ListProfessionPerS.length == 0 || this.professionService.ListProfessionPerS[0].schoolId != this.CurrentSchool.school.idschool) {
      this.professionService.ListProfessionPerS = this.professionService.ListProfession.filter(f => f.schoolId == this.CurrentSchool.school.idschool);
    }
  }
  //מחיקת קורס אב
  DeleteFatherCrouse(fatherCourse: FatherCourse,event:Event) {
    debugger;
    this.confirmationService.confirm({
      message: 'האם הנך בטוח כי ברצונך למחוק קורס אב זה   ?  ',
      header: 'מחיקת קורס אב',
      icon: 'pi pi-info-circle',
      acceptLabel: ' מחק ',
      rejectLabel: ' ביטול ',
      accept: () => {
        debugger;
        this.fatherCourseService.DeleteFatherCrouse(fatherCourse.idcourse).subscribe(data => {
          if (data == true) {
            this.messageService.add({ key: "tc", severity: 'success', summary: 'המחיקה הצליחה', detail: 'הקורס אב נמחק בהצלחה' });
            var i = this.fatherCourseService.ListFatherCourse.findIndex(f => f.idcourse == fatherCourse.idcourse);
            this.fatherCourseService.ListFatherCourse.splice(i, 1);
          }
          else
            this.messageService.add({ key: "tc", severity: 'warn', summary: 'המחיקה בוטלה', detail: 'אין אפשרות למחוק קורס אב זה כיוון שיש קורסים המשוייכים אליו' });
        }, er => {
          this.messageService.add({ key: "tc", severity: 'error', summary: 'שגיאה', detail: ' המחיקה נכשלה,אנא נסה שנית' });
        });
      },
      reject: () => {
      }
    });
    if (event!=null)
    event.stopPropagation();
  }
  //מעבר לקומפוננטה קורסים
  GoToListCourse(fatherCourse: FatherCourse, event:Event=null) {
 
    this.router.navigate(["Home/ListCourse", fatherCourse.idcourse, fatherCourse.schoolId, fatherCourse.yearbookId])
  }
  //פתיחת דיאלוג הוספת קרוס תואם
  AddCoordinationsCrouseFather() {
    this.IsAddCoordinationsCode = true;
    this.CoordinationCode = '';
    this.AddCrouseFather();
  }
  //שליפת נתונים בעת שינוי קוד תואם
  ChangeCoordinationCode() {
    if (this.professionService.ListProfession == null || this.professionService.ListProfession.length == 0)
      this.professionService.GetAllProfessionByIdSchool(this.schoolService.ListSchool).subscribe(data => {
        this.professionService.ListProfession = data;
        var listSchoolCoordination = this.schoolService.ListSchool.filter(f => f.school.coordinationCode == this.CoordinationCode);
        this.ListProfessionPerCoordinationSchool = this.professionService.ListProfession.filter(f => listSchoolCoordination.find(i => i.school.idschool == f.schoolId) != null);
        this.ListProfessionPerCoordinationSchool = this.GenericFunctionService.uniqueBy(this.ListProfessionPerCoordinationSchool, (o1, o2) => o1.name === o2.name);
      }, er => { });
    else {
      var listSchoolCoordination = this.schoolService.ListSchool.filter(f => f.school.coordinationCode == this.CoordinationCode);
      this.ListProfessionPerCoordinationSchool = this.professionService.ListProfession.filter(f => listSchoolCoordination.find(i => i.school.idschool == f.schoolId) != null);
      this.ListProfessionPerCoordinationSchool = this.GenericFunctionService.uniqueBy(this.ListProfessionPerCoordinationSchool, (o1, o2) => o1.name === o2.name);
    }
  }
  //העברה לקומפוננטת מסמכים לקורס אב
  GoToDocumentsPerFatherCourse(fatherCourse: FatherCourse) {
    debugger;
    if (fatherCourse.uniqueCodeId == null)
      fatherCourse.uniqueCodeId = 0;
    this.fatherCourseService.NameCourse = fatherCourse.name;
    this.router.navigate(['Home/DocumentsPerFatherCourse', fatherCourse.idcourse, fatherCourse.schoolId, fatherCourse.uniqueCodeId]);
  }
  exportExcel() {
    debugger;
    let Heading = ['קוד',' מטלת אב',' קוד מטלה','שם מטלה','שם קורס','אחראי מטלה','מועד א',' מועד ב',' מועד ג',' אחוזים',  'ציון עובר',  'מחיר']
   //var fileName=this.data.find(f=>f.value==this.ADate).label;

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.fatherCourseService.ListFatherCourse);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "listFatherCourse");
    });
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
      FileSaver.saveAs(data, fileName );
    });
  }
}

//מחלקה המכילה מוסדות וקורס אב
export class ObjectFatherCoursekAndListSchools {

  constructor(
    public FatherCourse?: FatherCourse,
    public ListSchool?: any
  ) { }
}
