import { Component, OnInit, OnDestroy } from '@angular/core';
import { SegmentChangeEventDetail } from '@ionic/core';
import { take } from 'rxjs/operators';

import { Place } from './../place-model';
import { PlaceService } from './../place-service.service';
import { Subscription } from 'rxjs';
import { AuthenticateService } from './../../auth/authenticate.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {

  public places: Place[] = [];
  private userId: string;
  public isLoading = true;


  private subscription: Subscription;

  constructor(
    private placeService: PlaceService,
    private authService: AuthenticateService
  ) { }

  ngOnInit() {
    this.placeService.Places.subscribe(places => {
      this.places = places;
    });
    this.authService.UserId.pipe(take(1)).subscribe(id => {
      this.userId = id;
    });
  }

  ionViewWillEnter() {
    this.placeService.fetchData().subscribe(() => {
      this.isLoading = false;
    });
  }

  ionOnChange(event: CustomEvent<SegmentChangeEventDetail>) {
    if (event.detail.value === 'all') {
      this.placeService.Places.subscribe(places => {
        this.places = places;
      });
    } else {
      this.placeService.Places.subscribe(places => {
        this.places = places.filter(item => {
          return item.userID !== this.userId;
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
