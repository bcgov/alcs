import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineTextareaComponent } from './inline-textarea.component';

describe('InlineTextareaComponent', () => {
  let component: InlineTextareaComponent;
  let fixture: ComponentFixture<InlineTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InlineTextareaComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
