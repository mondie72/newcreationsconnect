import { Component } from '@angular/core';
import { ModalController, NavController, NavParams, ViewController } from 'ionic-angular';
import * as moment from 'moment';

import { EventService } from '../../../../_services/event.service';
import { Activity, ActivityTypes } from '../../../../_models/Activity';
import { EventTypes } from '../../../../_models/Event';

import { ValidationResults } from '../../../../app/components/_common/validation-results/validation-results.component';

@Component({
    selector: 'activity-edit',
    templateUrl: 'activity-edit.html'
})
export class ActivityEdit {

    eventId: string;
    eventType: string;
    eventDate: string;
    activity: Activity = new Activity();
    startYearRange: number = moment().year();
    endYearRange: number = moment().year() + 2;

    constructor(
        public activityTypes: ActivityTypes,
        private eventService: EventService,
        private eventTypes: EventTypes,
        private modalController: ModalController,
        private navController: NavController,
        private navParams: NavParams,
        private viewController: ViewController
    ) {
        // if we have an eventId it's a new activity
        this.eventId = this.navParams.get('eventId');
        this.eventType = this.navParams.get('eventType');
        var activity = this.navParams.get('activity');

        if (activity !== 'new') {
            this.activity = activity;
            this.activity.startDateString = activity.startDateString
        }
        else if (activity === 'new') {
            var eventDateString = this.navParams.get('eventDate');
            this.activity = new Activity();
            this.activity.startDateString = moment(eventDateString).format();
            this.activity.endDateString = moment(eventDateString).format();
            this.eventDate = moment(eventDateString).format('ddd, MMMM Do');
        }
    }

    saveActivity() {
        this.eventService.saveActivity(this.eventId, this.activity, () => {
            if (!this.eventService.validationResult.isSuccessful()) {
                let modal = this.modalController.create(
                    ValidationResults,
                    { messages: this.eventService.validationResult.messages, title: 'Error(s) Saving Activity' });
                modal.present();
            } else {
                this.navController.pop();
            }
        });
    }

    startDateChanged() {
        var mEndDateTimeString = moment(this.activity.startDateString).add(1, 'hour');
        this.activity.endDateString = mEndDateTimeString.format();
    }

    typeChanged() {
        this.clearActivityFields();
        if (this.activity.type === this.activityTypes.registration) {
            this.activity.name = this.activityTypes.registration;
        }
    }

    private clearActivityFields() {
        this.activity.description = "";
        this.activity.name = "";
        this.activity.speaker = "";
    }

    dismiss() {
        this.viewController.dismiss();
    }
}