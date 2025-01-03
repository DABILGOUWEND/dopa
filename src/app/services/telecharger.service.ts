import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { AuthenService } from '../authen.service';
import { Devis, Constats, Ligne_devis, ModelAttachement, ModelDecompte, unites, Gasoil, Statuts, sous_traitant } from '../models/modeles';
import { child } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class TelechargerService {
  _http = inject(HttpClient);
  db: Firestore = inject(Firestore);
  _auth_service = inject(AuthenService);

  //add gasoil
  addconso(data: any): Observable<void> {
    let mydata =
    {
      'engin_id': data.id_engin,
      'date': data.date,
      'quantite_go': data.quantite_go != null && data.quantite_go != "" ? Number(data.quantite_go) : 0,
      'compteur': data.compteur != null && data.compteur != "" ? Number(data.compteur) : 0,
      'diff_work': data.diff_work != null && data.diff_work != "" ? Number(data.diff_work) : 0,
      'numero': data.numero != null && data.numero != "" ? Number(data.numero) : 0,
    }
    const collection = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/conso_gasoil/' + data.id)
    const docRef = setDoc(collection, mydata)
    return from(docRef)
  }
  //appro gasoil
  addappro(data: any): Observable<void> {
    let mydata =
    {
      'date': data.date,
      'quantite': data.quantite != null && data.quantite != "" ? Number(data.quantite) : 0,
      'reception': data.reception,
    }
    const collection = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/appro_go/' + data.id)
    const docRef = setDoc(collection, mydata)
    return from(docRef)
  }

  //add personnel
  //appro gasoil
  addpersonnel(element: any): Observable<void> {
    let mydata = {
      nom: element.nom,
      prenom: element.prenom,
      fonction: element.fonction,
      num_phone1: element.num_phone1 ? element.num_phone1 : "",
      num_phone2: element.num_phone2 ? element.num_phone2 : "",
      email: element.email ? element.email : "",
      num_matricule: element.num_matricule ? element.num_matricule : "",
      dates: element.dates ? element.dates : [],
      heuresN: element.heuresN ? element.heuresN : [],
      heureSup: element.heureSup ? element.heureSup : [],
      presence: element.Presence ? element.Presence : [],
      statut_id: element.statut_id ? element.statut_id : "",
      statut: element.statut ? element.statut : "",
    }
    const collection = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/personnel/' + element.id)
    const docRef = setDoc(collection, mydata)
    return from(docRef)
  }

  //DEVIS
  getallDevis(): Observable<Devis[]> {
    const DevisCollection = collection(this.db, 'Devis')
    return collectionData(DevisCollection, { idField: 'id' }) as Observable<Devis[]>
  }
  getallSoustraitant(): Observable<sous_traitant[]> {
    const DevisCollection = collection(this.db, 'sstraitants')
    return collectionData(DevisCollection, { idField: 'id' }) as Observable<sous_traitant[]>
  }
  addDevis(data: Devis): Observable<void> {
    let mydata =
    {
      code: data.code,
      client_id: data.client_id,
      entreprise_id: data.entreprise_id,
      projet_id: data.projet_id,
      objet: data.objet,
      reference: data.reference,
      montant: data.montant,
      avance: data.avance,
    }
    const collection = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/devis/' + data.id)
    const docRef = setDoc(collection, mydata)
    return from(docRef)
  }
  saveDevis(id:string,data:any): Observable<void> {
    const docRef1 = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/devis/' + id);
    const docRef = updateDoc(docRef1, {
      data: data
    }).then
      (response => { }
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
  //constats
  addConstats(data: any): Observable<void> {
    let mydata = {
      poste_id: data.poste_id,
      date: data.date,
      numero: data.numero,
      rang: data.rang,
      quantite_mois: data.quantite_mois,
      description: data.description,
      decompte_id: data.decompte_id
    }
    const Collection = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/constats/' + data.id)
    const docRef = setDoc(Collection, mydata)
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
  addLigneDevis(data: Ligne_devis): Observable<void> {
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
    const LdevisCollection = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/lignes_devis/' + data.id)
    const docRef = setDoc(LdevisCollection, mydata)
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
  addAttachement(data: any): Observable<void> {
    let mydata = {
      devis_id: data.devis_id,
      numero: data.numero,
      date: data.date
    }
    const collection = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/attachements/' + data.id)
    const docRef = setDoc(collection, mydata)
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
  addDecomptes(data: any): Observable<void> {
    let mydata = {
      retenue_avance: data.retenue_avance,
      autre_retenue: data.autre_retenue,
      devis_id: data.devis_id,
      numero: data.numero,
      date: data.date,
      date_depot_bureau: data.date_depot_bureau,
      date_paiement: data.date_paiement,
    }
    const Collection = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/decomptes/' + data.id)
    const docRef = setDoc(Collection, mydata)
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

  //taches
  addTaches(data: any): Observable<void> {
    let mydata = {
      'designation': data.designation,
      'uniteid': data.uniteid,
      'type': data.type,
      'classe': data.classe,
    }
    const Collection = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/taches/' + data.id)
    const docRef = setDoc(Collection, mydata)
    return from(docRef)
  }
  //statut
  addStatut(path: string, data: any): Observable<void> {
    let mydata = {
      'designation': data.designation,
    }
    const Collection = doc(this.db, 'comptes/' +
      path + '/statuts_personnel/' + data.id)
    const docRef = setDoc(Collection, mydata)
    return from(docRef)
  }
  //ENTREPRISES
  addEntreprises(data: any): Observable<void> {
    let mydata = {
      entreprise: data.entreprise ? data.entreprise : '',
      enseigne: data.enseigne ? data.enseigne : '',
      ifu: data.ifu ? data.ifu : '',
      rccm: data.rccm ? data.rccm : '',
      adresse: data.adresse ? data.adresse : '',
      phone: data.phone ? data.phone : '',
      nom_responsable: data.nom_responsable ? data.nom_responsable : '',
      prenom_responsable: data.prenom_responsable ? data.prenom_responsable : '',
      date_naissance: data.date_naissance ? data.date_naissance : '',
      lieu_naissance: data.lieu_naissance ? data.lieu_naissance : '',
      num_cnib: data.num_cnib ? data.num_cnib : '',
    }
    const Collection = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/entreprises/' + data.id)
    const docRef = setDoc(Collection, mydata)
    return from(docRef)
  }
  //unites
  getAllUnites(): Observable<unites[]> {
    const Collection = collection(this.db, 'unites')
    return collectionData(Collection, { idField: 'id' }) as Observable<unites[]>
  }
  addUnites(data: any): Observable<void> {
    let mydata = {
      'unite': data.unite
    }
    const UnitesCollection = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/unites/' + data.id)
    const docRef = setDoc(UnitesCollection, mydata)
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

  //ss traitances
  addSstraitance(data: any): Observable<void> {
    let mydata = {
      entreprise: data.entreprise,
      enseigne: data.enseigne,
      ifu: data.ifu,
      rccm: data.rccm,
      adresse: data.adresse,
      phone: data.phone,
      nom_responsable: data.nom_responsable,
      prenom_responsable: data.prenom_responsable,
      date_naissance: data.date_naissance ? data.date_naissance : "",
      lieu_naissance: data.lieu_naissance ? data.lieu_naissance : "",
      num_cnib: data.num_cnib ? data.num_cnib : "",
    }
    const collection = doc(this.db, 'comptes/' +
      this._auth_service.current_projet_id() + '/sous_traitants/' + data.id)
    const docRef = setDoc(collection, mydata)
    return from(docRef)
  }

}
