import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousTraitanceComponent } from './sous-traitance.component';

describe('SousTraitanceComponent', () => {
  let component: SousTraitanceComponent;
  let fixture: ComponentFixture<SousTraitanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SousTraitanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SousTraitanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
