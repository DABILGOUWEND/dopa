import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthenService } from '../../authen.service';
import { entrees_articles, commandes, articles, sorties_articles } from '../../models/modeles';
import { SortiesArticlesStore, EntreesArticlesStore, fournisseursStore, CommandeStore, CategoriesStore, SitesStore, ProjetStore, RessourcesStore, UserStore, PersonnelStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ArticlesPipe } from '../../mypipes/articles.pipe';

@Component({
  selector: 'app-sorties-mat',
  imports: [ImportedModule],
  templateUrl: './sorties-mat.component.html',
  styleUrl: './sorties-mat.component.scss'
})
export class SortiesMatComponent implements OnInit {
  _sorties_store = inject(SortiesArticlesStore)
  _entrees_store = inject(EntreesArticlesStore)
  _fournisseurs_store = inject(fournisseursStore)
  _commandes_store = inject(CommandeStore)
  _categories_store = inject(CategoriesStore)
  _sites_stores = inject(SitesStore)
  _projets_stores = inject(ProjetStore)
  _ressources_store = inject(RessourcesStore)
  _users_store = inject(UserStore)
  _auth = inject(AuthenService)
  _service = inject(WenService)
  _personnel_store = inject(PersonnelStore)
  _form: FormGroup

  // signal declarations
  is_update = signal('')
  modif_sortie = signal<sorties_articles | undefined>(undefined)
  num_bc_search = signal<commandes[]>([]);
  article_search = signal<articles[]>([]);
  unites = signal("");
  commande_id = signal<string | undefined>("");
  article_id = signal<string | undefined>("");
  //computed 
  liste_fournisseurs = computed(() => {
    return this._fournisseurs_store.all_fournisseurs()
  })
  liste_projets = computed(() => {
    return this._projets_stores.donnees_projet()
  })
  liste_articles = computed(() => {
    let cat = this._categories_store.articles_catIds();
    let articles: articles[] = this._ressources_store.all_ressources().filter(r => cat.includes(r.categorie_id)).map(
      r => ({
        'id': r.id,
        'code': r.code,
        'designation': r.designation,
        'categorie_id': r.categorie_id,
        'unite': r.unite
      })
    );
    return articles
  })
  liste_sites = computed(() => {
    return this._sites_stores.all_sites()
  })
  liste_commandes = computed(() => {
    return this._commandes_store.commandes()
  })
  liste_users = computed(() => {
    return this._users_store.users().map((u: any) => ({
      id: u.id,
      username: u.username
    }))
  })
  liste_beneficiaires = computed(() => {
    return this._personnel_store.donnees_personnel().map((p: any) => ({
      id: p.id,
      nom: p.nom,
      prenom: p.prenom
    }))
  })
  sorties_recentes = computed(() => {
    let donnees: any = []
    let uniques_dates = this._sorties_store.sorties_articles().sort((a, b) => {
      let dateA = this._service.convertDate(a.date).getTime();
      let dateB = this._service.convertDate(b.date).getTime();
      return dateA - dateB;

    }).slice(0, 10).map((e: sorties_articles) => e.date).filter((value, index, self) => self.indexOf(value) === index);
    uniques_dates.forEach(element => {
      let filtre = this._sorties_store.sorties_articles().filter((e: sorties_articles) => e.date == element);
      donnees.push({

        'date': element,
        'articles': filtre.map((a: sorties_articles) => ({
          'id': a.id,
          'article': this.liste_articles().find((ar: articles) => ar.id == a.article_id)?.designation,
          'projet': a.projet_id,
          'beneficiaire': a.beneficiaire_id,
          'motif': a.motif,
          'quantite': a.quantite,
          'unite': this.liste_articles().find((ar: articles) => ar.id == a.article_id)?.unite
        }))
      })

    });
    return donnees
  })
  stock_articles = computed(() => {
    let articles = this.liste_articles();
    let entrees = this._entrees_store.entrees_articles();
    let sorties = this._sorties_store.sorties_articles();
    let stock: any = [];
    articles.forEach((article: articles) => {
      let entree = entrees.filter((entree: entrees_articles) => entree.article_id == article.id).map((entree: entrees_articles) => entree.quantite).reduce((a, b) => a + b, 0);
      let sortie = sorties.filter((sortie: sorties_articles) => sortie.article_id == article.id).map((sortie: sorties_articles) => sortie.quantite).reduce((a, b) => a + b, 0);
      stock.push({
        'article_id': article.id,
        'designation': article.designation,
        'stock': entree - sortie,
        'unite': article.unite
      })
    })
    return stock
  })
  stock_current_article = computed(() => {
    return this.stock_articles().find((stock: any) => stock.article_id == this.article_id())
  })

