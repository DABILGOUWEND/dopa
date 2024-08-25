import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprogoComponent } from './approgo.component';

describe('ApprogoComponent', () => {
  let component: ApprogoComponent;
  let fixture: ComponentFixture<ApprogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprogoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApprogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
