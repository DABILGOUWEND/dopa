import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WendComponent } from './wend.component';

describe('WendComponent', () => {
  let component: WendComponent;
  let fixture: ComponentFixture<WendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WendComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
