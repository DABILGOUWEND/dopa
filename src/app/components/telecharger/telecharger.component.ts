import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, OnInit } from '@angular/core';
import { Router } from 'express';
import { AuthenService } from '../../authen.service';
import { UserStore, EnginsStore, ClasseEnginsStore, PersonnelStore, ProjetStore, CompteStore, DevisStore, LigneDevisStore, ApproGasoilStore, GasoilStore, PannesStore, AttachementStore, DecompteStore, TachesStore, ConstatStore, UnitesStore, SstraitantStore, StatutStore } from '../../store/appstore';
import { TaskService } from '../../task.service';
import { WenService } from '../../wen.service';
import { concat, forkJoin, Observable, of, switchMap } from 'rxjs';
import { TelechargerService } from '../../services/telecharger.service';
import { ImportedModule } from '../../modules/imported/imported.module';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { appro_gasoil, Entreprise, Gasoil, Statuts, tab_personnel } from '../../models/modeles';
import { DataLoaderService } from '../../services/data-loader.service';
import { Console } from 'console';

@Component({
    selector: 'app-telecharger',
    imports: [ImportedModule],
    templateUrl: './telecharger.component.html',
    styleUrl: './telecharger.component.scss'
})
export class TelechargerComponent implements OnInit {
  constructor() {
    effect(() => console.log(this._devis_store.devis_data()));

  }

  ngOnInit() {

    this._devis_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/devis');
    this._sous_traitance_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/sous_traitants');
    this._devis_store.loadDevis();
    this._sous_traitance_store.loadSstraitants();
    // this._lignedevis_store.loadLigneDevis();
    //this._attachement_store.loadAttachements();
    // this._decompte_store.loadAllDecomptes();
    //this._taches_store.loadTaches();
    // this._constat_store.loadConstats();

    //this._unite_store.loadUnites();

  }
  telecharger() {
    this.upload_devis().subscribe();
  }
  db = inject(Firestore);
  _loader_service = inject(DataLoaderService);
  _user_store = inject(UserStore);
  _engins_store = inject(EnginsStore);
  _classes_engins_store = inject(ClasseEnginsStore);
  _personnel_store = inject(PersonnelStore);
  _projet_store = inject(ProjetStore);
  _compte_store = inject(CompteStore);
  _devis_store = inject(DevisStore);
  _lignedevis_store = inject(LigneDevisStore);
  _approgo_store = inject(ApproGasoilStore);
  _consogo_store = inject(GasoilStore);
  _pannes_store = inject(PannesStore);
  _task_service = inject(TaskService);
  _telecharger_service = inject(TelechargerService);
  _gasoil_store = inject(GasoilStore);
  _appro_go = inject(ApproGasoilStore);
  _classe_store = inject(ClasseEnginsStore);
  _attachement_store = inject(AttachementStore);
  _decompte_store = inject(DecompteStore);
  _taches_store = inject(TachesStore);
  _constat_store = inject(ConstatStore);
  _unite_store = inject(UnitesStore);
  _sous_traitance_store = inject(SstraitantStore);
  _statut_store = inject(StatutStore);
  _auth_service = inject(AuthenService);

