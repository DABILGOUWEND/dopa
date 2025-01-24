import { Component, OnInit, TemplateRef, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ApproGasoilStore, EnginsStore, GasoilStore, PersonnelStore, ProjetStore, TravauxStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { AuthenService } from '../../authen.service';

import { DataLoaderService } from '../../services/data-loader.service';
import { Router } from '@angular/router';
import { HomeComponent } from "../home/home.component";

import { EssaiComponent } from "../essai/essai.component";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { tab_personnel } from '../../models/modeles';



@Component({
    selector: 'app-accueil',
    imports: [ImportedModule],
    templateUrl: './accueil.component.html',
    styleUrl: './accueil.component.scss'
})
export class AccueilComponent implements OnInit {
    _autservice=inject(AuthenService)
    router = inject(Router);
    clicker = linkedSignal(() => this._personnel_store.donnees_personnel().map(x => false))
    donnees_table = computed(() => {
        return new MatTableDataSource<any>(this._personnel_store.donnees_personnel())
    })
    selected_row = signal<tab_personnel | undefined>(undefined)
    selected_nom = linkedSignal(() => this.selected_row()?.nom)
    selected_prenom = linkedSignal(() => this.selected_row()?.prenom)
    selected_fonction = linkedSignal(() => this.selected_row()?.fonction)
    selected_num_phone1 = linkedSignal(() => this.selected_row()?.num_phone1)

    displayedColumns = ['nom', 'prenom', 'fonction', 'num_phone1', 'actions']
    table_update_form: FormGroup
    constructor(
        private _fb: FormBuilder
    ) {
        this.table_update_form = this._fb.group({
            nom: new FormControl('', Validators.required),
            prenom: new FormControl('', Validators.required),
            fonction: new FormControl('', Validators.required),
            num_phone1: new FormControl('')
        }
        )

        effect(() => {
            console.log(this._autservice.userSignal())
        })
    }
    ngOnInit(): void {
    }

    _personnel_store = inject(PersonnelStore);
    modif(row: any, ind: number) {
        this.clicker.update(x => x.map((y, i) => i == ind ? true : false))
        this.table_update_form.patchValue({
            nom: row.nom,
            prenom: row.prenom,
            fonction: row.fonction,
            num_phone1: row.num_phone1
        })

    }
    submit() {
        console.log(this.table_update_form.value)
    }
    annuler() {
        this.clicker.update(x => x.map(y => false))
        this.table_update_form.reset()
    }
    edit(row: any, ind: number) {
        this.clicker.update(x => x.map((y, i) => i == ind ? true : false))
        this.selected_row.set(row)
    }
    delete(ind: number) {
    }
    update(row: any, ind: number) {
        console.log(row)
    }

    logout() {
        this._autservice.message.set('déconnexion en cours....');
        this._autservice.logout().subscribe({
          next: () => {
            setTimeout(() => {
              this._autservice.message.set('vous êtes déconnecté');
              this.router.navigateByUrl('/accueil');
            }, 2000);
          },
          complete: () => {
            console.log(this._autservice.userSignal());
          }
        })
    
      }
}
