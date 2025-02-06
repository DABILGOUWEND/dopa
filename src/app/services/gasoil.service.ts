import { computed, effect, inject, Injectable, signal } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WenService } from '../wen.service';
import { CompteStore, EnginsStore, GasoilStore } from '../store/appstore';
@Injectable({
  providedIn: 'root'
})
export class GasoilService {
  _service = inject(WenService);
  _engins_store = inject(EnginsStore);
  _gasoil_store = inject(GasoilStore);
  rapport_gasoil(
    choix_date: string,
    mydata: any,
    mytitre1: string,
    mytitre2: string,
    total_conso: number
  ) {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
    });

    doc.setFontSize(12);
    doc.text('CGE BTP', 23, 40);
    doc.text('VILLE NOUVELLE DE YENNENGA', 23, 50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    let titre = "RAPPORT DE CONSOMMATION DU GASOIL"
    let textWidth = doc.getTextWidth(titre);
    var yline = 60;
    doc.setLineWidth(1)
    doc.setFillColor(225, 225, 225);
    doc.rect(doc.internal.pageSize.getWidth() / 2 - textWidth / 2 - 5, yline + 5, textWidth + 10, 15, 'FD');
    doc.text(titre, doc.internal.pageSize.getWidth() / 2 - textWidth / 2, yline + 13);

    var yline = 90;
    if (mytitre1 != "") {
      let titre1 = mytitre1;
      let textWidth1 = doc.getTextWidth(titre1);
      doc.text(titre1, doc.internal.pageSize.getWidth() / 2 - textWidth1 / 2, yline);

    }
    if (mytitre2 != "") {
      yline = yline + 10;
      let titre2 = mytitre2;
      let textWidth2 = doc.getTextWidth(titre2);
      doc.text(titre2, doc.internal.pageSize.getWidth() / 2 - textWidth2 / 2, yline);
    }
    let long = mydata.length;
    let periode = "";
    doc.setFontSize(12);
    if (choix_date == "idate" || choix_date == "tout") {
      periode = "PERIODE: du " + mydata[long - 1].date + " au " + mydata[0].date
    }
    if (choix_date == "date") {
      periode = "DATE: " + mydata[0].date;
    }

    doc.text(periode, 15, yline + 10);
    doc.text("TOTAL CONSOMME: " + this._service.FormatMonnaie(total_conso) + " litres", 15, yline + 20);
    let data = mydata.
      sort((a: any, b: any) => new Date(this._service.convertDate(a.date)).getTime() - new Date(this._service.convertDate(b.date)).getTime());;
    let data_imp = []
    for (let row of data) {
      let engin = this._engins_store.donnees_engins().find(x => x.id == row.engin_id);
      if (mytitre2 == "") {
        data_imp.push(
          [{
            content: row.date,
            styles: {
              fontStyle: "bold",
              halign: 'center',
            }
          },
          {
            content: engin?.code_parc,
            styles: {
              fontStyle: "bold",
              halign: 'center',
            }
          }
            ,
          {
            content: engin?.designation,
            styles: {
              fontStyle: "bold",
              halign: 'center',
            }
          }
            ,
          {
            content: row.quantite_go,
            styles: {
              fontStyle: "bold",
              halign: 'center',
            }
          }
          ]
        );
      } else {
        data_imp.push(
          [{
            content: row.date,
            styles: {
              fontStyle: "bold",
              halign: 'center',
            }
          }
            ,
          {
            content: row.quantite_go,
            styles: {
              fontStyle: "bold",
              halign: 'center',
            }
          }
          ]
        );
      }
    }
    let head0: any = []
    if (mytitre2 == "") {
      head0 = [{
        content: 'DATE',
        styles: {
          halign: 'center'
        }
      }
        ,
      {
        content: 'CODE PARC',
        styles: {
          halign: 'center'
        }
      },

      {
        content: 'DESIGNATION',
        styles: {
          halign: 'center'
        }
      },
      {
        content: 'QUANTITE GO',
        styles: {
          halign: 'center'
        }
      }
      ];
      data_imp.push(
        [{
          content: 'TOTAL (litre)',
          colSpan: 3,
          styles: {
            fontSize: 10,
            fontStyle: "bold",
            halign: 'center',
            fillColor: [200, 160, 160]
          }
        },
        {
          content: this._service.FormatMonnaie(total_conso),
          styles: {
            fontSize: 10,
            fontStyle: "bold",
            halign: 'center',
            fillColor: [200, 160, 160]
          }
        }
        ])

    } else {
      head0 = [{
        content: 'DATE',
        styles: {
          halign: 'center'
        }
      },
      {
        content: 'QUANTITE GO',
        styles: {
          halign: 'center'
        }
      }
      ]
      data_imp.push(
        [{
          content: 'TOTAL (litre)',
          colSpan: 1,
          styles: {
            fontStyle: "bold",
            halign: 'center',
            fontSize: 10,
            fillColor: [200, 160, 160]
          }
        },
        {
          content: this._service.FormatMonnaie(total_conso),
          styles: {
            fontStyle: "bold",
            halign: 'center',
            fontSize: 10,
            fillColor: [200, 160, 160]
          }
        }
        ])
    }

    let doker: any = {
      startY: yline + 30,
      tableLineWidth: 0.1,
      head: [head0],
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
      body: data_imp,
      theme: "grid"
    };
    var img = new Image();
    img.src = 'assets/images/logocge.png';
    doc.addImage(img, 'png', 20, 20, 25, 15)
    autoTable(doc, doker);
    let finalY = (doc as any).lastAutoTable.finalY;
    if (finalY > doc.internal.pageSize.getHeight() - 40) {
      finalY = 40;
      doc.addPage();
    }


    const totalPages: number = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(8)
    var img = new Image();
    img.src = 'assets/images/logo_index.png';
    doc.setLineWidth(0.25)
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
    doc.save('rapportGo' + new Date().getTime() + '.pdf');
  }

} 
