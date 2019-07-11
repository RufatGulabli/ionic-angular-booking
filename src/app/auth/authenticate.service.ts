import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';

import { environment } from '../../environments/environment';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService implements OnDestroy {

  private user = new BehaviorSubject<User>(null);
  private activeLoOutTimer: any;

  constructor(private http: HttpClient) { }

  autoLogin() {
    return from(Plugins.Storage.get({ key: 'authData' }))
      .pipe(
        map(data => {
          if (!data || !data.value) {
            return null;
          }
          const parsedData = JSON.parse(data.value) as UserStorageModel;
          const expireTime = new Date(parsedData.expireDate);
          if (expireTime <= new Date()) {
            return null;
          }
          const user = new User(parsedData.userId, parsedData.email, parsedData.token, expireTime);
          return user;
        }),
        tap(user => {
          if (user) {
            this.user.next(user);
            this.autoLogOut(user.TokenDuration);
          }
        }),
        map(user => !!user)
      );
  }

  private autoLogOut(duration: number) {
    if (this.activeLoOutTimer) {
      clearTimeout(this.activeLoOutTimer);
    }
    this.activeLoOutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  get userIsAuthenticated() {
    return this.user.asObservable()
      .pipe(
        map(user => {
          if (user) {
            return !!user.Token;
          } else {
            return false;
          }
        }));
  }

  get UserId() {
    return this.user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      })
    );
  }

  get Token() {
    return this.user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.Token;
        } else {
          return null;
        }
      })
    );
  }

  signUp(email: string, password: string): Observable<FiraBaseAuthResponceModel> {
    return this.http.post<FiraBaseAuthResponceModel>(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${environment.googleWebApiKey}`,
      {
        email, password, returnSecureToken: true
      }
    ).pipe(
      tap(this.setUserData.bind(this))
    );
  }

  login(email: string, password: string): Observable<FiraBaseAuthResponceModel> {
    return this.http.post<FiraBaseAuthResponceModel>(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${environment.googleWebApiKey}`,
      { email, password, returnSecureToken: true }
    ).pipe(
      tap(this.setUserData.bind(this))
    );
  }

  logout() {
    if (this.activeLoOutTimer) {
      clearTimeout(this.activeLoOutTimer);
    }
    this.user.next(null);
    Plugins.Storage.remove({ key: 'authData' });
  }

  private setUserData(userDetails: FiraBaseAuthResponceModel) {
    const expireTime = new Date(new Date().getTime() + (+userDetails.expiresIn * 1000));
    const user = new User(
      userDetails.localId,
      userDetails.email,
      userDetails.idToken,
      expireTime
    );
    this.user.next(user);
    this.autoLogOut(user.TokenDuration);
    this.storeAuthData(user.id, user.Token, user.expireDate.toISOString(), user.email);
  }

  private storeAuthData(userId: string, token: string, expireDate: string, email: string) {
    const data = JSON.stringify({ userId, token, expireDate, email });
    Plugins.Storage.set({ key: 'authData', value: data });
  }

  ngOnDestroy() {
    if (this.activeLoOutTimer) {
      clearTimeout(this.activeLoOutTimer);
    }
  }

}

export interface FiraBaseAuthResponceModel {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

export interface UserStorageModel {
  userId: string;
  token: string;
  expireDate: string;
  email: string;
}
