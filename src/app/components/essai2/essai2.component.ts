import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { WenService } from '../../wen.service';
import { ApproGasoilStore, DatesStore, DevisStore, EnginsStore, GasoilStore, PersonnelStore, TachesEnginsStore, TachesStore, UnitesStore } from '../../store/appstore';
import { ImportedModule } from '../../modules/imported/imported.module';
import { DateTime, Info, Interval } from 'luxon';
import { toUnicode } from 'node:punycode';
import e from 'express';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AuthenService } from '../../authen.service';
import { DataLoaderService } from '../../services/data-loader.service';
import { Router } from '@angular/router';


interface Family {
  name: string;
  children?: Family[];
}
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}
@Component({
    selector: 'app-essai2',
    imports: [ImportedModule],
    templateUrl: './essai2.component.html',
    styleUrl: './essai2.component.scss'
})
export class Essai2Component implements OnInit {
  _devis_store = inject(DevisStore);
  _auth_service = inject(AuthenService);
  _router = inject(Router);
  _loader_service = inject(DataLoaderService);
  devis_ids=signal<string[]>([]);
  ind=signal<number>(0);  
  ngOnInit() {
    this._loader_service.setPath();
    this._devis_store.loadDevis()
  }
  constructor() {
    effect(() => {
    
      console.log('selected_devis store',this._devis_store.donnees_currentDevis())

    })
  }

  buttonClick() { 
    this._devis_store.setCurrentDevisId(this._devis_store.devisIds()[this.ind()])
    this.ind.update(x=>x+1)
  }

}
