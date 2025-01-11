import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { element_devis, ExampleFlatNode } from '../../models/modeles';
import { ImportedModule } from '../../modules/imported/imported.module';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DevisStore, SstraitantStore, TachesStore, UnitesStore } from '../../store/appstore';
import { AuthenService } from '../../authen.service';
import { UnitesPipe } from '../../unites.pipe';
import { MatTableDataSource } from '@angular/material/table';




@Component({
  selector: 'app-lignedevis',
  imports: [ImportedModule, UnitesPipe],
  templateUrl: './lignedevis.component.html',
  styleUrl: './lignedevis.component.scss'
})
export class LignedevisComponent implements OnInit {
  //injections
  _devis_store = inject(DevisStore);
  _ssTraitance_store = inject(SstraitantStore);
  _unit_store = inject(UnitesStore);
  _taches = inject(TachesStore);
  _auth_service = inject(AuthenService);

  //signals
  ligne_cliquer = signal(Infinity);
  current_poste = signal('');
  current_designation = signal('');
  current_unite = signal<string>('');
  current_prix = signal<number | null>(0);
  current_quantite = signal<number | null>(0);
  current_montant = signal<number | null>(0);
  current_devis_id = signal('');
  is_table_updated = signal(false);
  is_table_opened = signal(false);
  selected_row = signal<element_devis | undefined>(undefined);
  focus_row = signal(Infinity);
  designation_search = signal<string[]>([]);

