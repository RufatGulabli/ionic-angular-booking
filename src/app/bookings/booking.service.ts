import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, delay, tap, switchMap, map } from 'rxjs/operators';

import { Booking } from './booking.model';
import { AuthenticateService } from './../auth/authenticate.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookings = new BehaviorSubject<Booking[]>([]);

  private apiEndpoint = 'https://ionic-booking-place.firebaseio.com';

  constructor(
    private http: HttpClient,
    private authService: AuthenticateService
  ) { }

  get Bookings(): Observable<Booking[]> {
    return this.bookings.asObservable();
  }

  create(booking: Booking) {
    let generatedId: string;
    // /bookings.json => .json is a requirement of Google FireBase, bookings is the name of the table
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        return this.http.post<{ name: string }>(this.apiEndpoint.concat(`/bookings.json?auth=${token}`), booking);
      }),
      switchMap(id => {
        generatedId = id.name;
        booking.id = generatedId;
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        this.bookings.next(bookings.concat(booking));
      })
    );
  }

  delete(bookingId: string) {
    return this.authService.Token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(`${this.apiEndpoint}/bookings/${bookingId}.json?auth=${token}`);
      }),
      switchMap(() => {
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        this.bookings.next(bookings.filter(b => b.id !== bookingId));
      })
    );
  }


  fetchBookingsById() {
    let fetchedUserId: string;
    return this.authService.UserId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('user ID not found.');
        }
        fetchedUserId = userId;
        return this.authService.Token;
      }),
      take(1),
      switchMap(token => {
        return this.http.get<{ name: string }>
          (`${this.apiEndpoint}/bookings.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`);
      }),
      map(resultData => {
        const bookings: Booking[] = [];
        for (const key in resultData) {
          if (resultData.hasOwnProperty(key)) {
            bookings.push(
              new Booking(
                key,
                resultData[key].placeId,
                resultData[key].userId,
                resultData[key].placeTitle,
                resultData[key].placeImg,
                resultData[key].firstName,
                resultData[key].lasstName,
                resultData[key].guestNumber,
                new Date(resultData[key].availableFrom),
                new Date(resultData[key].availableTo),
              )
            );
          }
        }
        return bookings;
      }),
      tap(bookings => {
        this.bookings.next(bookings);
      })
    );
  }


}

// [
//   new Booking('1', '3', 1,
//     'Foggy Palace', 'https://www.swissdeluxehotels.com/media/228918/2-gstaad-palace-sommer-exterior.jpg',
//     'Rufat', 'Gulabli', 2, new Date('2019-08-10'), new Date('2019-8-15'))
// ]