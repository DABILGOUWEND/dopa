import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EssaiSsrComponent } from './essai-ssr.component';

describe('EssaiSsrComponent', () => {
  let component: EssaiSsrComponent;
  let fixture: ComponentFixture<EssaiSsrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EssaiSsrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EssaiSsrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
