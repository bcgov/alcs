import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedTableComponent } from './assigned-table.component';

describe('AssignedTableComponent', () => {
  let component: AssignedTableComponent;
  let fixture: ComponentFixture<AssignedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignedTableComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
