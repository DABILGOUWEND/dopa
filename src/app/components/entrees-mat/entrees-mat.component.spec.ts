import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntreesMatComponent } from './entrees-mat.component';

describe('EntreesMatComponent', () => {
  let component: EntreesMatComponent;
  let fixture: ComponentFixture<EntreesMatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntreesMatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntreesMatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
