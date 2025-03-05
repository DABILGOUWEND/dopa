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
import mapboxgl from 'mapbox-gl'

@Component({
    selector: 'app-essai2',
    imports: [ImportedModule],
    templateUrl: './essai2.component.html',
    styleUrl: './essai2.component.scss'
})
export class Essai2Component implements OnInit {
  options: any;
  ngOnInit() {
    
}
  

}
