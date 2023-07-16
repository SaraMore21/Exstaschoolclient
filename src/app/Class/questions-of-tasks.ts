export class QuestionsOfTasks {
    constructor(
        public idquestionOfTask?: number,
        public name?: string,
        public taskId?: number,
        public percent?: number,
        public number?: number,
        public UniqeCodeId ?:number,
        public UserCreatedId?: number,
        public DateCreated?: Date,
        public UserUpdatedId?: number,
        public DateUpdate?: Date
    ) { }
}
