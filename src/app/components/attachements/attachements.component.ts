import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ConstatStore, LigneDevisStore, DevisStore, SstraitantStore, AttachementStore, DecompteStore } from '../../store/appstore';
import { WenService } from '../../wen.service';
import { FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ImportedModule } from '../../modules/imported/imported.module';
import { EntreprisesPipe } from '../../entreprises.pipe';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SafeUrl } from '@angular/platform-browser';
import { AuthenService } from '../../authen.service';


@Component({
  selector: 'app-attachements',
  standalone: true,
  imports: [ImportedModule, EntreprisesPipe],
  templateUrl: './attachements.component.html',
  styleUrl: './attachements.component.scss'
})
export class AttachementsComponent implements OnInit {
  authservice = inject(AuthenService)

  _constat_store = inject(ConstatStore)
  _ligneDevis_Store = inject(LigneDevisStore)
  _devisStore = inject(DevisStore)
  _service = inject(WenService)
  _sstrce_Store = inject(SstraitantStore)
  _attachements_Store = inject(AttachementStore)
  _sousTraitance_Store = inject(SstraitantStore)
  _decompte_Store = inject(DecompteStore)

  //SIGNAL
  is_table_opened = signal(false);
  selected_devis = signal('')
  selected_poste_id = signal('');
  is_table_updated = signal(false);
  entreprise_id = signal('');
  current_avance = signal(0);
  current_autres_ret = signal(0);
  is_changed = signal(false);
  defile_numero = signal(0);
  ligne_cliquer = signal(0);
  myAngularxQrCode = signal('ras');
  imageUrl = signal('');

  //variables
  table_update_form: FormGroup;
  columnsToDisplay = ['poste', 'designation', 'unite', 'prix_u', 'quantite_marche',
    'quantite_prec', 'quantite_periode', 'quantite_cumul', 'montant_marche',
    'montant_prec', 'montant_periode', 'montant_cumul', 'taux'];
  columnsTodisplayDp = ['designation', 'precedent', 'periode', 'cumule'];
  qrCodeDownloadLink: SafeUrl = "";


  dataSource = computed(() => {
    return new MatTableDataSource<any>(this._constat_store.attachements())
  })
  dataSourceDP = computed(() => {
    return new MatTableDataSource<any>(this.donnees_decompte())
  })
  sommeTotal_marche = computed(() => {
    let data = this._constat_store.attachements().
      filter(x => {
        return this.ligne_parent0().
          includes(x.code) && x.numero == this.defile_numero()
      }).map(x => x.montant_marche)
    return this._service.somme(data)
  })
  sommeTotal_prec = computed(() => {
    let data = this._constat_store.attachements().
      filter(x => this.ligne_parent0().includes(x.code) && x.numero == this.defile_numero()).map(x => x.montant_prec)
    return this._service.somme(data)
  })
  sommeTotal_periode = computed(() => {
    let data = this._constat_store.attachements().
      filter(x => this.ligne_parent0().includes(x.code) && x.numero == this.defile_numero()).map(x => x.montant_periode)
    return this._service.somme(data)
  })
  sommeTotal_cumul = computed(() => {
    let data = this._constat_store.attachements().
      filter(x => this.ligne_parent0().includes(x.code) && x.numero == this.defile_numero()).map(x => x.montant_cumul)
    return this._service.somme(data)
  })

  has_child = computed(() => {
    let code_parent = this._ligneDevis_Store.donnees_Lignedevis().
      filter(x => x.parent_code != '').map(x => x.parent_code)
    return code_parent
  }
  )
  ligne_parent0 = computed(() => {
    return this._ligneDevis_Store.donnees_Lignedevis().filter(x => x.parent_code == "").map(x => x.code)
  })
  ligne_parent1 = computed(() => {
    let data1 = this._ligneDevis_Store.donnees_Lignedevis().filter(x => {
      return this.ligne_parent0().includes(x.parent_code)
    }).map(x => x.code);
    return data1
  })
  ligne_parent2 = computed(() => {
    let data2 = this._ligneDevis_Store.donnees_Lignedevis().filter(x => {
      return this.ligne_parent1().includes(x.parent_code)
    }).map(x => x.code);
    return data2
  })

