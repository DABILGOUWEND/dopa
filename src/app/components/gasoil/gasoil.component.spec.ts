import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GasoilComponent } from './gasoil.component';

describe('GasoilComponent', () => {
  let component: GasoilComponent;
  let fixture: ComponentFixture<GasoilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GasoilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GasoilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
