import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

import { Place } from './../../places/place-model';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {

  @Input() selectedPlace: Place;
  @Input() selectionMode: 'selected' | 'random';
  @ViewChild('f') form: NgForm; // to get template driven form details

  public startDate: string;
  public endDate: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    const availableFrom = new Date(this.selectedPlace.availableFrom);
    const availableTo = new Date(this.selectedPlace.availableTo);

    if (this.selectionMode === 'random') {
      this.startDate = new Date(
        availableFrom.getTime() + Math.random() *
        (availableTo.getTime() - 7 * 24 * 60 * 60 * 1000 - availableFrom.getTime())
      ).toISOString();
      this.endDate = new Date(
        new Date(this.startDate).getTime() + Math.random() *
        (new Date(this.startDate).getTime() + 6 * 24 * 60 * 60 * 1000 - new Date(this.startDate).getTime()
        )).toISOString();
    }
  }

  onClose() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onSubmit() {
    if (this.form.invalid || !this.dateValidation()) {
      return;
    }
    this.modalCtrl.dismiss({ data: this.form.value }, 'confirm');
  }

  dateValidation() {
    const start = new Date(this.form.value.dateFrom);
    const end = new Date(this.form.value.dateTo);
    return end > start;
  }
}
