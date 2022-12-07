import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDragDropComponent } from './file-drag-drop.component';

describe('FileDragDropComponent', () => {
  let component: FileDragDropComponent;
  let fixture: ComponentFixture<FileDragDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileDragDropComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FileDragDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
