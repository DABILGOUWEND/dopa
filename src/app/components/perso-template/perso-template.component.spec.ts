import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersoTemplateComponent } from './perso-template.component';

describe('PersoTemplateComponent', () => {
  let component: PersoTemplateComponent;
  let fixture: ComponentFixture<PersoTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersoTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersoTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
