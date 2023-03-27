import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineNumberComponent } from './inline-number.component';

describe('InlineNumberComponent', () => {
  let component: InlineNumberComponent;
  let fixture: ComponentFixture<InlineNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InlineNumberComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
