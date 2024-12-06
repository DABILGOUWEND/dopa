import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { DevisStore, SstraitantStore, UnitesStore } from '../../store/appstore';
import { element_constat, element_devis, ExampleFlatNode2 } from '../../models/modeles';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AuthenService } from '../../authen.service';
import { BehaviorSubject } from 'rxjs';
import { UnitesPipe } from '../../unites.pipe';

@Component({
    selector: 'app-mes-constats',
    imports: [ImportedModule, UnitesPipe],
    templateUrl: './mes-constats.component.html',
    styleUrl: './mes-constats.component.scss'
})
export class MesConstatsComponent implements OnInit {
  //injections
  _devis_store = inject(DevisStore);
  _auth_service = inject(AuthenService);
  _ssTraitance_store = inject(SstraitantStore);
  _unit_store = inject(UnitesStore);

  //signals properties
  current_devis_id = signal('');
  current_constat = signal(0);
  numero_constat = signal(0);
  clicked_qte_prec = signal(0);
  clicked_qte_periode = signal(0);
  clicked_qte_cumul = signal(0);


  //computed properties
  data_loaded = computed(() => this._devis_store.donnees_currentDevis()?.data)
  liste_devis = computed(() => {
    let donnees: any = []
    this._devis_store.donnees_devis().forEach(ent => {
      let entreprise = this._ssTraitance_store.donnees_sstraitant().find(e => e.id == ent.entreprise_id);
      donnees.push({
        id: ent.id,
        entreprise: entreprise ? entreprise.enseigne : '',
        travaux: ent.reference
      });
    })
    return donnees;

  })
  liste_unites = computed(() => {
    return this._unit_store.unites_data()
  })
  last_constat = computed(() => {
    let dataAll = this._devis_store.devis_data().find(x => x.id == this.current_devis_id());
    let data = dataAll?.data;
    this.constats = [];
    let constats_numero = this.getChildren(data).map(c => c.numero);
    return constats_numero.length > 0 ? Math.max(...constats_numero) : 0;
  })

  
  //current properties 
  constats: element_constat[] = [];
  ligne_clicked = signal(Infinity);
  displayedColumns = ['poste', 'designation', 'unite', 'prix_u', 'quantite', 'quantite_prec', 'quantite_periode', 'quantite_cumul', 'actions'];
  row_color = ['#5094D8', '#93B3BF', 'white', 'white', 'lightyellow', 'lightcoral', 'lightcyan'];
  nestedNodeMap = new Map<element_devis, ExampleFlatNode2>();
  flatNodeMap = new Map<ExampleFlatNode2, element_devis>();
  transformer = (node: element_devis, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && (existingNode.poste === node.poste

    )
      ? existingNode
      : {
        poste: node.poste,
        designation: node.designation,
        prix_u: node.prix_u,
        unite: node.unite,
        quantite: node.quantite,
        expandable: !!node.children && node.children.length > 0,
        level: level,
        quantite_prec: null,
        quantite_periode: null,
        quantite_cumul: null,

      };
    flatNode.poste = node.poste;
    flatNode.designation = node.designation;
    flatNode.prix_u = node.prix_u;
    flatNode.unite = node.unite;
    flatNode.quantite = node.quantite;
    flatNode.expandable = !!node.children && node.children.length > 0;
    flatNode.level = level;
    flatNode.quantite_prec = null;
    flatNode.quantite_periode = null;
    flatNode.quantite_cumul = null;


    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }
  treeControl = new FlatTreeControl<ExampleFlatNode2>(
    node => node.level, node => node.expandable);
  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level, node => node.expandable, node => node.children
  );
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  constructor() {
    effect(() => {
      let data = this._devis_store.donnees_currentDevis()?.data;
      this.init_dat(data);
    }
    )
  }

  // methods
  ngOnInit() {
    this._devis_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/devis');
    this._ssTraitance_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/sous_traitants');
    this._unit_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/unites');
    this._devis_store.loadDevis();
    this._ssTraitance_store.loadSstraitants();
    this._unit_store.loadUnites();
  }

  init_dat(data: element_devis[] | undefined) {
    if (data) {
      let children = data[0].children;
      let sorting = children.sort((a, b) => a.poste.localeCompare(b.poste))
      data[0].children = sorting;
      this.dataSource.data = data;
      this.treeControl.expandAll();
      for (let node of this.treeControl.dataNodes) {
        if (!node.expandable) {
          let flatenNode = this.flatNodeMap.get(node);
          if (flatenNode) {
            let constat = flatenNode.constat;
            if (constat.length > 0) {
              let numeros = constat.map(c => c.numero);
              let ind = numeros.indexOf(this.current_constat());
              if (ind > -1) {
                node.quantite_periode = constat[ind].quantite_periode;
              }
              else {
                node.quantite_periode = 0;
              }
              let quantites_prec = constat.filter(x => x.numero < this.current_constat()).map(c => c.quantite_periode);
              if (quantites_prec.length > 0) {
                node.quantite_prec = quantites_prec.reduce((a, b) => a + b);
              } else {
                node.quantite_prec = 0;
              }
              node.quantite_cumul = node.quantite_prec + node.quantite_periode;
            }
          }
        }

      }
    }


  }
  new_constat() {
    this.current_constat.set(this.last_constat() + 1);
    this.NewConstat(this.data_loaded());
    this._devis_store.addDataDevis(this.data_loaded());
  }
  selecteDevis(devis_id: string) {
    this.numero_constat.set(0);
    this._devis_store.setCurrentDevisId(devis_id)
    this.current_constat.set(this.last_constat());
  }
  next_constat() {
    this.current_constat.update(x => x + 1);
  }
  previous_constat() {
    this.current_constat.update(x => x - 1);
  }
  getChildren(data: element_devis[] | undefined) {

    if (data) {
      data.forEach((each) => {

        if (each.constat.length > 0) {
          this.constats.push(...each.constat);
        }
        this.getChildren(each.children);
      });
    }
    return this.constats;
  }
  ligne_click(node: ExampleFlatNode2, ind: number) {
    this.ligne_clicked.set(ind);
    let qtite_periode = node.quantite_periode;
    let qtite_prec = node.quantite_prec;
    let qtite_cumul = node.quantite_cumul;
    qtite_periode != null ? this.clicked_qte_periode.set(qtite_periode) : this.clicked_qte_periode.set(0);
    qtite_prec != null ? this.clicked_qte_prec.set(qtite_prec) : this.clicked_qte_prec.set(0);
    qtite_cumul != null ? this.clicked_qte_cumul.set(qtite_cumul) : this.clicked_qte_cumul.set(0);
  }
  save(node: ExampleFlatNode2) {
    let flatenNode = this.flatNodeMap.get(node);
    if (flatenNode) {
      let ind = flatenNode.constat.map(c => c.numero).indexOf(this.current_constat());
      if (ind > -1) {
        flatenNode.constat[ind].quantite_periode = this.clicked_qte_periode();
      }
    }
    this._devis_store.addDataDevis(this.data_loaded());
    this.ligne_clicked.set(Infinity);
  }
  close() {
    this.ligne_clicked.set(Infinity);
  }
  saisie() {
    this.clicked_qte_cumul.set(this.clicked_qte_periode() + this.clicked_qte_prec());
  }
  delete_constat() {
    if (confirm('Voulez-vous vraiment supprimer ce constat?')) {
      this.RemoveConstat(this.data_loaded());
      this._devis_store.addDataDevis(this.data_loaded());
      this.current_constat.update(x => x - 1);
    }

  }
  NewConstat(data: element_devis[] | undefined) {
    if (data) {
      data.forEach((each) => {
        let flatenNode = this.nestedNodeMap.get(each);

        if (!flatenNode?.expandable) {
          each.constat.push({
            numero: this.last_constat() + 1,
            quantite_periode: 0
          })
        }
        this.NewConstat(each.children);
      });
    }
  }
  RemoveConstat(data: element_devis[] | undefined) {
    if (data) {
      data.forEach((each) => {
        let flatenNode = this.nestedNodeMap.get(each);

        if (!flatenNode?.expandable) {
          let ind = each.constat.map(c => c.numero).indexOf(this.current_constat());
          if (ind > -1) {
            each.constat = each.constat.filter(x => x.numero != this.current_constat());
          }
        }
        this.RemoveConstat(each.children);
      });
    }
  }
  getLevel = (node: ExampleFlatNode2) => node.level
  getParentNode(node: ExampleFlatNode2): ExampleFlatNode2 | undefined {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) {
      return undefined;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return undefined;
  }
}
