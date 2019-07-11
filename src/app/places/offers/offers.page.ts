import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';

import { Place } from '../place-model';
import { PlaceService } from './../place-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {

  public offers: Place[] = [];

  public isLoading = true;

  private subscription: Subscription;

  constructor(
    private placeService: PlaceService,
    private route: Router
  ) { }

  ngOnInit() {
    this.subscription = this.placeService.Places.subscribe(places => {
      this.offers = places;
    });
  }

  ionViewWillEnter() {
    this.subscription.add(
      this.placeService.fetchData().subscribe(() => {
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      }));
  }

  onEdit(offerId: number, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.route.navigate(['/places/tabs/offers/edit/', offerId]);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
