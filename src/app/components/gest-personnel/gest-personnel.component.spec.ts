import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestPersonnelComponent } from './gest-personnel.component';

describe('GestPersonnelComponent', () => {
  let component: GestPersonnelComponent;
  let fixture: ComponentFixture<GestPersonnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestPersonnelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestPersonnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
