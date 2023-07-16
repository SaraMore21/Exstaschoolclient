import { UserPerSchool } from './user-per-school';
import {ProfessionCategory} from './profession-category'
import { User } from './user';
import { Indexer } from "./indexer";

export class Profession extends Indexer {
  constructor(
    public idprofession?: number,
    public name?: string,
    public coordinatorId?: number,
    public schoolId?: number,
    public userCreatedId?: number,
    public dateCreate?: Date,
    public userUpdatedId?: number,
    public dateUpdate?: Date,
    public professionCategoryId?:number,
    public isActive?:number,
    public uniqueCodeId ?:number,

    public schoolName?:string,
    public coordinator?: User,
    public professionCategory?:ProfessionCategory
  ) {
    super()
  }
}
