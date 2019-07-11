import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

import { PlaceService } from './../../place-service.service';
import { PlaceLocation } from '../../location-model';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {

  form: FormGroup;

  constructor(
    private placeService: PlaceService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      location: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null)
    });
  }

  onLocationPicked(location: PlaceLocation) {
    this.form.patchValue({ location });
  }

  onCreateOffer() {
    if (this.form.invalid || !this.form.get('image').value) {
      return;
    } else {

      const { title, description, price, dateFrom, dateTo, location } = this.form.controls;

      const placeLocation: PlaceLocation = {
        lat: location.value.lat,
        lng: location.value.lng,
        address: location.value.address,
        staticMapImgUrl: location.value.staticMapImgUrl
      };

      this.loadingCtrl.create({
        spinner: 'dots',
        message: 'Creating offer...'
      }).then(loadingEl => {

        loadingEl.present();

        this.placeService.uploadImage(this.form.get('image').value)
          .pipe(
            switchMap(uploadRes => {
              return this.placeService.create(
                title.value,
                description.value,
                +price.value,
                new Date(dateFrom.value),
                new Date(dateTo.value),
                placeLocation,
                uploadRes.imageUrl
              );
            })
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.router.navigate(['/places/tabs/offers']);
            this.form.reset();
          });
      });

    }
  }

  onImgPicked(imageData: string | File) {
    let imagefile;
    if (typeof imageData === 'string') {
      try {
        imagefile = base64ToBlob(
          imageData.replace('data:image/jpeg;base64', ''),
          'image/jpeg');
      } catch (err) {
        console.log(err);
        return;
      }
    } else {
      imagefile = imageData;
    }
    this.form.patchValue({ image: imagefile });
  }

}

function base64ToBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = window.atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);
  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}
