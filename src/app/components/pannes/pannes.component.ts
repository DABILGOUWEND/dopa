import { Component, ViewChild, computed, effect, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Engins } from '../../models/modeles';
import { PannesStore, EnginsStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { ImportedModule } from '../../modules/imported/imported.module';
import { TablePanneComponent } from '../table-panne/table-panne.component';

@Component({
  selector: 'app-pannes',
  standalone: true,
  imports: [ImportedModule,TablePanneComponent],
  templateUrl: './pannes.component.html',
  styleUrl: './pannes.component.scss'
})
export class PannesComponent {
  readonly Pannestore = inject(PannesStore)
  readonly EnginStore = inject(EnginsStore)
  readonly app_service = inject(WenService)
  datasource = computed(
    () => new MatTableDataSource<Engins>(this.EnginStore.donnees_engins()),
  );
  heure_pannes = computed(() => {
    let donnees = this.EnginStore.donnees_engins()
    let engins_id = this.Pannestore.donnees_pannes().map(x => x.engin_id)
    let h_pannes: any = []
    donnees.forEach(element => {
      if (engins_id.includes(element.id)) {
        let filtre1 = this.Pannestore.donnees_pannes().filter(x => x.engin_id == element.id)
        let rep1 = filtre1.find(x => x.situation == 'garage')
        if (rep1) {
          h_pannes.push(this.app_service.calculateDiff1(this.app_service.convertDate(rep1.debut_panne), rep1.heure_debut))
        }
        else {
          h_pannes.push('')
        }
      }
      else {
        h_pannes.push(0)
      }
    });
    return h_pannes
  })
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort;

  engin: Engins = {
    id: '',
    code_parc: '',
    designation: '',
    classe_id: '',
    immatriculation: '',
    utilisateur_id: ''
  };
  open_tab_pannes: boolean = false
  engins_panne: string[] = []
  engins_panne_en_cours:string[] = []
  displayedColumns: string[] = ['code_parc', 'designation', 'id', 'actions']
  constructor(
    private _fb: FormBuilder
  ) {
    effect(() => {
      this.engins_panne = this.Pannestore.donnees_pannes().map(x => x.engin_id)
      this.engins_panne_en_cours = this.Pannestore.donnees_pannes().filter(x => x.situation == "garage").map(x => x.engin_id)
    })
  }
  ngOnInit() {
    this.EnginStore.loadengins()
    this.Pannestore.loadPannes()
    this.EnginStore.filterbyDesignation('')
    this.Pannestore.setIntervalleDate([''])
    this.Pannestore.setEnginsIds([''])

  }
  editpanne(data: Engins) {
    this.open_tab_pannes = true
    this.Pannestore.filtrebyId(data.id)
    this.engin = data;
  }
  onclose() {
    this.open_tab_pannes = false
  }

}
