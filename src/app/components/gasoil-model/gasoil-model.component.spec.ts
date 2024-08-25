import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GasoilModelComponent } from './gasoil-model.component';

describe('GasoilModelComponent', () => {
  let component: GasoilModelComponent;
  let fixture: ComponentFixture<GasoilModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GasoilModelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GasoilModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
