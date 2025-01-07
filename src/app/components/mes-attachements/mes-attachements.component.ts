import { Component, computed, effect, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { UnitesPipe } from '../../unites.pipe';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { AuthenService } from '../../authen.service';
import { element_constat, element_decompte, element_devis, FlatNodeAttachement } from '../../models/modeles';
import { DevisStore, SstraitantStore, UnitesStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SafeUrl } from '@angular/platform-browser';
import { MatTableDataSource } from '@angular/material/table';
import { link } from 'node:fs';
export type myconstat = {
  'element_devis': element_devis,
  'data_periode': element_constat[],
  'data_prec': element_constat[]
}
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
  net_a_payer_prec = signal(0)
  net_a_payer_actuel = signal(0)
  current_devis_id = signal('');
  imageUrl = signal('');
  ligne_clicked = signal(Infinity);
  is_table_opened = signal(false);
  current_avance = linkedSignal(() => {
    let avance = this._devis_store.donnees_currentDevis()?.avance
    if (avance != undefined) {
      if (this.totaux().montant_marche != 0) {
        return this.totaux().montant_periode * avance / (this.totaux().montant_marche * 0.85);
      } else {
        return 0
      }

    } else {
      return 0
    }

  })
  current_autres_ret = linkedSignal(() => {
    let autres_ret = this._devis_store.donnees_currentDevis()?.decompte.find(x => x.numero == this.current_decompte())?.autre_retenue;
    return autres_ret ? autres_ret : 0;
  })

  ligne_cliquer = signal(0);
  is_changed = signal(false);

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
  selected_entreprise = computed(() => {
    let entreprise = this._ssTraitance_store.donnees_sstraitant().find(e => e.id == this._devis_store.donnees_currentDevis()?.entreprise_id);
    return {
      'entreprise': entreprise ? entreprise.enseigne : '',

      'id': entreprise ? entreprise.id : ''
    }
  })
  myAngularxQrCode = computed(() => {
    return this._devis_store.donnees_currentDevis()?.id + '' + this.current_decompte();
  })
  liste_unites = computed(() => {
    return this._unit_store.unites_data()
  })
  dataSourceDP = computed(() => {
    return new MatTableDataSource<any>(this.donnees_decompte())
  })
  totaux = linkedSignal(() => {
    let data = this.data_loaded();
    this.constats = []
    let constats = this.getChildren(data).map(x => {
      let prix = x.element_devis.prix_u;
      let quantite_marche = x.element_devis.quantite;
      let quantite_periode = x.data_periode.map(x => x.quantite_periode).reduce((a, b) => a + b, 0);
      let quantite_prec = x.data_prec.map(x => x.quantite_periode).reduce((a, b) => a + b, 0)
      let montant_periode = (prix ? prix : 0) * quantite_periode;
      let montant_prec = (prix ? prix : 0) * quantite_prec;
      let montant_marche = (prix ? prix : 0) * (quantite_marche ? quantite_marche : 0);
      return {
        'montant_periode': montant_periode,
        'montant_marche': montant_marche,
        'montant_prec': montant_prec
      }

    })
    return {
      'montant_periode': constats.map(x => x.montant_periode).reduce((a, b) => a + b, 0),
      'montant_marche': constats.map(x => x.montant_marche).reduce((a, b) => a + b, 0),
      'montant_prec': constats.map(x => x.montant_prec).reduce((a, b) => a + b, 0),
      'montant_cumul': constats.map(x => x.montant_periode).reduce((a, b) => a + b, 0) + constats.map(x => x.montant_prec).reduce((a, b) => a + b, 0)
    };
  })

  is_dp_exist = computed(() => {
    return this._devis_store.donnees_currentDevis()?.decompte.find(x => x.numero == this.current_decompte()) != undefined
  })

  donnees_decompte = computed(() => {
    let current_devis = this._devis_store.donnees_currentDevis();
    if (!current_devis) return [];
    let dp_precedent = current_devis?.decompte.filter(x => x.numero < this.current_decompte());
    let retenue_gar_prec = 0;
    let rembours_avance_prec = 0;
    let autres_ret_prec = 0;
    if (dp_precedent) {
      retenue_gar_prec = this.totaux().montant_prec * 0.05;
      rembours_avance_prec = dp_precedent.map(x => x.rembours_avance).reduce((a, b) => a + b, 0);
      autres_ret_prec = dp_precedent.map(x => x.autre_retenue).reduce((a, b) => a + b, 0);
    }

    let retenue_gar_periode = this.totaux().montant_periode * 0.05;
    let rembours = this.totaux().montant_marche != 0 ? current_devis.avance * this.totaux().montant_periode / (this.totaux().montant_marche * 0.85) : 0;
    let rembours_avance_periode = 0;
    let autres_ret_periode = 0;
    if (this.is_dp_exist()) {
      let dp_cours = current_devis.decompte.find(x => x.numero == this.current_decompte());
      if (dp_cours) {
        rembours_avance_periode = dp_cours.rembours_avance;
        autres_ret_periode = dp_cours.autre_retenue;
      }
    }
    else {
      rembours_avance_periode = rembours;
      autres_ret_periode = 0;
    }
    let total_ret_prec = (retenue_gar_prec + rembours_avance_prec + autres_ret_prec);
    let total_ret_period = (autres_ret_periode + rembours_avance_periode + retenue_gar_periode);
    let total_ret_cum = total_ret_prec + total_ret_period;
    let montant_net_prec = (this.totaux().montant_prec - total_ret_prec);
    let montant_net_periode = (this.totaux().montant_periode - total_ret_period);
    let montant_net_cumul = (this.totaux().montant_cumul - total_ret_cum);

    let donnees = [];
    donnees.push(
      {
        'titre_precedent': 'DECOMPTE BRUT',
        'montant_precedent': this.totaux().montant_prec,
        'montant_periode': this.totaux().montant_periode,
        'montant_cumul': this.totaux().montant_cumul
      },
      {
        'titre_precedent': 'RETENUES DE GARANTIES',
        'montant_precedent': retenue_gar_prec,
        'montant_periode': retenue_gar_periode,
        'montant_cumul': retenue_gar_periode + retenue_gar_prec
      },
      {
        'titre_precedent': 'REMBOURSEMENTS AVANCE DEMARRAGE',
        'montant_precedent': rembours_avance_prec,
        'montant_periode': rembours_avance_periode,
        'montant_cumul': rembours_avance_periode + rembours_avance_prec
      },
      {
        'titre_precedent': 'AUTRES RETENUES',
        'montant_precedent': autres_ret_prec,
        'montant_periode': autres_ret_periode,
        'montant_cumul': autres_ret_prec + autres_ret_periode
      },
      {
        'titre_precedent': 'TOTAL DES RETENUES',
        'montant_precedent': total_ret_prec,
        'montant_periode': total_ret_period,
        'montant_cumul': total_ret_cum
      }
      ,
      {
        'titre_precedent': 'MONTANT APRES RETENUES',
        'montant_precedent': montant_net_prec,
        'montant_periode': montant_net_periode,
        'montant_cumul': montant_net_cumul
      }
      ,
      {
        'titre_precedent': 'RETENUE AIB',
        'montant_precedent': this.totaux().montant_prec * 0.01,
        'montant_periode': this.totaux().montant_periode * 0.01,
        'montant_cumul': this.totaux().montant_cumul * 0.01
      }
      ,
      {
        'titre_precedent': 'NET A PAYER',
        'montant_precedent': montant_net_prec - this.totaux().montant_prec * 0.01,
        'montant_periode': montant_net_periode - this.totaux().montant_periode * 0.01,
        'montant_cumul': montant_net_cumul - this.totaux().montant_cumul * 0.01
      }
    )
    return donnees;
  })
  num_decompte = linkedSignal(() => {
    let decompte = this._devis_store.donnees_currentDevis()?.decompte;
    if (decompte != undefined) {
      if (decompte.length > 0) {
        return Math.max(...decompte.map(x => x.numero))
      }
      else {
        return 0
      }
    } else {
      return 0
    }

  })

  current_decompte = linkedSignal(() => {
    return this.num_decompte()
  })
  //current properties 
  row_color = ['#5094D8', '#93B3BF', 'white', 'white', 'lightyellow', 'lightcoral', 'lightcyan'];
  columnsToDisplay = ['poste', 'designation', 'unite', 'prix_u', 'quantite_marche',
    'quantite_prec', 'quantite_periode', 'quantite_cumul', 'montant_marche',
    'montant_prec', 'montant_periode', 'montant_cumul', 'taux'];
  columnsTodisplayDp = ['designation', 'precedent', 'periode', 'cumule'];

  qrCodeDownloadLink: SafeUrl = "";
  constats: myconstat[] = [];


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
        montant: null

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
    if (node.children.length == 0) {

      flatNode.montant = (node.prix_u ? node.prix_u : 0) * (node.quantite ? node.quantite : 0);
    }


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
  constructor(private _service: WenService) {
    effect(() => {
      this.init_dat(this.loaded_data());
      if (this._devis_store.donnees_currentDevis()) {

      }
    }
    )
  }
  loaded_data = linkedSignal(() => this._devis_store.donnees_currentDevis()?.data)
  // methods
  ngOnInit() {
    this._devis_store.setCurrentDevisId('');
    this._devis_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/devis');
    this._ssTraitance_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/sous_traitants');
    this._unit_store.setPathString('comptes/' + this._auth_service.current_projet_id() + '/unites');
  }

  init_dat(data: element_devis[] | undefined) {
    if (data) {
      let children = data[0].children;
      let sorting = children.sort((a, b) => a.poste.localeCompare(b.poste))
      data[0].children = sorting;
      this.dataSource.data = data;
      this.treeControl.expandAll();
      this.treeControl.dataNodes.forEach(node => {
        node.montant = 0
      }
      )
      for (let i = this.treeControl.dataNodes.length - 1; i >= 0; i--) {
        let node = this.treeControl.dataNodes[i];
        if (!node.expandable) {
          let flatenNode = this.flatNodeMap.get(node);
          if (flatenNode) {
            let constat = flatenNode.constat;
            let filtre_periode = constat.filter(x => x.numero_decompte == this.current_decompte())
            let filtre_precedente = constat.filter(x => x.numero_decompte < this.current_decompte())
            let qte_periode = filtre_periode.map(x => x.quantite_periode)
            let qte_prec = filtre_precedente.map(x => x.quantite_periode)
            node.quantite_periode = qte_periode.length > 0 ? qte_periode.reduce((a, b) => a + b) : 0;
            node.quantite_prec = qte_prec.length > 0 ? qte_prec.reduce((a, b) => a + b) : 0;
            node.quantite_cumul = node.quantite_prec + node.quantite_periode;
            let prix = node.prix_u ? node.prix_u : 0;
            node.montant_prec = Math.round((node.quantite_prec * prix) * 100) / 100;
            node.montant_periode = Math.round((node.quantite_periode * prix) * 100) / 100;
            node.montant_cumul = Math.round((node.montant_prec + node.montant_periode) * 100) / 100;
            node.montant = (node.prix_u ? node.prix_u : 0) * (node.quantite ? node.quantite : 0);
          }
        }
        let parent = this.getParentNode(this.treeControl.dataNodes[i]);
        if (parent) {
          let montantNode = this.treeControl.dataNodes[i].montant;
          let montant_prec = this.treeControl.dataNodes[i].montant_prec;
          let montant_periode = this.treeControl.dataNodes[i].montant_periode;
          let montant_cumul = this.treeControl.dataNodes[i].montant_cumul;

          let montantNodeprec = parent.montant_prec;
          let montantNodePeriode = parent.montant_periode;
          let montantNodeCumul = parent.montant_cumul;

          let parentmontprec = (montantNodeprec ? montantNodeprec : 0) + (montant_prec ? montant_prec : 0);
          let parentmontperiode = (montantNodePeriode ? montantNodePeriode : 0) + (montant_periode ? montant_periode : 0);
          let parentmontcumul = (montantNodeCumul ? montantNodeCumul : 0) + (montant_cumul ? montant_cumul : 0);

          parent.montant_prec = Math.round(parentmontprec * 100) / 100;
          parent.montant_periode = Math.round(parentmontperiode * 100) / 100;
          parent.montant_cumul = Math.round(parentmontcumul * 100) / 100;

          let montantNodeExist = parent.montant;
          let parentmont = (montantNodeExist ? montantNodeExist : 0) + (montantNode ? montantNode : 0);
          parent.montant = parentmont;

        }
      }

    }
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
    this.constats = []
    this._devis_store.setCurrentDevisId(devis_id);
  }
  next_constat() {
    this.current_decompte.update(x => x + 1);
    this.init_dat(this.loaded_data());
  }
  previous_constat() {
    this.current_decompte.update(x => x - 1);
    this.init_dat(this.loaded_data());
  }

  printAttachement() {
    let devis = this._devis_store.donnees_currentDevis();
    let data_imp = [];
    for (let row of this.treeControl.dataNodes) {
      let montant_marche = row.montant != null ? row.montant : 0;
      let montant_prec = row.montant_prec ? row.montant_prec : 0;
      let montant_periode = row.montant_periode ? row.montant_periode : 0;
      let montant_cumul = montant_periode + montant_prec;
      let unite = this._unit_store.unites_data().find(x => x.id == row.unite)?.unite;
      if (row.expandable) {
        data_imp.push(
          [{
            content: row.poste,
            styles: {
              fontStyle: "bold",
              halign: 'center',
              fillColor: [212, 204, 204]
            }
          },
          {
            content: row.designation,
            colSpan: 4,
            styles: {
              fontStyle: "bold",
              halign: 'left',
              fillColor: [212, 204, 204]
            }
          }
            ,
          {
            content: this._service.FormatMonnaie(montant_marche),
            styles: {
              fontStyle: "bold",
              halign: 'center',
              fillColor: [212, 204, 204]
            }
          }
            ,
          {
            content: '',
            colSpan: 3,
            styles: {
              fontStyle: "bold",
              halign: 'center',
              fillColor: [212, 204, 204]
            }
          },
          {
            content: this._service.FormatMonnaie(montant_prec),
            styles: {
              fontStyle: "bold",
              halign: 'center',
              fillColor: [212, 204, 204]
            }
          }
            ,
          {
            content: this._service.FormatMonnaie(montant_periode),
            styles: {
              fontStyle: "bold",
              halign: 'center',
              fillColor: [212, 204, 204]
            }
          }
            ,
          {
            content: this._service.FormatMonnaie(montant_cumul),
            styles: {
              fontStyle: "bold",
              halign: 'center',
              fillColor: [212, 204, 204]
            }
          }
            ,
          {
            content: montant_marche > 0 ? (montant_cumul / montant_marche * 100).toFixed(2) + ' %' : '',
            styles: {
              fontStyle: "bold",
              halign: 'center',
              fillColor: [212, 204, 204]
            }
          }
          ]
        )
      } else {
        let montant_rec = (row.prix_u ? row.prix_u : 0) * (row.quantite ? row.quantite : 0)
        data_imp.push([row.poste, row.designation, unite,
        this._service.FormatMonnaie(row.prix_u ? row.prix_u : 0),
        row.quantite,
        this._service.FormatMonnaie(montant_rec),
        row.quantite_prec,
        row.quantite_periode,
        row.quantite_cumul,
        this._service.FormatMonnaie(montant_prec),
        this._service.FormatMonnaie(montant_periode),
        this._service.FormatMonnaie(montant_cumul),
        montant_rec > 0 ? (montant_cumul / montant_rec * 100).toFixed(2) + ' %' : ''])
      }


    }
    let totaux_montant = this.treeControl.dataNodes[0].montant ? this.treeControl.dataNodes[0].montant : 0;
    let totaux_montant_prec = this.treeControl.dataNodes[0].montant_prec ? this.treeControl.dataNodes[0].montant_prec : 0;
    let totaux_montant_periode = this.treeControl.dataNodes[0].montant_periode ? this.treeControl.dataNodes[0].montant_periode : 0;
    let totaux_montant_cumul = this.treeControl.dataNodes[0].montant_cumul ? this.treeControl.dataNodes[0].montant_cumul : 0;

    data_imp.push([{
      content: 'MONTANT TOTAL HTVA',
      colSpan: 5,
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'center',
        fillColor: [160, 160, 160]
      }
    },
    {
      content: this._service.FormatMonnaie(this.totaux().montant_marche),
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'center',
        fillColor: [160, 160, 160]
      }
    },

    {
      content: "",
      colSpan: 3,
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'center',
        fillColor: [160, 160, 160]
      }
    },
    {
      content: this._service.FormatMonnaie(totaux_montant_prec),
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'center',
        fillColor: [160, 160, 160]
      }
    },
    {
      content: this._service.FormatMonnaie(totaux_montant_periode),
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'center',
        fillColor: [160, 160, 160]
      }
    },
    {
      content: this._service.FormatMonnaie(totaux_montant_cumul),
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'center',
        fillColor: [160, 160, 160]
      }
    }
      ,
    {
      content: totaux_montant > 0 ? (totaux_montant_cumul / totaux_montant * 100).toFixed(2) + ' %' : '',
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'center',
        fillColor: [160, 160, 160]
      }
    }
    ])
    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
    });
    let head0: any = [{
      content: 'N° POSTE',
      colSpan: 1,
      rowSpan: 2,
      styles: {
        halign: 'center'
      }
    },
    {
      content: 'DESIGNATION',
      colSpan: 1,
      rowSpan: 2,
      styles: {
        halign: 'center'
      }
    },
    {
      content: 'UNITE',
      colSpan: 1,
      rowSpan: 2,
      styles: {
        halign: 'center'
      }
    }
      ,
    {
      content: 'PRIX UNITAIRE',
      colSpan: 1,
      rowSpan: 2,
      styles: {
        halign: 'center'
      }
    },
    {
      content: 'ESTIMATION',
      colSpan: 2,
      rowSpan: 1,
      styles: {
        halign: 'center'
      }
    },
    {
      content: 'EXECUTION',
      colSpan: 6,
      rowSpan: 1,
      styles: {
        halign: 'center'
      }
    },
    {
      content: 'TAUX',
      colSpan: 1,
      rowSpan: 2,
      styles: {
        halign: 'center'
      }
    }]
    let head1: any = [
      'QUANTITE MARCHE', 'MONTANT MARCHE', 'QUANTITE PRECEDENTE', 'QUANTITE PERIODE', 'QUANTITE CUMULEE',
      'MONTANT PRECEDENT', 'MONTANT PERIODE', 'MONTANT CUMULE'];

    let doker: any = {
      startY: 55,
      tableLineWidth: 0.1,
      head: [head0, head1],
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        valign: "middle",
        halign: "center",
      },
      headStyles: {
        fontStyle: "bold",
        fontSize: 8,
        textColor: [0, 0, 0],
        fillColor: [160, 160, 160],
      },
      bodyStyles: {
        fontSize: 8,
        minCellHeight: 10
      },

      columnStyles: {
        3: {
          cellWidth: 22
        },
        5: {
          cellWidth: 22
        },
        9: {
          cellWidth: 22
        }
        ,
        10: {
          cellWidth: 22
        }
        ,
        11: {
          cellWidth: 22
        }
      },
      body: data_imp,
      theme: "grid"
    };
    doc.setFont('times', 'bold');
    doc.setFontSize(12)
    let titre = "ATTACHEMENT DES TRAVAUX N° " + this.current_decompte();
    var titreX = (doc.internal.pageSize.getWidth() - doc.getTextWidth(titre)) / 2
    var textWidth = doc.getTextWidth(titre) + 20;

    doc.text("DECOMPTE N°: " + this.current_decompte(), 20, 30);
    doc.text("ENTREPRISE: " + this.selected_entreprise().entreprise, 20, 40);
    doc.text("N° MARCHE: " + devis?.reference, 20, 50);
    doc.setFillColor(160, 160, 160);
    doc.rect(titreX - 10, 15, textWidth, 10, 'DF');
    doc.text(titre, titreX, 20);
    autoTable(doc, doker);
    let finalY = (doc as any).lastAutoTable.finalY;
    if (finalY > doc.internal.pageSize.getHeight() - 40) {
      finalY = 40;
      doc.addPage();
    }

    let signature_ent = 'Nom et Visa: Entreprise';
    let signature_cge = 'Nom et Visa : CGE BTP';
    doc.setFontSize(10);
    doc.setFont('Newsreader', 'normal');
    doc.text(signature_ent, 15, finalY + 10)
    doc.text(signature_cge, 220, finalY + 10)

    doc.text('Date:', 15, finalY + 30)
    doc.text('Date:', 220, finalY + 30)


    const totalPages: number = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(8)
    var img = new Image();
    img.src = 'assets/images/logo_index.png';
    for (let i = 1; i <= totalPages; i++) {
      doc.line(10, doc.internal.pageSize.getHeight() - 10, doc.internal.pageSize.getWidth() - 10, doc.internal.pageSize.getHeight() - 10);
      //pdfDoc.addImage(img, 'png', 180, 3, 15, 10)
      doc.setPage(i);
      doc.setFont('Newsreader', 'italic');
      doc.text(
        `Page ${i} / ${totalPages}`,
        doc.internal.pageSize.getWidth() - 40,
        doc.internal.pageSize.getHeight() - 5, { align: 'justify' }
      );
    }
    doc.addImage(this.imageUrl(), doc.internal.pageSize.getWidth() - 40, 10, 30, 30);
    doc.save('attachement_' + this.selected_entreprise().entreprise + '_' + new Date().getTime() + '.pdf');
  }
  printDecompte() {
    let dp_precedent = this._devis_store.donnees_currentDevis()?.decompte.filter(x => x.numero < this.current_decompte());
    let dpPeriode = this._devis_store.donnees_currentDevis()?.decompte.find(x => x.numero == this.current_decompte());

    let avance_periode = dpPeriode ? dpPeriode.rembours_avance : 0;
    let avance_prec = this._service.somme(dp_precedent?.map(x => x.rembours_avance));


    let ret_gar_periode = this.totaux().montant_periode * 0.05;
    let ret_gar_prec = this.totaux().montant_prec * 0.05;

    let ret_autre_periode = dpPeriode ? dpPeriode.autre_retenue : 0;
    let ret_autre_prec = this._service.somme(dp_precedent?.map(x => x.autre_retenue));


    let devis = this._devis_store.donnees_currentDevis()

    let net_a_payer_prec = this.totaux().montant_prec - ret_autre_prec - ret_gar_prec - avance_prec - this.totaux().montant_prec * 0.01;
    this.net_a_payer_prec.set(net_a_payer_prec);
    let net_a_payer_periode = this.totaux().montant_periode - ret_autre_periode - ret_gar_periode - avance_periode - this.totaux().montant_periode * 0.01;
    this.net_a_payer_actuel.set(net_a_payer_periode);
    let net_a_payer_cumul = net_a_payer_periode + net_a_payer_prec;
    let data_imp = []

    data_imp.push([{
      content: 'MONTANT DU MARCHE HTVA',
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'left',
      }
    },
    {
      content: this._service.FormatMonnaie(this.totaux().montant_marche),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },
    {
      content: this._service.FormatMonnaie(this.totaux().montant_marche),
      styles: {
        fontSize: 8,
        halign: 'center',

      }
    }
      ,
    {
      content: this._service.FormatMonnaie(this.totaux().montant_marche),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    }
      ,
    {
      content: this._service.FormatMonnaie(this.totaux().montant_marche),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    }

    ]);
    data_imp.push([{
      content: "MONTANT BRUT DU DECOMPTE HTVA",
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'left',
      }
    },
    {
      content: this._service.FormatMonnaie(this.totaux().montant_prec),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },

    {
      content: this._service.FormatMonnaie(this.totaux().montant_periode),
      styles: {
        fontSize: 8,
        halign: 'center',

      }
    }
      ,
    {
      content: this._service.FormatMonnaie(this.totaux().montant_cumul),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },
    {
      content: this._service.FormatMonnaie(this.totaux().montant_marche - this.totaux().montant_cumul),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    }

    ]);
    data_imp.push([{
      content: "TAUX D'AVANCEMENT",
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'left',
      }
    },
    {
      content: (this.totaux().montant_prec / this.totaux().montant_marche * 100).toFixed(2) + ' %',
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },

    {
      content: (this.totaux().montant_periode / this.totaux().montant_marche * 100).toFixed(2) + ' %',
      styles: {
        fontSize: 8,
        halign: 'center',

      }
    }
      ,

    {
      content: (this.totaux().montant_cumul / this.totaux().montant_marche * 100).toFixed(2) + ' %',
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },

    {
      content: (100 - this.totaux().montant_cumul / this.totaux().montant_marche * 100).toFixed(2) + ' %',
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    }

    ]);
    data_imp.push([{
      content: "RETENUES EFFECTUEES",
      colSpan: 5,
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'left',
        fillColor: [205, 209, 213]
      }
    }
    ]);
    ;
    data_imp.push([{
      content: "REMBOURSEMENT AVANCE DEMARRAGE",
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'right',
      }
    },
    {
      content: this._service.FormatMonnaie(avance_prec),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },

    {
      content: this._service.FormatMonnaie(avance_periode),
      styles: {
        fontSize: 8,
        halign: 'center',

      }
    }
      ,

    {
      content: this._service.FormatMonnaie(avance_prec + avance_periode),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    }
      ,

    {
      content: this._service.FormatMonnaie(devis ? devis.avance - avance_prec - avance_periode : 0 - avance_prec - avance_periode),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    }
    ]);
    data_imp.push([{
      content: "RETENUE DE GARANTIE",
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'right',
      }
    },
    {
      content: this._service.FormatMonnaie(ret_gar_prec),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },

    {
      content: this._service.FormatMonnaie(ret_gar_periode),
      styles: {
        fontSize: 8,
        halign: 'center',

      }
    }
      ,

    {
      content: this._service.FormatMonnaie(ret_gar_periode + ret_gar_prec),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },

    {
      content: this._service.FormatMonnaie(this.totaux().montant_marche * 0.05 - ret_gar_periode - ret_gar_prec),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    }

    ]);
    ;
    data_imp.push([{
      content: "AUTRES RETENUES",
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'right'
      }
    },
    {
      content: this._service.FormatMonnaie(ret_autre_prec),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },

    {
      content: this._service.FormatMonnaie(ret_autre_periode),
      styles: {
        fontSize: 8,
        halign: 'center',

      }
    }
      ,

    {
      content: this._service.FormatMonnaie(ret_autre_prec + ret_autre_periode),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    }

    ]);
    data_imp.push([{
      content: "TOTAL DES RETENUES",
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'left',
        fillColor: [205, 209, 213]
      }
    },
    {
      content: this._service.FormatMonnaie((ret_autre_prec + avance_prec + ret_gar_prec)),
      styles: {
        fontSize: 8,
        halign: 'center',
        fillColor: [205, 209, 213]
      }
    },

    {
      content: this._service.FormatMonnaie((ret_autre_periode + avance_periode + ret_gar_periode)),
      styles: {
        fontSize: 8,
        halign: 'center',
        fillColor: [205, 209, 213]

      }
    }
      ,
    {
      content: this._service.FormatMonnaie((ret_autre_prec + avance_prec + ret_gar_prec) +
        (ret_autre_periode + avance_periode + ret_gar_periode)),
      styles: {
        fontSize: 8,
        halign: 'center',
        fillColor: [205, 209, 213]
      }
    },
    {
      content: '',
      styles: {
        fontSize: 8,
        halign: 'center',
        fillColor: [205, 209, 213]
      }
    }]);

    data_imp.push([{
      content: "MONTANT APRES RETENUES",
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'left'
      }
    },
    {
      content: this._service.FormatMonnaie(this.totaux().montant_prec - (ret_autre_prec + avance_prec + ret_gar_prec)),
      styles: {
        fontSize: 8,
        halign: 'center'
      }
    },

    {
      content: this._service.FormatMonnaie(this.totaux().montant_periode - (ret_autre_periode + avance_periode + ret_gar_periode)),
      styles: {
        fontSize: 8,
        halign: 'center'

      }
    }
      ,
    {
      content: this._service.FormatMonnaie(this.totaux().montant_cumul - (ret_autre_prec + avance_prec + ret_gar_prec) +
        (ret_autre_periode + avance_periode + ret_gar_periode)),
      styles: {
        fontSize: 8,
        halign: 'center'
      }
    },
    {
      content: ''

    }]);

    data_imp.push([{
      content: "RETENUES AIB",
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'left'
      }
    },
    {
      content: this._service.FormatMonnaie(this.totaux().montant_prec * 0.01),
      styles: {
        fontSize: 8,
        halign: 'center'
      }
    },

    {
      content: this._service.FormatMonnaie(this.totaux().montant_periode * 0.01),
      styles: {
        fontSize: 8,
        halign: 'center'

      }
    }
      ,
    {
      content: this._service.FormatMonnaie(this.totaux().montant_cumul * 0.01),
      styles: {
        fontSize: 8,
        halign: 'center'
      }
    }
      ,
    {
      content: this._service.FormatMonnaie(this.totaux().montant_marche * 0.01 - this.totaux().montant_cumul * 0.01),
      styles: {
        fontSize: 8,
        halign: 'center'
      }
    }]);
    data_imp.push([{
      content: "NET A PAYER",
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'left',
        fillColor: [160, 160, 160],
      }
    },
    {
      content: this._service.FormatMonnaie(net_a_payer_prec),
      styles: {
        fontSize: 8,
        halign: 'center',
        fontStyle: "bold",
        fillColor: [160, 160, 160],
      }
    },

    {
      content: this._service.FormatMonnaie(net_a_payer_periode),
      styles: {
        fontSize: 8,
        halign: 'center',
        fontStyle: "bold",
        fillColor: [160, 160, 160]

      }
    }
      ,
    {
      content: this._service.FormatMonnaie(net_a_payer_cumul),
      styles: {
        fontSize: 8,
        halign: 'center',
        fontStyle: "bold",
        fillColor: [160, 160, 160]
      }
    },
    {
      content: '',
      styles: {
        fontSize: 8,
        halign: 'center',
        fillColor: [160, 160, 160]
      }
    }]);


    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
    });
    let head0: any = [{
      content: 'DECOMPTE N° ' + this.current_decompte(),
      colSpan: 5,
      rowSpan: 1,
      styles: {
        fontSize: 12,
        halign: 'center',
        fillColor: [160, 160, 160]
      }
    }]
    let head1: any = [{
      content: 'MONTANT DU MARCHE EN F CFA HTVA',
      colSpan: 3,
      rowSpan: 1,
      styles: {
        halign: 'center',
        fillColor: [232, 239, 247],

      }
    },
    {
      content: this._service.FormatMonnaie(this.totaux().montant_marche),
      colSpan: 2,
      rowSpan: 1,
      styles: {
        halign: 'center',
        fillColor: [232, 239, 247],
      }
    }];
    let head2: any = [{
      content: 'AVANCE DE DEMARRAGE PERCUE EN F CFA',
      colSpan: 3,
      rowSpan: 1,
      styles: {
        halign: 'center',
        fillColor: [232, 239, 247],
      }
    },
    {
      content: this._service.FormatMonnaie(devis?.avance),
      colSpan: 2,
      rowSpan: 1,
      styles: {
        halign: 'center',
        fillColor: [232, 239, 247],
      }
    }];
    let head3: any = [{
      content: 'DESIGNATION',

      styles: {
        halign: 'center',

        fillColor: [160, 160, 160],
      }
    },
    {
      content: 'SITUATION PRECEDENTE',

      styles: {
        halign: 'center',

        fillColor: [160, 160, 160],
      }
    }
      ,
    {
      content: 'SITUATION DE LA PERIODE',

      styles: {
        halign: 'center',
        fillColor: [160, 160, 160],
      }
    },
    {
      content: 'SITUATION CUMULEE ACTUELLE',

      styles: {
        halign: 'center',

        fillColor: [160, 160, 160],
      }
    },
    {
      content: 'RESTE A FACTURER',

      styles: {
        halign: 'center',

        fillColor: [160, 160, 160],
      }
    }];

    let doker: any = {
      tableLineColor: [0, 0, 0],
      startY: 75,
      tableLineWidth: 0.25,
      head: [head0, head1, head2, head3],
      styles: {
        textColor: [0, 0, 0],
        overflow: 'linebreak',
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        valign: "middle",
        halign: "center",
      },
      headStyles: {
        fontStyle: "bold",
        fontSize: 10,
        textColor: [0, 0, 0]
      },
      bodyStyles: {
        fontSize: 8,
        minCellHeight: 10
      },

      columnStyles: {
        1: {
          cellWidth: 30
        },
        2: {
          cellWidth: 30
        },
        3: {
          cellWidth: 30
        }
        ,
        4: {
          cellWidth: 30
        }
        ,
      },
      body: data_imp,
      theme: "striped"
    };
    doc.setFont('times', 'bold');
    doc.setFontSize(12)
    let entrepr = "ENTREPRISE : " + this.selected_entreprise().entreprise;
    let marche = "N° MARCHE : " + this._service.Majuscule(devis?.reference);
    let travaux = "TRAVAUX : " + this._service.Majuscule(devis?.objet);
    doc.text(entrepr, 20, 30);
    doc.text(marche, 20, 40);
    doc.text(travaux, 20, 50);

    doc.text("CLIENT: CGE BTP", 20, 60);

    doc.text("CHANTIER: VILLE NOUVELLE DE YENNENGA", 20, 70);

    autoTable(doc, doker);
    let finalY = (doc as any).lastAutoTable.finalY;
    if (finalY > doc.internal.pageSize.getHeight() - 40) {
      finalY = 20;
      doc.addPage();
    }

    let signature_ent = "Pour l'Entreprise";
    let signature_cge = 'Pour CGE BTP';
    doc.setFontSize(12);
    doc.setFont('Newsreader', 'normal');
    doc.text(signature_ent, 15, finalY + 10)
    doc.text(signature_cge, 150, finalY + 10)

    doc.text('Date:', 15, finalY + 40)
    doc.text('Date:', 150, finalY + 40)

    const totalPages: number = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(8)
    var img = new Image()
    img.src = 'assets/images/logo_index.png'
    for (let i = 1; i <= totalPages; i++) {
      doc.line(10, doc.internal.pageSize.getHeight() - 8, doc.internal.pageSize.getWidth() - 10, doc.internal.pageSize.getHeight() - 10);

      doc.setPage(i);
      doc.setFont('Newsreader', 'italic');
      doc.text(
        `Page ${i} / ${totalPages}`,
        doc.internal.pageSize.getWidth() - 40,
        doc.internal.pageSize.getHeight() - 3, { align: 'justify' }
      );
    }
    doc.addImage(this.imageUrl(), doc.internal.pageSize.getWidth() / 2 - 10, doc.internal.pageSize.getHeight() - 30, 20, 20);

    doc.save('ficheDP_' + this.selected_entreprise().entreprise + '_' + new Date().getTime() + '.pdf');
  }
  printFacture() {
    if (this.is_dp_exist()) {
      let dp_precedent = this._devis_store.donnees_currentDevis()?.decompte.filter(x => x.numero < this.current_decompte());
      let dpPeriode = this._devis_store.donnees_currentDevis()?.decompte.find(x => x.numero == this.current_decompte());

      let avance_periode = dpPeriode ? dpPeriode.rembours_avance : 0;
      let avance_prec = this._service.somme(dp_precedent?.map(x => x.rembours_avance));


      let ret_gar_periode = this.totaux().montant_periode * 0.05;
      let ret_gar_prec = this.totaux().montant_prec * 0.05;

      let ret_autre_periode = dpPeriode ? dpPeriode.autre_retenue : 0;
      let ret_autre_prec = this._service.somme(dp_precedent?.map(x => x.autre_retenue));

      let devis = this._devis_store.donnees_currentDevis();

      let net_a_payer_prec = this.totaux().montant_prec - ret_autre_prec - ret_gar_prec - avance_prec - this.totaux().montant_prec * 0.01;
      this.net_a_payer_prec.set(net_a_payer_prec);
      let net_a_payer_periode = this.totaux().montant_periode - ret_autre_periode - ret_gar_periode - avance_periode - this.totaux().montant_periode * 0.01;
      this.net_a_payer_actuel.set(net_a_payer_periode);

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
      });



      let data_imp = []
      let data_imp_table2 = []
      data_imp.push([{
        content: 'ENTREPRISE: ' + this.selected_entreprise().entreprise,
        styles: {
          fontStyle: "bold",
          halign: 'left',
        }
      }
      ]);

      data_imp.push([{
        content: 'N° DU CONTRAT: ' + devis?.reference,
        styles: {
          fontStyle: "bold",
          halign: 'left',
        }
      }
      ]);
      data_imp.push([{
        content: 'CLIENT: CGE BTP ',
        styles: {
          fontStyle: "bold",
          halign: 'left',
        }
      }
      ]);
      data_imp.push([{
        content: 'CHANTIER: VILLE NOUVELLE DE YENNENGA/ TRANCHE 03',
        styles: {
          fontStyle: "bold",
          halign: 'left',
        }
      }
      ]);
      data_imp.push([{
        content: 'TRAVAUX: ' + this._service.Majuscule(devis?.objet),
        styles: {
          fontStyle: "bold",
          halign: 'left',
        }
      }
      ]);

      data_imp_table2.push([{
        content: "1",
        styles: {
          fontStyle: "bold",
          halign: 'center',
        }
      }, {
        content: "MONTANT DU CONTRAT HTVA",
        styles: {
          fontStyle: "bold",
          halign: 'center',
        }
      },
      {
        content: this._service.FormatMonnaie(this.totaux().montant_marche),
        styles: {
          fontStyle: "bold",
          halign: 'center',
        }
      }
      ]);
      data_imp_table2.push([{
        content: "2",
        styles: {
          fontStyle: "bold",
          halign: 'center',
        }
      }, {
        content: "MONTANT DES ACOMPTES PRECEDENTS",
        styles: {
          fontStyle: "bold",
          halign: 'center',
        }
      },
      {
        content: this._service.FormatMonnaie(this.net_a_payer_prec()),
        styles: {
          fontStyle: "bold",
          halign: 'center',
        }
      }
      ]);
      data_imp_table2.push([{
        content: "3",
        styles: {
          fontStyle: "bold",
          halign: 'center',
        }
      }, {
        content: "MONTANT DE LA PRESENTE FACTURE HTVA",
        styles: {
          fontStyle: "bold",
          halign: 'center',
        }
      },
      {
        content: this._service.FormatMonnaie(this.net_a_payer_actuel()),
        styles: {
          fontSize: 12,
          fontStyle: "bold",
          halign: 'center',
        }
      }
      ]);

      doc.setFont('times', 'normal');
      doc.setFontSize(12)
      let doit = "CGE BTP SA"
      let secteur = "Secteur: 23; section EY; Lot: 53; Parcelle: F12; Avenue Babanguida";
      let bp = "01 BP 1337 Ouagadougou 01";
      let tel = "Tél: 25 36 11 87";;
      let rccm = "R.C.C.M: BF OUA 2021 M 13808";
      let ifu = "IFU: N° 00001074R - Régime d'Imposition: RN";
      let dge = "Division fiscale: DGE Ouagadougou Burkina Faso";

      var yline = 55;
      doc.text(doit, 20, yline);
      doc.text(secteur, 20, yline + 5);
      doc.text(bp, 20, yline + 10);
      doc.text(tel, 20, yline + 15);
      doc.text(rccm, 20, yline + 20);
      doc.text(ifu, 20, yline + 25);
      doc.text(dge, 20, yline + 30);
      doc.setLineWidth(.5)
      doc.line(18, yline - 5, 150, yline - 5);
      doc.line(18, yline - 5, 18, yline + 35);
      doc.line(18, yline + 35, 150, yline + 35);
      doc.line(150, yline - 5, 150, yline + 35);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      let facture = "FACTURE N° 00" + this.current_decompte() + "/" + this.selected_entreprise().entreprise + "/TR03/2024"
      let textWidth = doc.getTextWidth(facture);
      var yline = yline + 35;
      doc.setLineWidth(1)
      doc.setFillColor(225, 225, 225);
      doc.rect(doc.internal.pageSize.getWidth() / 2 - textWidth / 2 - 5, yline + 5, textWidth + 10, 15, 'FD');


      doc.text(facture, doc.internal.pageSize.getWidth() / 2 - textWidth / 2, yline + 13);

      var yline = yline + 20;
      let table1: any = {
        tableLineColor: [0, 0, 0],
        startY: yline + 2.5,
        tableLineWidth: 0.10,
        styles: {
          textColor: [0, 0, 0],
          overflow: 'linebreak',
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          valign: "middle",
          halign: "center",
        },
        headStyles: {
          fontStyle: "bold",
          fontSize: 10,
          textColor: [0, 0, 0]
        },
        bodyStyles: {
          fontSize: 10,
          minCellHeight: 10
        },

        columnStyles: {
          1: {
            cellWidth: 60
          }
          ,
        },
        body: data_imp,
        theme: "plain"
      };

      autoTable(doc, table1);
      let finalY1 = (doc as any).lastAutoTable.finalY;
      if (finalY1 > doc.internal.pageSize.getHeight() - 40) {
        finalY1 = 20;
        doc.addPage();
      }
      let head0: any = [{
        content: "N°",
        styles: {
          fontSize: 12,
          halign: 'center',
          fillColor: [160, 160, 160]
        }
      },
      {
        content: "DESIGNATION",
        styles: {
          fontSize: 12,
          halign: 'center',
          fillColor: [160, 160, 160]
        }
      }
        ,
      {
        content: "MONTANT (F CFA)",
        styles: {
          fontSize: 12,
          halign: 'center',
          fillColor: [160, 160, 160]
        }
      }];
      let table2: any = {
        tableLineColor: [0, 0, 0],
        startY: finalY1 + 5,
        tableLineWidth: 0.25,
        head: [head0],
        styles: {
          textColor: [0, 0, 0],
          overflow: 'linebreak',
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          valign: "middle",
          halign: "center",
        },
        headStyles: {
          fontStyle: "bold",
          fontSize: 12,
          textColor: [0, 0, 0]
        },
        bodyStyles: {
          fontSize: 12,
          minCellHeight: 10
        },

        columnStyles: {
          2: {
            cellWidth: 60
          }

        },
        body: data_imp_table2,
        theme: "plain"
      };
      autoTable(doc, table2);
      let finalY2 = (doc as any).lastAutoTable.finalY;
      if (finalY2 > doc.internal.pageSize.getHeight() - 40) {
        finalY2 = 20;
        doc.addPage();
      }
      let wrapWidth = 180
      doc.setFontSize(11);
      let arrete = 'Arrêté la présente facture à la somme de ' +
        this._service.NumberToLetter(Math.round(net_a_payer_periode)) +
        " (" + this._service.FormatMonnaie(net_a_payer_periode) + ') F CFA HTVA.'
      let arreteM = this._service.Majuscule(arrete);
      const splitText = doc.splitTextToSize(arreteM, wrapWidth);
      let line = finalY2 + 10
      for (var i = 0, length = splitText.length; i < length; i++) {
        if (line >= doc.internal.pageSize.getHeight() - 15) {
          doc.addPage()
          line = 20
        }
        doc.text(splitText[i], 20, line)
        line = 7 + line
      }

      let signature_ent = "Ouagadougou, le " + new Date().toLocaleDateString();
      doc.setFontSize(12);
      doc.setFont('Newsreader', 'normal');
      doc.text(signature_ent, 145, line)
      doc.setFont('Newsreader', 'bold');
      doc.text("Le Directeur Général", 145, line + 7)

      doc.save('Facture' + this.selected_entreprise().entreprise + '_' + new Date().getTime() + '.pdf');
    }
    else {
      alert("POUR IMPRIMER LA FACTURE VOUS DEVEZ D'ABORD ENREGISTRER jLA FICHE DE DECOMPTE")
    }

  }
  onChangeURL(url: SafeUrl) {
    this.imageUrl.set(this.download(url))
  }
  download(url: any) {
    const qrcode = document.getElementById('qrcode');
    let doc = new jsPDF();

    let imageData = this.getBase64Image(qrcode?.firstChild?.firstChild);
    return imageData
  }
  getBase64Image(img: any) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx?.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL;
  }
  saisie() {
    this.is_changed.set(true)
  }
  saveDp() {
    let decompte = this._devis_store.donnees_currentDevis()?.decompte
    if (decompte) {
      let ind = decompte.map(x => x.numero).indexOf(this.current_decompte());
      if (ind != -1) {
        decompte[ind] = {
          ...decompte[ind],
          rembours_avance: this.current_avance(),
          retenue_garantie: this.totaux().montant_periode * 0.05,
          autre_retenue: this.current_autres_ret()
        }
        this._devis_store.addDecompteDevis(decompte)
      }
    }
    this.is_changed.set(false);
    this.ligne_cliquer.set(0);
  }
  clicker(ind: number) {
    this.ligne_cliquer.set(ind)
  }
  Annuler() {
    this.is_changed.set(false)
    this.ligne_cliquer.set(Infinity)
    this.current_autres_ret.update(x => {
      let autres_ret = this._devis_store.donnees_currentDevis()?.decompte.find(x => x.numero == this.current_decompte())?.autre_retenue;
      return autres_ret ? autres_ret : 0;
    })

  }
  Quitter() {
    if (!this.is_changed()) {
      this.is_table_opened.set(false);
    }
    else { alert('ENREGISTRER AVANT DE QUITTER') }

  }

  open_decompte() {
    this.is_table_opened.set(true);
  }
  getChildren(data: element_devis[] | undefined) {

    if (data) {
      data.forEach((each) => {

        if (each.children.length == 0) {

          this.constats.push({
            element_devis: each,
            data_periode: each.constat.filter(x => x.numero_decompte == this.current_decompte()),
            data_prec: each.constat.filter(x => x.numero_decompte < this.current_decompte())
          });

        }
        this.getChildren(each.children);
      });
    }
    return this.constats;
  }
}
