import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePanneComponent } from './table-panne.component';

describe('TablePanneComponent', () => {
  let component: TablePanneComponent;
  let fixture: ComponentFixture<TablePanneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablePanneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablePanneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
