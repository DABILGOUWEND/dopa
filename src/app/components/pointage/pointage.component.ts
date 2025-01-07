import { Component, OnInit, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { tab_personnel } from '../../models/modeles';
import { PersonnelStore, DatesStore } from '../../store/appstore';

import { WenService } from '../../wen.service';
import { DateTime, Info, Interval } from 'luxon';
import { ImportedModule } from '../../modules/imported/imported.module';
import { ThemePalette } from '@angular/material/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Console } from 'node:console';

@Component({
    selector: 'app-pointage',
    imports: [ImportedModule],
    templateUrl: './pointage.component.html',
    styleUrl: './pointage.component.scss'
})
export class PointageComponent implements OnInit {
  personnel_store = inject(PersonnelStore);
  constructor(
    private _service: WenService,
    private _fb: FormBuilder) {
    this.table_update_form = this._fb.group({
      heureNorm: new FormControl([Validators.min(1), Validators.required]),
      heureSup: new FormControl([Validators.required]),
    })

    this.formG = _fb.group({
      date_debut: new FormControl(new Date(), Validators.required),
      date_fin: new FormControl(new Date(), Validators.required)
    })
    effect(() => {
    })
  }
  //signalsfff
  tab_expander = signal<boolean[]>([]);
  current_expanded = signal(false);
  nbre_hs = signal(0);
  nbre_absence = signal(0);
  debut_date = signal('');
  fin_date = signal('');
  is_table_being_updated = signal(false);
  is_new_row_being_added = signal(false);
  is_table_list_open = signal(false);
  madate = signal('');
  ind = signal(0);
  default_date = signal(new Date());
  selectedData = signal<tab_personnel | undefined>(undefined);
  personnel_data = signal({
    nom: '',
    prenom: '',
    fonction: ''
  })
  current_date = signal(new Date().toLocaleDateString())
  allComplete = signal(false)

  table_update_form: FormGroup;
  formG: FormGroup;
  displayedColumns: string[] = ['nom', 'prenom', 'fonction', 'presence', 'nbre_heure', 'heure_sup', 'actions']

  //computed signals
  weekDays = computed(() => {
    let star = new Date(this._service.convertDate(this.debut_date()))
    star.setDate(star.getDate() - 1)
    let end = new Date(this._service.convertDate(this.fin_date()))
    return Interval.fromDateTimes(
      star,
      end,
    ).splitBy({ day: 1 }).map((d) => {
      if (d.end == null) {
        throw new Error('Wrong dates')
      }
      return d.end
    })
  })

  dataSource = computed(
    () => {
      let date = this.personnel_store.current_date();
      if (this.datespointage().includes(date) && this.personnel_store.is_finished()) {
        return new MatTableDataSource<tab_personnel>
          (this.personnel_store.data_pointage())
      }
      else {
        return new MatTableDataSource<tab_personnel>()
      }
    }
  );

  datespointage = computed(() => {
    return this.personnel_store.getDates()[0];
  })

  datespointageClass = computed(() => {
    return this._service.classement(this.datespointage())
  })


  //methods
  ngOnInit() {
    this.personnel_store.loadPersonnel();
    this.madate.set(this.default_date().toLocaleDateString());
    this.personnel_store.filtrebyDate(this.madate());
    this.tab_expander.set(new Array(this.personnel_store.getDates()[1].length).fill(true))
  }
  editperso(row: tab_personnel, index: number) {
    this.is_table_being_updated.set(true);
    this.personnel_data.update(
      person =>
      (
        {
          ...person,
          nom: row.nom,
          prenom: row.prenom,
          fonction: row.fonction
        }
      )
    );
    this.selectedData.set(row);
    this.ind.set(index);
    this.table_update_form.patchValue({
      heureNorm: this.personnel_store.heures_normale()[index],
      heureSup: this.personnel_store.heures_sup()[index]
    })
  }
  someComplete(): boolean {
    if (!this.personnel_store.mytasks().subtasks) {
      return false;
    }
    return this.personnel_store.mytasks().subtasks.filter((t: any) => t.completed).length > 0 && !this.allComplete();
  }
  setAll(completed: boolean) {
    this.allComplete.set(completed);
    this.personnel_store.ModifMultiPersonnel(completed);
  }
  is_checked(row: tab_personnel, ind: number) {
    this.selectedData.set(row);
    let a = this.personnel_store.mytasks().subtasks[ind].completed;
    let data = this.selectedData();
    let rep = !a;
    if (data) {
      let index = data.dates.indexOf(this.madate(), 0);
      let presence = row.presence;
      presence[index] = rep;
      data.presence = presence;
      let heurenorm = row.heuresN;
      let heuresup = row.heureSup;
      if (!rep) {
        heurenorm[index] = 0;
        heuresup[index] = 0;
        data.heuresN = heurenorm;
        data.heureSup = heuresup;
      }
      else {
        heurenorm[index] = 8;
        heuresup[index] = 0;
        data.heuresN = heurenorm;
        data.heureSup = heuresup;
      }
      this.personnel_store.ModifPersonnel(this.selectedData());
    }

  }
  annuler() {
    this.is_table_being_updated.set(false);
  }
  updateTableData() {
    if (this.table_update_form.valid) {
      let data = this.selectedData();
      if (data) {
        let value = this.table_update_form.value;
        let index = data.dates.indexOf(this.madate(), 0);
        let heurenorm = data.heuresN;
        let heuresup = data.heureSup;
        let presence = data.presence;
        heurenorm[index] = value.heureNorm;
        heuresup[index] = value.heureSup;
        presence[index] = this.personnel_store.presence()[this.ind()];
        data.heureSup = heuresup;
        data.heuresN = heurenorm;
        data.presence = presence;
        this.personnel_store.ModifPersonnel(this.selectedData());
        this.is_table_being_updated.set(false);
      }

    }
  }
  addEvent(event: MatDatepickerInputEvent<any>) {
    this.personnel_store.filtrebyDate(event.value.toLocaleDateString())
    this.madate.set(event.value.toLocaleDateString())
  }
  commencerPoint() {
    this.personnel_store.setfiniched(false);
    this.personnel_store.initialPersonnel(this.personnel_store.donnees_personnel())
    this.personnel_store.filtrebyDate(this.madate())
  }
  is_checked2(ind: number) {
    let checked = this.personnel_store.ischecked()[ind]
    this.personnel_store.ischecked().splice(ind, 1, !checked)
  }
  ajouter() {
    let tab: any = []
    for (let i = 0; i < this.personnel_store.ischecked().length; i++) {
      if (this.personnel_store.ischecked()[i]) {
        tab.push(this.personnel_store.no_pointage()[i].names)
      }
    }
    this.personnel_store.initialPersonnel(tab)
  }
  exclure(row: any) {
    this.personnel_store.reducePerson(row)
  }
  ouvriliste() {
    this.is_table_list_open.set(true);
  }
  Annuler2() {
    this.is_table_list_open.set(false);
  }
  
  
  
  afficher(row: any) {
    this.personnel_store.filtrebyDate(row)
    this.madate.set(row)
    this.default_date.set(this._service.convertDate(row))
  }
  deletedate(date: string) {
    this.personnel_store.setfiniched(false);
    let filtre = this.personnel_store.getDates()[0];
    if (filtre) {
      if (confirm('Voulez-vous vraiment supprimer cette date?'))
        this.personnel_store.removeDate(date)
      this.madate.set(new Date().toLocaleDateString())
    }
  }
  dateRangeChange() {
    if (this.formG.valid) {
      let value = this.formG.value
      if (value.date_debut != null && value.date_fin != null) {
        this.debut_date.set(value.date_debut.toLocaleDateString())
        this.fin_date.set(value.date_fin.toLocaleDateString())
      }
    }
  }
  impression() {
    let datas = this.creation_table()
    let months: any[] = []
    for (let row of this.weekDays()) {
      months.push(Info.months('short')[row.month - 1].replace('.', ''))
    }
    let unique_mont = months.filter((value, index, self) => self.indexOf(value) === index)
    let headmonth: any = [{
      content: '',
      colSpan: 3,
      rowSpan: 2,
      styles: { halign: 'center' }
    }]
    for (let i = 0; i <= unique_mont.length - 1; i++) {
      let nbi = months.filter((x) => x == unique_mont[i]).length
      headmonth.push({
        content: unique_mont[i],
        colSpan: nbi,
        styles: { halign: 'center' },

      })
    }
    let headdayweek: any = []
    let headdaynum: any = ['NOM', 'PRENOM', 'FONCTION']

    for (let row of this.weekDays()) {
      headdayweek.push(Info.weekdays('short')[row.weekday - 1].replace('.', ''))
      headdaynum.push(row.day)
    }
    headmonth.push({
      content: 'HN',
      rowSpan: 3,
      colSpan: 1,
      styles: {
        fillColor: [192, 192, 192],
        halign: 'center'
      }
    })
    headmonth.push({
      content: 'HS',
      rowSpan: 3,
      colSpan: 1,
      styles: {
        fillColor: [255, 248, 220],
        halign: 'center'
      }
    })
    headmonth.push({
      content: 'TH',
      colSpan: 1,
      rowSpan: 3,
      styles: {
        fillColor: [230, 236, 238],
        halign: 'center'
      }
    })
    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a3',
      putOnlyUsedFonts: true,
    });
    var img = new Image()
    img.src = 'assets/images/CGE.jpg'
    doc.addImage(img, 'jpg', 360, 20, 30, 20)
    doc.setFont('Newsreader');
    doc.text("CGE BTP ", 25, 30)
    doc.text(" ----------- ", 25, 40)
    doc.text("CHANTIER: VILLE NOUVELLE DE YENNENGA", 25, 50)
    doc.setFontSize(24);
    let text = "POINTAGE DU PERSONNEL DU " + this.debut_date() + ' AU ' + this.fin_date()
    var titreX = (doc.internal.pageSize.getWidth() - doc.getTextWidth(text)) / 2

    doc.text(text, titreX, 63)
    doc.setLineWidth(0.5)
    doc.line(titreX, 65, titreX + doc.getTextWidth(text), 65)

    doc.setFontSize(12);
    const columns = [headmonth, headdayweek, headdaynum];
    autoTable(doc, {
      startY: 70,
      tableLineWidth: 1,
      head: columns,
      styles: {
        lineColor: [73, 138, 159],
        lineWidth: 0.2,
        valign: "middle",
        halign: "center",
      },
      headStyles: {
        fillColor: [212, 204, 204],
        fontStyle: "bold"
      },
      bodyStyles: {

      },
      columnStyles: {
        0: {
          cellWidth: 27
        },
        1: {
          cellWidth: 25
        }
        ,
        2: {
          cellWidth: 24
        }
      },

      body: datas,

      theme: "plain"
    });


    let finalY = (doc as any).lastAutoTable.finalY;
    doc.setFont('Newsreader', 'normal');
    let line = finalY + 20
    if (finalY >= doc.internal.pageSize.getHeight() - 100) {
      doc.addPage()
      line = 40
    }

    doc.setFontSize(24);
    doc.text('RECAPITULATIF', 15, line)
    doc.setFontSize(18);
    doc.text('*Total des heures sup: ' + this.nbre_hs() + ' heures', 20, line + 10)
    doc.text('*Total des absences: ' + this.nbre_absence() * 8 + ' heures', 20, line + 20)
    doc.text('Etabli le:', 20, line + 40)
    doc.text('LE COMMIS POINTEUR ', 20, line + 50)
    doc.line(20, line + 53, 20 + doc.getTextWidth('LE COMMIS POINTEUR:'), line + 53)

    doc.text('Validé le:', doc.internal.pageSize.getWidth() - 100, line + 40)
    let dt = "LE DIRECTEUR DES TRAVAUX"
    var titreX = (doc.internal.pageSize.getWidth() - 100)
    doc.text(dt, titreX, line + 50)
    doc.setLineWidth(0.5)
    doc.line(titreX, line + 53, titreX + doc.getTextWidth(dt), line + 53)
    const totalPages: number = (doc as any).internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setFontSize(14);
      doc.setFont('Newsreader', 'italic');
      doc.setLineWidth(0.1)
      doc.line(10, 283, doc.internal.pageSize.getWidth() - 10, 283);
      doc.setPage(i);
      let text1 = `Page ${i} / ${totalPages}`
      doc.text(
        text1,
        (doc.internal.pageSize.getWidth() - doc.getTextWidth(text1)) / 2,
        doc.internal.pageSize.getHeight() - 5, { align: 'justify' }
      );
      let text2 = new Date().toLocaleDateString()
      doc.text(text2,
        doc.internal.pageSize.getWidth() - 40,
        doc.internal.pageSize.getHeight() - 5, { align: 'justify' }
      );
      doc.text('PrintBySoluBTP', 15, doc.internal.pageSize.getHeight() - 5)
    }

    doc.save('pointage_vny du' + this.debut_date() + ' au' + this.fin_date() + '.pdf');

  }
  creation_table() {
    let tab_person: any = []
    let statut = {
      'c3ua9MGsI13TFp04JUui': 'ENCADREMENT ET APPUI',
      'bhWBRM0VQNV4CrIR1a8F': 'CONDUCTEURS ENGINS',
      'wKGKtTCoYRJRJkBZoFYV': 'CHAUFFEURS',
      'a0j2NVGKSWuULltQeJNA': 'MANOEUVRES',
      'ykPrM225VtJrMe7NvIHt': 'APPRENTIS',
      'Q1njfNbBiVETnY9Uficy': 'VIGILES',
      '9on5kDjFEBcJWQ5KOwuO': 'PRESTATAIRES'
    }
    let mykeys = Object.keys(statut)
    let myval = Object.values(statut)
    for (let ind in mykeys) {
      let personnel_bystatut = this.personnel_store.donnees_personnel().filter(x => x.statut_id == mykeys[ind] && x.dates.length > 0)
      tab_person.push([{
        content: myval[ind],
        colSpan: 6 + this.weekDays().length,
        rowSpan: 1,
        styles: {
          halign: 'left',
          fontStyle: "bold",
          fontSize: 18
        }
      }])
      for (let person of personnel_bystatut) {
        let dates_pointage = this.personnel_store.getDates()[0].
          filter((x: any) => {
            return this._service.convertDate(x).getTime() >= this._service.convertDate(this.debut_date()).getTime() &&
              this._service.convertDate(x).getTime() <= this._service.convertDate(this.fin_date()).getTime()
          })
        let rep = person.dates.every((x: any) => !dates_pointage.includes(x))
        if (!rep) {
          let dates = person.dates

          let presence: any[] = []
          let heuressup: any[] = []
          let heuresnorm: any[] = []

          //presence = [person.nom, this.titleCaseWord(person.prenom.toLowerCase()), this.titleCaseWord(person.fonction.toLowerCase())]
          presence.push({
            content: person.nom,
            styles: {
              halign: 'left'
            }
          })
          presence.push({
            content: this.titleCaseWord(person.prenom.toLowerCase()),
            styles: {
              halign: 'left'
            }
          })
          presence.push({
            content: this.titleCaseWord2(person.fonction.toLowerCase()),
            styles: {
              halign: 'left'
            }
          })
          for (let row of this.weekDays()) {
            let jour = Info.weekdays('short')[row.weekday - 1].replace('.', '')
            if (dates.includes(row.toLocaleString())) {
              let ind = dates.indexOf(row.toLocaleString())
              heuressup.push(person.heureSup[ind])
              if (jour == 'dim' || jour == 'sam') {
                presence.push({
                  content: '',
                  styles: {
                    halign: 'center',
                    fillColor: [212, 204, 204],
                  }
                })
                heuresnorm.push(0)
              }
              else {
                if (!person.presence[ind]) {
                  this.nbre_absence.set(this.nbre_absence() + 1)
                }
                presence.push({
                  content: person.presence[ind] ? person.heuresN[ind] : 'A',
                  styles: {
                    halign: 'center',
                    fillColor: person.presence[ind] ? [255, 255, 255] : [242, 205, 163],
                  }
                })
                heuresnorm.push(person.heuresN[ind])
              }
            }
            else {
              if (jour == 'dim' || jour == 'sam') {
                presence.push({
                  content: '',
                  styles: {
                    halign: 'center',
                    fillColor: [212, 204, 204],
                  }
                })
              }
              else {
                presence.push('')
              }
              heuresnorm.push(0)
              heuressup.push(0)
            }
          }
          ;
          let hn = this._service.somme(heuresnorm)
          let hs = this._service.somme(heuressup)
          presence.push({
            content: hn,
            styles: {
              halign: 'center',
              fillColor: [192, 192, 192],
              fontStyle: "bold"
            }
          })
          presence.push({
            content: hs,
            styles: {
              halign: 'center',
              fillColor: [255, 248, 220],
              fontStyle: "bold"
            }
          })
          presence.push({
            content: hn + hs,
            styles: {
              halign: 'center',
              fillColor: [230, 236, 238],
              fontStyle: "bold"
            }
          })
          this.nbre_hs.set(this.nbre_hs() + hs)
          tab_person.push(presence)

        }


      }

    }
    return tab_person
  }
  titleCaseWord(strin: string) {
    let splite = strin.split(" ");
    let ret = ''
    for (let ind in splite) {
      let mystr = splite[ind]
      if (mystr != '') {
        let str = mystr[0].toUpperCase() + mystr.slice(1);
        ret = ret + ' ' + str
      }

    }

    return ret
  }
  titleCaseWord2(strin: string) {
    let str = strin[0].toUpperCase() + strin.slice(1);
    return str
  }
  getfin_date(date: string) {
    let num_month1 = this._service.convertDate(date).getMonth();
    let num_month2 = num_month1 == 11 ? 0 : num_month1 + 1;
    let annee1 = this._service.convertDate(date).getFullYear();
    let annee2 = num_month1 == 11 ? annee1 + 1 : annee1;
    return this._service.convertDate('20/' + (num_month2 + 1) + '/' + annee2);
  }
  expander(index: number) {
    var rep = this.tab_expander()[index];
    this.tab_expander.update((tab) => tab.map((x, i) => i == index ? !rep : x))
  }
  print(index: number) {
    this.debut_date.set(this.personnel_store.getDates()[1][index].debut);
    this.fin_date.set(this.personnel_store.getDates()[1][index].fin);
    this.impression();
  }
}
