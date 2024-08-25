import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointageTrvxEnginsComponent } from './pointage-trvx-engins.component';

describe('PointageTrvxEnginsComponent', () => {
  let component: PointageTrvxEnginsComponent;
  let fixture: ComponentFixture<PointageTrvxEnginsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointageTrvxEnginsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PointageTrvxEnginsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
