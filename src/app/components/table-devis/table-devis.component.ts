import { Component, computed, effect, inject, input, model, OnInit, output, signal, TemplateRef } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { SousTraitanceComponent } from '../sous-traitance/sous-traitance.component';
import { FormGroup } from '@angular/forms';
import { SaisiComponent } from '../../utilitaires/saisi/saisi.component';
import { FormSaisiComponent } from '../form-saisi/form-saisi.component';
import { MatTableDataSource } from '@angular/material/table';
import { DevisStore, LigneDevisStore } from '../../store/appstore';

@Component({
    selector: 'app-table-devis',
    imports: [ImportedModule,FormSaisiComponent],
    templateUrl: './table-devis.component.html',
    styleUrl: './table-devis.component.scss'
})
export class TableDevisComponent implements OnInit {
  ngOnInit() {
    this.header_titles = Object.keys(this.displayedColumns())
  }
  constructor() {
    effect(() => {
    })
  }
  //injected stores
  _devis_store = inject(DevisStore);
  _ligne_devis_store = inject(LigneDevisStore);
  //signals
  is_update = signal(false);
  is_open = model(false);
  current_row = signal<any>([]);

  //computed
  selected_devis = computed(() => {
    let dev=this._devis_store.current_devis()
    return dev?dev.id:'';
  });

  //inputs
  titre = input.required<TemplateRef<any>>();
  table_update_form = input.required<FormGroup>();
  table = input.required<any>();
  displayedColumns = input.required<any>();
  devis_opened = input.required<boolean>();
  dataSource = input<any>({
    transform: (value: any) => new MatTableDataSource<any>(value)
  });

  //outputs
  newItemEvent = output<any[]>();
  RemoveItemEvent = output<string>();
  ChangeSelectEvent = output<any[]>();
  PatchEvent = output();
  addEvent = output();

  //properties
  header_titles: string[] = [];

  //methods
  retourQuitter() {
    this.is_open.set(false);
    this._devis_store.setCurrentDevisId('')
  }
  modifier(row: any, id: string) {
    this._devis_store.setCurrentDevis(row)
    this._devis_store.setCurrentDevisId(row.id)
    this._ligne_devis_store.filtrebyDevis(row.id)
    this.is_open.set(true)
    this.is_update.set(true)
    this.PatchEvent.emit(row)
  }
  addNewItem() {
    if (this.table_update_form().valid) {
      let valeur = this.table_update_form().value;
      this.newItemEvent.emit([valeur, this._devis_store.current_devis(), this.is_update()]);
      this.is_update.set(true);
      //this.is_open.set(false)
    }
  }
  supprimer(id: string) {
    this.is_update.set(false)
    this.RemoveItemEvent.emit(id)
  }
  annuler() {
    this.is_open.set(false)
    this._devis_store.setCurrentDevisId('')
    this._devis_store.setCurrentDevis(undefined)

  }
  ChangeSelect(data: any, controle_name: string) {
    this.ChangeSelectEvent.emit([data, controle_name]);
  }
  addElement() {
    this.is_open.set(true)
    this.is_update.set(false)
    this.addEvent.emit()
    this._ligne_devis_store.filtrebyDevis('')
    this._devis_store.setCurrentDevisId('')
    this._devis_store.setCurrentDevis(undefined)
  }
}
