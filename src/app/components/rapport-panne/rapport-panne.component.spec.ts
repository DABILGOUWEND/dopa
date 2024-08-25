import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportPanneComponent } from './rapport-panne.component';

describe('RapportPanneComponent', () => {
  let component: RapportPanneComponent;
  let fixture: ComponentFixture<RapportPanneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportPanneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RapportPanneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
