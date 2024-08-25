import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EntrepriseStore, UserStore } from '../../store/appstore';
import { AuthenService } from '../../authen.service';
import { Router } from '@angular/router';
import { ImportedModule } from '../../modules/imported/imported.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ImportedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  users_store=inject(UserStore);
  entreprise_store=inject(EntrepriseStore);
  loginForm: FormGroup
  message: string = 'vous êtes déconnecté'
  constructor(
    private router: Router,
    private authservice: AuthenService,
    private _fb: FormBuilder
  ) {
    this.loginForm = this._fb.group(
      {
        identifiant: new FormControl('', Validators.required),
        mot_de_passe: new FormControl('', Validators.required),
      }
    )

  }
  ngOnInit() {
    this.entreprise_store.loadEntreprises();
    }
  setMessage() {
    if (this.authservice.isloggedIn) {
      this.message = 'vous êtes connecté.'
    } else {
      this.message = 'identifiant ou mot de passe incorrecte.'
    }
  }
  sumitlogin() {
    this.message = 'tentative de connection en cours...'
    let value = this.loginForm.value
    this.authservice.login(value.identifiant, value.mot_de_passe).subscribe(response => {
      this.setMessage();
      if (response) {
       
        let niveau=this.authservice.is_connected()?.niveau;
        let url =this.users_store.getUrl()
        this.router.navigateByUrl(url)
        this.authservice.is_connected.set({id:'',identifiant:value.identifiant,mot_de_passe:value.mot_de_passe,niveau:niveau?niveau:0})
      }
      else {
        this.loginForm.get('mot_de_passe')?.setValue('')
        this.router.navigateByUrl('/login')
      }
    })
  }
  choiceEntreprise(data:any){

  }
}
