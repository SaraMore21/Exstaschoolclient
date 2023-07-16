import { Lesson } from "./lesson";
import { Presence } from "./presence";

export class AttendancePerLesson
{
    constructor(
    public  presence?:Presence, 
    public  lesson?:Lesson ){}
}