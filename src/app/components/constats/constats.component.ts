import { AfterViewInit, Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ImportedModule } from '../../modules/imported/imported.module';
import { AttachementStore, ConstatStore, DecompteStore, DevisStore, LigneDevisStore, SstraitantStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { EntreprisesPipe } from '../../entreprises.pipe';
import { MatTableDataSource } from '@angular/material/table';
import { Constats, Ligne_devis } from '../../models/modeles';
import { FormBuilder, FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DevisPipe } from '../../devis.pipe';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DateTime, Info, Interval } from 'luxon';

@Component({
  selector: 'app-constats',
  standalone: true,
  imports: [ImportedModule, EntreprisesPipe, DevisPipe],
  templateUrl: './constats.component.html',
  styleUrl: './constats.component.scss'
})
export class ConstatsComponent implements OnInit {

  constructor() {
    effect(() => {
      this.dataSource2().paginator = this.paginator;
      this.dataSource2().sort = this.sort;
    })
  }
  //INJECTIONS
  _fb = inject(FormBuilder)
  _constat_store = inject(ConstatStore)
  _ligneDevis_Store = inject(LigneDevisStore)
  _devisStore = inject(DevisStore)
  _service = inject(WenService)
  _sstrce_Store = inject(SstraitantStore)
  _attachements_Store = inject(AttachementStore);
  _decompte_store = inject(DecompteStore)


  //SIGNAL
  is_table_opened = signal(false);
  selected_devis = signal('');
  selected_poste_id = signal('');
  is_table_updated = signal(false);
  totalExec = signal(0);
  defile_numero = signal(0);
  numero_decompte = signal(0);
  new_decompte = signal(0);

  //COMPUTED SIGNALS
  has_child = computed(() => {
    return this._ligneDevis_Store.donnees_Lignedevis().map(x => x.parent_code).filter(x => x != '');
  }
  )
  liste_poste = computed(() => {
    let poste = this._ligneDevis_Store.donnees_Lignedevis().filter(x => !this.has_child().includes(x.code));
    return this._service.classement_Ldevis(poste)
  })
  numero = computed(() => {
    let last_num = this._attachements_Store.last_num();
    return last_num
  })
  rang = computed(() => {
    let rangs = this._constat_store.constats_by_devis().filter(x => x.numero == this.numero_decompte()).map(x => x.rang);
    let last_num = 0;
    if (rangs.length > 0) {
      last_num = Math.max(...rangs)
    }
    return last_num;

  })

  donnees = computed(() => {
    let donnees: any = []
    let constats_dp_en_cours = this._constat_store.constats_by_devis().filter(x => x.numero == this.numero_decompte())
    let unique_postes_id = constats_dp_en_cours.map(x => x.poste_id).filter((value, index, self) => self.indexOf(value) === index).sort(
      (a, b) => {
        let poste_a = this._ligneDevis_Store.donnees_Lignedevis().find(x => x.id == a)
        let poste_b = this._ligneDevis_Store.donnees_Lignedevis().find(x => x.id == b)
        return (poste_a ? poste_a.poste : '').localeCompare(poste_b ? poste_b.poste : '')
      }
    )
    unique_postes_id.forEach(id => {
      let ligne_devis = this._ligneDevis_Store.donnees_Lignedevis().find(x => x.id == id)
      let constats_poste_en_cours = constats_dp_en_cours.filter(x => x.poste_id == id).sort((a, b) => { return b.rang - a.rang });
      donnees.push(
        {
          id: "",
          date: "",
          description: "",
          quantite_mois: 0,
          quantite_prec: 0,
          quantite_cumul: 0,
          poste_id: 0,
          numero: 0,
          rang: 0,
          designation: ligne_devis?.designation,
          poste: ligne_devis?.poste,
          is_parent: true
        }
      )
      constats_poste_en_cours.forEach(element => {
        let quantite_dp_prec = 0
        let rang = element.rang
        let filtres2 = this._constat_store.constats_by_devis().filter(x => x.numero <= this.numero_decompte() - 1 && x.poste_id == element.poste_id)
        if (filtres2.length > 0) {
          quantite_dp_prec = this._service.somme(filtres2.map(x => x.quantite_mois));
        }

        let constats_prec_dp_en_cours = constats_poste_en_cours.filter(x => x.rang < rang)
        let qte_cumul_prec = this._service.somme(constats_prec_dp_en_cours.map(x => x.quantite_mois)) + quantite_dp_prec
        let qte_cumul_actu = qte_cumul_prec + element.quantite_mois
        let poste = this._ligneDevis_Store.donnees_Lignedevis().find(x => x.id == element.poste_id)
        donnees.push(
          {
            id: element.id,
            date: element.date,
            description: element.description,
            quantite_mois: element.quantite_mois,
            quantite_prec: qte_cumul_prec.toFixed(2),
            quantite_cumul: qte_cumul_actu.toFixed(2),
            poste_id: element.poste_id,
            numero: element.numero,
            rang: element.rang,
            designation: poste?.designation,
            poste: poste?.poste,
            is_parent: false
          }
        )
      });

    });
    return donnees
  })

