import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AuthenService } from './authen.service';
import { BehaviorSubject, forkJoin, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { appro_gasoil, classe_engins, Constats, Devis, element_devis, Engins, Gasoil, Ligne_devis, ModelAttachement, ModelDecompte, Pannes, Projet, sous_traitant, tab_personnel, tab_ProjetStore, taches, taches_engins, unites } from './models/modeles';
import { environment } from '../environments/environment';
import { response } from 'express';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  _http = inject(HttpClient);
  dataChange: BehaviorSubject<element_devis[]> = new BehaviorSubject<element_devis[]>([]);
  db: Firestore = inject(Firestore);
  _auth_service = inject(AuthenService);
  constructor() {
    this.getaDevis().subscribe(data => {
      this.dataChange.next([...data[0].data.sort((a, b) => b.poste.localeCompare(a.poste))]);
    })
  }
  data_element(): element_devis[] { return this.dataChange.value; }
  //engins
  getallEngins(): Observable<Engins[]> {


    if (!environment.production) {
      return this._http.get<any[]>(this._auth_service.lodal_apiUrl() + '/engins').pipe(map((resp: any) => resp.map((x: any) => {
        return {
          id: x.id.toString(),
          designation: x.designation,
          code_parc: x.code_parc,
          immatriculation: x.immatriculation,
          utilisateur_id: x.utilisateur_id,
          classe_id: x.classe_id.toString(),
        }
      }
      )
      )
      )
    }
    else {
      const Collection = collection(this.db, 'comptes/' +
        this._auth_service.current_projet_id() + '/engins');
      return collectionData(Collection, { idField: 'id' }) as Observable<Engins[]>
    }

  }
  addEngins(data: any): Observable<string> {
    const EnginsCollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/engins');
    const docRef = addDoc(EnginsCollection, data).then(response => response.id)
    return from(docRef)
  }
  updateEngins(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/engins' + id);
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteEngins(id: string): Observable<any> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/engins' + id);
    const promise = deleteDoc(docRef)
    return from(promise)
  }

  //personnel
  getallPersonnel(): Observable<tab_personnel[]> {
    if (!environment.production) {
      return this._http.get<any[]>(this._auth_service.lodal_apiUrl() + '/personnel').pipe(
        map((resp: any) => resp.map((x: any) => {
          return {
            id: x.id.toString(),
            nom: x.nom,
            prenom: x.prenom,
            fonction: x.fonction,
            num_phone1: x.num_phone1,
            num_phone2: x.num_phone2,
            email: x.email,
            num_matricule: x.num_matricule,
            dates: [],
            heuresN: [],
            heureSup: [],
            presence: [],
            statut_id: ""
          }
        }))
      )
    } else {
      const Collection = collection(this.db, 'comptes/' +
        this._auth_service.current_projet_id() + '/personnel');
      return collectionData(Collection, { idField: 'id' }) as Observable<tab_personnel[]>
    }
  }
  addPersonnel(data: any): Observable<string> {
    const Collection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/personnel');
    const docRef = addDoc(Collection, data).then(response => response.id)
    return from(docRef)
  }
  updatePersonnel(data: any): Observable<any> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/personnel/' + id);
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deletePersonnel(id: string): Observable<any> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/personnel/' + id);
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updatePerson(row: tab_personnel, date: string): Observable<void> {
    let dates = [...row.dates, date]
    let presence = [...row.presence, true]
    let heureNorm = [...row.heuresN, 8]
    let heureSup = [...row.heureSup, 0]
    let myrow: any = row;
    row.dates = dates;
    row.presence = presence;
    row.heureSup = heureSup;
    row.heuresN = heureNorm;
    myrow = row;
    if (!environment.production) {
      let promise = this._http.put<void>(this._auth_service.lodal_apiUrl() + '/personnel/' + row.id, myrow,
        { headers: new HttpHeaders({ 'Content-type': 'application/json' }) });
      return promise
    }
    else {
      const docRef1 = doc(this.db, 'comptes/' + this._auth_service.current_projet_id() + '/personnel/' + row.id)
      const docRef = updateDoc(docRef1, { dates: dates, heuresN: heureNorm, heureSup: heureSup, presence: presence }).then
        (response => { }
        )
      return from(docRef)
    }
  }
  removePerson(row: tab_personnel, date: string): Observable<void> {
    let initdate = row.dates
    let ind = initdate.indexOf(date)

    let initheurenor = row.heuresN
    let initheuresup = row.heureSup
    let initpresence = row.presence

    let remdate = initdate.splice(ind, 1)
    let remheurenom = initheurenor.splice(ind, 1)
    let remheuresup = initheuresup.splice(ind, 1)
    let rempresence = initpresence.splice(ind, 1)
    const docRef1 = doc(this.db, 'comptes/' + this._auth_service.current_projet_id() + '/personnel/' + row.id)
    const docRef = updateDoc(docRef1, { dates: initdate, heuresN: initheurenor, heureSup: initheuresup, presence: initpresence }).then
      (response => { }
      )
    return from(docRef)
  }
  updatePersonInit(row: any): Observable<void> {
    let curendate = row.dates[row.dates.length - 1]
    let dates = ['']
    let presence = [false]
    let heureNorm = [0]
    let heureSup = [0]
    const docRef1 = doc(this.db, 'comptes/' + this._auth_service.current_projet_id() + '/personnel/' + row.id);
    const docRef = updateDoc(docRef1, { dates: dates, heuresN: heureNorm, heureSup: heureSup, Presence: presence }).then
      (response => { }
      )
    return from(docRef)
  }
  ModifPerson(row: tab_personnel|any): Observable<void> {
    console.log(row)
    let id = row.id
    let heuresN = row.heuresN
    let heuresup = row.heureSup
    let presence = row.presence
    const docRef1 = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/personnel/' + id)
    const docRef = updateDoc(docRef1, { heuresN: heuresN, heureSup: heuresup, presence: presence }).then
      (response => { }
      )
    return from(docRef)
  }

  //classes_engins
  getallClassesEngins(): Observable<classe_engins[]> {
    if (!environment.production) {
      return this._http.get<any[]>(this._auth_service.lodal_apiUrl() + '/classes_engins').pipe(
        map((resp: any) => resp.map((x: any) => {
          return {
            id: x.id.toString(),
            designation: x.designation,
            taches: []
          }
        }))
      )
    } else {
      const Collection = collection(this.db, 'comptes/' +
        this._auth_service.current_projet_id() + '/classes_engins');
      return collectionData(Collection, { idField: 'id' }) as Observable<classe_engins[]>
    }

  }
  addClassesEngins(data: any): Observable<string> {
    const Collection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/classes_engins');
    const docRef = addDoc(Collection, data).then(response => response.id)
    return from(docRef)
  }
  updateClassesEngins(data: any): Observable<any> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/classes_engins/' + id);
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteClassesEngins(id: string): Observable<any> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/classes_engins/' + id);
    const promise = deleteDoc(docRef)
    return from(promise)
  }

  //projets
  getallProjets(): Observable<Projet[]> {

    const Collection = collection(this.db, '/projet');
    return collectionData(Collection, { idField: 'id' }) as Observable<Projet[]>


  }
  addProjets(data: any): Observable<string> {
    const EnginsCollection = collection(this.db, '/projet');
    const docRef = addDoc(EnginsCollection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  updateProjets(data: any): Observable<any> {
    let id = data.id
    const docRef = doc(this.db, '/projet/' + id);
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteProjets(id: string): Observable<any> {
    const docRef = doc(this.db, '/projet/' + id);
    const promise = deleteDoc(docRef)
    return from(promise)
  }

  //gasoil
  getallConsogo(): Observable<Gasoil[]> {
    if (!environment.production) {
      return this._http.get<any[]>(this._auth_service.lodal_apiUrl() + '/conso_go').pipe(
        map((resp: any) => resp.map((x: any) => {
          return {
            id: x.id.toString(),
            engin_id: x.engin_id.toString(),
            compteur: x.compteur,
            quantite_go: x.quantite_go,
            date: x.date,
            diff_work: x.diff_work,
            numero: x.numero
          }
        }))
      )
    } else {
      const mycollection = collection(this.db, 'comptes/' +
        this._auth_service.current_projet_id() + '/conso_gasoil')
      let donnees = collectionData(mycollection, { idField: 'id' }) as Observable<Gasoil[]>
      return donnees
    }
  }
  addConsogo(data: any): Observable<string> {
    const EnginsCollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/conso_gasoil');
    const docRef = addDoc(EnginsCollection, data).then(response => response.id)
    return from(docRef)
  }
  updateConsogo(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/conso_gasoil' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteConsogo(id: string): Observable<void> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/conso_gasoil' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }

  //appro gasoil
  getAllApproGo(): Observable<appro_gasoil[]> {
    if (!environment.production) {
      return this._http.get<any[]>(this._auth_service.lodal_apiUrl() + '/appro_go').pipe(
        map((resp: any) => resp.map((x: any) => {
          return {
            id: x.id.toString(),
            date: x.date,
            quantite: x.quantite,
            reception: x.reception
          }
        }))
      )
    } else {
      const mycollection = collection(this.db, 'comptes/' +
        this._auth_service.current_projet_id() + '/appro_go')
      let donnees = collectionData(mycollection, { idField: 'id' }) as Observable<appro_gasoil[]>
      return donnees
    }
  }
  addApproGo(data: any): Observable<string> {
    const Collection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/appro_go');
    const docRef = addDoc(Collection, data).then(response => response.id)
    return from(docRef)
  }
  updateApproGo(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +this._auth_service.current_projet_id() + '/appro_go/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteApproGo(id: string): Observable<void> {
    console.log(id)
    const docRef = doc(this.db, 'comptes/' +this._auth_service.current_projet_id() + '/appro_go/' + id);
    const promise = deleteDoc(docRef)
    return from(promise)
  }

  //pannes
  getAllPannes(): Observable<Pannes[]> {
    if (!environment.production) {
      return this._http.get<any[]>(this._auth_service.lodal_apiUrl() + '/pannes').pipe(
        map((resp: any) => resp.map((x: any) => {
          return {
            id: x.id.toString(),
            engin_id: x.engin_id,
            debut_panne: x.debut_panne,
            fin_panne: x.fin_panne ? x.fin_panne : "",
            heure_debut: x.heure_debut,
            heure_fin: x.heure_fin ? x.heure_fin : "",
            motif_panne: x.motif_panne,
            situation: x.situation
          }
        }))
      )
    } else {
      const mycollection = collection(this.db, 'comptes/' +
        this._auth_service.current_projet_id() + '/pannes')
      let donnees = collectionData(mycollection, { idField: 'id' }) as Observable<Pannes[]>
      return donnees
    }

  }
  addpannes(data: any): Observable<string> {
    const EnginsCollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/pannes');
    const docRef = addDoc(EnginsCollection, data).then(response => response.id)
    return from(docRef)
  }
  updatePannes(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/pannes' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deletePannes(id: string): Observable<void> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/pannes' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }



  //DEVIS
  getallDevis(): Observable<Devis[]> {
    const DevisCollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/devis')
    return collectionData(DevisCollection, { idField: 'id' }) as Observable<Devis[]>
  }
  addDevis(data: any): Observable<string> {
    const devcollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/devis')
    const docRef = addDoc(devcollection, data).then(response => response.id)
    return from(docRef)
  }

  initialDevis(path_string: string, row: Devis, entreprise: string): Observable<void> {
    const docRef1 = doc(this.db, path_string + '/' + row.id);
    const docRef = updateDoc(docRef1, {
      data: [{
        'poste': row.code,
        'designation': entreprise,
        'prix_u': null,
        'unite': '',
        'quantite': null,
        'children': []
      }]
    }).then
      (response => { }
      )
    return from(docRef)
  }

  addDataDevis(path_string: string, devis_id: string, row: any): Observable<void> {
    const docRef1 = doc(this.db, path_string + '/' + devis_id);
    const docRef = updateDoc(docRef1, { data: row }).then
      (response => { }
      )
    return from(docRef)
  }
  addNewDecompteDevis(path_string: string, devis_id: string, row: any): Observable<void> {
    const docRef1 = doc(this.db, path_string + '/' + devis_id);
    const docRef = updateDoc(docRef1, { decompte: row }).then
      (response => { }
      )
    return from(docRef)
  }

  updateDevis(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/devis/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteDevis(id: string): Observable<void> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/devis/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }


  //CONSTATS
  getallConstats(): Observable<Constats[]> {
    const ConstatsCollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/constats')
    return collectionData(ConstatsCollection, { idField: 'id' }) as Observable<Constats[]>
  }
  addConstats(data: any): Observable<string> {
    const constcollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/constats')
    const docRef = addDoc(constcollection, data).then(response => response.id)
    return from(docRef)
  }
  updateConstat(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/constats/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteConstat(id: string): Observable<void> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/constats/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }

  //LIGNES DEVIS
  getallLigneDevis(): Observable<Ligne_devis[]> {
    const LDevisCollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/lignes_devis')
    return collectionData(LDevisCollection, { idField: 'id' }) as Observable<Ligne_devis[]>
  }
  getaDevis(): Observable<Devis[]> {
    const LDevisCollection = collection(this.db, 'data_devis')
    return collectionData(LDevisCollection, { idField: 'id' }) as Observable<Devis[]>
  }
  saveDevis(row: any, devis_id: string): Observable<void> {
    const docRef1 = doc(this.db, 'data_devis/' + devis_id);
    const docRef = updateDoc(docRef1, { data: row }).then
      (response => { }
      )
    return from(docRef)
  }
  addLigneDevis(data: any): Observable<string> {
    const LdevisCollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/lignes_devis')
    const docRef = addDoc(LdevisCollection, data).then(response => response.id)
    return from(docRef)
  }
  updateLigneDevis(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/lignes_devis/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteLigneDevis(id: string): Observable<void> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/lignes_devis/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  //ATTACHEMENTS
  getallAttachements(): Observable<ModelAttachement[]> {
    const AttachCollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/attachements')
    return collectionData(AttachCollection, { idField: 'id' }) as Observable<ModelAttachement[]>
  }
  addAttachement(data: any): Observable<string> {
    const attach_collection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/attachements')
    const docRef = addDoc(attach_collection, data).then(response => response.id)
    return from(docRef)
  }
  updateAttachement(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/attachements/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteAttachement(id: string): Observable<void> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/attachements/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }

  //DECOMPTES
  getAllDecompte(): Observable<ModelDecompte[]> {
    const Collection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/decomptes')
    return collectionData(Collection, { idField: 'id' }) as Observable<ModelDecompte[]>
  }
  addDecomptes(data: any): Observable<string> {
    const Collection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/decomptes')
    const docRef = addDoc(Collection, data).then(response => response.id)
    return from(docRef)
  }
  updateDecompte(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/decomptes/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteDecompte(id: string): Observable<void> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/decomptes/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }

  //TACHES
  getAllTaches(): Observable<taches[]> {
    const Collection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/taches')
    return collectionData(Collection, { idField: 'id' }) as Observable<taches[]>
  }
  addTaches(data: any): Observable<string> {
    const Collection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/taches')
    const docRef = addDoc(Collection, data).then(response => response.id)
    return from(docRef)
  }
  updateTaches(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/taches/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteTaches(id: string): Observable<void> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/taches/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }

  //unites
  getAllUnites(): Observable<unites[]> {
    const unites_ollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/unites')
    return collectionData(unites_ollection, { idField: 'id' }) as Observable<unites[]>
  }
  addUnites(data: any): Observable<string> {
    const UnitesCollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/unites')
    const docRef = addDoc(UnitesCollection, data).then(response => response.id);
    return from(docRef)
  }
  deleteUnite(id: string): Observable<void> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/unites/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateUnite(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/unites/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }

  //ss traitances
  getAllSstraitance(): Observable<sous_traitant[]> {
    const sstce_collection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/sous_traitants')
    return collectionData(sstce_collection, { idField: 'id' }) as Observable<sous_traitant[]>
  }
  addSstraitance(data: any): Observable<string> {
    const mcollection = collection(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/sous_traitants')
    const docRef = addDoc(mcollection, data).then(response => response.id)
    return from(docRef)
  }
  deleteSstraitance(id: string): Observable<void> {
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/sous_traitants/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updatSstraitance(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/sous_traitants/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }


  //modeles 
  getallModels(path_string: string): Observable<any[]> {
    const my_collection = collection(this.db, path_string);
    return collectionData(my_collection, { idField: 'id' }) as Observable<any[]>;
  }
  addModel(path_string: string, data: any): Observable<string> {
    const my_collection = collection(this.db, path_string);
    const docRef = addDoc(my_collection, data).then(response => response.id);
    return from(docRef);
  }
  updateModel(path_string: string, data: any): Observable<void> {
    let id = data.id;
    const docRef = doc(this.db, path_string + '/' + id);
    const promise = setDoc(docRef, data);
    return from(promise);
  }
  deleteModel(path_string: string, id: string): Observable<void> {
    const docRef = doc(this.db, path_string + '/' + id);
    const promise = deleteDoc(docRef);
    return from(promise);
  }
}
