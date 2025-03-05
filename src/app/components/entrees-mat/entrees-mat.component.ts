import { Component, computed, effect, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { CategoriesStore, CommandeStore, EntreesArticlesStore, fournisseursStore, ProjetStore, RessourcesStore, SitesStore, SortiesArticlesStore, UserStore } from '../../store/appstore';
import { NonNullableFormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { AuthenService } from '../../authen.service';
import { articles, commandes, entrees_articles, fournisseurs, sorties_articles } from '../../models/modeles';
import { ImportedModule } from '../../modules/imported/imported.module';
import { WenService } from '../../wen.service';

@Component({
  selector: 'app-entrees-mat',
  imports: [ImportedModule],
  templateUrl: './entrees-mat.component.html',
  styleUrl: './entrees-mat.component.scss'
})
export class EntreesMatComponent implements OnInit {
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
  _form: FormGroup

  // signal declarations
  is_update = signal('')
  modif_entree = signal<entrees_articles | undefined>(undefined)
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
  entree_recentes = computed(() => {
    let donnees: any = []
    let uniques_dates = this._entrees_store.entrees_articles().sort((a, b) => a.time - b.time).slice(0, 10).map((e: entrees_articles) => e.date).filter((value, index, self) => self.indexOf(value) === index);
    uniques_dates.forEach(element => {
      let filtre = this._entrees_store.entrees_articles().filter((e: entrees_articles) => e.date == element);
      donnees.push({

        'date': element,
        'articles': filtre.map((a: entrees_articles) => ({
          'id': a.id,
          'article': this.liste_articles().find((ar: articles) => ar.id == a.article_id)?.designation,
          'num_bc': this.liste_commandes().find((c: commandes) => c.id == a.num_bc)?.numero_commande,
          'projet': a.projet_id,
          'site': a.site_id,
          'fournisseur': a.fournisseur_id,
          'receptionniste': a.receptionniste_id,
          'quantite': a.quantite,
          'time':a.time,
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
      num_bc: new FormControl(''),
      article: new FormControl('', Validators.required),
      fournisseur: new FormControl('', Validators.required),
      quantite_recue: new FormControl(0, [Validators.required, Validators.min(1)]),
      site: new FormControl('', Validators.required),
      projet: new FormControl('', Validators.required),
      receptionniste: new FormControl('', Validators.required),
      unite: new FormControl({ value: '', disabled: true }),
    })
    effect(() => {
      console.log(this.modif_entree())
    })
  }
  ngOnInit() {

  }
  submit_entree() {
    if (this._form.valid) {
      if (this.modif_entree()) {
        let entrees = {
          id: this.modif_entree()?.id,
          date: this._form.value.date.toLocaleDateString(),
          num_bc: this.commande_id(),
          article_id: this.article_id(),
          fournisseur_id: this._form.value.fournisseur,
          quantite: this._form.value.quantite_recue,
          site_id: this._form.value.site,
          projet_id: this._form.value.projet,
          receptionniste_id: this._form.value.receptionniste,
          utilisateur_id: this._auth.userSignal()?.uid,
          time: new Date().getTime()
        }
        this._entrees_store.updateEntreeArticle(entrees)
      } else {
        let entrees = {
          date: this._form.value.date.toLocaleDateString(),
          article_id: this.article_id(),
          num_bc: this.commande_id(),
          fournisseur_id: this._form.value.fournisseur,
          quantite: this._form.value.quantite_recue,
          site_id: this._form.value.site,
          projet_id: this._form.value.projet,
          receptionniste_id: this._form.value.receptionniste,
          utilisateur_id: this._auth.userSignal()?.uid,
          time: new Date().getTime()
        }
        this._entrees_store.addEntreeArticles(entrees)
      }
    }
    this.modif_entree.set(undefined)
    this._form.reset()

  }
  remove_entree(id: string | undefined) {
    console.log(id)
    if (id)
     {if (confirm('Voulez-vous vraiment supprimer cette entrée?')) {
      this._entrees_store.removeEntreeArticle(id)
      this.modif_entree.set(undefined)
      this._form.reset()
    }} 
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
    this.modif_entree.set(undefined);
  }
  get_details_entrees(commande: any, entree: any) {
    let data_com = this.liste_commandes().find(x => this.Majuscule(x.numero_commande) == entree.num_bc);
    let data_arc = this.liste_articles().find(x => this.Majuscule(x.designation) == entree.article);
    if (data_com) {
      this.commande_id.set(data_com.id);
    }
    if (data_arc) {
      this.article_id.set(data_arc.id);
    }
    this.modif_entree.set({
      date:commande.date,
      time:entree.time,
      id: entree.id,
      num_bc: entree.num_bc,
      article_id: entree.article,
      fournisseur_id: entree.fournisseur,
      quantite: entree.quantite,
      site_id: entree.site,
      projet_id: entree.projet,
      receptionniste_id: entree.receptionniste,
      utilisateur_id: entree.utilisateur
    });
    this._form.patchValue({
      date:this._service.convertDate( commande.date) ,
      num_bc: entree.num_bc,
      article: entree.article,
      fournisseur: entree.fournisseur,
      quantite_recue: entree.quantite,
      site: entree.site,
      projet: entree.projet,
      receptionniste: entree.receptionniste,
      unite: entree.unite
    })
  }
}
