import { AfterViewInit, Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EntrepriseStore, UserStore } from '../../store/appstore';
import { AuthenService } from '../../authen.service';
import { Router } from '@angular/router';
import { ImportedModule } from '../../modules/imported/imported.module';
import { WenService } from '../../wen.service';
import { error } from 'console';
import { Subject, Subscriber, Subscription } from 'rxjs';
@Component({
  selector: 'app-login',
  imports: [ImportedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  _service = inject(WenService);
  _auth_service = inject(AuthenService);
  subscribe = Subscriber;
  loginForm: FormGroup;
  loginForm_mob: FormGroup;
  message = signal('tentative de connexion ....');

  constructor(
    private router: Router,
    private _fb: FormBuilder
  ) {
    this.loginForm = this._fb.group(
      {
        email: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
      }
    );

    this.loginForm_mob = this._fb.group(
      {
        email: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
      }
    )
    effect(() => {
    })
  }

  ngOnInit() {
  }

  sumitlogin() {
    this.message.set('tentative de connection en cours...');
    let value = this.loginForm.getRawValue();
    this._auth_service.loginFirebase(value.email, value.password)
      .subscribe(
        {
          next: () => {
            setTimeout(() => {
              this._auth_service.loadings.set(false);
              this.router.navigateByUrl('/home');

            }, 2000);

          },
          error: error => {
            this._auth_service.loadings.set(false);
          }
        }
      )
  }
  choiceEntreprise(data: any) {

  }
}
