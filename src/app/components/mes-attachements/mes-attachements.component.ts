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
  imageUrl = signal('');
  ligne_clicked = signal(Infinity);
  is_table_opened = signal(false);
  current_avance = signal(0);
  current_autres_ret = signal(0);
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
  totaux = computed(() => {
    let node = this.treeControl.dataNodes[0];

    return {
      'montant_marche': node.montant ? node.montant : 0,
      'montant_prec': node.montant_prec ? node.montant_prec : 0,
      'montant_periode': node.montant_periode ? node.montant_periode : 0,
      'montant_cumul': node.montant_cumul ? node.montant_cumul : 0
    }
  })
  is_dp_exist = computed(() => {
    return this._devis_store.donnees_currentDevis()?.decompte.find(x => x.numero == this.current_decompte()) != undefined
  })

  donnees_decompte = computed(() => {
    let current_devis = this._devis_store.donnees_currentDevis();
    let dp_precedent = current_devis?.decompte.filter(x => x.numero < this.current_decompte());

    let retenue_gar_prec = this.totaux().montant_prec * 0.05;
    let rembours_avance_prec = this._service.somme(dp_precedent?.map(x => x.rembours_avance));
    let autres_ret_prec = this._service.somme(dp_precedent?.map(x => 0));

    let retenue_gar_periode = this.totaux().montant_periode * 0.05;
    let rembours = current_devis != undefined ? current_devis.avance * this.totaux().montant_periode / (this.totaux().montant_marche * 0.85) : 0;

    let rembours_avance_periode = 0;
    let autres_ret_periode = 0;
    if (this.is_dp_exist()) {
      let dp_cours = current_devis?.decompte.find(x => x.numero == this.current_decompte());
      if (dp_cours) {
        rembours_avance_periode = dp_cours.rembours_avance;
        autres_ret_periode = dp_cours.autre_retenue;
      }
    }
    else {
      rembours_avance_periode = rembours;
      autres_ret_periode = 0;
    }

    let total_ret_prec = (autres_ret_prec + rembours_avance_prec + retenue_gar_prec);
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
  constats: element_constat[] = [];

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
    this.constats = [];
    this._devis_store.setCurrentDevisId(devis_id);
  }
  next_constat() {
    this.current_decompte.update(x => x + 1);
  }
  previous_constat() {
    this.current_decompte.update(x => x - 1);
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
    if (this.is_dp_exist()) {
      let ind = this._devis_store.donnees_currentDevis()?.decompte.map(x => x.numero).indexOf(this.current_decompte())
      let data: element_decompte[] | undefined = this._devis_store.donnees_currentDevis()?.decompte.map(x => ({
        ...x,
        rembours_avance: this.current_avance(),
        retenue_garantie: this.totaux().montant_periode * 0.05,
        autre_retenue: this.current_autres_ret()
      }))
      this._devis_store.addDecompteDevis(data)
    }

    this.is_changed.set(false);
    this.ligne_cliquer.set(0);
  }
  clicker(ind: number) {
    this.ligne_cliquer.set(ind)
  }
  Annuler() {
    this.is_table_opened.set(false);
  }
  Quitter() {
    if (!this.is_changed()) {
      this.is_table_opened.set(false);
    }
    else { alert('ENREGISTRER AVANT DE QUITTER') }

  }
  printDecompte() {

  }
  open_decompte(){
   this.is_table_opened.set(true);
  }
}
