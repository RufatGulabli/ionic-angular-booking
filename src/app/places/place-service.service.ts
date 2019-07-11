import { Injectable } from '@angular/core';
import { Place } from './place-model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take, map, delay, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { AuthenticateService } from './../auth/authenticate.service';
import { PlaceLocation } from './location-model';

interface FireBasePlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userID: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})
export class PlaceService {

  private apiEndpoint = 'https://ionic-booking-place.firebaseio.com';

  private places = new BehaviorSubject<Place[]>([]);

  constructor(
    private authService: AuthenticateService,
    private http: HttpClient
  ) { }

  get Places(): Observable<Place[]> {
    return this.places.asObservable();
  }

  fetchData() {
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: FireBasePlaceData }>(this.apiEndpoint.concat(`/places.json?auth=${token}`));
      }),
      map(data => {
        const fetchedPlaces: Place[] = [];
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            fetchedPlaces.push(new Place(
              key,
              data[key].title,
              data[key].description,
              data[key].imageUrl,
              data[key].price,
              new Date(data[key].availableFrom),
              new Date(data[key].availableTo),
              data[key].userID,
              data[key].location
            ));
          }
        }
        return fetchedPlaces;
      }),
      tap((fetchedPlaces) => {
        this.places.next(fetchedPlaces);
      })
    );
  }

  getById(id: string): Observable<Place> {
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<FireBasePlaceData>(`${this.apiEndpoint}/places/${id}.json?auth=${token}`);
      }),
      map(data => {
        return new Place(
          id,
          data.title,
          data.description,
          data.imageUrl,
          data.price,
          new Date(data.availableFrom),
          new Date(data.availableTo),
          data.userID,
          data.location
        );
      })
    );
  }


  uploadImage(image: File): Observable<{ imageUrl: string, imagePath: string }> {
    const uploadData = new FormData();
    uploadData.append('image', image);
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        return this.http.post<{ imageUrl: string, imagePath: string }>(
          'https://us-central1-ionic-booking-place.cloudfunctions.net/storeImage',
          uploadData, {
            headers: { Authorization: 'Bearer ' + token }
          });
      })
    );

  }

  create(
    title: string,
    description: string,
    price: number,
    from: Date,
    to: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
    let generatedId: string;
    let newPlace: Place;
    let fetchedUserID;
    return this.authService.UserId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserID = userId;
        return this.authService.Token;
      }),
      take(1),
      switchMap(token => {
        if (!fetchedUserID) {
          throw new Error('No user id found.');
        }
        newPlace = new Place(
          null,
          title,
          description,
          imageUrl,
          price,
          from,
          to,
          fetchedUserID,
          location,
        );
        return this.http.post<{ name: string }>(this.apiEndpoint.concat(`/places.json?auth=${token}`), newPlace);
      }),
      switchMap(id => {
        generatedId = id.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = generatedId;
        this.places.next(places.concat(newPlace));
      })
    );
  }


  update(updatedPlace: Place) {
    if (!updatedPlace) {
      return;
    }
    const updatedPlaceArray: Place[] = [];
    let fetchedToken;
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.places;
      }),
      take(1),
      switchMap(places => {
        if (!places && places.length <= 0) {
          return this.fetchData();
        } else {
          return of(places);
        }
      }),
      switchMap(placesEl => {
        placesEl.forEach(item => {
          if (item.id === updatedPlace.id) {
            updatedPlaceArray.push(updatedPlace);
          } else {
            updatedPlaceArray.push(item);
          }
        });
        return this.http.put(`${this.apiEndpoint}/places/${updatedPlace.id}.json?auth=${fetchedToken}`, updatedPlace);
      }),
      tap(() => {
        this.places.next(updatedPlaceArray);
      })
    );
  }

}
