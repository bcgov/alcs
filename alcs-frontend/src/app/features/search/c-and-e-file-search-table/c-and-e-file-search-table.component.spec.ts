import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ComplianceAndEnforcementSearchTableComponent } from './c-and-e-file-search-table.component';

describe('ComplianceAndEnforcementSearchTableComponent', () => {
  let component: ComplianceAndEnforcementSearchTableComponent;
  let fixture: ComponentFixture<ComplianceAndEnforcementSearchTableComponent>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(() => {
    mockRouter = createMock();

    TestBed.configureTestingModule({
      declarations: [ComplianceAndEnforcementSearchTableComponent],
      providers: [
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ComplianceAndEnforcementSearchTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
