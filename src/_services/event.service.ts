import { Injectable } from '@angular/core';
import * as _ from 'underscore';
import * as moment from 'moment';

import { Database } from '@ionic/cloud-angular';
//import { Observable } from 'rxjs';

import { ValidationResult, ValidationMessageTypes } from '../_services/_common/validation';
import { UtilityService } from '../_services/_common/utility.service';
import { ReplaySubject } from 'rxjs';

import { Event } from '../_models/Event';
import { Activity } from '../_models/Activity';

@Injectable()
export class EventService {

    eventsDbCollection = this.db.collection("events");
    activeEvents: ReplaySubject<Event[]> = new ReplaySubject<Event[]>();
    draftEvents: ReplaySubject<Event[]> = new ReplaySubject<Event[]>();

    constructor(
        private db: Database,
        private util: UtilityService,
        private messageTypes: ValidationMessageTypes
    ) {
        this.db.status().subscribe(status => console.log(status));
        this.eventsDbCollection
            .findAll({ status: "Active" }, { status: "Draft" })
            .watch()
            .subscribe(events => {
                this.activeEvents.next(_.filter(events, event => {
                    return event.status === 'Active';
                }));
                this.draftEvents.next(_.filter(events, event => {
                    return event.status === 'Draft';
                }));
            });
    }

    saveEvent(event: Event, validationResult: ValidationResult): ValidationResult {

        //Convert Local Date to GMT datetime before saving
        event.startDateUtc = moment(event.startDateString).utc().toDate();
        event.startDateString = moment(event.startDateString).toISOString();
        event.endDateUtc = moment(event.endDateString).utc().toDate();
        event.endDateString = moment(event.endDateString).toISOString();

        this.validateEvent(event, validationResult);
        if (!validationResult.isSuccessful()) return validationResult;

        try {
            this.eventsDbCollection.store(event);
        } catch (exception) {
            validationResult.addMessage('There was an error saving event', this.messageTypes.error);
        }

        return validationResult;
    }

    getEvent(eventId: string) {
        return this.eventsDbCollection.find({ id: eventId }).fetch();
    }

    validateEvent(event: Event, validationResult: ValidationResult): ValidationResult {

        if (this.util.isNullOrEmpty(event.status)) {
            validationResult.addMessage("Status is Required", this.messageTypes.error);
        }

        if (this.util.isNullOrEmpty(event.name)) {
            validationResult.addMessage("Name is Required", this.messageTypes.error);
        }

        if (this.util.isNullOrEmpty(event.startDateString)) {
            validationResult.addMessage("Start Date is Required", this.messageTypes.error);
        }

        if (this.util.isNullOrEmpty(event.endDateString)) {
            validationResult.addMessage("End Date is Required", this.messageTypes.error);
        }

        if (this.util.isNullOrEmpty(event.address)) {
            validationResult.addMessage("Address is Required", this.messageTypes.error);
        }

        if (this.util.isNullOrEmpty(event.city)) {
            validationResult.addMessage("City is Required", this.messageTypes.error);
        }

        if (this.util.isNullOrEmpty(event.state)) {
            validationResult.addMessage("State is Required", this.messageTypes.error);
        }

        return validationResult;
    }

    validateActivity(_event: Event, _activity: Activity, validationResult: ValidationResult): ValidationResult {

        if (this.util.isNullOrEmpty(_activity.name)) {
            validationResult.addMessage("Name is Required", this.messageTypes.error);
        }

        if (this.util.isNullOrEmpty(_activity.type)) {
            validationResult.addMessage("Type is Required", this.messageTypes.error);
        }

        if (this.util.isNullOrEmpty(_activity.startDateTimeUtc)) {
            validationResult.addMessage("Start Date is Required", this.messageTypes.error);
        }

        if (this.util.isNullOrEmpty(_activity.endDateTimeUtc)) {
            validationResult.addMessage("End Date is Required", this.messageTypes.error);
        }

        return validationResult;
    }

    saveActivity(_eventId: string, _activity: Activity, _validationResult: ValidationResult): ValidationResult {
        console.log('EventService.saveActivity', _activity, _validationResult);
        try {
            this.getEvent(_eventId).subscribe(event => {

                _validationResult = this.validateActivity(event, _activity, _validationResult);
                if (!_validationResult.isSuccessful()) return _validationResult;

                var eventToSave: Event = event;
                eventToSave.activities.push(_activity);

                _validationResult = this.validateEvent(eventToSave, _validationResult)
                if (!_validationResult.isSuccessful()) return _validationResult;

                _validationResult = this.saveEvent(eventToSave, _validationResult);

                return _validationResult;
            });
        } catch (exception){
            _validationResult.addMessage('There was an error saving Activity', this.messageTypes.error);
            return _validationResult;
        }
    }
}