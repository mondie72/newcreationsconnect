export class Activity {
    startDateTimeUtc: Date;
    startDateTimeString: string;
    endDateTimeUtc: Date;
    endDateTimeString: string;
    type: string;
    name: string;
    speaker: string;
    description: string;
    url: string;
    accessCode: string;
}

export class ActivityTypes {
    speaker: string = 'Speaker Session';
    groupActivity: string = 'Group Activity';
    meal: string = 'Meal Time';
    registration: string = 'Registration/Check-In';
    break: string = 'Break Time'

    all: string[] = [this.speaker, this.groupActivity, this.meal, this.registration, this.break];
}