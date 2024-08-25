import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, from, switchMap, of, concatMap, forkJoin, map } from 'rxjs';
import { Engins, classe_engins, Gasoil, appro_gasoil, tab_personnel, Pannes, travaux, nature_travaux, Users, pointage, tab_ressources, tab_familles, tab_categories, datesPointages, tab_composites, Contrats, Projet, sous_traitant, tab_Essais, Statuts, Devis, Ligne_devis, Constats, ModelAttachement, ModelDecompte, unites, taches, pointage_machine, taches_engins, taches_projet, Entreprise } from './models/modeles';
import jsPDF from 'jspdf'
import autoTable, { Styles } from 'jspdf-autotable';
import { HttpClient } from '@angular/common/http';
import { formatNumber } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class WenService {

  constructor(private firestore: Firestore,
    private _http: HttpClient) {

  }
  addevis(data: Devis): Observable<string> {
    const DevisCollection = collection(this.firestore, 'Devis')
    const docRef = addDoc(DevisCollection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  addLdevis(data: Ligne_devis): Observable<string> {
    const DevisCollection = collection(this.firestore, 'Lignedevis')
    const docRef = addDoc(DevisCollection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  uploaddevis(): Observable<any> {
    return this._http.get<Devis[]>('http://localhost:3000/devis').pipe(
      switchMap(resp => {
        let obs: Observable<any>[] = []
        for (let row of resp) {
          obs.push(this.addevis(row))
        }
        return forkJoin(obs)
      })
    )
  }
  uploadLdevis(): Observable<any> {
    return this._http.get<Ligne_devis[]>('http://localhost:3000/lignedev').pipe(
      switchMap(resp => {
        let obs: Observable<any>[] = []
        for (let row of resp) {
          obs.push(this.addLdevis(row))
        }
        return forkJoin(obs)
      })
    )
  }
  uploadUnite(): Observable<any> {
    return this._http.get<unites[]>('http://localhost:3000/unite').pipe(
      switchMap(resp => {
        let obs: Observable<any>[] = []
        for (let row of resp) {
          obs.push(this.addMyUnites(row))
        }
        return forkJoin(obs)
      })
    )
  }
  uploadtachengins(): Observable<any> {
    return this._http.get<taches_engins[]>('http://localhost:3000/tachesmachines').pipe(
      switchMap(resp => {
        let obs: Observable<any>[] = []
        for (let row of resp) {
          obs.push(this.addMyTachesEngins(row))
        }
        return forkJoin(obs)
      })
    )
  }
  uploadTaches(): Observable<any> {
    return this._http.get<taches[]>('http://localhost:3000/taches').pipe(
      switchMap(resp => {
        let classes = resp.map(x => x.classe);
        let filtres = classes.filter((value, index, self) => self.indexOf(value) === index)
        let obs: Observable<any>[] = []
        for (let str of filtres) {
          var i = 0;
          let taches = resp.filter(x => x.classe == str)
          taches.forEach(element => {
            i++;
            obs.push(this.addTaches({
              'designation': element.designation,
              'uniteid': element.uniteid,
              'type': element.type,
              'classe': str + "00" + i.toString()
            }))
          });

        }
        return forkJoin(obs)
      })
    )
  }
  addMyUnites(data: unites): Observable<string> {
    const DevisCollection = collection(this.firestore, 'taches')
    const docRef = addDoc(DevisCollection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  addMyTachesEngins(data: taches_engins): Observable<string> {
    const Collection = collection(this.firestore, 'tachesmachines')
    const docRef = addDoc(Collection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  addTaches(data: any): Observable<void> {
    const Collection = collection(this.db, 'taches')
    const docRef = addDoc(Collection, {
      designation: data.designation,
      uniteid: data.uniteid,
      type: data.type,
      classe: data.classe
    }).then
      (response => { }
      )
    return from(docRef)
  }
  docStyles: Partial<Styles>;
  printHeadStyles: Partial<Styles>;
  printColumns: any[];
  printColumnsStyles: any;
  db: Firestore = inject(Firestore)
  //engins
  getallEngins(): Observable<Engins[]> {
    const EnginsCollection = collection(this.db, 'engins')
    return collectionData(EnginsCollection, { idField: 'id' }) as Observable<Engins[]>
  }
  addEngins(data: Engins): Observable<string> {
    let mydata =
    {
      classe_id: data.classe_id,
      code_parc: data.code_parc,
      designation: data.designation,
      immatriculation: data.immatriculation,
      utilisateur_id: data.utilisateur_id
    }
    const EnginsCollection = collection(this.db, 'engins')
    const docRef = addDoc(EnginsCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deleteEngin(id: string): Observable<void> {
    const docRef = doc(this.db, 'engins/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateEngin(data: any): Observable<void> {

    let id = data.id
    const docRef = doc(this.db, 'engins/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }

  //classes engins
  getallClasses(): Observable<classe_engins[]> {
    const ClassesCollection = collection(this.db, 'classes')
    return collectionData(ClassesCollection, { idField: 'id' }) as Observable<classe_engins[]>
  }
  addclasses(data: classe_engins): Observable<string> {
    let mydata =
    {
      designation: data.designation,
    }
    const ClasseCollection = collection(this.db, 'classes')
    const docRef = addDoc(ClasseCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deleteclasses(id: string): Observable<void> {
    const docRef = doc(this.db, 'classes/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateclasses(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'classes/' + id)

    const promise = setDoc(docRef, data)
    return from(promise)
  }

  //*gasoil
  getallGasoil(): Observable<Gasoil[]> {
    const ClassesCollection = collection(this.db, 'basessais')
    return collectionData(ClassesCollection, { idField: 'id' }) as Observable<Gasoil[]>
  }
  addgasoil(data: any): Observable<string> {
    let mydata =
    {
      date: data.date,
      id_engin: data.id_engin,
      compteur: (data.compteur).toString(),
      diff_work: data.diff_work,
      quantite_go: data.quantite_go,
      numero: data.numero
    }
    const EnginsCollection = collection(this.db, 'basessais')
    const docRef = addDoc(EnginsCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deleteGasoil(id: string): Observable<void> {
    const docRef = doc(this.db, 'basessais/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateGasoil(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'basessais/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }

  //appro gasoil
  getallApproGo(): Observable<appro_gasoil[]> {
    const mycollection = collection(this.db, 'approgo')
    let donnees = collectionData(mycollection, { idField: 'id' }) as Observable<appro_gasoil[]>
    return donnees
  }
  addApproGo(data: appro_gasoil): Observable<string> {
    let mydata =
    {
      date: data.date,
      quantite: data.quantite.toString(),
      reception: data.reception
    }
    const mycollection = collection(this.db, 'approgo')
    const docRef = addDoc(mycollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deleteApproGo(id: string): Observable<void> {
    const docRef = doc(this.db, 'approgo/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateApproGo(data: any): Observable<void> {
    let id = data.id
    let val_tr = {
      date: data.date.toLocaleDateString(),
      quantite: data.quantite,
      reception: data.reception
    }
    const docRef = doc(this.db, 'approgo/' + id)
    const promise = setDoc(docRef, val_tr)
    return from(promise)
  }

  // personnel
  getallPersonnel(): Observable<tab_personnel[]> {
    const ClassesCollection = collection(this.db, 'personnel')
    return collectionData(ClassesCollection, { idField: 'id' }) as Observable<tab_personnel[]>
  }
  recherchePersonneByid(id: string): Observable<string | undefined> {
    return this.getallPersonnel().pipe(switchMap(res => {
      let donnne = res.find(x => x.id == id)
      return of(donnne?.nom)
    })
    )
  }
  addpersonnel(data: tab_personnel): Observable<string> {
    let mydata =
    {
      nom: data.nom,
      prenom: data.prenom,
      fonction: data.fonction,
      num_phone1: data.num_phone1,
      num_phone2: data.num_phone2,
      email: data.email,
      num_matricule: data.num_matricule,
      dates: [''],
      Presence: [false],
      heuresN: [0],
      heureSup: [0],
      statut_id: data.statut_id
    }
    const EnginsCollection = collection(this.db, 'personnel')
    const docRef = addDoc(EnginsCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deletePersonnel(id: string): Observable<void> {
    const docRef = doc(this.db, 'personnel/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updatePersonnel(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'personnel/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }

  //pannes
  getallpannes(): Observable<Pannes[]> {
    const PannesCollection = collection(this.db, 'pannes')
    return collectionData(PannesCollection, { idField: 'id' }) as Observable<Pannes[]>
  }
  addpanne(data: Pannes): Observable<string> {
    let mydata =

    {
      engin_id: data.engin_id,
      debut_panne: data.debut_panne,
      fin_panne: data.fin_panne,
      motif_panne: data.motif_panne,
      situation: data.situation,
      heure_debut: data.heure_debut,
      heure_fin: data.heure_fin
    }
    const PannesCollection = collection(this.db, 'pannes')
    const docRef = addDoc(PannesCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  updatePanne(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'pannes/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deletePanne(id: string): Observable<void> {
    const docRef = doc(this.db, 'pannes/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }

  //travaux
  getalltravaux(): Observable<travaux[]> {
    const trvxCollection = collection(this.db, 'travaux')
    return collectionData(trvxCollection, { idField: 'id' }) as Observable<travaux[]>
  }
  updatetravaux(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'travaux/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deletetravaux(id: string): Observable<void> {
    const docRef = doc(this.db, 'travaux/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  addtravaux(data: travaux): Observable<string> {
    let mydata =
    {
      engin_id: data.engin_id,
      quantite: data.quantite,
      nature_id: data.nature_id,
      date: data.date
    }
    const travauxCollection = collection(this.db, 'travaux')
    const docRef = addDoc(travauxCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  //nature travaux
  getallnaturetrvx(): Observable<nature_travaux[]> {
    const naturetrxCollection = collection(this.db, 'naturetravaux')
    return collectionData(naturetrxCollection, { idField: 'id' }) as Observable<nature_travaux[]>
  }
  updatenaturetrvx(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'naturetravaux/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deletenaturetrvx(id: string): Observable<void> {
    const docRef = doc(this.db, 'naturetravaux/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  addnaturetrvx(data: nature_travaux): Observable<string> {
    let mydata =
    {
      designation: data.designation,
      unite: data.unite,
    }
    const naturetrvxCollection = collection(this.db, 'naturetravaux')
    const docRef = addDoc(naturetrvxCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  //users
  getallUsers(): Observable<Users[]> {
    const UsersCollection = collection(this.db, 'users')
    return collectionData(UsersCollection, { idField: 'id' }) as Observable<Users[]>
  }
  addUser(data: Users): Observable<string> {
    let mydata =

    {
      identifiant: data.identifiant,
      mot_de_passe: data.mot_de_passe,
    }
    const UsersCollection = collection(this.db, 'users')
    const docRef = addDoc(UsersCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deleteUser(id: string): Observable<void> {
    const docRef = doc(this.db, 'users/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  //DEVIS
  getallDevis(): Observable<Devis[]> {
    const DevisCollection = collection(this.db, 'Devis')
    return collectionData(DevisCollection, { idField: 'id' }) as Observable<Devis[]>
  }
  addDevis(data: Devis): Observable<string> {
    const PannesCollection = collection(this.db, 'Devis')
    const docRef = addDoc(PannesCollection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  updateDevis(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'Devis/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteDevis(id: string): Observable<void> {
    const docRef = doc(this.db, 'pointage/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  //CONSTATS
  getallConstats(): Observable<Constats[]> {
    const ConstatsCollection = collection(this.db, 'Constats')
    return collectionData(ConstatsCollection, { idField: 'id' }) as Observable<Constats[]>
  }
  addConstat(data: any): Observable<string> {
    const ConstatsCollection = collection(this.db, 'Constats')
    const docRef = addDoc(ConstatsCollection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  updateConstat(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'Constats/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteConstat(id: string): Observable<void> {
    const docRef = doc(this.db, 'Constats/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  //LIGNES DEVIS
  getallLigneDevis(): Observable<Ligne_devis[]> {
    const LDevisCollection = collection(this.db, 'Lignedevis')
    return collectionData(LDevisCollection, { idField: 'id' }) as Observable<Ligne_devis[]>
  }
  addLigneDevis(data: any): Observable<string> {
    let mydata = {
      code: data.code,
      devis_id: data.devis_id,
      parent_code: data.parent_code,
      designation: data.designation,
      prix_u: data.prix_u,
      unite: data.unite,
      quantite: data.quantite,
      poste: data.poste,
    }
    const LdevisCollection = collection(this.db, 'Lignedevis')
    const docRef = addDoc(LdevisCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  updateLigneDevis(data: any): Observable<void> {
    let mydata = {
      code: data.code,
      devis_id: data.devis_id,
      parent_code: data.parent_code,
      designation: data.designation,
      prix_u: data.prix_u,
      unite: data.unite,
      quantite: data.quantite,
      poste: data.poste
    }
    let id = data.id
    const docRef = doc(this.db, 'Lignedevis/' + id)
    const promise = setDoc(docRef, mydata)
    return from(promise)
  }
  deleteLigneDevis(id: string): Observable<void> {
    const docRef = doc(this.db, 'Lignedevis/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  //ATTACHEMENTS
  getallAttachements(): Observable<ModelAttachement[]> {
    const AttachCollection = collection(this.db, 'attachements')
    return collectionData(AttachCollection, { idField: 'id' }) as Observable<ModelAttachement[]>
  }
  addAttachement(data: any): Observable<string> {
    let mydata = {
      devis_id: data.devis_id,
      numero: data.numero,
      date: data.date
    }
    const LdevisCollection = collection(this.db, 'attachements')
    const docRef = addDoc(LdevisCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  updateAttachement(data: any): Observable<void> {
    let mydata = {
      quantite_periode: data.quantite_periode,
    }
    let id = data.id
    const docRef = doc(this.db, 'attachements/' + id)
    const promise = setDoc(docRef, mydata)
    return from(promise)
  }
  deleteAttachement(id: string): Observable<void> {
    const docRef = doc(this.db, 'attachements/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }

  //DECOMPTES
  getAllDecompte(): Observable<ModelDecompte[]> {
    const Collection = collection(this.db, 'decomptes')
    return collectionData(Collection, { idField: 'id' }) as Observable<ModelDecompte[]>
  }
  addDecomptes(data: any): Observable<string> {

    const Collection = collection(this.db, 'decomptes')
    const docRef = addDoc(Collection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  updateDecompte(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'decomptes/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteDecompte(id: string): Observable<void> {
    const docRef = doc(this.db, 'decomptes/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  //pointages
  getallpointage(): Observable<pointage[]> {
    const PannesCollection = collection(this.db, 'pointage')
    return collectionData(PannesCollection, { idField: 'id' }) as Observable<pointage[]>
  }
  addpointage(data: pointage): Observable<string> {
    let mydata =

    {
      personnel_id: data.personnel_id,
      presence: data.presence,
      date: data.date,
      heure_sup: data.heure_sup
    }
    const PannesCollection = collection(this.db, 'pointage')
    const docRef = addDoc(PannesCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  updatepointage(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'pointage/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deletepointage(id: string): Observable<void> {
    const docRef = doc(this.db, 'pointage/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  //ressources
  getallressources(): Observable<tab_ressources[]> {
    const RessCollection = collection(this.db, 'ressources')
    return collectionData(RessCollection, { idField: 'id' }) as Observable<tab_ressources[]>
  }
  addressources(data: tab_ressources): Observable<string> {
    let mydata =
    {
      designation: data.designation,
      unite: data.unite,
      prix_unitaire: data.prix_unitaire,
      categorie_id: data.categorie_id,
      code: data.code
    }
    const RessCollection = collection(this.db, 'ressources')
    const docRef = addDoc(RessCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  updateressources(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'ressources/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deleteressources(id: string): Observable<void> {
    const docRef = doc(this.db, 'ressources/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  //familles
  getallfamilles(): Observable<tab_familles[]> {
    const famCollection = collection(this.db, 'familles')
    return collectionData(famCollection, { idField: 'id' }) as Observable<tab_familles[]>
  }
  addfamilles(data: tab_familles): Observable<string> {
    let mydata =

    {
      designation: data.designation,
      description: data.description,
    }
    const famCollection = collection(this.db, 'familles')
    const docRef = addDoc(famCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  updatefamilles(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'familles/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deletefamilles(id: string): Observable<void> {
    const docRef = doc(this.db, 'familles/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  //categories
  getcategories(): Observable<tab_categories[]> {
    const catCollection = collection(this.db, 'categories')
    return collectionData(catCollection, { idField: 'id' }) as Observable<tab_categories[]>
  }
  addcategories(data: tab_categories): Observable<string> {
    let mydata =
    {
      designation: data.designation,
      famille_id: data.famille_id,
    }
    const catCollection = collection(this.db, 'categories')
    const docRef = addDoc(catCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  updatecategories(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'categories/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deletecategories(id: string): Observable<void> {
    const docRef = doc(this.db, 'categories/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  //dates
  getalldates(): Observable<datesPointages[]> {
    const datesCollection = collection(this.db, 'datespointages')
    return collectionData(datesCollection, { idField: 'id' }) as Observable<datesPointages[]>
  }
  adddates(data: datesPointages): Observable<string> {
    let mydata =
    {
      dates: data.dates
    }
    const catCollection = collection(this.db, 'datespointages')
    const docRef = addDoc(catCollection, mydata).then
      (async (response) => {

        return response.id
      }
      )
    return from(docRef)
  }
  deletedates(id: string): Observable<void> {
    const docRef = doc(this.db, 'datespointages/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  //statut
  getallstatut(): Observable<Statuts[]> {
    const statCollection = collection(this.db, 'satut')
    return collectionData(statCollection, { idField: 'id' }) as Observable<Statuts[]>
  }
  //ressources composites
  getallcomposites(): Observable<tab_composites[]> {
    const famCollection = collection(this.db, 'composites')
    return collectionData(famCollection, { idField: 'id' }) as Observable<tab_composites[]>
  }
  addcomposites(data: tab_composites): Observable<string> {
    let mydata =

    {
      ressource_id: data.ressource_id,
      quantite: data.quantite,
    }
    const compoCollection = collection(this.db, 'composites')
    const docRef = addDoc(compoCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  updatecomposites(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'composites/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  deletecomposites(id: string): Observable<void> {
    const docRef = doc(this.db, 'composites/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  //unites
  getAllUnites(): Observable<unites[]> {
    const Collection = collection(this.db, 'unites')
    return collectionData(Collection, { idField: 'id' }) as Observable<unites[]>
  }
  addUnites(data: any): Observable<string> {
    const UnitesCollection = collection(this.db, 'unites')
    const docRef = addDoc(UnitesCollection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deleteUnite(id: string): Observable<void> {
    const docRef = doc(this.db, 'unites/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateUnite(data: any): Observable<void> {

    let id = data.id
    const docRef = doc(this.db, 'unites/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  //taches
  getAllTaches(): Observable<taches[]> {
    const TachesCollection = collection(this.db, 'taches')
    return collectionData(TachesCollection, { idField: 'id' }) as Observable<taches[]>
  }
  addTache(data: any): Observable<string> {
    const TachesCollection = collection(this.db, 'taches')
    const docRef = addDoc(TachesCollection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deleteTache(id: string): Observable<void> {
    const docRef = doc(this.db, 'taches/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateTache(data: any): Observable<void> {

    let id = data.id
    const docRef = doc(this.db, 'taches/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }

  //pointages travaux
  getAllPointage_travaux(): Observable<pointage_machine[]> {
    const Collection = collection(this.db, 'pointage_trvx')
    return collectionData(Collection, { idField: 'id' }) as Observable<pointage_machine[]>
  }
  addPointage_travaux(data: any): Observable<string> {
    const Collection = collection(this.db, 'pointage_trvx')
    const docRef = addDoc(Collection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deletePointage_travaux(id: string): Observable<void> {
    const docRef = doc(this.db, 'pointage_trvx/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updatePointage_travaux(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'pointage_trvx/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }

  //taches projet
  getAllTachesProjet(): Observable<taches_projet[]> {
    const Collection = collection(this.db, 'taches_projet')
    return collectionData(Collection, { idField: 'id' }) as Observable<taches_projet[]>
  }
  addTachesProjet(data: any): Observable<string> {
    const Collection = collection(this.db, 'taches_projet')
    const docRef = addDoc(Collection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deleteTachesProjet(id: string): Observable<void> {
    const docRef = doc(this.db, 'taches_projet/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateTachesProjet(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'taches_projet/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  //
   //entreprises
   getAllEntreprises(): Observable<Entreprise[]> {
    const Collection = collection(this.db, 'entreprises')
    return collectionData(Collection, { idField: 'id' }) as Observable<Entreprise[]>
  }
  addEntreprise(data: any): Observable<string> {
    const Collection = collection(this.db, 'entreprises')
    const docRef = addDoc(Collection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deleteEntreprise(id: string): Observable<void> {
    const docRef = doc(this.db, 'entreprises/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateEntreprise(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'entreprises/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  //

  getallTachesEngins(): Observable<taches_engins[]> {
    const Collection = collection(this.db, 'tachesmachines')
    return collectionData(Collection, { idField: 'id' }) as Observable<taches_engins[]>
  }
  addTachesEngins(data: any): Observable<string> {
    const Collection = collection(this.db, 'tachesmachines')
    const docRef = addDoc(Collection, data).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deleteTachesEngins(id: string): Observable<void> {
    const docRef = doc(this.db, 'tachesmachines/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateTachesEngins(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'tachesmachines/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  
  convertDate(strdate: string): Date {
    const [day1, month1, year1] = strdate.split("/")
    const date1 = new Date(+year1, +month1 - 1, +day1)
    return date1
  }
  calculateDiff1(sentDate: any, time1: string) {
    let date1: any = new Date(new Date(sentDate).setHours(0, 0, 0, 0));
    let date2: any = new Date(new Date().setHours(0, 0, 0, 0));

    let time2 = (new Date()).toString().split(' ')[4]
    const [heure1, min1] = time1.split(":")
    const [heure2, min2, sec2] = time2.split(":")

    let conv_heure1 = Number(heure1)
    let conv_min1 = Number(min1)
    let conv_heure2 = Number(heure2)
    let conv_min2 = Number(min2)

    if (conv_heure2 >= 16) {
      conv_heure2 = 16
      conv_min2 = 0
    }

    let diffDays = 0

    if ((date2 - date1) == 0) {

      if (conv_heure2 < 12) {
        diffDays = (conv_heure2 - conv_heure1) + (conv_min2 - conv_min1) / 60
      }
      if (conv_heure2 == 12) {
        diffDays = (12 - conv_heure1) - conv_min1 / 60
      }
      if (conv_heure2 > 12) {
        if (date1.getDay() == 6) {
          diffDays = (12 - conv_heure1) + - conv_min1 / 60
        }
        else {
          if (conv_heure1 == 12) {
            diffDays = (conv_heure2 - 13) + (conv_min2) / 60
          }
          if (conv_heure1 > 12) {
            diffDays = (conv_heure2 - conv_heure1) + (conv_min2 - conv_min1) / 60
          }
          if (conv_heure1 < 12) {
            diffDays = (conv_heure2 - conv_heure1 - 1) + (conv_min2 - conv_min1) / 60
          }
        }

      }
      var decimal = diffDays - Math.floor(diffDays)
      return Math.floor(diffDays).toString() + 'H' + Math.floor((decimal * 60)).toString() + 'MN';
    }
    else {
      let nbre_samedi = this.nombrejour(6, sentDate, new Date())
      let nbre_dim = this.nombrejour(0, sentDate, new Date())
      let diff1 = 0
      if (conv_heure1 < 12) {
        diff1 = ((16 - conv_heure1 - 1) * 60 - conv_min1) / 60
      }
      if (conv_heure1 >= 13) {
        diff1 = ((16 - conv_heure1) * 60 - conv_min1) / 60
      }

      if (conv_heure1 == 12) {
        diff1 = ((16 - 13) * 60 - conv_min1) / 60
      }

      let diff2 = 0
      if (conv_heure2 < 16) {
        diff2 = ((conv_heure2 - 7) * 60 + conv_min2) / 60
      }
      if (conv_heure2 >= 16) {
        diff2 = 8
      }
      diffDays = (Math.floor((date2 - date1) / (1000 * 60 * 60 * 24)) - 1) * 8 + diff1 + diff2 - nbre_dim * 8 - nbre_samedi * 3;
      //return diffDays.toFixed(2);
      var decimal = diffDays - Math.floor(diffDays)
      return Math.floor(diffDays).toString() + 'H' + Math.floor((decimal * 60)).toString() + 'MN';
    }

  }
  calculateDiff2(sentDate1: any, sentDate2: any, time1: string, time2: string) {
    let date1: any = new Date(new Date(sentDate1).setHours(0, 0, 0, 0));
    let date2: any = new Date(new Date(sentDate2).setHours(0, 0, 0, 0));

    const [heure1, min1] = time1.split(":")
    const [heure2, min2] = time2.split(":")

    let conv_heure1 = Number(heure1)
    let conv_min1 = Number(min1)

    let conv_heure2 = Number(heure2)
    let conv_min2 = Number(min2)
    let diffDays = 0

    if ((date2 - date1) == 0) {
      if (conv_heure2 < 12) {
        diffDays = (conv_heure2 - conv_heure1) + (conv_min2 - conv_min1) / 60
      }
      if (conv_heure2 == 12) {
        diffDays = (12 - conv_heure1) - conv_min1 / 60
      }
      if (conv_heure2 > 12) {
        if (date1.getDay() == 6) {
          diffDays = (12 - conv_heure1) - conv_min1 / 60
        }
        else {
          if (conv_heure1 == 12) {
            diffDays = (conv_heure2 - 13) + (conv_min2) / 60
          }
          if (conv_heure1 > 12) {
            diffDays = (conv_heure2 - conv_heure1) + (conv_min2 - conv_min1) / 60
          }
          if (conv_heure1 < 12) {
            diffDays = (conv_heure2 - conv_heure1 - 1) + (conv_min2 - conv_min1) / 60
          }
        }

      }
      var decimal = diffDays - Math.floor(diffDays)
      return Math.floor(diffDays).toString() + 'H' + Math.floor((decimal * 60)).toString() + 'MN';
      //return diffDays.toFixed(2);
    }
    else {
      let nbre_samedi = this.nombrejour(6, sentDate1, sentDate2)
      let nbre_dim = this.nombrejour(0, sentDate1, sentDate2)
      let diff1 = 0
      if (conv_heure1 < 12) {
        diff1 = ((16 - conv_heure1 - 1) * 60 - conv_min1) / 60
      }
      if (conv_heure1 >= 13) {
        diff1 = ((16 - conv_heure1) * 60 - conv_min1) / 60
      }

      let diff2 = 0
      if (conv_heure2 < 16) {
        diff2 = ((conv_heure2 - 7) * 60 + conv_min2) / 60
      }
      if (conv_min2 >= 16) {
        diff2 = 8
      }

      diffDays = (Math.floor((date2 - date1) / (1000 * 60 * 60 * 24)) - 1) * 8 + diff1 + diff2 - nbre_dim * 8 - nbre_samedi * 3;
      var decimal = diffDays - Math.floor(diffDays)
      return Math.floor(diffDays).toString() + 'H' + Math.floor((decimal * 60)).toString() + 'MN';
    }

  }
  nombrejour(numero: number, sDate: Date, eDate: Date) {
    var startDate = new Date(sDate.setHours(0, 0, 0, 0));
    var endDate = new Date(eDate.setHours(0, 0, 0, 0));
    const date = new Date(startDate.getTime());
    const dates: any[] = [];
    while (date <= endDate) {
      dates.push((new Date(date)).getDay());
      date.setDate(date.getDate() + 1);
    }
    return (dates.filter(x => x == numero)).length
  }
  getallProjet(): Observable<Projet[]> {
    const ClassesCollection = collection(this.db, 'projet')
    return collectionData(ClassesCollection, { idField: 'id' }) as Observable<Projet[]>
  }
  addProjet(data: Projet): Observable<string> {
    let mydata =
    {
      intitule: data.intitule,
      descrip_travaux: data.descrip_travaux,
      maitre_ouvrage: data.maitre_ouvrage,
      maitre_oeuvre: data.maitre_oeuvre,
      finacement: data.financement

    }
    const EnginsCollection = collection(this.db, 'projet')
    const docRef = addDoc(EnginsCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deleteProjet(id: string): Observable<void> {
    const docRef = doc(this.db, 'projet/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateProjet(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'projet/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  getallContrat(): Observable<Contrats[]> {
    const ClassesCollection = collection(this.db, 'contrats')
    return collectionData(ClassesCollection, { idField: 'id' }) as Observable<Contrats[]>
  }
  addContrat(data: Contrats): Observable<string> {
    let mydata =
    {
      projet_id: data.projet_id,
      sous_traitant_id: data.sous_traitant_id,
      duree_travaux: data.duree_travaux,
      montant: data.montant,
      montant_avance: data.montant_avance
    }
    const EnginsCollection = collection(this.db, 'contrats')
    const docRef = addDoc(EnginsCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }

  deleteContrat(id: string): Observable<void> {
    const docRef = doc(this.db, 'contrats/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateContrat(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'contrats/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  getallSousTraitants(): Observable<sous_traitant[]> {
    const ClassesCollection = collection(this.db, 'sstraitants')
    return collectionData(ClassesCollection, { idField: 'id' }) as Observable<sous_traitant[]>
  }
  addSoustraitant(data: sous_traitant): Observable<string> {
    let mydata =
    {
      entreprise: data.entreprise,
      enseigne: data.enseigne,
      phone: data.phone,
      adresse: data.adresse,
      nom_responsable: data.nom_responsable,
      prenom_responsable: data.prenom_responsable,
      ifu: data.ifu,
      rccm: data.rccm,
      date_naissance: data.date_naissance,
      lieu_naissance: data.lieu_naissance,
      num_cnib: data.num_cnib
    }
    const EnginsCollection = collection(this.db, 'sstraitants')
    const docRef = addDoc(EnginsCollection, mydata).then
      (response =>
        response.id
      )
    return from(docRef)
  }
  deleteSoutraitant(id: string): Observable<void> {
    const docRef = doc(this.db, 'sstraitants/' + id)
    const promise = deleteDoc(docRef)
    return from(promise)
  }
  updateSoutraitant(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'sstraitants/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  preparePDFInfo() {
    this.docStyles = {
      font: 'Times',
      lineColor: '#323a46',
      lineWidth: 0.2,
      textColor: '#808080'
    };
    this.printHeadStyles = {
      font: 'helvetica',
      fillColor: '#008080',
      fontSize: 12,
      textColor: 5
    };
    this.printColumns = [
      {
        header: 'Désignation',
        dataKey: 'designation',
      },
      {
        header: 'Code parc',
        dataKey: 'code_parc',
      },
      {
        header: 'Immatriculation',
        dataKey: 'immatriculation',
      }
    ];
    this.printColumnsStyles = [
      {
        cellWidth: 60,
      },
      {
        cellWidth: 60,
      },
      {
        cellWidth: 60,
      },
    ];
  }
  generatePDF(donnee_entreprise: any, donnees: any, num: number, donnees_projet: any, donnees_contrat: any, date: string) {
    const tableOptions: any = {
      startY: 20,
      columns: this.printColumns,
      columnStyles: this.printColumnsStyles,
      //body: this.dataToPrint,
      rowPageBreak: 'avoid',
      //showHead: 'firstPage',
      styles: this.docStyles,
      headStyles: this.printHeadStyles,
    };

    let pdfDoc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [297, 210]
    });
    pdfDoc.setFont('times', 'normal');
    var line = 30 // Line height to start text at
    var lineHeight = 10
    var lineHeight_titre = 30
    var leftMargin = 20
    var wrapWidth = 180

    var titre = "CONTRAT D'ENTREPRISE N°0" + num + "/2024/CGE-BTP/VILLE NOUVELLE DE YENNENGA/TRANCHE 03"
    var sous_titre = donnees_projet.descrip_travaux
    var objet = donnees_projet.descrip_travaux
    var montant = this.NumberToLetter(donnees_contrat.montant)
    //var avance_dem = donnees_contrat.montant_avance
    let entreprise = donnee_entreprise.entreprise
    var rccm_ifu = 'RCCM N° ' + donnee_entreprise.rccm + ', ' + donnee_entreprise.ifu
    var phone = 'Tél:' + donnee_entreprise.phone
    var responsable = donnee_entreprise.nom_responsable + ' ' + donnee_entreprise.prenom_responsable
    var delai = donnees_contrat.duree_travaux
    var titreX = (pdfDoc.internal.pageSize.getWidth() - pdfDoc.getTextWidth(titre)) / 2
    //var ss_titreX = (pdfDoc.internal.pageSize.getWidth() - pdfDoc.getTextWidth(sous_titre)) / 2
    let my_format = new Intl.NumberFormat('de-DE');
    var mon_montant = montant + ' (' + (my_format.format(donnees_contrat.montant)).replaceAll('.', ' ') + ') F CFA'

    pdfDoc.setFont('times', 'bold');
    pdfDoc.rect(leftMargin - 5, line - 10, 185, 40, 'S');

    var splitText = pdfDoc.splitTextToSize(titre, wrapWidth)
    for (var i = 0, length = splitText.length; i < length; i++) {
      this.saut_page(line, pdfDoc)
      var titreX = (pdfDoc.internal.pageSize.getWidth() - pdfDoc.getTextWidth(splitText[i])) / 2
      pdfDoc.text(splitText[i], titreX, line)
      line = lineHeight + line
    }
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(15)
    var splitText = pdfDoc.splitTextToSize(sous_titre, wrapWidth)
    for (var i = 0, length = splitText.length; i < length; i++) {
      this.saut_page(line, pdfDoc)
      var titreX = (pdfDoc.internal.pageSize.getWidth() - pdfDoc.getTextWidth(splitText[i])) / 2
      pdfDoc.text(splitText[i], titreX, line)
      pdfDoc.setLineWidth(0.5)
      var textWidth = pdfDoc.getTextWidth(splitText[i]);
      pdfDoc.line(titreX, line + 2, titreX + textWidth, line + 2)
      line = lineHeight + line
    }

    line = lineHeight_titre + line

    pdfDoc.text('OBJET: ', 15, line)
    this.souligne(pdfDoc, 'OBJET:', 15, line + 2)
    this.split_function(pdfDoc, objet, line, lineHeight, wrapWidth)

    line = lineHeight_titre + line

    pdfDoc.text('MONTANT: ', 15, line)
    this.souligne(pdfDoc, 'MONTANT: ', 15, line + 2)
    this.split_function(pdfDoc, mon_montant, line, lineHeight, wrapWidth)

    line = lineHeight_titre + line

    /* pdfDoc.text('AVANCE DE DEMARRAGE: ', 15, line)
    this.souligne(pdfDoc, 'AVANCE DE DEMARRAGE: ', 15, line + 2)
    this.split_function(pdfDoc, avance_dem.toString(), line, lineHeight, wrapWidth)

    line = lineHeight_titre + line */

    pdfDoc.text("MAITRE D'OUVRAGE : ", 15, line)
    this.souligne(pdfDoc, "MAITRE D'OUVRAGE : ", 15, line + 2)
    this.split_function(pdfDoc, "CGE SA", line, lineHeight, wrapWidth)

    line = lineHeight_titre + line

    pdfDoc.text("MAITRE D'OEUVRE : ", 15, line)
    this.souligne(pdfDoc, "MAITRE D'OEUVRE : ", 15, line + 2)
    this.split_function(pdfDoc, "CGE SA", line, lineHeight, wrapWidth)

    line = lineHeight_titre + line

    pdfDoc.text("ATTRIBUTAIRE : ", 15, line)
    this.souligne(pdfDoc, "ATTRIBUTAIRE : ", 15, line + 2)
    this.split_function(pdfDoc, entreprise, line, lineHeight, wrapWidth)

    line = lineHeight_titre + line

    pdfDoc.text("FINANCEMENT: ", 15, line)
    this.souligne(pdfDoc, "FINANCEMENT: ", 15, line + 2)
    this.split_function(pdfDoc, "CGE SA", line, lineHeight, wrapWidth)

    line = lineHeight_titre + line

    pdfDoc.text("DELAI D'EXECUTION: ", 15, line)
    this.souligne(pdfDoc, "DELAI D'EXECUTION: ", 15, line + 2)
    this.split_function(pdfDoc, delai, line, lineHeight, wrapWidth)

    pdfDoc.addPage()
    line = 30
    pdfDoc.setFont('times', 'normal');
    var text = 'ENTRE LES SOUSSIGNES:'

    pdfDoc.text(text, leftMargin, 20)
    line = lineHeight + line

    var textWidth = pdfDoc.getTextWidth(text);
    pdfDoc.setLineWidth(0.5)
    pdfDoc.line(20, 22, 20 + textWidth, 22)

    let entrep_mere = 'LA COMPAGNIE GENERALE DES ENTREPRISES,'

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text(entrep_mere, leftMargin, line)
    line = lineHeight + line

    pdfDoc.setFont('times', 'normal');

    var longString = donnees[0].entreprise
    var splitText = pdfDoc.splitTextToSize(longString, wrapWidth)
    for (var i = 0, length = splitText.length; i < length; i++) {
      this.saut_page(line, pdfDoc)
      pdfDoc.text(splitText[i], leftMargin, line)
      line = lineHeight + line
    }
    const cge = 'Ci-après désignée'
    pdfDoc.text(cge, leftMargin, line)

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text(' « CGE SA »', leftMargin + pdfDoc.getTextWidth(cge), line)
    line = lineHeight + line

    pdfDoc.setFont('times', 'italic');

    const une_part = "D'une part;"

    pdfDoc.text(une_part, wrapWidth - pdfDoc.getTextWidth(une_part) + leftMargin, line)
    line = lineHeight + line


    pdfDoc.setFont('times', 'normal');

    pdfDoc.text("Et", leftMargin, line)
    line = lineHeight + line



    pdfDoc.setFont('times', 'bold');

    pdfDoc.text(entreprise, leftMargin, line)

    const entrep_width = pdfDoc.getTextWidth(entreprise);
    const text1 = ', sis à Ouagadougou, immatriculé au RCCM du Tribunal de Commerce de Ouagadougou sous le numéro:'
    const splitText1 = pdfDoc.splitTextToSize(text1, wrapWidth - entrep_width)

    pdfDoc.setFont('times', 'normal');
    pdfDoc.text(splitText1[0], leftMargin + entrep_width, line)
    line = lineHeight + line

    let mtext = splitText1[1]
    if (splitText1.length > 1) {
      for (var i = 2, length = splitText1.length; i < length; i++) {
        mtext = mtext + ' ' + splitText1[i]
      }
    }

    const splitText2 = pdfDoc.splitTextToSize(mtext, wrapWidth)

    for (var i = 0, length = splitText2.length; i < length; i++) {
      pdfDoc.text(splitText2[i], leftMargin, line)
      line = lineHeight + line
    }

    pdfDoc.setFont('times', 'bold');

    const text3 = rccm_ifu

    const splitText3 = pdfDoc.splitTextToSize(text3, wrapWidth)

    for (var i = 0, length = splitText3.length; i < length; i++) {
      var titreX = (pdfDoc.internal.pageSize.getWidth() - pdfDoc.getTextWidth(splitText3[i])) / 2
      pdfDoc.text(splitText3[i], titreX, line)
      line = lineHeight + line
    }
    pdfDoc.text(phone, leftMargin, line)

    var long = pdfDoc.getTextWidth(phone)
    pdfDoc.setFont('times', 'normal');
    //line = line-lineHeight
    const text4 = ' et représenté par son Directeur Général,' + ' ' + responsable
    const splitText4 = pdfDoc.splitTextToSize(text4, wrapWidth - long)
    pdfDoc.text(splitText4[0], leftMargin + long + 1, line)
    line = lineHeight + line

    for (var i = 1, length = splitText4.length; i < length && length > 0; i++) {
      pdfDoc.text(splitText4[i], leftMargin, line)
      line = lineHeight + line
    }


    var prestataire = 'Ci-après désignée'
    pdfDoc.text(prestataire, leftMargin, line)

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text(' « le prestataire »', leftMargin + pdfDoc.getTextWidth(prestataire), line)

    line = lineHeight + line

    pdfDoc.setFont('times', 'italic');

    const autre_part = "D'autre part;"

    pdfDoc.text(autre_part, wrapWidth - pdfDoc.getTextWidth(autre_part) + leftMargin, line)
    line = lineHeight + line

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('IL A ETE CONVENU ET ARRÊTE CE QUI SUIT :', leftMargin, line)
    line = lineHeight + line + 3

    pdfDoc.text('Article 1 : Objet du contrat', leftMargin, line)

    line = lineHeight + line

    pdfDoc.setFont('times', 'normal');
    var article1 = donnees[0].article1

    const splitText5 = pdfDoc.splitTextToSize(article1, wrapWidth)
    for (var i = 0, length = splitText5.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText5[i], leftMargin, line)
      line = lineHeight + line
    }
    line = + line + 3
    pdfDoc.setFont('times', 'bold');
    pdfDoc.text("Article 2 : Conditions d'exécution du contrat", leftMargin, line)
    const p1 = '2.1 Le présent contrat sera exécuté conformément aux documents contractuels suivants qui en constituent des annexes :'
    line = lineHeight + line

    pdfDoc.setFont('times', 'normal');

    const splitText6 = pdfDoc.splitTextToSize(p1, wrapWidth)
    for (var i = 0, length = splitText6.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText6[i], leftMargin, line)
      line = lineHeight + line
    }
    pdfDoc.setFont('times', 'bold');
    var article2p1 = donnees[0].article2p1
    const splitText7 = pdfDoc.splitTextToSize(article2p1, wrapWidth - 10)
    for (var i = 0, length = splitText7.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText7[i], leftMargin + 10, line)
      line = lineHeight + line
    }

    pdfDoc.setFont('times', 'bold');

    pdfDoc.setFont('times', 'normal');

    var article2p2 = donnees[0].article2p2
    const splitText8 = pdfDoc.splitTextToSize(article2p2, wrapWidth)
    for (var i = 0, length = splitText8.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText8[i], leftMargin, line)
      line = lineHeight + line
    }
    line = line + 3
    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('Article 3 : Rapports techniques', leftMargin, line)

    line = lineHeight + line

    pdfDoc.setFont('times', 'normal');

    var article3 = donnees[0].article3
    const splitText9 = pdfDoc.splitTextToSize(article3, wrapWidth)
    for (var i = 0, length = splitText9.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText9[i], leftMargin, line)
      line = lineHeight + line
    }

    line = line + 3
    pdfDoc.setFont('times', 'bold');
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }
    pdfDoc.text('Article 4 : Durée du contrat', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');

    const contrat = 'Le présent contrat est conclu pour une durée de'
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }

    pdfDoc.text(contrat, leftMargin, line)

    pdfDoc.setFont('times', 'bold', 12);
    const duree = donnees_contrat.duree_travaux
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }
    pdfDoc.text(duree + '.', leftMargin + pdfDoc.getTextWidth(contrat) + 2, line)

    line = lineHeight + line + 3

    pdfDoc.setFont('times', 'bold');
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }
    pdfDoc.text('Article 5 : Prix-Modalités de paiement', leftMargin, line)
    line = lineHeight + line
    pdfDoc.text('5.1: Prix', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var text_prix = 'Le présent contrat est conclu pour un montant de: '
    pdfDoc.text(text_prix, leftMargin, line)
    line = lineHeight + line

    pdfDoc.setFont('times', 'bold');
    var splitText = pdfDoc.splitTextToSize(mon_montant, wrapWidth)
    for (var i = 0, length = splitText.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText[i], leftMargin, line)
      line = lineHeight + line
    }
    var suite_tx_prix = 'et conformément au devis en annexe des présentes. Ce prix est ferme et non révisable.'
    pdfDoc.setFont('times', 'normal', 12);
    const splitText10 = pdfDoc.splitTextToSize(suite_tx_prix, wrapWidth)
    for (var i = 0, length = splitText10.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText10[i], leftMargin, line)
      line = lineHeight + line
    }

    pdfDoc.setFont('times', 'bold');
    var note_bebe = "NB: Il sera retenu 1% du montant total de ce prix au titre de l'impôt minimum forfaitaire libératoire."
    const splitText12 = pdfDoc.splitTextToSize(note_bebe, wrapWidth)
    for (var i = 0, length = splitText12.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText12[i], leftMargin, line)
      line = lineHeight + line
    }



    line = line + 3
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }
    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('5.2: Modalités de paiement', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var modalites = donnees[0].modalites
    const splitText14 = pdfDoc.splitTextToSize(modalites, wrapWidth)
    for (var i = 0, length = splitText14.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText14[i], leftMargin, line)
      line = lineHeight + line
    }

    'Régime fiscal'

    line = line + 3

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('Article 6 : Régime fiscal', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var regime = donnees[0].regime
    const splitText15 = pdfDoc.splitTextToSize(regime, wrapWidth)
    for (var i = 0, length = splitText15.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText15[i], leftMargin, line)
      line = lineHeight + line
    }


    'Garantie'

    line = line + 3
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('Article 7 : Retenue de garantie', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var garantie = donnees[0].garantie
    const splitText16 = pdfDoc.splitTextToSize(garantie, wrapWidth)
    for (var i = 0, length = splitText16.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText16[i], leftMargin, line)
      line = lineHeight + line
    }

    'Confidence'

    line = line + 3
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }
    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('Article 8 : Confidentialité', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var confidence = donnees[0].confidence
    const splitText17 = pdfDoc.splitTextToSize(confidence, wrapWidth)
    for (var i = 0, length = splitText17.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText17[i], leftMargin, line)
      line = lineHeight + line
    }

    'Assurance'

    line = line + 3
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('Article 9 : Asssurance', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var assurance = donnees[0].assurance
    const splitText18 = pdfDoc.splitTextToSize(assurance, wrapWidth)
    for (var i = 0, length = splitText18.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText18[i], leftMargin, line)
      line = lineHeight + line
    }


    'Responsabilite'

    line = line + 3
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('Article 10 : Responsabilité du prestataire', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var responsabilite = donnees[0].responsabilite
    const splitText19 = pdfDoc.splitTextToSize(responsabilite, wrapWidth)
    for (var i = 0, length = splitText19.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText19[i], leftMargin, line)
      line = lineHeight + line
    }


    'Interpretation'

    line = line + 3
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('Article 11 : Interprétation du contrat-Modification', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var interpretation = donnees[0].interpretation
    const splitText20 = pdfDoc.splitTextToSize(interpretation, wrapWidth)
    for (var i = 0, length = splitText20.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText20[i], leftMargin, line)
      line = lineHeight + line
    }



    'Force majeure'

    line = line + 3
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('Article 12 : Force majeure', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var force = donnees[0].force
    const splitText21 = pdfDoc.splitTextToSize(force, wrapWidth)
    for (var i = 0, length = splitText21.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText21[i], leftMargin, line)
      line = lineHeight + line
    }


    'Défaillance'

    line = line + 3
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('Article 13 : Défaillance du prestataire', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var defaillance = donnees[0].defaillance
    const splitText22 = pdfDoc.splitTextToSize(defaillance, wrapWidth)
    for (var i = 0, length = splitText22.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText22[i], leftMargin, line)
      line = lineHeight + line
    }


    'Défaillance'

    line = line + 3
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('Article 14 : Clause résolutoire', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var clause = donnees[0].clause
    const splitText23 = pdfDoc.splitTextToSize(clause, wrapWidth)
    for (var i = 0, length = splitText23.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText23[i], leftMargin, line)
      line = lineHeight + line
    }

    'Droit applicable'

    line = line + 3
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('Article 15 : Droit applicable - Règlement de litige', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var droit = donnees[0].droit
    const splitText24 = pdfDoc.splitTextToSize(droit, wrapWidth)
    for (var i = 0, length = splitText24.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText24[i], leftMargin, line)
      line = lineHeight + line
    }

    'Election domicile'

    line = line + 3
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }

    pdfDoc.setFont('times', 'bold');

    pdfDoc.text('Article 16 : Election de domicile', leftMargin, line)
    line = lineHeight + line
    pdfDoc.setFont('times', 'normal');
    var election = donnees[0].election
    const splitText25 = pdfDoc.splitTextToSize(election, wrapWidth)
    for (var i = 0, length = splitText25.length; i < length; i++) {
      if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
        pdfDoc.addPage()
        line = 20
      }
      pdfDoc.text(splitText25[i], leftMargin, line)
      line = lineHeight + line
    }
    var dates = date

    let my_text1 = "Fait à Ouagadougou, le " + dates
    let my_text2 = "En deux exemplaires originaux."
    let my_text3 = "ONT SIGNE"

    let textX1 = (pdfDoc.internal.pageSize.getWidth() - pdfDoc.getTextWidth(my_text1)) / 2
    let textX2 = (pdfDoc.internal.pageSize.getWidth() - pdfDoc.getTextWidth(my_text2)) / 2
    let textX3 = (pdfDoc.internal.pageSize.getWidth() - pdfDoc.getTextWidth(my_text3)) / 2

    this.saut_page(line, pdfDoc)
    pdfDoc.text(my_text1, textX1, line)
    line = lineHeight + line

    pdfDoc.text(my_text2, textX2, line)

    line = lineHeight + line
    pdfDoc.setFont('times', 'bold');
    pdfDoc.text(my_text3, textX3, line)


    line = lineHeight + line

    pdfDoc.text("Pour le Prestataire", leftMargin, line)
    const pour_cge = "Pour CGE "
    var pdg = 'Saïdou TIENDREBEOGO'
    pdfDoc.text(pour_cge, wrapWidth - pdfDoc.getTextWidth(pour_cge) - 10, line)

    line = 40 + line
    pdfDoc.text(donnee_entreprise.prenom_responsable + ' ' + donnee_entreprise.nom_responsable, leftMargin, line)
    pdfDoc.text(pdg, wrapWidth - pdfDoc.getTextWidth(pdg), line)

    line = lineHeight + line
    var titre = "Chevalier de l'Ordre du Mérite"
    pdfDoc.setFont('times', 'italic');
    pdfDoc.text(titre, wrapWidth - pdfDoc.getTextWidth(titre), line)
    pdfDoc.setLineWidth(0.1)
    pdfDoc.setFont('times', 'normal');
    const totalPages: number = (pdfDoc as any).internal.getNumberOfPages();
    pdfDoc.setFontSize(8)
    var img = new Image()
    img.src = 'assets/images/logo_index.png'
    for (let i = 2; i <= totalPages; i++) {
      pdfDoc.line(10, 283, 200, 283);
      //pdfDoc.addImage(img, 'png', 180, 3, 15, 10)
      pdfDoc.setPage(i);
      pdfDoc.setFont('Newsreader', 'italic');
      pdfDoc.text(
        `Page ${i - 1} / ${totalPages - 1}`,
        180,
        pdfDoc.internal.pageSize.getHeight() - 8, { align: 'justify' }
      );
    }

    pdfDoc.save('contrat_' + donnee_entreprise.enseigne + '.pdf')
  }
  split_function(pdfDoc: any, objet: string, line: number, lineHeight: number, wrapWidth: number) {
    var splitobjet = pdfDoc.splitTextToSize(objet, 100)
    for (var i = 0, length = splitobjet.length; i < length; i++) {
      pdfDoc.text(splitobjet[i], 100, line)
      line = lineHeight + line
    }
  }
  souligne(pdfDoc: any, text: string, X: number, Y: number) {
    pdfDoc.setLineWidth(0.5)
    var textWidth = pdfDoc.getTextWidth(text);
    pdfDoc.line(X, Y, X + textWidth, Y)
  }
  saut_page(line: number, pdfDoc: any) {
    if (line >= pdfDoc.internal.pageSize.getHeight() - 15) {
      pdfDoc.addPage()
      line = 20
    }
  }

  Unite(nombre: number) {
    var unite;
    switch (nombre) {
      case 0: unite = "zéro"; break;
      case 1: unite = "un"; break;
      case 2: unite = "deux"; break;
      case 3: unite = "trois"; break;
      case 4: unite = "quatre"; break;
      case 5: unite = "cinq"; break;
      case 6: unite = "six"; break;
      case 7: unite = "sept"; break;
      case 8: unite = "huit"; break;
      case 9: unite = "neuf"; break;
      default: unite = ''
    }//fin switch
    return unite;
  }//-----------------------------------------------------------------------

  Dizaine(nombre: number) {
    var dizaine
    switch (nombre) {

      case 10: dizaine = "dix"; break;
      case 11: dizaine = "onze"; break;
      case 12: dizaine = "douze"; break;
      case 13: dizaine = "treize"; break;
      case 14: dizaine = "quatorze"; break;
      case 15: dizaine = "quinze"; break;
      case 16: dizaine = "seize"; break;
      case 17: dizaine = "dix-sept"; break;
      case 18: dizaine = "dix-huit"; break;
      case 19: dizaine = "dix-neuf"; break;
      case 20: dizaine = "vingt"; break;
      case 30: dizaine = "trente"; break;
      case 40: dizaine = "quarante"; break;
      case 50: dizaine = "cinquante"; break;
      case 60: dizaine = "soixante"; break;
      case 70: dizaine = "soixante-dix"; break;
      case 80: dizaine = "quatre-vingt"; break;
      case 90: dizaine = "quatre-vingt-dix"; break;
      default: dizaine = ''
    }//fin switch
    return dizaine;
  }//-----------------------------------------------------------------------
  NumberToLetter(nombre: number) {
    var i, j, n, quotient, reste, nb;
    var ch
    var numberToLetter: string = '';
    //__________________________________

    if (nombre.toString().length > 15) return "dépassement de capacité";
    if (isNaN(nombre)) return "Nombre non valide";

    nb = parseFloat(nombre.toString().replace(/ /gi, ""));
    if (Math.ceil(nb) != nb) return "Nombre avec virgule non géré.";

    n = nb.toString().length;
    switch (n) {
      case 1: numberToLetter = this.Unite(nb); break;
      case 2: if (nb > 19) {
        quotient = Math.floor(nb / 10);
        reste = nb % 10;
        if (nb < 71 || (nb > 79 && nb < 91)) {
          if (reste == 0) numberToLetter = this.Dizaine(quotient * 10);
          if (reste == 1) numberToLetter = this.Dizaine(quotient * 10) + "-et-" + this.Unite(reste);
          if (reste > 1) numberToLetter = this.Dizaine(quotient * 10) + "-" + this.Unite(reste);
        } else numberToLetter = this.Dizaine((quotient - 1) * 10) + "-" + this.Dizaine(10 + reste);
      } else numberToLetter = this.Dizaine(nb);
        break;
      case 3: quotient = Math.floor(nb / 100);
        reste = nb % 100;
        if (quotient == 1 && reste == 0) numberToLetter = "cent";
        if (quotient == 1 && reste != 0) numberToLetter = "cent" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.Unite(quotient) + " cent";
        if (quotient > 1 && reste != 0) numberToLetter = this.Unite(quotient) + " cent " + this.NumberToLetter(reste);
        break;
      case 4: quotient = Math.floor(nb / 1000);
        reste = nb - quotient * 1000;
        if (quotient == 1 && reste == 0) numberToLetter = "mille";
        if (quotient == 1 && reste != 0) numberToLetter = "mille" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " mille";
        if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " mille " + this.NumberToLetter(reste);
        break;
      case 5: quotient = Math.floor(nb / 1000);
        reste = nb - quotient * 1000;
        if (quotient == 1 && reste == 0) numberToLetter = "mille";
        if (quotient == 1 && reste != 0) numberToLetter = "mille" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " mille";
        if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " mille " + this.NumberToLetter(reste);
        break;
      case 6: quotient = Math.floor(nb / 1000);
        reste = nb - quotient * 1000;
        if (quotient == 1 && reste == 0) numberToLetter = "mille";
        if (quotient == 1 && reste != 0) numberToLetter = "mille" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " mille";
        if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " mille " + this.NumberToLetter(reste);
        break;
      case 7: quotient = Math.floor(nb / 1000000);
        reste = nb % 1000000;
        if (quotient == 1 && reste == 0) numberToLetter = "un million";
        if (quotient == 1 && reste != 0) numberToLetter = "un million" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " millions";
        if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " millions " + this.NumberToLetter(reste);
        break;
      case 8: quotient = Math.floor(nb / 1000000);
        reste = nb % 1000000;
        if (quotient == 1 && reste == 0) numberToLetter = "un million";
        if (quotient == 1 && reste != 0) numberToLetter = "un million" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " millions";
        if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " millions " + this.NumberToLetter(reste);
        break;
      case 9: quotient = Math.floor(nb / 1000000);
        reste = nb % 1000000;
        if (quotient == 1 && reste == 0) numberToLetter = "un million";
        if (quotient == 1 && reste != 0) numberToLetter = "un million" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " millions";
        if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " millions " + this.NumberToLetter(reste);
        break;
      case 10: quotient = Math.floor(nb / 1000000000);
        reste = nb - quotient * 1000000000;
        if (quotient == 1 && reste == 0) numberToLetter = "un milliard";
        if (quotient == 1 && reste != 0) numberToLetter = "un milliard" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " milliards";
        if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " milliards " + this.NumberToLetter(reste);
        break;
      case 11: quotient = Math.floor(nb / 1000000000);
        reste = nb - quotient * 1000000000;
        if (quotient == 1 && reste == 0) numberToLetter = "un milliard";
        if (quotient == 1 && reste != 0) numberToLetter = "un milliard" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " milliards";
        if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " milliards " + this.NumberToLetter(reste);
        break;
      case 12: quotient = Math.floor(nb / 1000000000);
        reste = nb - quotient * 1000000000;
        if (quotient == 1 && reste == 0) numberToLetter = "un milliard";
        if (quotient == 1 && reste != 0) numberToLetter = "un milliard" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " milliards";
        if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " milliards " + this.NumberToLetter(reste);
        break;
      case 13: quotient = Math.floor(nb / 1000000000000);
        reste = nb - quotient * 1000000000000;
        if (quotient == 1 && reste == 0) numberToLetter = "un billion";
        if (quotient == 1 && reste != 0) numberToLetter = "un billion" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " billions";
        if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " billions " + this.NumberToLetter(reste);
        break;
      case 14: quotient = Math.floor(nb / 1000000000000);
        reste = nb - quotient * 1000000000000;
        if (quotient == 1 && reste == 0) numberToLetter = "un billion";
        if (quotient == 1 && reste != 0) numberToLetter = "un billion" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " billions";
        if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " billions " + this.NumberToLetter(reste);
        break;
      case 15: quotient = Math.floor(nb / 1000000000000);
        reste = nb - quotient * 1000000000000;
        if (quotient == 1 && reste == 0) numberToLetter = "un billion";
        if (quotient == 1 && reste != 0) numberToLetter = "un billion" + " " + this.NumberToLetter(reste);
        if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " billions";
        if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " billions " + this.NumberToLetter(reste);
        break;
      default:
        numberToLetter = ''
    }//fin switch
    /*respect de l'accord de quatre-vingt*/
    //if (numberToLetter.substr(numberToLetter.length - "quatre-vingt".length, "quatre-vingt".length) == "quatre-vingt") numberToLetter = numberToLetter + "s";

    return numberToLetter;
  }

  updateGasoils(id: string, ind: number): Observable<void> {
    const docRef1 = doc(this.db, 'gasoil/' + id)
    const docRef = updateDoc(docRef1, { numero: ind }).then
      (response => { }
      )
    return from(docRef)
  }
  somme(tab: any) {
    let som = 0
    for (let row of tab) {
      som = som + Number(row)
    }
    return som
  }
  classement(mytable: string[]) {
    return mytable.sort((a: string, b: string) => {
      const [day1, month1, year1] = a.split("/")
      const [day2, month2, year2] = b.split("/")
      const date1 = new Date(+year1, +month1 - 1, +day1)
      const date2 = new Date(+year2, +month2 - 1, +day2)
      return date2.getTime() - date1.getTime()
    });
  }
  getallessais(): Observable<tab_Essais[]> {
    const famCollection = collection(this.db, 'essai')
    return collectionData(famCollection, { idField: 'id' }) as Observable<tab_Essais[]>
  }
  updateessai(data: any): Observable<void> {
    let id = data.id
    const docRef = doc(this.db, 'essai/' + id)
    const promise = setDoc(docRef, data)
    return from(promise)
  }
  updatePerson(row: tab_personnel, date: string): Observable<void> {
    let curendate = row.dates[row.dates.length - 1]
    let dates = [...row.dates, date]
    let presence = [...row.Presence, true]
    let heureNorm = [...row.heuresN, 8]
    let heureSup = [...row.heureSup, 0]
    const docRef1 = doc(this.db, 'personnel/' + row.id)
    const docRef = updateDoc(docRef1, { dates: dates, heuresN: heureNorm, heureSup: heureSup, Presence: presence }).then
      (response => { }
      )
    return from(docRef)
  }

  ModifGasoil(row: Gasoil, numerostr: string, date: string, id_engin: string, compteur: string, quantite_go: string, diff_work: string): Observable<void> {
    const Collection = collection(this.db, 'basessais')
    const docRef = addDoc(Collection, {
      date: date,
      id_engin: id_engin,
      compteur: compteur,
      quantite_go: quantite_go,
      numero: numerostr,
      diff_work: diff_work
    }).then
      (response => { }
      )
    return from(docRef)
  }
  removePerson(row: tab_personnel, date: string): Observable<void> {
    let initdate = row.dates
    let ind = initdate.indexOf(date)

    let initheurenor = row.heuresN
    let initheuresup = row.heureSup
    let initpresence = row.Presence

    let remdate = initdate.splice(ind, 1)
    let remheurenom = initheurenor.splice(ind, 1)
    let remheuresup = initheuresup.splice(ind, 1)
    let rempresence = initpresence.splice(ind, 1)
    const docRef1 = doc(this.db, 'personnel/' + row.id)
    const docRef = updateDoc(docRef1, { dates: initdate, heuresN: initheurenor, heureSup: initheuresup, Presence: initpresence }).then
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
    const docRef1 = doc(this.db, 'personnel/' + row.id)
    const docRef = updateDoc(docRef1, { dates: dates, heuresN: heureNorm, heureSup: heureSup, Presence: presence }).then
      (response => { }
      )
    return from(docRef)
  }
  ModifPerson(row: tab_personnel): Observable<void> {
    let id = row.id
    let heuresN = row.heuresN
    let heuresup = row.heureSup
    let presence = row.Presence
    const docRef1 = doc(this.db, 'personnel/' + id)
    const docRef = updateDoc(docRef1, { heuresN: heuresN, heureSup: heuresup, Presence: presence }).then
      (response => { }
      )
    return from(docRef)
  }
  removePersonDate(row: tab_personnel, date: string): Observable<void> {
    let initdate = row.dates
    let ind = initdate.indexOf(date)
    let id = row.id
    let heuresN = row.heuresN
    let heuresup = row.heureSup
    let presence = row.Presence
    const docRef1 = doc(this.db, 'personnel/' + id)
    const docRef = updateDoc(docRef1, { heuresN: heuresN, heureSup: heuresup, Presence: presence }).then
      (response => { }
      )
    return from(docRef)
  }

  uploadNumero(curendate: string, date: string): Observable<any> {
    return this.getallPersonnel().pipe(
      concatMap(resp => {
        let obs: Observable<any>[] = []
        for (let row of resp) {
          obs.push(this.updatePerson(row, date))
        }
        return forkJoin(obs)
      })
    )
  }

  uploadGasoilNumero(enginId: string[]): Observable<any> {
    return this.getallGasoil().pipe(
      concatMap(resp => {
        let resp_classes = this.classementDates(resp)
        let obs: Observable<any>[] = []
        var ind = 1;
        for (let row of resp_classes) {
          ind++;
          let numerostr = ind.toString();
          let compteur = "0";
          let diff_work = "0";
          if (enginId.includes(row.id_engin)) {
            obs.push(this.ModifGasoil(row,
              numerostr,
              row.date,
              row.id_engin,
              compteur,
              row.quantite_go,
              diff_work
            )
            )
          }
          else {
            obs.push(this.ModifGasoil(row,
              numerostr,
              row.date,
              "c2Tzeqqm4B6gVljWGEkz",
              compteur,
              row.quantite_go,
              diff_work
            )
            )

          }
        }
        return forkJoin(obs)
      })
    )
  }


  uploadSatut(): Observable<any> {
    return this.getallPersonnel().pipe(
      concatMap(resp => {
        let obs: Observable<any>[] = []
        for (let row of resp) {
          let fct = row.fonction
          if (fct.indexOf('CHAUFFEUR') !== -1) {
            obs.push(this.updatePersonStatut(row, 'wKGKtTCoYRJRJkBZoFYV'))
          }
          if (fct.indexOf('MANOEUVRE') !== -1) {
            obs.push(this.updatePersonStatut(row, 'a0j2NVGKSWuULltQeJNA'))
          }
          if (fct.indexOf('CONDUCTEUR') !== -1) {
            obs.push(this.updatePersonStatut(row, 'bhWBRM0VQNV4CrIR1a8F'))
          }
          if (fct.indexOf('GARDIEN') !== -1) {
            obs.push(this.updatePersonStatut(row, 'a0j2NVGKSWuULltQeJNA'))
          }
          if (fct.indexOf('CHEF') !== -1) {
            obs.push(this.updatePersonStatut(row, 'c3ua9MGsI13TFp04JUui'))
          }
          if (fct.indexOf('METREUR') !== -1) {
            obs.push(this.updatePersonStatut(row, 'c3ua9MGsI13TFp04JUui'))
          }
          if (fct.indexOf('COMMIS') !== -1) {
            obs.push(this.updatePersonStatut(row, 'c3ua9MGsI13TFp04JUui'))
          }
          if (fct.indexOf('AIDE') !== -1) {
            obs.push(this.updatePersonStatut(row, 'c3ua9MGsI13TFp04JUui'))
          }
          if (fct.indexOf('DIRECTEUR') !== -1) {
            obs.push(this.updatePersonStatut(row, 'c3ua9MGsI13TFp04JUui'))
          }
          if (fct.indexOf('MANŒUVRE') !== -1) {
            obs.push(this.updatePersonStatut(row, 'a0j2NVGKSWuULltQeJNA'))
          }

        }
        return forkJoin(obs)
      })
    )
  }
  updatePersonStatut(row: tab_personnel, statut: string): Observable<void> {
    const docRef1 = doc(this.db, 'personnel/' + row.id)
    const docRef = updateDoc(docRef1, { statut_id: statut }).then
      (response => { }
      )
    return from(docRef)
  }
  classement_Ldevis(mytable: Ligne_devis[]) {
    return mytable.sort((a, b) => (a.poste.toString()).localeCompare(b.poste.toString()));
  }
  classement_Constat(mytable: Constats[]) {
    return mytable.sort((a, b) => b.rang - a.rang);
  }
  classement2_Constat(mytable: any[]) {
    return mytable.sort((a, b) => (a.poste).localeCompare(b.poste) || b.rang - a.rang);
  }
  classementDates(mytable: Gasoil[]) {
    return mytable.sort((a, b) => {
      const [day1, month1, year1] = a.date.split("/")
      const [day2, month2, year2] = b.date.split("/")
      const date1 = new Date(+year1, +month1 - 1, +day1)
      const date2 = new Date(+year2, +month2 - 1, +day2)
      return date1.getTime() - date2.getTime()
    });
  }
  FormatMonnaie(nombre: number | undefined) {
    if (nombre) {
      return (formatNumber(nombre, 'en-US', '1.0-0')).replaceAll(",", " ")
    }
    else {
      return 0
    }

  }

  titleCaseWord(strin: string | undefined) {
    if (strin == undefined) {
      return
    }
    else {
      let splite = strin.split(" ");
      let ret = ''
      console.log(splite)
      for (let ind in splite) {
        let mystr = splite[ind]
        if (mystr != '') {
          let str = mystr[0].toUpperCase() + mystr.slice(1);
          ret = ret + ' ' + str
        }

      }

      return ret
    }

  }
  titleCaseWord2(strin: string) {
    let str = strin[0].toUpperCase() + strin.slice(1);
    return str
  }
  Majuscule(strin: string | undefined) {
    if (strin == undefined) {
      return ""
    }
    else {
      return strin.toUpperCase();
    }

  }
}
