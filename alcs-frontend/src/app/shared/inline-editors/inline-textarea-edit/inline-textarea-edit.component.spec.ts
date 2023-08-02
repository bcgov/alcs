import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineTextareaEditComponent } from './inline-textarea-edit.component';

describe('InlineTextareaComponent', () => {
  let component: InlineTextareaEditComponent;
  let fixture: ComponentFixture<InlineTextareaEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InlineTextareaEditComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineTextareaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
