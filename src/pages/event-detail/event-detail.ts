import { Component, OnInit, OnChanges } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { Auth, User } from '@ionic/cloud-angular';

import { ValidationResult } from '../../_services/_common/validation';

import { EventService } from '../../_services/event.service';

import { Event } from '../../_models/Event';
import { Login } from '../login/login';
import { ValidationResults } from '../../app/components/_common/validation-results/validation-results.component';

@Component({
  selector: 'event-detail',
  templateUrl: 'event-detail.html'
})
export class EventDetail implements OnInit, OnChanges {

  id: string;
  newEvent: Event;

  constructor(
    public auth: Auth,
    private eventService: EventService,
    private modalController: ModalController,
    public navController: NavController, 
    private navParams: NavParams,
    private user: User,
    private validationResult: ValidationResult
  ) { }

  ngOnInit() {
    this.id = this.navParams.get('id');

    if (this.id === 'new') {
      this.newEvent = new Event();
      this.newEvent.status = 'Draft';
      if (this.auth.isAuthenticated()) {
        this.newEvent.createdByUsername = this.user.details.username;
        this.newEvent.createdByDisplayName = this.user.details.name;
      }
      if (!this.auth.isAuthenticated()) {
        this.navController.push(Login);
      }
    }
  }

  ngOnChanges() {
    this.newEvent.createdByUsername = this.user.details.username;
    this.newEvent.createdByDisplayName = this.user.details.name;
  }

  saveEvent() {
    var validationResult = new ValidationResult();
    this.validationResult = this.eventService.saveEvent(this.newEvent, validationResult);
    if (!this.validationResult.isSuccessful()) {
      let modal = this.modalController.create(ValidationResults, {messages: this.validationResult.messages, title: 'Errors Saving Event'});
      modal.present();
    } else {
      this.navController.pop();
    }
  }
}
