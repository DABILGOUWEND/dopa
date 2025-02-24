import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortiesMatComponent } from './sorties-mat.component';

describe('SortiesMatComponent', () => {
  let component: SortiesMatComponent;
  let fixture: ComponentFixture<SortiesMatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortiesMatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortiesMatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
