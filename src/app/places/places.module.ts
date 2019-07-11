import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PlacesPage } from './places.page';
import { PlacesRoutingModule } from './places-routing.module';
import { CreateBookingComponent } from './../bookings/create-booking/create-booking.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    PlacesRoutingModule
  ],
  declarations: [PlacesPage, CreateBookingComponent],
  entryComponents: [CreateBookingComponent]
})
export class PlacesPageModule { }
