import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Capacitor, Plugins } from '@capacitor/core';

import { MapModalComponent } from './../../map-modal/map-modal.component';
import { environment } from '../../../../environments/environment';
import { PlaceLocation } from '../../../places/location-model';
import { Coordinates } from './../../../places/location-model';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  @Output() locationPicked = new EventEmitter<PlaceLocation>();
  @Input() previousValue = false;
  selectedLocationImg: string;
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() { }

  onPickLocation() {
    this.actionSheetCtrl.create({
      header: 'How to pick location?',
      buttons: [
        {
          text: 'Auto-Locate', handler: () => {
            this.getGeoLocation();
          }
        },
        {
          text: 'Choose on Map', handler: () => {
            this.openOnMap();
          }
        },
        { text: 'Cancel', role: 'cancel' }
      ]
    }).then(actSheetEl => {
      actSheetEl.present();
    });
  }

  private getGeoLocation() {

    if (Capacitor.isPluginAvailable('GeoLocation')) {
      this.showErrorAlert();
      return;
    }

    Plugins.Geolocation.getCurrentPosition()
      .then(geoPosition => {
        const coords: Coordinates = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude
        };
        this.createPlace(coords.lat, coords.lng);
      })
      .catch(() => {
        this.showErrorAlert();
      });
  }

  private createPlace(lat: number, lng: number) {

    const selectedLocation: PlaceLocation = {
      lat,
      lng,
      address: null,
      staticMapImgUrl: null
    };

    this.isLoading = true;

    this.getAddress(lat, lng)
      .pipe(
        switchMap(address => {
          selectedLocation.address = address;
          return of(this.getMapImage(selectedLocation.lat, selectedLocation.lng, 14));
        }),
      ).subscribe(staticMapImgUrl => {
        selectedLocation.staticMapImgUrl = staticMapImgUrl;
        this.selectedLocationImg = staticMapImgUrl;
        this.isLoading = false;
        this.locationPicked.emit(selectedLocation);
      });
  }

  private showErrorAlert() {
    this.alertCtrl.create({
      header: 'Location is not available.',
      message: 'Please choose Map to select Location!',
      buttons: ['Okay']
    }).then(alertEl => alertEl.present());
  }

  private openOnMap() {
    this.modalCtrl.create({
      component: MapModalComponent
    }).then(modalEl => {
      modalEl.onDidDismiss().then(cordinates => {
        if (!cordinates.data) {
          return;
        }
        const { lat, lng } = cordinates.data;
        const selectedLocation: Coordinates = {
          lat,
          lng,
        };
        this.createPlace(selectedLocation.lat, selectedLocation.lng);
      });
      modalEl.present();
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=
      ${lat},${lng}&key=${environment.googleMapApiKEY}`)
      .pipe(
        map(geoData => {
          if (!geoData || !geoData.results || geoData.results.length === 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        }));
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:indianred%7Clabel:Place%7C${lat},${lng}&key=${environment.googleMapApiKEY}`;
  }

}
