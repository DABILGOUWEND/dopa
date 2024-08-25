import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Essai2Component } from './essai2.component';

describe('Essai2Component', () => {
  let component: Essai2Component;
  let fixture: ComponentFixture<Essai2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Essai2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Essai2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