  upload_personnel() {
    let obsrv: Observable<any>[] = [];
    const MyCollection = collection(this.db, 'personnel')
    let rep = collectionData(MyCollection, { idField: 'id' }) as Observable<tab_personnel[]>
    return rep.pipe(switchMap(personnel => {
      personnel.forEach(
        (element: any) => {
          obsrv.push(
            this._telecharger_service.addpersonnel(element)
          )
        })
      return concat(obsrv)
    }
    ))

  }
  upload_engins() {
    let obsrv: Observable<any>[] = []
    this._engins_store.donnees_engins().forEach((element) => {
      let mydata = {
        "id": element.id,
        "designation": element.designation,
        "code_parc": element.code_parc,
        "classe_id": element.classe_id,
        "utilisateur_id": element.utilisateur_id,
        "immatriculation": element.immatriculation
      }
      obsrv.push(
        this._task_service.addEngins(mydata)
      )
    })
    concat(obsrv).subscribe()
  }
  upload_gasoil(): Observable<any> {
    let obsrv: Observable<any>[] = [];
    const MyCollection = collection(this.db, 'basessais')
    let rep = collectionData(MyCollection, { idField: 'id' }) as Observable<Gasoil[]>
    return rep.pipe(switchMap(gasoil => {
      gasoil.forEach(
        (element: any) => {
          obsrv.push(
            this._telecharger_service.addconso(element)
          )
        })
      return concat(obsrv)
    }
    ))

  }
  upload_approgo(): Observable<any> {
    let obsrv: Observable<any>[] = [];
    const MyCollection = collection(this.db, 'approgo')
    let rep = collectionData(MyCollection, { idField: 'id' }) as Observable<appro_gasoil[]>
    return rep.pipe(switchMap(gasoil => {
      gasoil.forEach(
        (element: any) => {
          obsrv.push(
            this._telecharger_service.addappro(element)
          )
        })
      return concat(obsrv)
    }
    ))

  }
  upload_pannes(): Observable<any> {
    let obsrv: Observable<any>[] = [];
    let pannes = this._pannes_store.pannes_data();
    pannes.forEach(
      (element) => {
        obsrv.push(
          this._task_service.addpannes({
            engin_id: element.engin_id,
            debut_panne: element.debut_panne,
            fin_panne: element.fin_panne,
            heure_debut: element.heure_debut,
            heure_fin: element.heure_fin,
            motif_panne: element.motif_panne,
            situation: element.situation
          })
        )
      })
    return concat(obsrv);
  }
  loadData() {
    this.upload_gasoil().subscribe()
  }
  upload() {
    let obsrv: Observable<any>[] = []
    let pannes = this._pannes_store.pannes_data();
    pannes.forEach(element => {
      obsrv.push(
        this._task_service.addpannes({
          'engin_id': element.engin_id,
          'date_panne': element.debut_panne,
          'date_depanne': element.fin_panne,
          'motif': element.motif_panne,
          'heure_panne': element.heure_debut,
          'heure_depanne': element.heure_fin
        })
      )
    });
    forkJoin(obsrv).subscribe();
  }
  upload_classe_engins() {
    let obsrv: Observable<any>[] = []
    this._classe_store.classes().forEach((element) => {
      let mydata = {
        "id": element.id,
        "designation": element.designation,
        "taches": element.taches
      }
      obsrv.push(
        this._task_service.addClassesEngins(mydata)
      )
    })
    concat(obsrv).subscribe()
  }
  upload_devis() {
    let obsrv: Observable<any>[] = []
    let filtre = this._devis_store.devis_data().find(x => x.entreprise_id == 'T2cUO3uBcfCGKQpI7wNf')
    let data = filtre?.data
    this._devis_store.devis_data().forEach((element) => {
      let entreprise = this._sous_traitance_store.donnees_sstraitant().find(x => x.id == element.entreprise_id)
      if (data) {
        let ent = data[0]
        ent.poste = ''
        ent.designation = element.code+'/'+entreprise?.enseigne
      }
      obsrv.push(
        this._telecharger_service.saveDevis(element.id, data)
      )
    })
    return concat(obsrv)
  }
  upload_ligne_devis() {
    let obsrv: Observable<any>[] = []
    this._lignedevis_store.lignedevis_data().forEach((element) => {
      obsrv.push(
        this._telecharger_service.addLigneDevis(element)
      )
    })
    return concat(obsrv)
  }
  upload_attachement() {
    let obsrv: Observable<any>[] = []
    this._attachement_store.attachement_data().forEach((element) => {
      obsrv.push(
        this._telecharger_service.addAttachement(element)
      )
    })
    return concat(obsrv)
  }
  upload_statut(path: string) {
    let obsrv: Observable<any>[] = [];
    const MyCollection = collection(this.db, 'satut')
    let rep = collectionData(MyCollection, { idField: 'id' }) as Observable<Statuts[]>
    return rep.pipe(switchMap(gasoil => {
      gasoil.forEach(
        (element: any) => {
          obsrv.push(
            this._telecharger_service.addStatut(path, element)
          )
        })
      return concat(obsrv)
    }
    ))

  }
  upload_entreprises() {
    let obsrv: Observable<any>[] = [];
    const MyCollection = collection(this.db, 'entreprises')
    let rep = collectionData(MyCollection, { idField: 'id' }) as Observable<Entreprise[]>
    return rep.pipe(switchMap(entreprise => {
      entreprise.forEach(
        (element: any) => {
          obsrv.push(
            this._telecharger_service.addEntreprises(element)
          )
        })
      return concat(obsrv)
    }
    ))

  }
  upload_decomptes() {
    let obsrv: Observable<any>[] = []
    this._decompte_store.decompte_data().forEach((element) => {
      obsrv.push(
        this._telecharger_service.addDecomptes(element)
      )
    })
    return concat(obsrv)
  }
  upload_taches() {
    let obsrv: Observable<any>[] = []
    this._taches_store.taches_data().forEach((element) => {
      obsrv.push(
        this._telecharger_service.addTaches(element)
      )
    })
    return concat(obsrv)
  }
  upload_constats() {
    let obsrv: Observable<any>[] = [];
    this._constat_store.constat_data().forEach((element) => {
      obsrv.push(
        this._telecharger_service.addConstats(element)
      )
    })
    return concat(obsrv)
  }
  upload_unites() {
    let obsrv: Observable<any>[] = [];
    this._unite_store.unites_data().forEach((element) => {
      obsrv.push(
        this._telecharger_service.addUnites(element)
      )
    })
    return concat(obsrv)
  }
  upload_sstraitance() {
    let obsrv: Observable<any>[] = [];
    const MyCollection = collection(this.db, 'sstraitants')
    let rep = collectionData(MyCollection, { idField: 'id' }) as Observable<tab_personnel[]>
    return rep.pipe(switchMap(data => {
      data.forEach(
        (element: any) => {
          obsrv.push(
            this._telecharger_service.addSstraitance(element)
          )
        })
      return concat(obsrv)
    }
    ))
  }
}
