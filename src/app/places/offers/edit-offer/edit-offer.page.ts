import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../../place-service.service';
import { Place } from '../../place-model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {

  public form: FormGroup;
  public offerId: number;
  public place: Place;
  public isLoading = true;
  private subscription: Subscription;

  constructor(
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private placeService: PlaceService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {

    this.activatedRoute.paramMap.subscribe(param => {
      if (!param.get('offerId')) {
        this.offerId = +param.get('offerId');
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.subscription = this.placeService.getById(param.get('offerId')).subscribe(place => {
        this.place = place;
        this.form = new FormGroup({
          title: new FormControl(this.place.title, {
            updateOn: 'blur',
            validators: [Validators.required]
          }),
          description: new FormControl(this.place.description, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.maxLength(180)]
          }),
          price: new FormControl(this.place.price, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.min(1)]
          })
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
                  this.router.navigateByUrl('/places/tabs/offers');
                }
              }
            ]
          }).then(alertEl => {
            alertEl.present();
          });
        });

    });
  }

  public onEditOffer() {
    if (this.form.invalid) {
      return;
    } else {
      this.loadingCtrl.create({
        message: 'Updating...',
        spinner: 'crescent'
      }).then(resultEl => {
        resultEl.present();
        const { title, description, price } = this.form.controls;
        this.place.title = title.value;
        this.place.description = description.value;
        this.place.price = price.value;
        this.placeService.update(this.place).subscribe(() => {
          resultEl.dismiss();
          this.form.reset();
          this.router.navigate(['/places/tabs/offers']);
        });
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
