import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeSousTraitantsComponent } from './liste-sous-traitants.component';

describe('ListeSousTraitantsComponent', () => {
  let component: ListeSousTraitantsComponent;
  let fixture: ComponentFixture<ListeSousTraitantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeSousTraitantsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListeSousTraitantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
