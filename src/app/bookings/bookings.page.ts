import { Component, OnInit, OnDestroy } from '@angular/core';
import { Booking } from './booking.model';
import { BookingService } from './booking.service';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {

  public bookings: Booking[] = [];
  public isLoading = true;

  private subscription = new Subscription();

  constructor(
    private bookingService: BookingService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.bookingService.Bookings.subscribe(items => {
        this.bookings = items;
      }));
  }

  ionViewWillEnter() {
    this.bookingService.fetchBookingsById().subscribe(() => {
      this.isLoading = false;
    });
  }

  onDelete(bookingId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingCtrl.create({
      spinner: 'circles',
    }).then(resultEl => {
      resultEl.present();
      this.subscription.add(
        this.bookingService.delete(bookingId).subscribe(() => {
          resultEl.dismiss();
        }));
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
