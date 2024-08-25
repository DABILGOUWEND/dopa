import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSaisiComponent } from './form-saisi.component';

describe('FormSaisiComponent', () => {
  let component: FormSaisiComponent;
  let fixture: ComponentFixture<FormSaisiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSaisiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormSaisiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
