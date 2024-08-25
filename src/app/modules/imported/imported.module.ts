import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatBadgeModule } from '@angular/material/badge';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { MatFormFieldModule } from "@angular/material/form-field";
import { QRCodeModule } from 'angularx-qrcode';
import { QrCodeModule } from 'ng-qrcode';


const MATERIAL_COMPONENTS = [
  CommonModule,
  MatTabsModule,
  MatInputModule,
  MatSelectModule,
  MatRippleModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatRadioModule,
  MatDialogModule,
  MatMenuModule,
  MatExpansionModule,
  MatProgressBarModule,
  MatTooltipModule,
  MatTableModule,
  MatTabsModule,
  MatPaginatorModule,
  MatSidenavModule,
  MatIconModule,
  MatCardModule,
  MatListModule,
  ReactiveFormsModule,
  MatButtonModule,
  MatToolbarModule,
  MatSlideToggleModule,
  FormsModule,
  MatTreeModule,
  MatSlideToggleModule,
  FormsModule,
  RouterModule,
  MatGridListModule,
  MatBadgeModule,
  CanvasJSAngularChartsModule,
  NgxMatTimepickerModule,
  MatFormFieldModule,
  QrCodeModule,
  QRCodeModule,
];



@NgModule({
  declarations: [],
  imports: [
    MATERIAL_COMPONENTS
  ],
  exports: [MATERIAL_COMPONENTS],
})
export class ImportedModule { }