  dataSource = computed(() => {
    return new MatTableDataSource<any>(this.donnees());
  })
  dataSource2 = computed(() => {
    let donnees: any = []
    this._constat_store.constats_by_devis().filter(x => x.numero == this.defile_numero()).forEach(element => {
      let poste_id = element.poste_id
      let ligne = this._ligneDevis_Store.lignedevis_data().find(x => x.id == poste_id)
      donnees.push(
        {
          id: element.id,
          date: element.date,
          designation: ligne?.designation,
          poste: ligne?.poste,
          unite: ligne?.unite,
          rang: element.rang,
          quantite_mois: element.quantite_mois.toFixed(2)
        }
      )
    });
    return new MatTableDataSource<any>(this._service.classement2_Constat(donnees))
  })
  ///
  dataSource3 = computed(() => {
    let donnees: any = []
    let unique_postes = this._constat_store.constats_by_devis().map(x => x.poste_id).filter((value, index, self) => self.indexOf(value) === index)

    let allpostes = this._ligneDevis_Store.donnees_Lignedevis();
    allpostes.forEach(element => {
      if (unique_postes.length > 0) {
        if (unique_postes.includes(element.id)) {
          for (let i = 0; i <= unique_postes.length; i++) {
            let row = unique_postes[i]
            let filtres = this._constat_store.constats_by_devis().filter(x => x.poste_id == row)
            let ligne = this._ligneDevis_Store.lignedevis_data().find(x => x.id == row)
            let som = this._service.somme(filtres.map(x => Number(x.quantite_mois)))
            let taux = ligne ? (ligne.quantite != 0 ? som / Number(ligne.quantite) * 100 : 0) : 0
            if (ligne)
              donnees.push(
                {
                  designation: ligne.designation,
                  poste: ligne.poste,
                  unite: ligne.unite,
                  quantite_cumul: som.toFixed(2),
                  taux: taux.toFixed(2)
                })
          }
        }
        else {
          donnees.push(
            {
              designation: element.designation,
              poste: element.poste,
              unite: element.unite,
              quantite_cumul: 0,
              taux: 0
            })
        }
      }





    });
    return donnees
  });
  min_numero = computed(() => {
    if(this._constat_store.constats_by_devis().length>0)
    {
      return Math.min(... this._constat_store.constats_by_devis().map(x => x.numero))
    }
    else
    {return 0}
   
  })
  max_numero = computed(() => {
    if(this._constat_store.constats_by_devis().length>0)
    {
      return Math.max(... this._constat_store.constats_by_devis().map(x => x.numero))
    }
    else
    {return 0}
   
  })

