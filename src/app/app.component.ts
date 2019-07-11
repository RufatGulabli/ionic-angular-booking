import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { Plugins, Capacitor, AppState } from '@capacitor/core';
import { Subscription } from 'rxjs';


import { AuthenticateService } from './auth/authenticate.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  private previousAuthState = false;

  constructor(
    private platform: Platform,
    private authService: AuthenticateService,
    private navCtrl: NavController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
    });
  }

  ngOnInit(): void {
    this.subscription = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.navCtrl.navigateRoot('/auth');
      }
      this.previousAuthState = isAuth;
    });
    Plugins.App.addListener('appStateChange', this.checkAuthOnResume.bind(this));
  }

  onLogOut() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogOut();
          }
        });
    }
  }

}
