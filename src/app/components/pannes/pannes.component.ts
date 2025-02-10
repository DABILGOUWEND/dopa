import { Component, ViewChild, computed, effect, inject, signal } from '@angular/core';
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
  _pannes_service=inject(PannesService)
  datasource = computed(
    () => new MatTableDataSource<Engins>(this._enginStore.donnees_engins()),
  );

  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort;
  engin=signal<Engins|undefined>(undefined);
  open_tab_pannes=signal(false);
  current_row = signal<Pannes|undefined>(undefined);
  engins_panne: string[] = [];
  engins_panne_en_cours:string[] = [];
  displayedColumns: string[] = ['code_parc', 'designation', 'id', 'actions'];
  constructor(
  ) {
    effect(() => {
      this.engins_panne = this._pannestore.donnees_pannes().map(x => x.engin_id)
      this.engins_panne_en_cours = this._pannestore.donnees_pannes().filter(x => x.situation == "garage").map(x => x.engin_id);
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
