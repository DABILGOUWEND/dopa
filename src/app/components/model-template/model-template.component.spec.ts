import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelTemplateComponent } from './model-template.component';

describe('ModelTemplateComponent', () => {
  let component: ModelTemplateComponent;
  let fixture: ComponentFixture<ModelTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
