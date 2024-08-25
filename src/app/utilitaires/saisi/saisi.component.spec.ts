import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisiComponent } from './saisi.component';

describe('SaisiComponent', () => {
  let component: SaisiComponent;
  let fixture: ComponentFixture<SaisiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaisiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
