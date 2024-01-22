import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineTextComponent } from './inline-text.component';

describe('InlineTextComponent', () => {
  let component: InlineTextComponent;
  let fixture: ComponentFixture<InlineTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InlineTextComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
