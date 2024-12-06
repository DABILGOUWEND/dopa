import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { UnitesPipe } from '../../unites.pipe';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { AuthenService } from '../../authen.service';
import { element_constat, element_devis, FlatNodeAttachement } from '../../models/modeles';
import { DevisStore, SstraitantStore, UnitesStore } from '../../store/appstore';

@Component({
    selector: 'app-mes-attachements',
    imports: [ImportedModule, UnitesPipe],
    templateUrl: './mes-attachements.component.html',
    styleUrl: './mes-attachements.component.scss'
})
export class MesAttachementsComponent implements OnInit {
  //injections
  _devis_store = inject(DevisStore);
  _auth_service = inject(AuthenService);
  _ssTraitance_store = inject(SstraitantStore);
  _unit_store = inject(UnitesStore);
  getchildren: element_constat[] = []

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
  row_color = ['#5094D8', '#93B3BF', 'white', 'white', 'lightyellow', 'lightcoral', 'lightcyan'];
  
  constats: element_constat[] = [];
  ligne_clicked = signal(Infinity);
  displayedColumns = [
    'poste',
    'designation',
    'unite',
    'prix_u',
    'quantite',
    'quantite_prec',
    'quantite_periode',
    'quantite_cumul',
    'montant_prec',
    'montant_periode',
    'montant_cumul'
  ];
  nestedNodeMap = new Map<element_devis, FlatNodeAttachement>();
  flatNodeMap = new Map<FlatNodeAttachement, element_devis>();
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
        montant_prec: null,
        montant_periode: null,
        montant_cumul: null,

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
    flatNode.montant_prec = null;
    flatNode.montant_periode = null;
    flatNode.montant_cumul = null;


    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }
  treeControl = new FlatTreeControl<FlatNodeAttachement>(
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
      for (let i = this.treeControl.dataNodes.length - 1; i >= 0; i--) {
          let node = this.treeControl.dataNodes[i];
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
              let prix = node.prix_u ? node.prix_u : 0;
              node.quantite_cumul = node.quantite_prec + node.quantite_periode;
              node.montant_prec = node.quantite_prec * prix;
              node.montant_periode = node.quantite_periode * prix;
              node.montant_cumul = node.montant_prec + node.montant_periode;
            }
          }
        }
        let parent = this.getParentNode(this.treeControl.dataNodes[i]);
        if (parent) {
          let montant_prec = this.treeControl.dataNodes[i].montant_prec;
          let montant_periode = this.treeControl.dataNodes[i].montant_periode;
          let montant_cumul = this.treeControl.dataNodes[i].montant_cumul;

          let montantNodeprec = parent.montant_prec;
          let montantNodePeriode = parent.montant_periode;
          let montantNodeCumul = parent.montant_cumul;

          let parentmontprec = (montantNodeprec ? montantNodeprec : 0) + (montant_prec ? montant_prec : 0);
          let parentmontperiode = (montantNodePeriode ? montantNodePeriode : 0) + (montant_periode ? montant_periode : 0);
          let parentmontcumul = (montantNodeCumul ? montantNodeCumul : 0) + (montant_cumul ? montant_cumul : 0);

          parent.montant_prec = parentmontprec;
          parent.montant_periode = parentmontperiode;
          parent.montant_cumul = parentmontcumul;

        }


      }
    }


  }
  new_constat() {
    this.current_constat.set(this.last_constat() + 1);
    this.NewConstat(this.data_loaded());
    this._devis_store.addDataDevis(this.data_loaded());
  }
  getLevel = (node: FlatNodeAttachement) => node.level
  getParentNode(node: FlatNodeAttachement): FlatNodeAttachement | undefined {
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
  ligne_click(node: FlatNodeAttachement, ind: number) {
    this.ligne_clicked.set(ind);
    let qtite_periode = node.quantite_periode;
    let qtite_prec = node.quantite_prec;
    let qtite_cumul = node.quantite_cumul;
    qtite_periode != null ? this.clicked_qte_periode.set(qtite_periode) : this.clicked_qte_periode.set(0);
    qtite_prec != null ? this.clicked_qte_prec.set(qtite_prec) : this.clicked_qte_prec.set(0);
    qtite_cumul != null ? this.clicked_qte_cumul.set(qtite_cumul) : this.clicked_qte_cumul.set(0);
  }
  add_ligne(data: any) {

  }

  save(node: FlatNodeAttachement) {
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
}
