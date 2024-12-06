import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { AuthenService } from '../../authen.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EntrepriseStore, ProjetStore } from '../../store/appstore';
import { TaskService } from '../../task.service';
import { HttpClient } from '@angular/common/http';
@Component({
    selector: 'app-register',
    imports: [ImportedModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  ngOnInit() {
  }

  message = signal('');
  selected_entrep_id = signal('')
  _auth_service = inject(AuthenService);
  registerForm: FormGroup;
  _http_service=inject(HttpClient)
  router = inject(Router);
  _task_service = inject(TaskService);
  _entreprise_store = inject(EntrepriseStore);
  _projet_store = inject(ProjetStore);

  projet_id = computed(() => {
    let projet = this._projet_store.donnees_projet().filter(x => x.entreprise_id == this.selected_entrep_id())
    return projet
  })
  constructor(
    private _fb: FormBuilder
  ) {
    this.registerForm = this._fb.group(
      {
        entreprise_id: new FormControl('', Validators.required),
        projet_id: new FormControl('', Validators.required),
        email: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
        role: new FormControl('', Validators.required),
        nom: new FormControl('', Validators.required)
      }
    )
  }

  submitRegister() {
    let value = this.registerForm.getRawValue();
    this._auth_service.register(
      value.email,
      value.password,
      value.role,
      value.nom,
      value.entreprise_id,
      value.projet_id
    ).subscribe(
      {
        next: (resp) => {
          this.router.navigateByUrl('/login');
        },
        error: error => {
          this.message.set('erreur lors de l\'inscription:' + error);
        }
      })
  }
  choice_entrep(data: any) {
    this.selected_entrep_id.set(data.value);
  }
}
