import { Component, OnInit, ViewChild, computed, effect, inject, model, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { FormControl, Validators, NonNullableFormBuilder } from '@angular/forms';
import { ClasseEnginsStore, CompteStore, EnginsStore, PersonnelStore, StatutStore } from '../../store/appstore';
import { PersoTemplateComponent } from '../perso-template/perso-template.component';
import { tab_personnel } from '../../models/modeles';
import { ArgumentOutOfRangeError } from 'rxjs';
import { TaskService } from '../../task.service';
import { set } from 'firebase/database';

@Component({
    selector: 'app-personnel',
    imports: [ImportedModule, PersoTemplateComponent],
    templateUrl: './personnel.component.html',
    styleUrl: './personnel.component.scss'
})
export class PersonnelComponent implements OnInit {

  constructor(private _fb: NonNullableFormBuilder) {

    this.table_update_form2.get('presence')?.valueChanges.subscribe((presence) => {
      if (!presence) {
        this.presence.set(false);
        this.table_update_form2.controls.heuresN.disable();
        this.table_update_form2.controls.heureSup.disable();
        this.table_update_form2.controls.heuresN.clearValidators();
        this.table_update_form2.controls.heureSup.clearValidators();
        this.table_update_form2.controls.heuresN.updateValueAndValidity();
        this.table_update_form2.controls.heureSup.updateValueAndValidity();
      } else {
        this.presence.set(true);
        this.table_update_form2.controls.heuresN.enable();
        this.table_update_form2.controls.heureSup.enable();
        this.table_update_form2.controls.heuresN.setValidators([Validators.required, Validators.min(1)]);
        this.table_update_form2.controls.heureSup.setValidators([Validators.required, Validators.min(0)]);
        this.table_update_form2.controls.heuresN.updateValueAndValidity();
        this.table_update_form2.controls.heureSup.updateValueAndValidity();
      }
    })


    effect(() => {
   console.log( this.personnel_store.isFulfilled());
    }
    )
  }
  is_open = signal(false)
  is_open2 = signal(false)
  tab_expander = signal<boolean[]>([]);
  current_row = signal<tab_personnel | undefined>(undefined);
  date_pointage = signal('');
  is_update = signal(false);
  is_click = signal<boolean | undefined>(false);
  is_pointed = signal<boolean | undefined>(false);
  presence = model<boolean | undefined>(undefined);
  heurs_w = model<number | undefined>(0);
  heurs_sup = model<number | undefined>(0);
  EnginsStore = inject(EnginsStore)
  personnel_store = inject(PersonnelStore)
  classeEngins_store = inject(ClasseEnginsStore)
  statut_store = inject(StatutStore)
  fb = inject(NonNullableFormBuilder)
  fb2 = inject(NonNullableFormBuilder)
  task_service = inject(TaskService)
  table_update_form = this.fb.group({
    id: new FormControl(''),
    nom: new FormControl('', Validators.required),
    prenom: new FormControl('', Validators.required),
    fonction: new FormControl('', Validators.required),
    statut_id: new FormControl('', Validators.required),
    num_phone1: new FormControl(''),
    num_phone2: new FormControl(''),
    email: new FormControl(''),
    num_matricule: new FormControl('')
  })
  table_update_form2 = this.fb2.group({
    presence: new FormControl(false),
    heuresN: new FormControl(0, [Validators.required, Validators.min(1)]),
    heureSup: new FormControl(0, [Validators.required, Validators.min(0)])
  })
  enregistrement = signal(false)
  displayedColumns = {
    'nom': 'NOM',
    'prenom': 'PRENOM',
    'fonction': 'FONCTION',
    'num_phone1': 'NUMERO PHONE 1',
    'num_phone2': 'NUMERO PHONE 2',
    'email': 'E -MAIL',
    'statut': 'STATUT',
    'actions': ''
  }
  titre_tableau = signal('Liste du personnel')
  table = computed(() => {
    let mytable =
      [
        {
          label: 'NOM',
          type: 'text1',
          control_name: 'nom',
          end_control_name: '',
          tableau: []
        }
        ,

        {
          label: 'PRENOM',
          type: 'text1',
          control_name: 'prenom',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'NUMERO DE PHONE1',
          type: 'text1',
          control_name: 'num_phone1',
          end_control_name: '',
          tableau: []
        }, {
          label: 'NUMERO DE PHONE2',
          type: 'text1',
          control_name: 'num_phone2',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'E MAIL',
          type: 'text1',
          control_name: 'email',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'NUMERO MATRICULE',
          type: 'text1',
          control_name: 'num_matricule',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'FONCTION',
          type: 'text1',
          control_name: 'fonction',
          end_control_name: '',
          tableau: []
        },
        {
          label: 'STATUT',
          type: 'select',
          control_name: 'statut_id',
          end_control_name: '',
          tableau: this.statut_select()
        },
      ]
    return mytable
  })

  statut_select = computed(() => {
    let donnees: any = []
    this.statut_store.donnees_statut()
      .forEach(element => {
        donnees.push(
          {
            id: element.id,
            valeur: element.designation
          }
        )

      });
    return donnees
  })
  dataSource = computed(
    () => {
      let donnees: any = []
      this.personnel_store.donnees_personnel().forEach(element => {
        let statut = this.statut_store.donnees_statut().find(x => x.id == element.statut_id)
        let statut_a = statut?.designation
        donnees.push(
          {
            'id': element.id,
            'statut_id': element.statut_id,
            'statut': statut_a,
            'nom': element.nom,
            'prenom': element.prenom,
            'fonction': element.fonction,
            'num_phone1': element.num_phone1,
            'num_phone2': element.num_phone2,
            'num_matricule': element.num_matricule,
            'email': element.email,
            'dates': element.dates,
            'presence': element.presence,
            'heureSup': element.heureSup,
            'heuresN': element.heuresN,
          }
        )
      });
      return donnees
    }
  );
  ngOnInit() {
    this.tab_expander.set(new Array(this.personnel_store.getDates()[1].length).fill(true))
  }
  updateData(data: any) {
    let valeur = data[0]
    let mydata: any = []
    if (this.is_update()) {
      mydata = {
        id: valeur.id,
        nom: valeur.nom,
        prenom: valeur.prenom,
        fonction: valeur.fonction,
        num_phone1: valeur.num_phone1,
        num_phone2: valeur.num_phone2,
        email: valeur.email,
        num_matricule: valeur.num_matricule,
        dates: this.current_row()?.dates,
        presence: this.current_row()?.presence,
        heuresN: this.current_row()?.heuresN,
        heureSup: this.current_row()?.heureSup,
        statut_id: valeur.statut_id
      }
      this.personnel_store.updatePersonnel(mydata)

    }
    else {
      mydata = {
        id: '',
        nom: valeur.nom,
        prenom: valeur.prenom,
        fonction: valeur.fonction,
        num_phone1: valeur.num_phone1,
        num_phone2: valeur.num_phone2,
        email: valeur.email,
        num_matricule: valeur.num_matricule,
        statut_id: valeur.statut_id,
        presence: [],
        dates: [],
        heuresN: [],
        heureSup: []

      }
      this.personnel_store.addPersonnel(mydata)
    }
    this.is_open.set(false)
  }
  deleteData(id: any) {
    if (confirm('voulez-vous supprimer cet élement?'))
      this.personnel_store.removePersonnel(id)
  }
  recherche(word: any) {
    this.personnel_store.filterbyNomPrenom(word)
  }
  afficheTout() {
    this.personnel_store.filterbyNomPrenom('')
  }
  PatchEventFct(row: any) {
    this.table_update_form.patchValue(
      row
    )
  }
  addEventFct() {
    this.is_update.set(false)
    this.table_update_form.reset();
  }
  modifier(row: any) {
    this.is_open.set(true)
    this.is_update.set(true)
    this.current_row.set(row)
    this.table_update_form.patchValue(
      row
    )
  }
  supprimer(arg0: any) {

  }
  pointage(row: tab_personnel) {
    this.current_row.set(row)
    this.personnel_store.getDates()[1]
    this.is_open2.set(true)
  }

  expander(index: number) {
    var rep = this.tab_expander()[index];
    this.tab_expander.update((tab) => tab.map((x, i) => i == index ? !rep : x))
  }
  afficher(arg0: any) {

    this.date_pointage.set(arg0);
    this.personnel_store.filtrebyDate(arg0);
    this.afficher2()
  }
  afficher2() {
    this.is_pointed.set(false);
    this.is_click.set(true);
    let arg0 = this.date_pointage();
    let ind = this.current_row()?.dates.indexOf(arg0);

    if (ind != undefined)
      if (ind != -1) {
        let presence = this.current_row()?.presence[ind];

        if (presence != undefined) {
          this.table_update_form2.patchValue({
            'presence': presence,
            'heuresN': this.current_row()?.heuresN[ind],
            'heureSup': this.current_row()?.heureSup[ind]
          });
        }
        this.is_pointed.set(true);
      } else {
        this.is_pointed.set(false);
      }
  }
  quitter() {
    this.is_open2.set(false);
    this.is_click.set(false);
    this.is_pointed.set(false);
    this.presence.set(undefined);
    this.heurs_w.set(0);
    this.heurs_sup.set(0);
    this.date_pointage.set('');

  }
  savepointage() {
    if (this.table_update_form2.valid) {
      let value = this.table_update_form2.value;
      let current = this.current_row();
      let presence = this.presence();
      this.enregistrement.set(true);
      if (current && presence != undefined) {
        let ind = this.current_row()?.dates.indexOf(this.date_pointage());
        let Presence = current.presence;
        let heuresN = current.heuresN;
        let heureSup = current.heureSup;
        if (ind != undefined) {
          presence ? Presence[ind] = true : Presence[ind] = false;
          value.heuresN != undefined ? heuresN[ind] = value.heuresN : heuresN[ind] = 0;
          value.heureSup != undefined ? heureSup[ind] = value.heureSup : heureSup[ind] = 0;
          this.current_row.update((row: any) => ({
            ...row,
            'presence': Presence,
            'heuresN': heuresN,
            'heureSup': heureSup,

          }))
          this.task_service.ModifPerson(this.current_row()).subscribe({
            complete: () => {
              setTimeout(() => {
                this.enregistrement.set(false);
                this.is_click.set(false);
                this.is_pointed.set(false);
              }, 2000);
            }

          })
        }
      }
    }
  }
  change_slide(data: boolean) {
    if (data) {
      let current = this.current_row()
      if (current) {
        this.task_service.updatePerson(current, this.date_pointage()).subscribe();

      }
    } else {
      let current = this.current_row()
      if (current)
        this.task_service.removePerson(current, this.date_pointage()).subscribe()

    }
    this.afficher2();

  }
}
