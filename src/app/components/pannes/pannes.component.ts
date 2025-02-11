import { Component, ViewChild, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Engins, Pannes } from '../../models/modeles';
import { PannesStore, EnginsStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { ImportedModule } from '../../modules/imported/imported.module';
import { TablePanneComponent } from '../table-panne/table-panne.component';
import { PannesService } from '../../services/pannes.service';


@Component({
  selector: 'app-pannes',
  imports: [ImportedModule, TablePanneComponent],
  templateUrl: './pannes.component.html',
  styleUrl: './pannes.component.scss'
})
export class PannesComponent {
  _pannestore = inject(PannesStore);
  _enginStore = inject(EnginsStore);
  _app_service = inject(WenService);
  _pannes_service = inject(PannesService)
  datasource = computed(
    () => new MatTableDataSource<Engins>(this.heure_pannes()),
  );
  heure_pannes = computed(() => {
    let donnees = this._enginStore.donnees_engins();
    let engins_id = this._pannestore.donnees_pannes().map(x => x.engin_id);
    let h_pannes: any = [];
    donnees.forEach(element => {
      if (engins_id.includes(element.id)) {
        let filtre1 = this._pannestore.donnees_pannes().filter(x => x.engin_id === element.id);
        let rep1 = filtre1.find(x => x.situation === 'garage');
        if (rep1) {
          h_pannes.push(
            {
              ...element,
              h_panne: this._app_service.calculateDiff1(this._app_service.convertDate(rep1.debut_panne), rep1.heure_debut)
            }
          );
        }
        else {
          h_pannes.push({
            ...element,
            h_panne: ""
          });
        }
      }
      else {

        h_pannes.push({
          ...element,
          h_panne: 0
        });
      }
    });
    return h_pannes
  })
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort;
  engin = signal<Engins | undefined>(undefined);
  open_tab_pannes = signal(false);
  current_row = signal<Pannes | undefined>(undefined);
  engins_panne = linkedSignal(() => this._pannestore.donnees_pannes().map(x => x.engin_id));
  engins_panne_en_cours = linkedSignal(() => this._pannestore.donnees_pannes().filter(x => x.situation == "garage").map(x => x.engin_id));
  displayedColumns: string[] = ['code_parc', 'designation', 'id', 'actions'];
  constructor(
  ) {
    effect(() => {

    })
  }
  ngOnInit() {
    this._enginStore.filterbyDesignation('');
    this._pannestore.setIntervalleDate(['']);
    this._pannestore.setEnginsIds(['']);
  }
  editpanne(data: Engins) {
    this.open_tab_pannes.set(true);
    this._pannestore.filtrebyId(data.id)
    this.engin.set(data);
  }
  onclose() {
    this.open_tab_pannes.set(false);
  }
}
