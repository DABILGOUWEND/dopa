import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, computed, effect, inject, input, linkedSignal, output, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Pannes, Engins } from '../../models/modeles';
import { PannesStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { SituationPannePipe } from '../../situation-panne.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-table-panne',
  imports: [ImportedModule, SituationPannePipe],
  templateUrl: './table-panne.component.html',
  styleUrl: './table-panne.component.scss'
})
export class TablePanneComponent implements OnInit{
  readonly PanneStore = inject(PannesStore)
  formG: FormGroup;
  displayedColumns: string[] = ['debut_panne', 'fin_panne', 'motif_panne', 'situation', 'nbre_heure', 'actions']
  datasource = computed(
    () => new MatTableDataSource<Pannes>(this.donnees()),
  )
  donnees = linkedSignal(() => this.PanneStore.donnees_PannesById())
  engin = input.required<Engins | undefined>();
  close = output();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  selected = signal("1");
  modif = signal(false);
  selectedRow = signal(0);
  current_row = signal<Pannes | undefined>(undefined);
  open_tab_pannes = signal(false);
  is_update = signal(false);
  constructor(
    private _fb: FormBuilder
  ) {

    this.formG = this._fb.group(
      {
        id: new FormControl(),
        debut_panne: new FormControl((new Date()), Validators.required),
        heure_debut: new FormControl('', Validators.required),
        heure_fin: new FormControl(''),
        fin_panne: new FormControl((new Date())),
        motif_panne: new FormControl(''),
        situation: new FormControl('1'),
      }
    )
    effect(() => {
    })
  }
  

  ngOnInit() {
    this.formG.valueChanges.subscribe(resp=>console.log(resp.situation))
   
  }
  UpdatePanne() {
    if (this.formG.valid) {
      let saisies = this.formG.value;
      if (!this.is_update()) {
        let donnees =
        {
          id: "",
          engin_id: this.engin()?.id,
          debut_panne: saisies.debut_panne.toLocaleDateString(),
          fin_panne: this.selected() === "2" ? saisies.fin_panne.toLocaleDateString() : "",
          heure_debut: saisies.heure_debut,
          heure_fin: this.selected() === "2" ? saisies.heure_fin : "",
          motif_panne: saisies.motif_panne ? saisies.motif_panne : "",
          situation: this.selected() === "1" ? "garage" : "dépanné",
        }
        this.PanneStore.addPannes(donnees);
      }
      else {
        let donnees =
        {
          id: saisies.id,
          engin_id: this.engin()?.id,
          debut_panne: saisies.debut_panne.toLocaleDateString(),
          fin_panne: this.selected() === "2" ? saisies.fin_panne.toLocaleDateString() : "",
          heure_debut: saisies.heure_debut,
          heure_fin: this.selected() === "2" ? saisies.heure_fin : "",
          motif_panne: saisies.motif_panne ? saisies.motif_panne : "",
          situation: this.selected() === "1" ? "garage" : "dépanné",
        }
        console.log(donnees);
        this.PanneStore.updatePannes(donnees);
      }
      this.formG.reset();
      this.is_update.set(false);
      this.modif.set(false);
    }
    this.current_row.set(undefined);
  }

  quitter() {
    this.close.emit();
    this.modif.set(false);
    this.selected.set("1");
    this.annuler()
  }
  annuler() {
    this.formG.reset();
    this.current_row.set(undefined);
    if (!this.is_update())
      this.donnees.update((data: any) => data.filter((x: any) => x.id != ""))
  }

  choix_situation() {
    let value=this.formG.value
    console.log(value.situation)
    let sit=this.formG.value.situation
    this.selected.set(sit);
    console.log(sit)
    if (sit == "2") {
      console.log('ok')
      this.formG.get('heure_fin')?.setValidators([Validators.required,Validators.minLength(1)]);
      this.formG.get('fin_panne')?.setValidators(Validators.required);
      this.update();
    }
    if (sit == "1") {
      this.formG.get('fin_panne')?.clearValidators();
      this.formG.get('heure_fin')?.clearValidators();
      this.update();
    }
  }
  private update() {
    this.formG.get('fin_panne')?.updateValueAndValidity();
    this.formG.get('heure_fin')?.updateValueAndValidity();
    this.formG.get('debut_panne')?.updateValueAndValidity();
    this.formG.get('heure_debut')?.updateValueAndValidity();
  }
  modif_panne(panne: any, index: any) {
    this.current_row.set(panne);
    this.selectedRow = index;
    this.is_update.set(true);
    this.modif.set(true);


    let temp_debut = panne.debut_panne;
    let temp_fin = panne.fin_panne;
    const [day1, month1, year1] = temp_debut.split("/");
    const [day2, month2, year2] = temp_fin.split("/");
    const date1 = new Date(+year1, +month1 - 1, +day1);
    const date2 = new Date(+year2, +month2 - 1, +day2);
    this.formG.patchValue(
      {
        id: panne.id,
        debut_panne: date1,
        fin_panne: date2,
        heure_debut: panne.heure_debut,
        heure_fin: panne.heure_fin,
        motif_panne: panne.motif_panne,
        situation:panne.situation === 'garage'?"1":"2"
      }
    )
  }
  addpanne() {
    this.is_update.set(false);
    this.modif.set(false);
    this.selected.set("1");
    this.formG.reset();
    let dates = new Date();
    let newdata: Pannes = {
      id: "",
      engin_id: this.engin()?.id ?? '',
      debut_panne: new Date().toLocaleDateString(),
      fin_panne: new Date().toLocaleDateString(),
      heure_debut: '',
      heure_fin: '',
      motif_panne: '',
      situation: "garage",
    }
    this.donnees.update((data: any) => [newdata, ...data])
    this.formG.get("debut_panne")?.setValue(dates);
    this.formG.get("fin_panne")?.setValue(dates);
    this.current_row.set(newdata);
  }
  delete(row: any) {
    if (confirm('voulez-vous supprimer cet élement?')) {
      this.PanneStore.removePannes(row.id);
      this.is_update.set(false);
      this.modif.set(false);
      this.formG.reset();
    }
  }
}
