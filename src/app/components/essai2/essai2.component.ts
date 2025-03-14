import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild, ViewChild } from '@angular/core';
import { WenService } from '../../wen.service';
import { ApproGasoilStore, DatesStore, DevisStore, EnginsStore, GasoilStore, PersonnelStore, TachesEnginsStore, TachesStore, UnitesStore } from '../../store/appstore';
import { ImportedModule } from '../../modules/imported/imported.module';
import { DateTime, Info, Interval, VERSION } from 'luxon';
import { toUnicode } from 'node:punycode';
import e from 'express';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AuthenService } from '../../authen.service';
import { DataLoaderService } from '../../services/data-loader.service';
import { Router } from '@angular/router';
import mapboxgl from 'mapbox-gl'
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { Subscription } from 'rxjs';
import { CameraPreviewServiceService } from '../../camera-preview-service.service';

@Component({
    selector: 'app-essai2',
    imports: [ImportedModule],
    templateUrl: './essai2.component.html',
    styleUrl: './essai2.component.scss'
})
export class Essai2Component implements OnInit {
  videoElement = viewChild<ElementRef>('videoElement');

  videoStream: MediaStream | null = null;

  videoSubscription?: Subscription;
  qrCodeSubscription?: Subscription;

  timeInterval: any = null;
  constructor(
    private cameraPreviewService: CameraPreviewServiceService,
    private barcodeService: WenService
  ) {}
  ngOnInit(): void {
    this.listenForChanges();
  }

  openCamera(): void {
    this.cameraPreviewService.openCamera();
  }

  closeCamera(): void {
    this.cameraPreviewService.closeCamera();
    this.stopPeriodicalScan();
  }

  private listenForChanges(): void {
    this.videoSubscription = this.cameraPreviewService.stream.subscribe({
      next: (stream) => {
        this.videoStream = stream;
        this.displayCamera();
      }
    });

    this.qrCodeSubscription = this.barcodeService.qrValue.subscribe({
      next: (code) => {
        alert(code);
        this.closeCamera();
      }
    })
  }

  private displayCamera() {
    const ele = this.videoElement()?.nativeElement as HTMLVideoElement;

    if (!this.videoStream || !ele) { 
      this.closeCamera();
      return; 
    }

    ele.srcObject = this.videoStream;
    ele.onloadedmetadata = () => {
      ele.play();
    }

    this.beginPeriodicalScan(ele);
  }

  private beginPeriodicalScan(ele: HTMLVideoElement): void {
    ele.addEventListener('pause', () => ele.play());
    this.timeInterval = setInterval(() => {
      this.barcodeService.captureFrame(ele);
    }, 1000)
  }

  private stopPeriodicalScan(): void {
    if (this.timeInterval) { clearInterval(this.timeInterval); }
    
    const ele = this.videoElement()?.nativeElement as HTMLVideoElement;
    if (ele) {
      ele.removeEventListener('pause', () => {});
    }
  }

  ngOnDestroy(): void {
    this.videoSubscription?.unsubscribe();
    this.qrCodeSubscription?.unsubscribe();
    this.closeCamera();
  }

}