  defilement_next() {
    this.numero_decompte.update(x => x + 1);
    this.new_decompte.set(this._constat_store.last_num());
  }
  defilement_back() {
    this.numero_decompte.update(x => x - 1);
    this.new_decompte.set(this._constat_store.last_num());
  }

  ///
  columnsToDisplay = ['date', 'poste', 'designation', 'quantite_prec', 'quantite_mois', 'quantite_cumul', 'description', 'actions'];
  columnsToDisplay2 = ['date', 'poste', 'designation', 'unite', 'quantite_mois', 'actions'];
  columnsToDisplay3 = ['poste', 'designation', 'quantite_cumul', 'taux'];

  table_update_form: FormGroup = this._fb.group(
    {
      quantite_mois: new FormControl(0, Validators.required),
      description: new FormControl('')
    }
  )
  ligne_poste: Ligne_devis | undefined
  selected_constat: any
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this._constat_store.loadConstats()
    this._ligneDevis_Store.loadLigneDevis()
    this._devisStore.loadDevis()
    this._sstrce_Store.loadSstraitants()
    this._attachements_Store.loadAttachements()
  }

  selectChangeDevis(id: string) {
    this._ligneDevis_Store.filtrebyDevis(id)
    this._attachements_Store.filtrebyDevisId(id)

    this.ligne_poste = undefined

    this.numero_decompte.set(this._constat_store.last_num())
    this.new_decompte.set(this._constat_store.last_num())
  }
  selectChangPostes(id: string) {
    this.selected_poste_id.set(id)
    this._constat_store.filtrebyPosteId(id)
    this.ligne_poste = this._ligneDevis_Store.donnees_Lignedevis().find(x => x.id == id);
    let qte = this._constat_store.constats_by_devis().filter(x => x.poste_id == this.ligne_poste?.id && x.numero <= this.numero_decompte()).map(x => x.quantite_mois)
    this.totalExec.set(this._service.somme(qte))
  }
  edit(data: any) {
    this.ligne_poste = this._ligneDevis_Store.donnees_Lignedevis().find(x => x.id == data.poste_id)
    let postes = this._constat_store.constats_by_devis().filter(x => x.poste_id == data.poste_id)
    this.totalExec.set(this._service.somme(postes.map(x => x.quantite_mois)))

    this.selected_constat = data
    this.is_table_opened.set(true)
    this.is_table_updated.set(true)
    let date = this._service.convertDate(data.date)
    this.table_update_form.patchValue(
      {
        'quantite_mois': data.quantite_mois,
        'description': data.description
      }
    )
  }
  delete(id: string) {
    if (confirm("Voulez-vous supprimer cet élement?"))
      this._constat_store.removeConstat(id)
  }
  ajouter() {
    this.is_table_opened.set(true)
    this.is_table_updated.set(false)
    this.table_update_form.reset()
    this.ligne_poste = undefined
  }
  updateTableData() {
    let ligne_poste = this._ligneDevis_Store.donnees_Lignedevis().find(x => x.id == this.selected_poste_id())
    let value = this.table_update_form.value
    if (this.table_update_form.valid) {
      if (this.is_table_updated()) {
        let constat =
        {
          'id': this.selected_constat?.id,
          'date': this.selected_constat?.date,
          'quantite_mois': value.quantite_mois,
          'description': value.description,
          'numero': this.selected_constat?.numero,
          'rang': this.selected_constat?.rang,
          'decompte_id': '',
          'poste_id': this.selected_constat?.poste_id
        }
        this._constat_store.updateConstat(constat)
      }
      else {
        let constat =
        {
          'date': new Date().toLocaleDateString(),
          'quantite_mois': value.quantite_mois,
          'description': value.description,
          'numero': this.numero_decompte(),
          'rang': this.rang() + 1,
          'decompte_id': '',
          'poste_id': ligne_poste?.id
        }
        this._constat_store.addConstat(constat);

        let attach = this._attachements_Store.donnees_attachement().filter(x => x.numero == this.numero_decompte());
        if (attach.length == 0) {
          this._attachements_Store.AddAttachement(
            {
              'numero': this.numero_decompte(),
              'devis_id': this.selected_devis(),
              'date': new Date().toLocaleDateString()
            }
          )

        }

        let qte = this._constat_store.constats_by_devis().filter(x => x.poste_id == this.ligne_poste?.id && x.numero <= this.numero_decompte()).map(x => x.quantite_mois);
        this.totalExec.set(this._service.somme(qte));
      }

    }
    this.is_table_opened.set(false)
  }
  annuler() {
    this.is_table_opened.set(false)
  }
  printConstat() {
    this._attachements_Store.filtrebyNumero(this.numero_decompte())
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
    });


    let devis = this._devisStore.donnees_devis().find(x => x.id == this.selected_devis())
    let entreprise_id = this._sstrce_Store.donnees_sstraitant().find(x => x.id == devis?.entreprise_id)
    let head1: any = [{
      content: 'FICHE DE CONSTAT DES TRAVAUX',
      colSpan: 3,
      rowSpan: 1,
      styles: {
        fillColor: [212, 204, 204],
        halign: 'center'
      }
    }]

    let head3 = ['DECOMPTE N°', this.numero_decompte()]
    let constat = this._constat_store.constats_by_devis().filter(x => x.numero == this.numero_decompte())
    let unique_postes = constat.map(x => x.poste_id).filter((value, index, self) => self.indexOf(value) === index).sort(
      (a, b) => {
        let poste_a = this._ligneDevis_Store.donnees_Lignedevis().find(x => x.id == a)
        let poste_b = this._ligneDevis_Store.donnees_Lignedevis().find(x => x.id == b)
        return (poste_a ? poste_a.poste : '').localeCompare(poste_b ? poste_b.poste : '')
      }
    )
    let rg = 0;
    for (let poste_id of unique_postes) {
      let constats = constat.filter(x => x.poste_id == poste_id)


      let data: any[] = []
      let cumul = 0;
      let poste = this._ligneDevis_Store.donnees_Lignedevis().find(x => x.id == poste_id)
      let unite = poste?.unite;
      let designation = poste?.designation;
      let nom_poste = poste?.poste;

      let attach = this._attachements_Store.attachements().find(x => x.poste == nom_poste)

      for (let row of constats) {
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
          content: row.quantite_mois,
          styles: {
            halign: 'center'
          }
        }])
        cumul = cumul + row.quantite_mois;
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
        content: attach.quantite_prec,
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
        content: attach.quantite_cumul,
        styles: {
          fontStyle: "bold",
          halign: 'center'
        }
      }])


      let head2: any[] = ['ENTREPRISE', entreprise_id?.entreprise]
      head2.push({
        content: designation,
        rowSpan: 4,
        colSpan: 1,
        styles: {

          halign: 'center'
        }
      })
      let head4 = ['Applicable au Prix N°', nom_poste]
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
      rg++
      if (rg <= unique_postes.length - 1)
        doc.addPage()
    }


    doc.save('constat_'+entreprise_id?.enseigne+'_'+new Date().getTime()+'.pdf');
  }
  nouveau() {
    this.numero_decompte.set(this._constat_store.last_num() + 1);
    this.new_decompte.update(x => x + 1)
  }
  deleteDec() {
    if (confirm("Voulez-vous supprimer cet élement?")) {
      let constats = this._constat_store.constats_by_devis().filter(x => x.numero == this.numero_decompte());
      let decomptes = this._decompte_store.decompte_data().filter(x => x.numero==this.numero_decompte() && x.devis_id==this.selected_devis())
      this._constat_store.RemoveManyConstat(constats);
      this._decompte_store.RemoveManyDecompte(decomptes)
      this.numero_decompte.set(this.max_numero()-1)
    }

  }
}
