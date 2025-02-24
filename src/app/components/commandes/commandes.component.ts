import { Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ModelTemplateComponent } from '../model-template/model-template.component';
import { NonNullableFormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthenService } from '../../authen.service';
import { article_commande, articles, commandes, fournisseurs } from '../../models/modeles';
import { CategoriesStore, CommandeStore, fournisseursStore, ProjetStore, RessourcesStore, UserStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { validate } from 'uuid';
import { MatTableDataSource } from '@angular/material/table';
import { ProjetsPipe } from '../../mypipes/projets.pipe';
import { FournisseursPipe } from '../../mypipes/fournisseurs.pipe';
import { ArticlesPipe } from '../../mypipes/articles.pipe';
import { sign } from 'crypto';

@Component({
  selector: 'app-commandes',
  imports: [ImportedModule, FournisseursPipe, ArticlesPipe],
  templateUrl: './commandes.component.html',
  styleUrl: './commandes.component.scss'
})
export class CommandesComponent {
  constructor() {
    effect(() => {
    })
  }
  ngOnInit() {

  }
  current_row = signal<any>(undefined);
  is_update_article = signal(false);
  is_open = signal(false);
  is_open2 = signal(false);
  article_id = signal<string | undefined>('');
  titre_tableau = signal('Liste des commandes');
  designation_search = signal<articles[]>([]);
  unites = signal("");
  is_new_commande = signal(false);
  is_new_article = signal(false);
  is_modif_commande = signal(false);
  articles_commande = signal<any>([])
  current_commande = signal<commandes | undefined>(undefined)

  _commandesStore = inject(CommandeStore);
  _fournisseurStore = inject(fournisseursStore);
  _projetStore = inject(ProjetStore)
  _ressource_store = inject(RessourcesStore);
  _categorie_store = inject(CategoriesStore);
  _users = inject(UserStore)
  _service = inject(WenService);
  _auth_service = inject(AuthenService);
  fb = inject(NonNullableFormBuilder);

  table_commande = this.fb.group({
    numero_commande: new FormControl({ value: '', disabled: true }, Validators.required),
    demandeur: new FormControl({ value: '', disabled: true }, Validators.required),
    projet_id: new FormControl('', Validators.required),
  });
  table_article_commande = this.fb.group({
    article: new FormControl('', Validators.required),
    unite: new FormControl({ value: '', disabled: true }, Validators.required),
    quantite: new FormControl(0, Validators.required),
    date_livraison: new FormControl(new Date(), Validators.required),
    fournisseur_id: new FormControl('')
  });
  displayedColumns = [
    'numero',
    'article_id',
    'unite',
    'quantite',
    'date_livraison',
    'fournisseur_id',
    'actions'
  ]

  dataSource = computed(() =>
    new MatTableDataSource(this.articles_commande()))
  is_valid = computed(() => {
    return (this.current_row() !== undefined)
  })
  liste_fournisseurs = computed(() => {
    return this._fournisseurStore.all_fournisseurs()
  })
  liste_projets = computed(() => {
    return this._projetStore.donnees_projet()
  })
  liste_articles = computed(() => {
    let cat = this._categorie_store.articles_catIds();
    let articles: articles[] = this._ressource_store.all_ressources().filter(r => cat.includes(r.categorie_id)).map(
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
  clicker = linkedSignal(() => this._commandesStore.commandes().map(x => false))

  num_bon_de_commande = computed(() => {
    if (this._commandesStore.commandes().length == 0) {
      return ('BC1' + new Date().toLocaleDateString()).replace(/\//g, '');
    } else {
      let numeros = this._commandesStore.commandes().map(x => ({ 'num': x.numero_commande, 'date': x.date_commande ? x.date_commande : '' }));
      let nums = numeros.map(x => {
        let num1 = x.num.split(x.date.replace(/\//g, ''))[0];
        let num = num1.split('BC')[1];
        return Number(num);
      });
      let num = Math.max(...nums);
      return ('BC' + (num + 1) + new Date().toLocaleDateString()).replace(/\//g, '');
    }


  })
  commande_recentes = computed(() => {
    return this._commandesStore.commandes().sort((a, b) => {
      let date1 = this._service.convertDate(a.date_commande ? a.date_commande : '').getTime();
      let date2 = this._service.convertDate(b.date_commande ? b.date_commande : '').getTime();
      return date2 - date1;
    }
    ).slice(0, 5)
  })

  deleteData(row: any) {
    if (confirm('Voulez-vous vraiment supprimer cette commande?'))
      this.articles_commande.update((data: any) => data.filter((x: any) => x.numero != row.numero))
  }

  annuler() {
    if (!this.is_update_article()) {
      this.articles_commande.update((data: any) => data.filter((x: any) => x.numero != this.current_row()?.numero))
    }
    this.current_row.set(undefined)
    this.is_new_article.set(false)
  }

  modifier(row: any) {
    this.is_update_article.set(true);
    let date = this._service.convertDate(row.date_livraison);
    this.table_article_commande.patchValue(
      {
        ...row,
        article: this.liste_articles().find(x => x.id == row.article_id)?.designation,
        date_livraison: date
      }
    )
    this.current_row.set(row);
    this.fermer()
  }

  recherche(word: any) {

  }
  afficheTout() {
  }

  changeSelect(data: any) {

  }
  fermer() {
    let searchText = this.table_article_commande.value.article;
    let data = this.liste_articles().find(x => this.Majuscule(x.designation) == searchText);

    this.article_id.set(data?.id);
    if (data) {
      this.table_article_commande.patchValue({ unite: data.unite });
      this.unites.set(data.unite);
    }

  }
  verif() {
    let searchText = this.table_article_commande.value.article;

    let data = this.liste_articles().find(x => this.Majuscule(x.designation) == searchText);
    if (!data) {
      this.table_article_commande.get("article")?.setErrors({ 'incorrect': true });
      this.table_article_commande.get('unite')?.setValue('');
      this.article_id.set('');
    } else {
      this.table_article_commande.get('unite')?.setValue(data.unite);
      this.unites.set(data.unite);
      this.article_id.set(data.id);
    }

  }
  search() {
    let searchText = this.table_article_commande.value.article;
    if (!searchText) {
      this.designation_search.set([]);
      return;
    }

    let data = [...this.liste_articles()]
    let filtre = data.filter(x =>
      this.Majuscule(x.designation).includes(this.Majuscule(searchText))
    )

    this.designation_search.set(filtre);
    this.verif()
  }
  Majuscule(text: string) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }

  new_bon_commande() {
    this.table_commande.reset();
    this.is_new_commande.set(true);
    this.is_modif_commande.set(false);

    this.table_commande.get('numero_commande')?.setValue(this.num_bon_de_commande());
    this.articles_commande.set([]);
    this.current_row.set(undefined);
    this.table_commande.get('projet_id')?.setValue(this.liste_projets()[0].id);
    let name = this._auth_service.userSignal()?.username;
    if (name) {
      this.table_commande.get('demandeur')?.setValue(name);
    }
    this.new_article();
    this.current_commande.set({
      id: '',
      numero_commande: this.num_bon_de_commande(),
      projet_id: this.liste_projets()[0].id,
      demandeur: this._auth_service.userSignal()?.uid,
      date_commande: new Date().toLocaleDateString(),
      articles_commandes: [],
      validation: 'non validé',
      livraison: 'non livré'
    })

  }
  new_article() {
    this.table_article_commande.reset();
    this.is_update_article.set(false);
    this.is_new_article.set(true);
    let numero = 1;
    if (this.articles_commande().length > 0) {
      let num = this.articles_commande().map((x: any) => x.numero)
      numero = Math.max(...num) + 1
    }
    let mydata = {
      numero: numero,
      article_id: '',
      unite: '',
      quantite: 0,
      date_livraison: new Date().toLocaleDateString(),
      fournisseur_id: '',
      validation: 'non validé',
      livraison: 'non livré'
    }
    this.articles_commande.update(data =>
    ([
      ...data,
      mydata
    ])
    )
    this.current_row.set(mydata)
  }
  valide_article() {
    if (this.table_article_commande.valid) {
      let valeur = this.table_article_commande.value
      this.articles_commande.update(data => {
        return data.map((x: any) => {
          if (x.numero == this.current_row()?.numero) {
            return {
              numero: x.numero,
              article_id: this.article_id(),
              unite: this.unites(),
              quantite: valeur.quantite,
              date_livraison: valeur.date_livraison?.toLocaleDateString(),
              fournisseur_id: valeur.fournisseur_id ? valeur.fournisseur_id : '',
              validation: 'validé',
              livraison: 'non livré'
            }
          }
          return x
        })
      })
    }
    this.current_row.set(undefined)
    this.is_new_article.set(false)
  }
  validate_commande() {
    let value = this.table_commande.value;
    if (this.is_modif_commande()) {
      let com = this.current_commande()
      let projet_id = this.table_commande.value.projet_id
      if (com) {
        let commande: commandes = {
          id: com.id,
          numero_commande: com.numero_commande,
          projet_id: projet_id ? projet_id : '',
          demandeur: com.demandeur,
          date_commande: com.date_commande,
          articles_commandes: this.articles_commande().map((x: any) => ({
            'article_id': x.article_id,
            'quantite': x.quantite,
            'fournisseur_id': x.fournisseur_id,
            'date_livraison': x.date_livraison,
            'validation': com.validation,
            'livraison': com.livraison
          })),
          'validation': 'non validé',
          'livraison': 'non livré'
        }
        this._commandesStore.updateCommande(commande)
      }
    } else {
      let commande = {
        numero_commande: this.num_bon_de_commande(),
        projet_id: value.projet_id ? value.projet_id : '',
        demandeur: this._auth_service.userSignal()?.uid,
        date_commande: new Date().toLocaleDateString(),
        articles_commandes: this.articles_commande().map((x: any) => ({
          'article_id': x.article_id,
          'quantite': x.quantite,
          'fournisseur_id': x.fournisseur_id,
          'date_livraison': x.date_livraison,
          'validation': 'non validé',
          'livraison': 'non livré'
        })),
        'livraison': 'non livré',
        'validation': 'non validé'
      }
      this._commandesStore.addCommande(commande)
    }
    this.is_new_commande.set(false)
    this.table_commande.reset()
    this.table_article_commande.reset()
    this.articles_commande.set([])
    this.current_commande.set(undefined)
  }
  remove_commande() {
    if (confirm('Voulez-vous vraiment supprimer cette commande?')) {
      let com = this.current_commande()
      if (com) {
        this._commandesStore.removeCommande(com.id)
        this.current_commande.set(undefined)
        this.table_commande.reset()
        this.articles_commande.set([])
        this.is_new_commande.set(false)
      }
    }
  }
  get_details(com: commandes) {
    this.current_commande.set(com)
    let user = this._users.users().find((x: any) => x.id == com.demandeur)
    this.table_commande.patchValue({
      numero_commande: com.numero_commande,
      demandeur: user?.username,
      projet_id: com.projet_id
    })
    this.articles_commande.set(com.articles_commandes.map((x, index) => {
      let article = this.liste_articles().find((y: any) => y.id == x.article_id)
      return {
        numero: index + 1,
        article_id: x.article_id,
        unite: article?.unite,
        quantite: x.quantite,
        date_livraison: x.date_livraison,
        fournisseur_id: x.fournisseur_id
      }
    }))
    this.is_new_commande.set(true)
    this.is_new_article.set(false)
    this.is_modif_commande.set(true)
  }
}
