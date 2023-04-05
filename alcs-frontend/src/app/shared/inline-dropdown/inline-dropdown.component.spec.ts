import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineDropdownComponent } from './inline-dropdown.component';

describe('InlineDropdownComponent', () => {
  let component: InlineDropdownComponent;
  let fixture: ComponentFixture<InlineDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InlineDropdownComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
