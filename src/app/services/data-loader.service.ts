import { effect, inject, Injectable } from '@angular/core';
import { EnginsStore, ClasseEnginsStore, PersonnelStore, ProjetStore, PannesStore, GasoilStore, ApproGasoilStore, StatutStore, TachesEnginsStore, EntrepriseStore, DevisStore, ConstatStore, LigneDevisStore, SstraitantStore, AttachementStore, DecompteStore, UserStore, UnitesStore, TachesStore, CommandeStore, SortiesArticlesStore, EntreesArticlesStore, RessourcesStore, FamillesStore, CategoriesStore, fournisseursStore, SitesStore } from '../store/appstore';
import { AuthenService } from '../authen.service';
import { Observable, of, tap } from 'rxjs';
import e from 'express';

@Injectable({
  providedIn: 'root'
})
export class DataLoaderService {
  //gestions
  _engins_store = inject(EnginsStore);
  _classes_engins_store = inject(ClasseEnginsStore);
  _personnel_store = inject(PersonnelStore);
  _projets_store = inject(ProjetStore);
  _pannes_store = inject(PannesStore);
  _consogo_store = inject(GasoilStore);
  _approgo_store = inject(ApproGasoilStore);
  _statuts_personnel_store = inject(StatutStore);
  _unit_store = inject(UnitesStore);
  _taches = inject(TachesStore);
  //travaux
  _taches_engins_store = inject(TachesEnginsStore);
  _entreprise_store = inject(EntrepriseStore);
  _devis_store = inject(DevisStore)
  _constats_store = inject(ConstatStore)
  _ligneDevis_store = inject(LigneDevisStore)
  _sousTraitance_store = inject(SstraitantStore)
  _attachements_store = inject(AttachementStore)
  _decomptes_store = inject(DecompteStore)
  _users_store = inject(UserStore);
  _commandes_store = inject(CommandeStore);
  _sorties_articles_store = inject(SortiesArticlesStore);
  _entrees_articles_store = inject(EntreesArticlesStore);
  _ressources_store = inject(RessourcesStore);
  _familles_store = inject(FamillesStore);
  _categories_store = inject(CategoriesStore); 
  _fournisseurs_store = inject(fournisseursStore);
  _sites_store = inject(SitesStore);



  _auth_service = inject(AuthenService);

  loadDataInit() {
    if (this._auth_service.userSignal()) {
      this._projets_store.loadProjets()
      this._entreprise_store.loadEntreprises();
    }

  }
  setPath() {

    this._personnel_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/personnel');
    this._engins_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/engins');
    this._classes_engins_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/classes_engins');
    this._consogo_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/conso_gasoil');
    this._pannes_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/pannes');
    this._approgo_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/appro_go');
    this._statuts_personnel_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/statuts_personnel');
    this._devis_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/devis');
    this._ligneDevis_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/lignes_devis');
    this._sousTraitance_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/sous_traitants');
    this._constats_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/constats');
    this._attachements_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/attachements');
    this._decomptes_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/decomptes');
    this._unit_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/unites');
    this._taches.setPathString('comptes/' + this._auth_service.current_projet_id() + '/taches');
    this._entrees_articles_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/entrees_articles');
    this._sorties_articles_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/sorties_articles');
    this._commandes_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/commandes');
    this._fournisseurs_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/fournisseurs');
    this._sites_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/sites');
    

  }
  Load_gestion_Data(): Observable<any> {
    if (this._auth_service.userSignal()) {
      return of({}).pipe(tap(() => {
        this._engins_store.loadengins();
        this._classes_engins_store.loadclasses();
        this._personnel_store.loadPersonnel();
        this._pannes_store.loadPannes();
        this._consogo_store.loadconso();
        this._approgo_store.loadappro();
        this._statuts_personnel_store.loadstatut();
        this._sorties_articles_store.loadSortiesArticles();
        this._entrees_articles_store.loadEntreeArticles();
        this._commandes_store.loadCommandes();
        this._ressources_store.loadRessources();
        this._familles_store.loadFamilles();
        this._categories_store.loadCategories();
        this._fournisseurs_store.loadFournisseurs();
        this._users_store.loadUsers();
        this._sites_store.loadSites();

      }))
    } else {
      return of({})
    }
  }
  Load_travaux_Data(): Observable<any> {
    if (this._auth_service.userSignal()) {
      return of({}).pipe(tap(() => {
        this._taches_engins_store.loadTachesEngins();
        this._users_store.loadUsers();
        this._devis_store.loadDevis();
        this._ligneDevis_store.loadLigneDevis();
        this._sousTraitance_store.loadSstraitants();
        this._constats_store.loadConstats();
        this._attachements_store.loadAttachements();
        this._decomptes_store.loadAllDecomptes();
        this._unit_store.loadUnites();
        this._taches.loadTaches();
      }))
    } else {
      return of({});
    }

  }


}