  //other properties
  constructor(
    fb: NonNullableFormBuilder
  ) {
    this._form = fb.group({
      date: new FormControl(new Date(), Validators.required),
      article: new FormControl('', Validators.required),
      quantite: new FormControl(0, [Validators.required, Validators.min(1)]),
      projet: new FormControl('', Validators.required),
      beneficiaire: new FormControl('', Validators.required),
      unite: new FormControl({ value: '', disabled: true }),
      motif: new FormControl('', Validators.required)
    })
    effect(() => {
      console.log(this.stock_current_article())
    })
  }
  ngOnInit() {

  }
  submit_entree() {
    if (this._form.valid) {
      if (this.modif_sortie()) {
        let sorties = {
          id: this.modif_sortie()?.id,
          date: this._form.value.date.toLocaleDateString(),
          article_id: this.article_id(),
          beneficiaire_id: this._form.value.beneficiaire,
          quantite: this._form.value.quantite,
          motif: this._form.value.motif,
          projet_id: this._form.value.projet,
          utilisateur_id: this._auth.userSignal()?.uid
        }
        this._sorties_store.updateSortieArticle(sorties)
      } else {
        let sorties = {
          date: this._form.value.date.toLocaleDateString(),
          article_id: this.article_id(),
          beneficiaire_id: this._form.value.beneficiaire,
          quantite: this._form.value.quantite,
          motif: this._form.value.motif,
          projet_id: this._form.value.projet,
          utilisateur_id: this._auth.userSignal()?.uid
        }
        this._sorties_store.addSortiesArticles(sorties)
      }
    }
    this.modif_sortie.set(undefined)
    this._form.reset()

  }
  remove_sortie(id: string | undefined) {
    if (id)
      if (confirm('Voulez-vous vraiment supprimer cette sortie?')) {
        this._sorties_store.removeSortieArticle(id)
        this.modif_sortie.set(undefined)
      }
  }
  fermer_bc() {
    let searchText = this._form.value.num_bc;
    let data = this.liste_commandes().find(x => this.Majuscule(x.numero_commande) == searchText);
    this.commande_id.set(data?.id);
    if (data) {
      this._form.patchValue({ projet: data.projet_id });
    }
  }
  verif_bc() {
    let searchText = this._form.value.num_bc;
    let data = this.liste_commandes().find(x => this.Majuscule(x.numero_commande) == searchText);
    if (!data) {
      this._form.get('projet')?.setValue('');
      this._form.get("num_bc")?.setErrors({ 'incorrect': true });
    } else {
      this.commande_id.set(data.id);
      this._form.get('projet')?.setValue(data.projet_id);
    }

  }
  search_bc() {
    let searchText = this._form.value.num_bc;
    if (!searchText) {
      this.num_bc_search.set([]);
      return;
    }

    let data = [...this.liste_commandes()];
    let filtre = data.filter(x =>
      this.Majuscule(x.numero_commande).includes(this.Majuscule(searchText))
    )

    this.num_bc_search.set(filtre);
    this.verif_bc()
  }
  search_article() {
    let searchText = this._form.value.article;
    if (!searchText) {
      this.article_search.set([]);
      return;
    }

    let data = [...this.liste_articles()];
    let filtre = data.filter(x =>
      this.Majuscule(x.designation).includes(this.Majuscule(searchText))
    )
    this.article_search.set(filtre);
    this.verif_article()
  }
  verif_article() {
    let searchText = this._form.value.article;
    let data = this.liste_articles().find(x => this.Majuscule(x.designation) == searchText);
    if (!data) {
      this._form.get('unite')?.setValue('');

      this._form.get("article")?.setErrors({ 'incorrect': true });
    } else {
      this.article_id.set(data.id);
      this._form.get('unite')?.setValue(data.unite);
    }

  }
  fermer_article() {
    let searchText = this._form.value.article;
    let data = this.liste_articles().find(x => this.Majuscule(x.designation) == searchText);
    this.article_id.set(data?.id);
    if (data) {
      this._form.patchValue({ unite: data.unite });
    }
  }
  Majuscule(text: string) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }
  reset() {
    this._form.reset();
    this.modif_sortie.set(undefined);
    console.log(new Date().getHours())
  }
  get_details_sortie(row: any, sortie: any) {
    let data_arc = this.liste_articles().find(x => this.Majuscule(x.designation) == sortie.article);
    if (data_arc) {
      this.article_id.set(data_arc.id);
    }
    this.modif_sortie.set({
      date: row.date,
      id: sortie.id,
      article_id: sortie.article,
      beneficiaire_id: sortie.beneficiaire,
      quantite: sortie.quantite,
      motif: sortie.motif,
      projet_id: sortie.projet,
      utilisateur_id: sortie.utilisateur
    });
    this._form.patchValue({
      date: this._service.convertDate(row.date),
      article: sortie.article,
      beneficiaire: sortie.beneficiaire,
      quantite: sortie.quantite,
      motif: sortie.motif,
      projet: sortie.projet,
      unite: sortie.unite
    })
  }
}
