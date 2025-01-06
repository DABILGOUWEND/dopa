import { Component, computed, effect, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { DevisStore, SstraitantStore, UnitesStore } from '../../store/appstore';
import { Devis, element_constat, element_decompte, element_devis, ExampleFlatNode2, Ligne_devis } from '../../models/modeles';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AuthenService } from '../../authen.service';
import { BehaviorSubject } from 'rxjs';
import { UnitesPipe } from '../../unites.pipe';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DateTime, Info, Interval } from 'luxon';
import { sign } from 'node:crypto';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
export type myconstat = {
  'element_devis': element_devis,
  'data': element_constat[]
}
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
  current_constat = linkedSignal(() => {
    let num_constat = 0;
    let index = this.clicked_index();
    if (index != null) {
      let node = this.treeControl.dataNodes[index];
      let element = this.flatNodeMap.get(node);
      if (element != undefined) {
        let constats = element.constat.filter(x => x.numero_decompte == this.current_decompte())
        num_constat = Math.max(...constats.map(x => x.numero));
      }
    }
    return num_constat
  })
  numero_constat = signal(0);
  clicked_quantite_marche = signal(0)
  clicked_qte_prec = signal(0);
  clicked_qte_periode = signal(0);
  clicked_qte_cumul = signal(0);
  selected_poste_id = signal('');
  modif_constat = signal<any>(undefined)
  is_updated = signal(false);
  clicked_index = signal<number | null>(null)

  is_table_opened = signal(false)
  datas = signal<element_devis[] | undefined>(undefined)
  selected_entreprise = computed(() => {
    let entreprise = this._ssTraitance_store.donnees_sstraitant().find(e => e.id == this._devis_store.donnees_currentDevis()?.entreprise_id);
    return {
      'entreprise': entreprise ? entreprise.enseigne : '',

      'id': entreprise ? entreprise.id : ''
    }
  })

  my_postes = signal<element_devis[] | undefined>(undefined)
  //computed properties
  data_loaded = computed(() => this._devis_store.donnees_currentDevis()?.data)

  liste_devis = computed(() => {
    return this._devis_store.donnees_devis().map(ent => {
      let entreprise = this._ssTraitance_store.donnees_sstraitant().find(e => e.id == ent.entreprise_id);
      return ({
        'id': ent.id,
        'entreprise': entreprise ? entreprise.enseigne : '',
        'travaux': ent.reference
      });
    })

  })

  montant_total = computed(() => {
    let data = this.data_loaded();

    this.constats = []
    let constats = this.getChildren(data).map(x => {
      let prix = x.element_devis.prix_u;
      let quantite_marche = x.element_devis.quantite;
      let quantite_periode = x.data.map(x => x.quantite_periode).reduce((a, b) => a + b, 0)
      let montant_periode = (prix ? prix : 0) * quantite_periode;
      let montant_marche = (prix ? prix : 0) * (quantite_marche ? quantite_marche : 0);
      return {
        'montant_periode': montant_periode,
        'montant_marche': montant_marche
      }

    })
    return {
      'montant_periode': constats.map(x => x.montant_periode).reduce((a, b) => a + b, 0),
      'montant_marche': constats.map(x => x.montant_marche).reduce((a, b) => a + b, 0)
    };
  })

  constats_decompte = linkedSignal<any | []>(() => {
    return []
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

  database_constat = computed(
    () => new MatTableDataSource<any>(this.constats_decompte()),
  );
  //current properties 
  current_clicked = computed(() => {
    let index = this.clicked_index();
    if (index != null) {
      let node = this.treeControl.dataNodes[index];
      let element = this.flatNodeMap.get(node);
      return element
    } else {
      return undefined
    }
  }
  )
  constats: myconstat[] = [];
  myconstats: myconstat[] = [];
  table_update_form: FormGroup;
  flatenode = signal<ExampleFlatNode2 | undefined>(undefined)
  ligne_clicked = signal(Infinity);
  displayedColumns = ['poste', 'designation', 'unite', 'prix_u', 'quantite', 'quantite_prec', 'quantite_periode', 'quantite_cumul', 'actions'];
  displayedColumnsConstat = ['numero', 'date', 'quantite', 'description', 'actions'];
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
  constructor(
    private _fb: FormBuilder
  ) {
    this.table_update_form = _fb.group({
      'quantite_mois': new FormControl('', Validators.required),
      'description': new FormControl(''),
      'date': new FormControl(new Date().toLocaleDateString(), Validators.required)

    })
    effect(() => {
      let data = this._devis_store.donnees_currentDevis()?.data;
      this.init_table(data);
    }
    )
  }
  // methods
  ngOnInit() {
    this._devis_store.setCurrentDevisId('')
  }

  init_table(data: element_devis[] | undefined) {

    if (data != undefined) {
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
              let quantites_prec = constat.filter(x => x.numero_decompte < this.current_decompte()).map(c => c.quantite_periode);
              let quantites_per = constat.filter(x => x.numero_decompte == this.current_decompte()).map(c => c.quantite_periode);
              if (quantites_prec.length > 0) {
                node.quantite_prec = quantites_prec.reduce((a, b) => a + b);
              } else {
                node.quantite_prec = 0;
              }
              if (quantites_per.length > 0) {
                node.quantite_periode = quantites_per.reduce((a, b) => a + b);
              } else {
                node.quantite_periode = 0;
              }
              node.quantite_cumul = node.quantite_prec + node.quantite_periode;
            }
          }
        }

      }
    }
  }

  new_decompte() {
    let numero = this.num_decompte();
    let decompte = this._devis_store.donnees_currentDevis()?.decompte;
    let newD = {
      'numero': numero + 1,
      'date': new Date().toLocaleDateString(),
      'retenue_garantie': 0,
      'rembours_avance': 0,
    }
    let mod_decompte = decompte ? [...decompte, newD] : [newD];
    this._devis_store.addDecompteDevis(mod_decompte);
  }
  selecteDevis(devis_id: string) {
    this.constats = []
    this._devis_store.setCurrentDevisId(devis_id);
  }
  next_decompte() {
    this.current_decompte.update(x => x + 1);
  }
  previous_decompte() {
    this.current_decompte.update(x => x - 1);
  }
  getChildren(data: element_devis[] | undefined) {

    if (data) {
      data.forEach((each) => {
        if (each.children.length == 0) {
          this.constats.push({ element_devis: each, data: each.constat.filter(x => x.numero_decompte == this.current_decompte()) });
        }
        this.getChildren(each.children);
      });
    }
    return this.constats;
  }

  getPostes(data: element_devis[] | undefined) {

    if (data) {
      data.forEach((each) => {
        if (each.unite != '') {
          this.my_postes.update(x => (x ? [...x, each] : [each]));
        }
        this.getPostes(each.children);
      });
    }
    return this.my_postes;
  }

  ligne_click(node: ExampleFlatNode2, ind: number) {
    this.clicked_index.set(ind);
    this.is_table_opened.set(true);
    this.table_update_form.reset();
    this.setTable();
  }

  delete_decompte() {
    if (confirm('Voulez-vous vraiment supprimer ce décompte?')) {
      let decompte = this._devis_store.donnees_currentDevis()?.decompte;
      let ind = decompte?.map(x => x.numero).indexOf(this.current_decompte());
      if (ind != undefined) {
        if (ind > -1) {
          decompte?.splice(ind, 1);
          this._devis_store.addDecompteDevis(decompte);
        }
      }
      this.delete_constat_by_decompte(this.data_loaded());
      this._devis_store.addDataDevis(this.datas());
    }
  }

  delete_constat_by_decompte(data: element_devis[] | undefined) {
    if (data) {
      data.forEach((each) => {
        let flatenNode = this.nestedNodeMap.get(each);
        if (!flatenNode?.expandable) {
          let ind = each.constat.map(c => c.numero_decompte).indexOf(this.current_decompte());
          if (ind > -1) {
            let data = each.constat.filter(x => x.numero_decompte != this.current_decompte());
            each.constat = data;
          }
        }
        this.delete_constat_by_decompte(each.children);
      });
      this.datas.set(data)
    }
  }
  EditConstat(numero: number, description: string, quantite: number, date: string) {
    let ind = this.clicked_index();
    if (ind != null) {
      let node = this.treeControl.dataNodes[ind];
      let element = this.flatNodeMap.get(node)
      if (element != undefined) {
        let ind = element.constat.filter(x => x.numero_decompte == this.current_decompte()).map(c => c.numero).indexOf(numero);
        if (ind > -1) {
          element.constat[ind] = {
            numero: this.modif_constat().numero,
            quantite_periode: quantite,
            date: date,
            description: description,
            numero_decompte: this.current_decompte()
          }
        }
      }
    }
  }
  AddConstat(description: string, quantite: number, date: string) {
    let ind = this.clicked_index();
    if (ind != null) {
      let node = this.treeControl.dataNodes[ind];
      let element = this.flatNodeMap.get(node);
      if (element != undefined) {
        element.constat.push({
          numero: this.current_constat() + 1,
          quantite_periode: quantite,
          date: date,
          description: description,
          numero_decompte: this.current_decompte()
        })
      }
    }
  }
  deleteConstat(data: element_devis[] | undefined, numero: number) {
    let ind = this.clicked_index()
    if (ind != null) {
      let node = this.treeControl.dataNodes[ind];
      let element = this.flatNodeMap.get(node);
      if (element != undefined) {
        let constat = element.constat.filter(x => x.numero_decompte == this.current_decompte() && x.numero != numero)
        element.constat = constat
      }
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


  updateTableData() {
    let value = this.table_update_form.value;
    let ind = this.clicked_index();
    if (ind) {
      let node = this.flatNodeMap.get(this.treeControl.dataNodes[ind]);
      if (node) {
        if (this.is_updated()) {
          this.EditConstat(this.modif_constat().numero, value.description, value.quantite_mois, value.date.toLocaleDateString())
        }
        else {
          this.AddConstat(value.description, value.quantite_mois, value.date.toLocaleDateString())
        }
        this._devis_store.addDataDevis(this.data_loaded());
        this.setTable()
        let avance = this._devis_store.donnees_currentDevis()?.avance;
        let decompte = this._devis_store.donnees_currentDevis()?.decompte;
        if (decompte) {
          let index = decompte.map(x => x.numero).indexOf(this.current_decompte());
          if (index > -1) {
            decompte[index] = {
              ...decompte[index],
              'retenue_garantie': this.montant_total().montant_periode * 0.05,
              'rembours_avance': (avance ? avance : 0) * this.montant_total().montant_periode / (0.85 * this.montant_total().montant_marche)
            }
            this._devis_store.addDecompteDevis(decompte);
          }
        }
        this.table_update_form.reset()
        this.is_updated.set(false)
      }
    }
  }
  setTable() {
    this.init_table(this.data_loaded())
    let ind = this.clicked_index();
    if (ind != null) {
      let node = this.treeControl.dataNodes[ind];
      let element = this.flatNodeMap.get(node);
      if (element) {
        let cumul = node.quantite_cumul ? node.quantite_cumul : 0;
        let periode = node.quantite_periode ? node.quantite_periode : 0;
        this.clicked_qte_cumul.set(cumul);
        this.clicked_qte_periode.set(periode);
        let constats = element.constat.filter(x => x.numero_decompte == this.current_decompte());
        this.current_constat.set(constats.length > 0 ? Math.max(...constats.map(x => x.numero)) : 0);
        this.constats_decompte.set(constats.map(x => {
          let date = x.date ? x.date : new Date().toLocaleDateString();
          return {
            'numero': x.numero,
            'description': x.description ? x.description : '',
            'quantite': x.quantite_periode,
            'date': date
          }
        }
        ))

      }
    }


  }
  fermer() {
    this.is_table_opened.set(false)
    this.is_updated.set(false)
  }
  modifier(data: any) {
    this.modif_constat.set(data);
    this.is_updated.set(true)
    let date = data.date
    const [day1, month1, year1] = date.split("/");
    const date1 = new Date(+year1, +month1 - 1, +day1);
    this.table_update_form.patchValue(
      {
        'quantite_mois': data.quantite,
        'description': data.description,
        'date': date1
      }
    )
  }
  supprimer(data: any) {
    this.modif_constat.set(data);
    if (confirm('Voulez-vous vraiment supprimer')) {
      this.deleteConstat(this.data_loaded(), data.numero)
      this._devis_store.addDataDevis(this.data_loaded());
      this.setTable()
    }
  }
  annuler() {
    this.table_update_form.reset()
    this.is_updated.set(false)
  }
  printConstat() {
    this.init_table(this.data_loaded())
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
    });

    let head1: any = [{
      content: 'FICHE DE CONSTAT DES TRAVAUX',
      colSpan: 3,
      rowSpan: 1,
      styles: {
        fillColor: [212, 204, 204],
        halign: 'center'
      }
    }]

    let head3 = ['DECOMPTE N°', this.current_decompte()]
    let rg = 0;
    let nbre = this.treeControl.dataNodes.filter(node => !node.expandable  && node.quantite_periode != null && node.quantite_periode != 0   ).length
    for (let node of this.treeControl.dataNodes) {
      let data: any[] = []
      if (!node.expandable) {
        if (node.quantite_periode != null && node.quantite_periode != 0) {
          let flatenNode = this.flatNodeMap.get(node);
          if (flatenNode) {
            let constat = flatenNode.constat.filter(x => x.numero_decompte == this.current_decompte());
            let poste = node.poste
            let myunite = this._unit_store.unites_data().find(u => u.id = node.unite)
            let unite = myunite?.unite;
            let designation = node.designation;
            let cumul = 0;
            for (let row of constat) {
              let description = ''
              if (row.description == undefined) {
                description = ''
              }
              else {
                description = row.description
              }
              data.push([{
                content: description,
                colSpan: 2,
                rowSpan: 1,
                styles: {
                  halign: 'center'
                }
              },
              {
                content: row.quantite_periode,
                styles: {
                  halign: 'center'
                }
              }])
              cumul = cumul + row.quantite_periode;
            }

            data.push([{
              content: 'Quantité cumulée',
              colSpan: 2,
              rowSpan: 1,
              styles: {
                fontStyle: "bold",
                halign: 'center'
              }
            },
            {
              content: cumul,
              styles: {
                fontStyle: "bold",
                halign: 'center'
              }
            }])
            data.push([{
              content: 'Quantité cumulée au précédent décompte',
              colSpan: 2,
              rowSpan: 1,
              styles: {
                fontStyle: "bold",
                halign: 'center'
              }
            },
            {
              content: node.quantite_prec,
              styles: {
                fontStyle: "bold",
                halign: 'center'
              }
            }])
            data.push([{
              content: 'Quantité de la période',
              colSpan: 2,
              rowSpan: 1,
              styles: {
                fontStyle: "bold",
                halign: 'center'
              }
            },
            {
              content: cumul,
              styles: {
                fillColor: [212, 204, 204],
                fontStyle: "bold",
                halign: 'center'
              }
            }])
            data.push([{
              content: 'Quantité cumulée actuelle',
              colSpan: 2,
              rowSpan: 1,
              styles: {
                fontStyle: "bold",
                halign: 'center'
              }
            },
            {
              content: node.quantite_cumul,
              styles: {
                fontStyle: "bold",
                halign: 'center'
              }
            }])

            let head2: any[] = ['ENTREPRISE', this.selected_entreprise().entreprise]
            head2.push({
              content: designation,
              rowSpan: 4,
              colSpan: 1,
              styles: {

                halign: 'center'
              }
            })
            let head4 = ['Applicable au Prix N°', poste]
            let head5 = ['UNITE: ', unite]

            let head6: any = [{
              content: 'Description - Détail des Calculs - Métrés:',
              colSpan: 2,
              styles: {
                fillColor: [212, 204, 204],
                halign: 'center'
              }
            },
            {
              content: 'Résultats Calcul',
              styles: {
                fillColor: [212, 204, 204],
                halign: 'center'
              }
            }]

            let doker: any = {
              startY: 40,
              tableLineWidth: 1,
              head: [head1, head2, head3, head4, head5, head6],
              styles: {
                lineColor: [73, 138, 159],
                lineWidth: 0.2,
                valign: "middle",
                halign: "center",
              },
              headStyles: {
                fontStyle: "bold"
              },
              bodyStyles: {
                minCellHeight: 10
              },

              columnStyles: {
                0: {
                  cellWidth: 60
                },
                1: {
                  cellWidth: 60
                }
              },
              body: data,
              theme: "plain"
            };
            autoTable(doc, doker)

            let signature_ent = 'Nom et Visa: Entreprise'
            let signature_cge = 'Nom et Visa : CGE BTP'
            doc.setFontSize(14);
            doc.setFont('Newsreader', 'normal');
            doc.text(signature_ent, 15, doc.internal.pageSize.getHeight() - 80)
            doc.text(signature_cge, 140, doc.internal.pageSize.getHeight() - 80)

            doc.text('Date:', 15, doc.internal.pageSize.getHeight() - 30)
            doc.text('Date:', 140, doc.internal.pageSize.getHeight() - 30)
            rg++;
            if (rg <= nbre - 1)
              doc.addPage()


          }
        }

      }


    }

    doc.save('constat_' + this.selected_entreprise().entreprise + '_' + new Date().getTime() + '.pdf');

  }
}