  donneesDevis = computed(() => {
    let devis = this._devisStore.donnees_devis().filter(x => x.id == this.selected_devis());
    return devis[0]
  }
  )
  is_dp_exist = computed(() => {
    return this._decompte_Store.donnees_decompte().find(x => x.numero == this.defile_numero()) != undefined
  })

  donnees_decompte = computed(() => {
    let dp_precedent = this._decompte_Store.donnees_decompte().filter(x => x.numero < this.defile_numero());

    let retenue_gar_prec = this.sommeTotal_prec() * 0.05;
    let rembours_avance_prec = this._service.somme(dp_precedent.map(x => x.retenue_avance));
    let autres_ret_prec = this._service.somme(dp_precedent.map(x => x.autre_retenue));

    let retenue_gar_periode = this.sommeTotal_periode() * 0.05;
    let rembours = this.donneesDevis() != undefined ? this.donneesDevis().avance * this.sommeTotal_periode() / (this._ligneDevis_Store.montantDevis() * 0.85) : 0;

    let rembours_avance_periode = 0;
    let autres_ret_periode = 0;
    if (this.is_dp_exist()) {
      let dp_cours = this._decompte_Store.donnees_decompte().find(x => x.numero == this.defile_numero());
      if (dp_cours) {
        rembours_avance_periode = dp_cours.retenue_avance;
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
    let montant_net_prec = (this.sommeTotal_prec() - total_ret_prec);
    let montant_net_periode = (this.sommeTotal_periode() - total_ret_period);
    let montant_net_cumul = (this.sommeTotal_cumul() - total_ret_cum);

    let donnees = [];
    donnees.push(
      {
        'titre_precedent': 'DECOMPTE BRUT',
        'montant_precedent': this.sommeTotal_prec(),
        'montant_periode': this.sommeTotal_periode(),
        'montant_cumul': this.sommeTotal_cumul()
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
        'montant_precedent': this.sommeTotal_prec() * 0.01,
        'montant_periode': this.sommeTotal_periode() * 0.01,
        'montant_cumul': this.sommeTotal_cumul() * 0.01
      }
      ,
      {
        'titre_precedent': 'NET A PAYER',
        'montant_precedent': montant_net_prec - this.sommeTotal_prec() * 0.01,
        'montant_periode': montant_net_periode - this.sommeTotal_periode() * 0.01,
        'montant_cumul': montant_net_cumul - this.sommeTotal_cumul() * 0.01
      }
    )
    return donnees;
  })

  net_a_payer_prec = signal(0)
  net_a_payer_actuel = signal(0)
  ngOnInit() {
    this._attachements_Store.loadAttachements();
    this._ligneDevis_Store.loadLigneDevis();
    this._constat_store.loadConstats();
    this._sstrce_Store.loadSstraitants();
    this._devisStore.loadDevis();
    this._decompte_Store.loadAllDecomptes()
  }
  selectChangeDevis(id: string) {
    this.selected_devis.set(id);
    let ent_id = this._devisStore.donnees_devis().find(x => x.id == this.selected_devis())?.entreprise_id;
    this._ligneDevis_Store.filtrebyDevis(id);
    this.entreprise_id.set(ent_id ? ent_id : '');
    this.defile_numero.set(this._constat_store.last_num());
    this._constat_store.filtrebyDpNumero(this._constat_store.last_num());

    this.myAngularxQrCode.set(this.selected_devis() + this.defile_numero());
    this._decompte_Store.filtrebyNumero(this._constat_store.last_num());

    let devis = this._devisStore.donnees_devis().filter(x => x.id == id);
    let rembours = devis.length > 0 ? devis[0].avance * this.sommeTotal_periode() / (this._ligneDevis_Store.montantDevis() * 0.85) : 0;
    this.current_avance.set(Number(rembours.toFixed(2)));
  }

  printAttachement() {
    let entreprise = this._sstrce_Store.donnees_sstraitant().find(x => x.id == this.entreprise_id())
    let devis = this._devisStore.donnees_devis().find(x => x.entreprise_id == this.entreprise_id())
    let data = this._constat_store.attachements()
    let data_imp = []
    for (let row of data) {
      if (row.parent_code == "") {
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
            content: this._service.FormatMonnaie(row.montant_marche),
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
            content: this._service.FormatMonnaie(row.montant_prec),
            styles: {
              fontStyle: "bold",
              halign: 'center',
              fillColor: [212, 204, 204]
            }
          }
            ,
          {
            content: this._service.FormatMonnaie(row.montant_periode),
            styles: {
              fontStyle: "bold",
              halign: 'center',
              fillColor: [212, 204, 204]
            }
          }
            ,
          {
            content: this._service.FormatMonnaie(row.montant_cumul),
            styles: {
              fontStyle: "bold",
              halign: 'center',
              fillColor: [212, 204, 204]
            }
          }
            ,
          {
            content: row.montant_marche > 0 ? (row.montant_cumul / row.montant_marche * 100).toFixed(2) + ' %' : '',
            styles: {
              fontStyle: "bold",
              halign: 'center',
              fillColor: [212, 204, 204]
            }
          }
          ]
        )

      }
      else {
        data_imp.push([row.poste, row.designation, row.unite,
        this._service.FormatMonnaie(row.prix_u),
        row.quantite_marche,
        this._service.FormatMonnaie(row.montant_marche),
        row.quantite_prec,
        row.quantite_periode,
        row.quantite_cumul,
        this._service.FormatMonnaie(row.montant_prec),
        this._service.FormatMonnaie(row.montant_periode),
        this._service.FormatMonnaie(row.montant_cumul),
        row.montant_marche > 0 ? (row.montant_cumul / row.montant_marche * 100).toFixed(2) + ' %' : ''])

      }

    }
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
      content: this._service.FormatMonnaie(this.sommeTotal_marche()),
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
      content: this._service.FormatMonnaie(this.sommeTotal_prec()),
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'center',
        fillColor: [160, 160, 160]
      }
    },
    {
      content: this._service.FormatMonnaie(this.sommeTotal_periode()),
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'center',
        fillColor: [160, 160, 160]
      }
    },
    {
      content: this._service.FormatMonnaie(this.sommeTotal_cumul()),
      styles: {
        fontSize: 8,
        fontStyle: "bold",
        halign: 'center',
        fillColor: [160, 160, 160]
      }
    }
      ,
    {
      content: this.sommeTotal_marche() > 0 ? (this.sommeTotal_cumul() / this.sommeTotal_marche() * 100).toFixed(2) + ' %' : '',
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
    let titre = "ATTACHEMENT DES TRAVAUX N° " + this.defile_numero();
    var titreX = (doc.internal.pageSize.getWidth() - doc.getTextWidth(titre)) / 2
    var textWidth = doc.getTextWidth(titre) + 20;

    doc.text("DECOMPTE N°: " + this.defile_numero(), 20, 30);
    doc.text("ENTREPRISE: " + entreprise?.enseigne, 20, 40);
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
    doc.save('attachement_' + entreprise?.enseigne + '_' + new Date().getTime() + '.pdf');
  }
  printDecompte() {
    let dp_precedent = this._decompte_Store.donnees_decompte().filter(x => x.numero < this.defile_numero());
    let dpPeriode = this._decompte_Store.donnees_decompte().find(x => x.numero == this.defile_numero());

    let avance_periode = dpPeriode ? dpPeriode.retenue_avance : 0;
    let avance_prec = this._service.somme(dp_precedent.map(x => x.retenue_avance));


    let ret_gar_periode = this.sommeTotal_periode() * 0.05;
    let ret_gar_prec = this.sommeTotal_prec() * 0.05;

    let ret_autre_periode = dpPeriode ? dpPeriode.autre_retenue : 0;
    let ret_autre_prec = this._service.somme(dp_precedent.map(x => x.autre_retenue));

    let entreprise = this._sstrce_Store.donnees_sstraitant().find(x => x.id == this.entreprise_id());
    let devis = this._devisStore.donnees_devis().find(x => x.entreprise_id == this.entreprise_id());

    let net_a_payer_prec = this.sommeTotal_prec() - ret_autre_prec - ret_gar_prec - avance_prec - this.sommeTotal_prec() * 0.01;
    this.net_a_payer_prec.set(net_a_payer_prec);
    let net_a_payer_periode = this.sommeTotal_periode() - ret_autre_periode - ret_gar_periode - avance_periode - this.sommeTotal_periode() * 0.01;
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
      content: this._service.FormatMonnaie(this._ligneDevis_Store.montantDevis()),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },
    {
      content: this._service.FormatMonnaie(this._ligneDevis_Store.montantDevis()),
      styles: {
        fontSize: 8,
        halign: 'center',

      }
    }
      ,
    {
      content: this._service.FormatMonnaie(this._ligneDevis_Store.montantDevis()),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    }
      ,
    {
      content: this._service.FormatMonnaie(this._ligneDevis_Store.montantDevis()),
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
      content: this._service.FormatMonnaie(this.sommeTotal_prec()),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },

    {
      content: this._service.FormatMonnaie(this.sommeTotal_periode()),
      styles: {
        fontSize: 8,
        halign: 'center',

      }
    }
      ,
    {
      content: this._service.FormatMonnaie(this.sommeTotal_cumul()),
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },
    {
      content: this._service.FormatMonnaie(this._ligneDevis_Store.montantDevis() - this.sommeTotal_cumul()),
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
      content: (this.sommeTotal_prec() / this._ligneDevis_Store.montantDevis() * 100).toFixed(2) + ' %',
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },

    {
      content: (this.sommeTotal_periode() / this._ligneDevis_Store.montantDevis() * 100).toFixed(2) + ' %',
      styles: {
        fontSize: 8,
        halign: 'center',

      }
    }
      ,

    {
      content: (this.sommeTotal_cumul() / this._ligneDevis_Store.montantDevis() * 100).toFixed(2) + ' %',
      styles: {
        fontSize: 8,
        halign: 'center',
      }
    },

    {
      content: (100 - this.sommeTotal_cumul() / this._ligneDevis_Store.montantDevis() * 100).toFixed(2) + ' %',
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
      content: this._service.FormatMonnaie(this._ligneDevis_Store.montantDevis() * 0.05 - ret_gar_periode - ret_gar_prec),
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
      content: this._service.FormatMonnaie(this.sommeTotal_prec() - (ret_autre_prec + avance_prec + ret_gar_prec)),
      styles: {
        fontSize: 8,
        halign: 'center'
      }
    },

    {
      content: this._service.FormatMonnaie(this.sommeTotal_periode() - (ret_autre_periode + avance_periode + ret_gar_periode)),
      styles: {
        fontSize: 8,
        halign: 'center'

      }
    }
      ,
    {
      content: this._service.FormatMonnaie(this.sommeTotal_cumul() - (ret_autre_prec + avance_prec + ret_gar_prec) +
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
      content: this._service.FormatMonnaie(this.sommeTotal_prec() * 0.01),
      styles: {
        fontSize: 8,
        halign: 'center'
      }
    },

    {
      content: this._service.FormatMonnaie(this.sommeTotal_periode() * 0.01),
      styles: {
        fontSize: 8,
        halign: 'center'

      }
    }
      ,
    {
      content: this._service.FormatMonnaie(this.sommeTotal_cumul() * 0.01),
      styles: {
        fontSize: 8,
        halign: 'center'
      }
    }
      ,
    {
      content: this._service.FormatMonnaie(this._ligneDevis_Store.montantDevis() * 0.01 - this.sommeTotal_cumul() * 0.01),
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
      content: 'DECOMPTE N° ' + this.defile_numero(),
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
      content: this._service.FormatMonnaie(this._ligneDevis_Store.montantDevis()),
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
    let entrepr = "ENTREPRISE : " + entreprise?.enseigne;
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

    doc.save('ficheDP_' + entreprise?.enseigne + '_' + new Date().getTime() + '.pdf');
  }
  printFacture() {
    if (this.is_dp_exist()) {
      let dp_precedent = this._decompte_Store.donnees_decompte().filter(x => x.numero < this.defile_numero());
      let dpPeriode = this._decompte_Store.donnees_decompte().find(x => x.numero == this.defile_numero());

      let avance_periode = dpPeriode ? dpPeriode.retenue_avance : 0;
      let avance_prec = this._service.somme(dp_precedent.map(x => x.retenue_avance));


      let ret_gar_periode = this.sommeTotal_periode() * 0.05;
      let ret_gar_prec = this.sommeTotal_prec() * 0.05;

      let ret_autre_periode = dpPeriode ? dpPeriode.autre_retenue : 0;
      let ret_autre_prec = this._service.somme(dp_precedent.map(x => x.autre_retenue));

      let entreprise = this._sstrce_Store.donnees_sstraitant().find(x => x.id == this.entreprise_id());
      let devis = this._devisStore.donnees_devis().find(x => x.entreprise_id == this.entreprise_id());

      let net_a_payer_prec = this.sommeTotal_prec() - ret_autre_prec - ret_gar_prec - avance_prec - this.sommeTotal_prec() * 0.01;
      this.net_a_payer_prec.set(net_a_payer_prec);
      let net_a_payer_periode = this.sommeTotal_periode() - ret_autre_periode - ret_gar_periode - avance_periode - this.sommeTotal_periode() * 0.01;
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
        content: 'ENTREPRISE: ' + entreprise?.enseigne,
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
        content: this._service.FormatMonnaie(this._ligneDevis_Store.montantDevis()),
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
      let facture = "FACTURE N° 00" + this.defile_numero() + "/" + entreprise?.enseigne + "/TR03/2024"
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

      doc.save('Facture' + entreprise?.enseigne + '_' + new Date().getTime() + '.pdf');
    }
    else {
      alert("POUR IMPRIMER LA FACTURE VOUS DEVEZ D'ABORD ENREGISTRER jLA FICHE DE DECOMPTE")
    }

  }
  onChangeURL(url: SafeUrl) {
    this.imageUrl.set(this.download(url))
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

  download(url: any) {
    const qrcode = document.getElementById('qrcode');
    let doc = new jsPDF();

    let imageData = this.getBase64Image(qrcode?.firstChild?.firstChild);
    return imageData
  }

  decompte() {
    this.is_table_opened.set(true);
    this.ligne_cliquer.set(0);

    this.verif_exist()
    if (this.is_dp_exist()) {
      this.is_changed.set(false)
    }
    else {
      this.is_changed.set(true)
    }

  }
  Quitter() {
    if (!this.is_changed()) {
      this.is_table_opened.set(false);
    }
    else { alert('ENREGISTRER AVANT DE QUITTER') }

  }
  Annuler() {
    this.is_table_opened.set(false);
  }

  verif_exist() {
    if (this.is_dp_exist()) {
      let dp_cours = this._decompte_Store.donnees_decompte().find(x => x.numero == this.defile_numero());
      if (dp_cours) {
        this.current_avance.set(dp_cours.retenue_avance)
        this.current_autres_ret.set(dp_cours.autre_retenue)
      }
    }
    else {
      let rembours = this.donneesDevis() != undefined ? this.donneesDevis().avance * this.sommeTotal_periode() / (this._ligneDevis_Store.montantDevis() * 0.85) : 0;
      this.current_avance.set(Number(rembours.toFixed(2)))
      this.current_autres_ret.set(0)
    }
  }
  saisie() {
    this.is_changed.set(true)
  }
  saveDp() {
    if (this.is_dp_exist()) {
      let id = this._decompte_Store.donnees_decompte().find(x => x.numero == this.defile_numero())?.id
      let data = {
        'id': id,
        'devis_id': this.selected_devis(),
        'retenue_avance': this.current_avance(),
        'retenue_garantie': this.sommeTotal_periode() * 0.05,
        'retenue_aib': this.sommeTotal_periode() * 0.15 * 0.01,
        'autre_retenue': this.current_autres_ret(),
        'numero': this.defile_numero(),
        'date': new Date().toLocaleDateString(),
        'date_depot_bureau': '',
        'date_paiement': ''
      }
      this._decompte_Store.updateDecompte(data)
    }
    else {
      let data = {
        'devis_id': this.selected_devis(),
        'retenue_avance': this.current_avance(),
        'retenue_garantie': this.sommeTotal_periode() * 0.05,
        'retenue_aib': this.sommeTotal_periode() * 0.15 * 0.01,
        'autre_retenue': this.current_autres_ret(),
        'numero': this.defile_numero(),
        'date': new Date().toLocaleDateString(),
        'date_depot_bureau': '',
        'date_paiement': ''
      }
      this._decompte_Store.AddDecompte(data)
    }

    this.is_changed.set(false);
    this.ligne_cliquer.set(0);
  }
  clicker(ind: number) {
    this.ligne_cliquer.set(ind)
  }
  defilement_next() {
    this.defile_numero.update(x => x + 1);
    this._constat_store.filtrebyDpNumero(this.defile_numero())
    this.verif_exist()
  }
  defilement_back() {
    this.defile_numero.update(x => x - 1);
    this._constat_store.filtrebyDpNumero(this.defile_numero())
    this.verif_exist()
  }
}
