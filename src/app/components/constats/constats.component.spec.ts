import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstatsComponent } from './constats.component';

describe('ConstatsComponent', () => {
  let component: ConstatsComponent;
  let fixture: ComponentFixture<ConstatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConstatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