  //models
  row_color = ['#5094D8', '#93B3BF', 'white', 'white', 'lightyellow', 'lightcoral', 'lightcyan'];
  displayedColumns = ['poste', 'designation', 'unite', 'prix_u', 'quantite', 'montant', 'actions'];
  displaytab_recherche = ['designation'];
  searchText = '';
  characters = [
    'Ant-Man',
    'Aquaman',
    'Asterix',
    'The Atom',
    'The Avengers',
    'Batgirl',
    'Batman',
    'Batwoman'
  ]
  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<element_devis, ExampleFlatNode>();
  flatNodeMap = new Map<ExampleFlatNode, element_devis>();

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
        montant: 0
      };
    flatNode.poste = node.poste;
    flatNode.designation = node.designation;
    flatNode.prix_u = node.prix_u;
    flatNode.unite = node.unite;
    flatNode.quantite = node.quantite;
    flatNode.expandable = !!node.children && node.children.length > 0;
    flatNode.level = level;

    if (node.children.length == 0) {

      flatNode.montant = (node.prix_u ? node.prix_u : 0) * (node.quantite ? node.quantite : 0);
    }
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }
  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);
  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level, node => node.expandable, node => node.children
  );
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  //form
  table_update_form: FormGroup;
  data_loaded = computed(() => this._devis_store.donnees_currentDevis()?.data)

  donnees_table = computed(() => {
    return new MatTableDataSource<any>(this.designation_search())
  })
  //constructor
  constructor(private _fb: FormBuilder) {
    this.table_update_form = this._fb.group({
      poste: new FormControl('', [Validators.required]),
      designation: new FormControl('', [Validators.required]),
      prix_u: new FormControl(0),
      unite: new FormControl(''),
      quantite: new FormControl(0),
    });
    effect(() => {
      let data = this._devis_store.donnees_currentDevis()?.data;
      this.init_dat(data);
    })
  }
  //computed variables
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
  selected_entreprise = computed(() => {
    let entreprise = this._ssTraitance_store.donnees_sstraitant().find(e => e.id == this._devis_store.donnees_currentDevis()?.entreprise_id);
    return {
      'entreprise': entreprise ? entreprise.enseigne : '',

      'id': entreprise ? entreprise.id : ''
    }
  })

  //methods
  ngOnInit() {
    this._devis_store.setCurrentDevisId('')
  }

  init_dat(data: element_devis[] | undefined) {
    if (data) {
      let children = data[0].children
      let sorting = children.sort((a, b) => a.poste.localeCompare(b.poste))
      data[0].children = sorting;
      this.dataSource.data = data;
      this.treeControl.expandAll();
      for (let i = this.treeControl.dataNodes.length - 1; i >= 0; i--) {
        let parent = this.getParentNode(this.treeControl.dataNodes[i]);
        if (parent) {
          let montantNode = this.treeControl.dataNodes[i].montant;
          let montantNodeExist = parent.montant;
          let parentmont = (montantNodeExist ? montantNodeExist : 0) + (montantNode ? montantNode : 0);
          parent.montant = parentmont;
        }
      }
    }

  }
  updateTableData() {
    if (this.table_update_form.valid) {
      let row = this.selected_row();
      let data = this.table_update_form.value;
      if (this.is_table_updated()) {
        if (row) {
          row.poste = data.poste;
          row.designation = data.designation;
          row.prix_u = data.prix_u;
          row.unite = data.unite ? data.unite : '';
          row.quantite = data.quantite;
        }
      } else {
        if (row) {
          let child =
          {
            poste: data.poste,
            designation: data.designation,
            prix_u: data.prix_u,
            unite: data.unite,
            quantite: data.quantite,
            constat: [],
            decompte: [],
            children: []
          }
          row.children.push(child);
          row.unite = '';
          row.prix_u = null
          row.quantite = null
        }
      }
      this.save();
    }
    this.is_table_opened.set(false);
  }
  annuler() {
    this.is_table_opened.set(false);
  }
  modif(data: any) {
    this.is_table_opened.set(true);
    this.selected_row.set(this.flatNodeMap.get(data));
    //this.is_table_updated.set(true);
    this.table_update_form.patchValue(data);
  }
  addrow(data: ExampleFlatNode) {
    let flatenNode = this.flatNodeMap.get(data);
    this.selected_row.set(flatenNode);
    this.is_table_updated.set(false);
    if (data.prix_u && data.quantite) {
      if (confirm('la création d\'une ligne fille modifiera le montant de la ligne parente, voulez-vous continuer?')) {
        if (flatenNode) {
          flatenNode.prix_u = null;
          flatenNode.quantite = null;
          flatenNode.unite = '';
          let nestedNode = this.nestedNodeMap.get(flatenNode);
          if (nestedNode) {
            nestedNode.montant = 0;
          }
        }
        this.new_ligne(flatenNode);
      }
    } else {
      this.new_ligne(flatenNode);
    }
  }
  delete(node: ExampleFlatNode) {
    if (confirm('Voulez-vous vraiment supprimer cette ligne?')) {
      let nodeFlat = this.flatNodeMap.get(node);
      if (nodeFlat) {
        const parentNode = this.getParentNode(node);
        if (parentNode) {
          let parentFlat = this.flatNodeMap.get(parentNode);
          if (!parentFlat || nodeFlat.children.length > 0) {
            alert('Impossible de supprimer la ligne car elle contient des lignes filles');
          } else {
            parentFlat.children = parentFlat.children.filter(c => c.poste !== node.poste);
            this.save();
          }
        } else {
          alert('Impossible de supprimer la ligne car elle est la racine');

        }
      }

    }
  }
  getLevel = (node: ExampleFlatNode) => node.level;
  getParentNode(node: ExampleFlatNode): ExampleFlatNode | undefined {
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
  modif_data(ind: number, node: ExampleFlatNode) {
    this.designation_search.set([]);
    this.selected_row.set(this.flatNodeMap.get(node));
    this.ligne_cliquer.set(ind);
    this.current_poste.set(node.poste);
    this.current_designation.set(node.designation);
    this.current_unite.set(node.unite);
    this.current_prix.set(node.prix_u);
    this.current_quantite.set(node.quantite);
    this.current_montant.set(node.montant)
    this.is_table_updated.set(true);
  }
  saisie() {
    let prix = this.current_prix();
    let quantite = this.current_quantite();
    if (prix && quantite) {
      let montant = prix * quantite;
      let row = this.selected_row();
      this.current_montant.set(montant)
    }
  }
  update() {
    let row = this.selected_row();
    if (row) {
      if (row.children.length == 0) {
        row.poste = this.current_poste();
        row.designation = this.current_designation();
        row.prix_u = this.current_prix();
        row.unite = this.current_unite();
        row.quantite = this.current_quantite();
        let flatenNode = this.nestedNodeMap.get(row)
        if (flatenNode) {
          flatenNode.montant = this.current_montant()
        }
      } else {
        row.poste = this.current_poste();
      }
    }
    this.save();
    this.ligne_cliquer.set(Infinity);
  }
  close(data: ExampleFlatNode) {
    this.ligne_cliquer.set(Infinity);
    const parentNode = this.getParentNode(data);
    if (data.poste === '' && data.designation == '') {
      if (parentNode) {
        let parentFlat = this.flatNodeMap.get(parentNode);
        if (parentFlat)
          parentFlat.children = parentFlat.children.filter(c => c.poste !== '');
        this.init_dat(this.data_loaded())
      }

    }
  }
  save() {
    this._devis_store.addDataDevis(this.data_loaded());
  }
  selecteDevis(devis_id: string) {
    this._devis_store.setCurrentDevisId(devis_id)
  }
  new_ligne(flatenNode: element_devis | undefined) {
    if (flatenNode) {
      let child: element_devis = {
        poste: '',
        designation: '',
        prix_u: null,
        unite: '',
        quantite: null,
        constat: [],
        children: []
      }
      flatenNode.children.push(child)
      this.init_dat(this.data_loaded())
      let nestedNode = this.nestedNodeMap.get(child);
      if (nestedNode) {
        let ind = this.treeControl.dataNodes.indexOf(nestedNode)
        this.modif_data(ind, nestedNode)
      }
    }
  }
  Majuscule(text: string) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }
  search() {
    let searchText = this.current_designation();
    if (!searchText) {
      this.designation_search.set([]);
      return;
    }
    let data = [...this._taches.taches_data().map(x => x.designation), ...this._taches.taches_data().map(x => x.type)]
    this.designation_search.set(data.filter(x =>
      this.Majuscule(x).includes(this.Majuscule(searchText))
    ));

  }
  displayFn(taches: any): string {
    //let unites = this._unit_store.unites_data().find(u => u.id == taches.uniteid);
    this.current_unite.set(taches && taches.uniteid ? taches.uniteid : '');
    let id = taches && taches.uniteid ? taches.uniteid : '';
    return taches && taches.designation ? taches.designation : '';
  }

}

