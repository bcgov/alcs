import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NfuInputComponent } from './nfu-input.component';

describe('NfuInputComponent', () => {
  let component: NfuInputComponent;
  let fixture: ComponentFixture<NfuInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NfuInputComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NfuInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
