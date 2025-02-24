import { Component, computed, effect, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { CategoriesStore, CommandeStore, EntreesArticlesStore, fournisseursStore, ProjetStore, RessourcesStore, SitesStore } from '../../store/appstore';
import { NonNullableFormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthenService } from '../../authen.service';
import { articles, entrees_articles, fournisseurs } from '../../models/modeles';

@Component({
  selector: 'app-entrees-mat',
  imports: [],
  templateUrl: './entrees-mat.component.html',
  styleUrl: './entrees-mat.component.scss'
})
export class EntreesMatComponent implements OnInit {
  constructor() {
    effect(() => {
    })
  }
  ngOnInit() {

  }


}
