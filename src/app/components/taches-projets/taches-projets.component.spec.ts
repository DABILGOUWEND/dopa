import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TachesProjetsComponent } from './taches-projets.component';

describe('TachesProjetsComponent', () => {
  let component: TachesProjetsComponent;
  let fixture: ComponentFixture<TachesProjetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TachesProjetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TachesProjetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
