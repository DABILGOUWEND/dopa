import { Component, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { tab_personnel } from '../../models/modeles';
import { PersonnelStore, DatesStore } from '../../store/appstore';
import { Task } from '../contrat-sstraitant/contrat-sstraitant.component';
import { WenService } from '../../wen.service';
import { DateTime, Info, Interval } from 'luxon';
import { ImportedModule } from '../../modules/imported/imported.module';
@Component({
  selector: 'app-pointage',
  standalone: true,
  imports: [ImportedModule],
  templateUrl: './pointage.component.html',
  styleUrl: './pointage.component.scss'
})
export class PointageComponent {
  nbre_hs = signal(0)
  nbre_absence = signal(0)
  formG: FormGroup
  debut_date = signal('')
  fin_date = signal('')
  is_table_being_updated = false
  is_new_row_being_added = false
  is_table_list_open = false
  text1: string = 'text'
  text2: string = 'select1'
  text3: string = 'select2'
  text4: string = 'number'
  default_date = signal(new Date())
  selectedData: tab_personnel
  madate = signal('')
  ind = signal(0)
  personnel_data: WritableSignal<any> = signal({
    nom: '',
    prenom: '',
    fonction: ''
  })
  readonly personnel_store = inject(PersonnelStore)
  readonly datesStore = inject(DatesStore)
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
  }

  ngOnInit() {
    this.personnel_store.loadPersonnel()
    this.personnel_store.filterbyNomPrenom('')
    this.datesStore.loaddates()
    this.madate.set(this.default_date().toLocaleDateString())
    this.personnel_store.filtrebyDate(this.madate())
  }
  //signals
  weekDays: Signal<DateTime[]> = computed(() => {
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
      let date = this.personnel_store.current_date()
      if (this.datespointage().includes(date)) {
        return new MatTableDataSource<tab_personnel>
          (this.personnel_store.data_pointage())
      }
      else {
        return new MatTableDataSource<tab_personnel>()
      }
    }
  );

  ischeck = computed(() => {
    return this.personnel_store.ischecked().includes(true)
  })
  datespointage = computed(() => {
    return this.datesStore.donnees_dates().map(x => x.dates)
  })

  datespointageClass = computed(() => {
    return this._service.classement(this.datespointage())
  })

  current_date = signal(new Date().toLocaleDateString())
  task: Task = {
    name: 'Indeterminate',
    completed: false,
    color: 'primary',
    subtasks: [
      { name: 'Primary', completed: false, color: 'primary' },
      { name: 'Accent', completed: false, color: 'accent' },
      { name: 'Warn', completed: false, color: 'warn' },
    ],
  };
  allComplete: boolean = false;
  selected: boolean[] = []
  table_update_form: FormGroup
  displayedColumns: string[] = ['nom', 'prenom', 'fonction', 'presence', 'nbre_heure', 'heure_sup', 'actions']
  //methods

  editperso(row: tab_personnel, index: number) {
    this.is_table_being_updated = true
    this.personnel_data().nom = row.nom
    this.personnel_data().prenom = row.prenom
    this.personnel_data().fonction = row.fonction
    this.selectedData = row

    this.ind.set(index)
    this.table_update_form.patchValue({
      heureNorm: this.personnel_store.heures_normale()[index],
      heureSup: this.personnel_store.heures_sup()[index]
    })
  }
  updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
  }
  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }
  setAll(completed: boolean) {
    this.allComplete = completed;
    this.personnel_store.ModifMultiPersonnel(completed)
  }
  is_checked(row: tab_personnel, ind: number) {
    this.selectedData = row
    let a = this.personnel_store.presence()[ind]
    //this.personnel_store.presence().splice(i, 1, !a)
    let index = this.selectedData.dates.indexOf(this.madate(), 0)
    let presence = row.Presence
    let rep = !a
    presence[index] = rep
    this.selectedData.Presence = presence
    let heurenorm = row.heuresN
    let heuresup = row.heureSup
    if (rep == false) {
      heurenorm[index] = 0
      heuresup[index] = 0
      this.selectedData.heuresN = heurenorm
      this.selectedData.heureSup = heuresup
    }
    else {
      heurenorm[index] = 8
      heuresup[index] = 0
      this.selectedData.heuresN = heurenorm
      this.selectedData.heureSup = heuresup
    }
    this.personnel_store.ModifPersonnel(this.selectedData)
  }
  annuler() {
    this.is_table_being_updated = false
  }
  updateTableData() {
    if (this.table_update_form.valid) {
      let value = this.table_update_form.value
      let index = this.selectedData.dates.indexOf(this.madate(), 0)
      let heurenorm = this.selectedData.heuresN
      let heuresup = this.selectedData.heureSup
      let presence = this.selectedData.Presence
      heurenorm[index] = value.heureNorm
      heuresup[index] = value.heureSup
      presence[index] = this.personnel_store.presence()[this.ind()]
      this.selectedData.heureSup = heuresup
      this.selectedData.heuresN = heurenorm
      this.selectedData.Presence = presence
      this.personnel_store.ModifPersonnel(this.selectedData)
      this.is_table_being_updated = false
    }
  }
  addEvent(event: MatDatepickerInputEvent<any>) {
    this.personnel_store.filtrebyDate(event.value.toLocaleDateString())
    this.madate.set(event.value.toLocaleDateString())
  }
  commencerPoint() {
    this.datesStore.adddates({ id: '', dates: this.madate() })
    this.personnel_store.filtrebyDate(this.madate())
    this.personnel_store.initialPersonnel(this.personnel_store.donnees_personnel())
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
    this.is_table_list_open = true
  }
  Annuler2() {
    this.is_table_list_open = false
  }
  afficher(row: any) {
    this.personnel_store.filtrebyDate(row)
    this.madate.set(row)
    this.default_date.set(this._service.convertDate(row))
  }
  deletedate(date: string) {
    let filtre = this.datesStore.dates().find(x => x.dates == date)
    if (filtre) {
      this.datesStore.removedates(filtre?.id)
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
    console.log(this.weekDays())
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
    img.src = '/assets/images/CGE.jpg'
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
              if (!person.Presence[ind]) {
                this.nbre_absence.set(this.nbre_absence() + 1)
              }
              presence.push({
                content: person.Presence[ind] ? person.heuresN[ind] : 'A',
                styles: {
                  halign: 'center',
                  fillColor: person.Presence[ind] ? [255, 255, 255] : [242, 205, 163],
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
    return tab_person
  }
  titleCaseWord(strin: string) {
    let splite = strin.split(" ");
    let ret = ''
    console.log(splite)
    for (let ind in splite) {
      let mystr = splite[ind]
      if (mystr != '') {
        let str = mystr[0].toUpperCase() + mystr.slice(1);
        ret = ret+' '+str 
      }

    }

    return ret
  }
  titleCaseWord2(strin: string) {
    let str = strin[0].toUpperCase() + strin.slice(1);
    return str
  }
}
