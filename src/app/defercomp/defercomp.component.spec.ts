import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefercompComponent } from './defercomp.component';

describe('DefercompComponent', () => {
  let component: DefercompComponent;
  let fixture: ComponentFixture<DefercompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefercompComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefercompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
