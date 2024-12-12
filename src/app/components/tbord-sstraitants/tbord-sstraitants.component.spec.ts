import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TbordSstraitantsComponent } from './tbord-sstraitants.component';

describe('TbordSstraitantsComponent', () => {
  let component: TbordSstraitantsComponent;
  let fixture: ComponentFixture<TbordSstraitantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TbordSstraitantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TbordSstraitantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
