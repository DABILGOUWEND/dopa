import { Component, Input, OnInit, effect, inject } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Engins, classe_engins, tab_personnel, Projet, sous_traitant, Statuts } from '../../models/modeles';
import { EnginsStore, PersonnelStore, ClasseEnginsStore, ProjetStore, SstraitantStore, StatutStore } from '../../store/appstore';
import { ImportedModule } from '../../modules/imported/imported.module';

@Component({
  selector: 'app-saisi',
  standalone: true,
  imports: [ImportedModule],
  templateUrl: './saisi.component.html',
  styleUrl: './saisi.component.scss'
})
export class SaisiComponent implements OnInit {

  select_EnginByclasse:Engins[] 
  select_classe:classe_engins[]
  select_personnel:tab_personnel[]
  select_projet:Projet[]
  select_sstraitant:sous_traitant[]
  select_statut:Statuts[]
  readonly engins_store = inject(EnginsStore);
  readonly personnel_store = inject(PersonnelStore);
  readonly classeEngins_store = inject(ClasseEnginsStore);
  readonly projets_store=inject(ProjetStore)
  readonly sstraitants_store=inject(SstraitantStore)
  readonly statut_store=inject(StatutStore)
  constructor(
  ) {
    effect(()=>{
      this.select_EnginByclasse=this.engins_store.donnees_enginsByClasse()
      this.select_personnel=this.personnel_store.donnees_personnel()
      this.select_classe=this.classeEngins_store.classes_engins()
      this.select_projet=this.projets_store.donnees_projet()
      this.select_sstraitant=this.sstraitants_store.donnees_sstraitant()
      this.select_statut=this.statut_store.donnees_statut()
    })
   }
  @Input() label!: string;
  @Input() required_error!: string;
  invalid_error: string = 'Donnée invalide.';
  @Input() placeholder: string;
  @Input() maxlength!: string;
  @Input() type: string;
  @Input() select_option_map: any;
  required: boolean = false;
  @Input() parent_FG: FormGroup;
  @Input() control_name: string;

  control!: AbstractControl;
  @Input() enddate_control_name: string;
  default_design:string='ddmdmmd'
  ngOnInit() {
    this.projets_store.loadProjets()
    this.sstraitants_store.loadSstraitants()
    this.statut_store.loadstatut()
    this.control = this.parent_FG.get(this.control_name) as AbstractControl;
    //check if required validator
    if (!!this.control.validator) {
      let validators = this.control.validator({} as AbstractControl);
      this.required = !!validators && !!validators['required'];
    }
    //update the invalid error for date fields
    if (this.type == 'date' || this.type == 'daterange') {
      this.invalid_error = 'svp utiliser le format MM/DD/YYYY.';
    }
  }
  choix(id: string) {
    this.engins_store.filtrebyClasseId(id)
    this.parent_FG.get('designation')?.setValue(this.engins_store.donnees_enginsByClasse()[0].designation)
    this.parent_FG.get('id_engin')?.setValue(this.engins_store.donnees_enginsByClasse()[0].id)
  }
  choixEngin(id: string) {
    this.engins_store.filtrebyId(id)
    this.parent_FG.get('designation')?.setValue(this.engins_store.donnees_enginsById()?.designation)
  }
  choixPersonnel(id: string)
  {
  }

  choixStatut(id: string) {
  }

}
