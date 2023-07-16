import { StatusTaskPerformance } from './StatusTaskPerformance';




export class TaskToStudent {
  constructor(
    public idtaskToStudent?: number,
    public taskExsistId?: number,
    public studentId?: number,
    public userCreatedId?: number,
    public dateCreated?: Date,
    public userUpdatedId?: number,
    public dateUpdated?: Date,
    public dateNeedSubmit?: Date,
    public dateNeedSubmitStr?: string,
    public dateSubmit?: Date,
    public grade?: number,
    public paymentStatusId?: number,
    public paymentMethodId?: number,
    public receivePaymentId?: number,
    public amountReceived?: number,
    public comment?: string,
    public administratorApproval?: boolean,
    public yearBookId?: number,
    public studentName?: string,
    public studentTz ?:string,
    public code?: string,

    public isEdit ?:boolean,

    public paymentStatusName?:string,
    public paymentMethodName ?:string,
    public receivePaymentName ?:string,
    public isActiveTask ?: boolean,
    public finalScore ?:number,
    public appScoreStudentPerQuestionsOfTasks?: any,
    public statusTaskPerformanceId?:number,
    public statusTaskPerformance?:StatusTaskPerformance,
    // public statusTaskPerformance?:any

    public show?:boolean

  ) {
  }
}
