import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratSstraitantComponent } from './contrat-sstraitant.component';

describe('ContratSstraitantComponent', () => {
  let component: ContratSstraitantComponent;
  let fixture: ComponentFixture<ContratSstraitantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratSstraitantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContratSstraitantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
