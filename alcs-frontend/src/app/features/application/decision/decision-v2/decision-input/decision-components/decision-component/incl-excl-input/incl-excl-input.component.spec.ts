import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InclExclInputComponent } from './incl-excl-input.component';

describe('InclExclInputComponent', () => {
  let component: InclExclInputComponent;
  let fixture: ComponentFixture<InclExclInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InclExclInputComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InclExclInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
