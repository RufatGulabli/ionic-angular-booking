import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { Place } from './../../place-model';
import { PlaceService } from './../../place-service.service';
import { CreateBookingComponent } from './../../../bookings/create-booking/create-booking.component';
import { BookingService } from './../../../bookings/booking.service';
import { Booking } from '../../../bookings/booking.model';
import { AuthenticateService } from './../../../auth/authenticate.service';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';

@Component({
  selector: 'app-place-details',
  templateUrl: './place-details.page.html',
  styleUrls: ['./place-details.page.scss'],
})
export class PlaceDetailsPage implements OnInit, OnDestroy {

  public place: Place;
  private userID;
  public bookable = true;
  public isLoading = true;

  private subscription = new Subscription();

  constructor(
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private placeService: PlaceService,
    private modalCtrl: ModalController,
    private actionCtrl: ActionSheetController,
    private bookingService: BookingService,
    private authservice: AuthenticateService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(param => {
      if (!param.get('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.subscription.add(
        this.placeService.getById(param.get('placeId')).subscribe(place => {
          this.place = place;
          this.authservice.UserId.pipe(take(1)).subscribe(userId => {
            if (!userId) {
              throw new Error('User Id not found.');
            }
            this.userID = userId;
            this.bookable = userId !== place.userID;
          });
          this.isLoading = false;
        },
          error => {
            this.alertCtrl.create({
              header: 'Error Occured!',
              message: 'Place could not be fetched!',
              buttons: [
                {
                  text: 'OK',
                  handler: () => {
                    this.router.navigateByUrl('/places/tabs/discover');
                  }
                }
              ]
            }).then(alertEl => {
              alertEl.present();
            });
          }));

    });
    // this.userID = this.authservice.UserId;
  }

  onBook() {

    this.actionCtrl.create({
      header: 'Select Date',
      buttons: [
        {
          text: 'Selected Dates',
          role: 'selected',
          handler: () => {
            this.openBookingModal('selected');
          }
        },
        {
          text: 'Random Dates',
          role: 'random',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'destructive'
        }
      ]
    })
      .then(result => {
        result.present();
      });


  }

  private openBookingModal(value: 'selected' | 'random') {
    this.modalCtrl.create({
      component: CreateBookingComponent,
      animated: true,
      showBackdrop: true,
      componentProps: {
        selectedPlace: this.place,
        selectionMode: value
      }
    }).then(res => {
      res.present();
      return res.onDidDismiss();
    }).then(resultData => {
      if (resultData.role === 'confirm') {
        this.loadingCtrl.create({
          spinner: 'lines',
          message: 'Creating Your Booking...'
        }).then(loadingEl => {
          loadingEl.present();
          const newBooking = new Booking(
            null,
            this.place.id,
            this.userID,
            this.place.title,
            this.place.imageUrl,
            resultData.data.data.firstName,
            resultData.data.data.lastName,
            resultData.data.data.guestNumber,
            new Date(resultData.data.data.dateFrom),
            new Date(resultData.data.data.dateTo)
          );
          this.subscription.add(
            this.bookingService.create(newBooking).subscribe(() => {
              loadingEl.dismiss();
              this.router.navigate(['/bookings']);
            }));
        });

      }
    });
  }

  onShowMap() {
    this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        selectable: false,
        center: {
          lat: this.place.location.lat,
          lng: this.place.location.lng
        },
        title: this.place.title,
        closeButtonText: 'Close'
      }
    })
      .then(modalEl => {
        modalEl.present();
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
