import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';

import { AuthenticateService, FiraBaseAuthResponceModel } from './authenticate.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  isLogin = true;

  constructor(
    private authService: AuthenticateService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    const { email, password } = form.value;
    this.authenticate(email, password);
    form.reset();
  }

  authenticate(email: string, password: string) {
    this.loadingCtrl.create({
      spinner: 'bubbles',
      duration: 500,
      // keyboardClose: true
    })
      .then(result => {
        result.present();
        let authObs: Observable<FiraBaseAuthResponceModel>;
        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.signUp(email, password);
        }
        authObs.subscribe(
          resData => {
            result.dismiss();
            this.router.navigateByUrl('/places/tabs/discover');
          },
          errRes => {
            result.dismiss();
            const code = errRes.error.error.message;
            let msg = `Couldn't register. Something wrent wrong.`;
            if (code === 'EMAIL_EXISTS') {
              msg = 'This email address already exists.';
            } else if (code === 'EMAIL_NOT_FOUND' || code === 'INVALID_PASSWORD') {
              msg = 'Email address or password could not be found.';
            }
            this.showAlert(msg);
          }
        );
      });
  }

  changeMode() {
    this.isLogin = !this.isLogin;
  }

  private showAlert(msg: string) {
    this.alertCtrl.create({
      header: 'Authentication Error',
      message: msg,
      buttons: ['OK']
    }).then(alertEL => {
      alertEL.present();
    });
  }

}
