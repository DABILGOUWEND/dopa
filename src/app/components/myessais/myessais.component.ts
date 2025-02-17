import { Component, computed, effect, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { WenService } from '../../wen.service';
import { CategoriesStore, CommandeStore, EntreesArticlesStore, RessourcesStore, SortiesArticlesStore } from '../../store/appstore';
import { articles } from '../../models/modeles';
import { ImportedModule } from '../../modules/imported/imported.module';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { serialize } from 'v8';

@Component({
    selector: 'app-myessais',
    imports: [ImportedModule],
    templateUrl: './myessais.component.html',
    styleUrl: './myessais.component.scss'
})
export class MyessaisComponent implements OnInit {
    _service = inject(WenService);
    _ressource_store = inject(RessourcesStore);
    _categorie_store = inject(CategoriesStore);
    _commande_store = inject(CommandeStore);
    _sorties_store = inject(SortiesArticlesStore);
    _entrees_store = inject(EntreesArticlesStore);

    recherch: FormGroup

    //signals

    current_designation = signal("")
    designation_search = signal<articles[]>([]);
    constructor(
        fd: FormBuilder
    ) {
        this.recherch = fd.group({
            recherche: new FormControl('')
        })

        effect(() => {
        })
    }

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
    articles = signal("")
    recherche_article = linkedSignal(() => {
        return this.liste_articles().filter(r => {
            return (r.designation).toLowerCase().includes(this.articles().toLowerCase())
        })
    }
    )
    ngOnInit(): void {

    }

    search() {
        let searchText = this.recherch.value.recherche;
        if (!searchText) {
            this.designation_search.set([]);
            return;
        }

        let data = [...this.liste_articles()]
        this.designation_search.set(data.filter(x =>
            this.Majuscule(x.designation).includes(this.Majuscule(searchText))
        ));
    }
    Majuscule(text: string) {
        if (!text) return '';
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    }

    fermer()
    {
        let searchText = this.recherch.value.recherche;
        let data=this.liste_articles().find(x=>this.Majuscule(x.designation)==searchText)
    }
}
