import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestMaterielComponent } from './gest-materiel.component';

describe('GestMaterielComponent', () => {
  let component: GestMaterielComponent;
  let fixture: ComponentFixture<GestMaterielComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestMaterielComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestMaterielComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
