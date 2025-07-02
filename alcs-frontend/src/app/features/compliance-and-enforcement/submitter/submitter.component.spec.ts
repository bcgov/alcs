import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { StartOfDayPipe } from '../../../shared/pipes/startOfDay.pipe';
import { OverviewComponent } from '../overview/overview.component';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ToastService } from '../../../services/toast/toast.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ComplianceAndEnforcementSubmitterDto } from '../../../services/compliance-and-enforcement/submitter/submitter.dto';
import { ComplianceAndEnforcementSubmitterService } from '../../../services/compliance-and-enforcement/submitter/submitter.service';
import { SubmitterComponent } from './submitter.component';

describe('SubmitterComponent', () => {
  let component: SubmitterComponent;
  let fixture: ComponentFixture<SubmitterComponent>;
  let mockSubmitter: ComplianceAndEnforcementSubmitterDto = {
    uuid: '12345',
    dateAdded: 0,
    isAnonymous: false,
    name: 'a',
    email: 'b',
    telephoneNumber: 'c',
    affiliation: 'd',
    additionalContactInformation: 'e',
  };
  let mockComplianceAndEnforcementSubmitterService: DeepMocked<ComplianceAndEnforcementSubmitterService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockComplianceAndEnforcementSubmitterService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [OverviewComponent, StartOfDayPipe],
      providers: [
        {
          provide: ComplianceAndEnforcementSubmitterService,
          useValue: mockComplianceAndEnforcementSubmitterService,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ fileNumber: '12345' }),
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add overview control to parent form', () => {
    const parentForm = new FormGroup({ overview: new FormGroup({}) });
    component.parentForm = parentForm;

    expect(parentForm.contains('overview')).toBe(true);
  });

  it('should patch form values when file input is set', () => {
    component.submitter = mockSubmitter;

    expect(component.form.enabled).toBe(true);
    expect(component.form.value.name).toEqual(mockSubmitter.name);
    expect(component.form.value.email).toBe(mockSubmitter.email);
    expect(component.form.value.telephoneNumber).toBe(mockSubmitter.telephoneNumber);
    expect(component.form.value.affiliation).toEqual(mockSubmitter.affiliation);
    expect(component.form.value.additionalContactInformation).toBe(mockSubmitter.additionalContactInformation);
  });

  it('should not patch form if file input is undefined', () => {
    jest.spyOn(component.form, 'patchValue');

    component.submitter = undefined;

    expect(component.form.patchValue).not.toHaveBeenCalled();
  });

  it('should emit changes when form values change', (done) => {
    component.submitter = mockSubmitter;

    component.$changes.subscribe((val) => {
      if (val.additionalContactInformation === 'Updated notes') {
        expect(val.additionalContactInformation).toBe('Updated notes');
        done();
      }
    });

    component.form.get('additionalContactInformation')?.setValue('Updated notes');
  });

  it('should complete $destroy on ngOnDestroy', () => {
    jest.spyOn(component.$destroy, 'next');
    jest.spyOn(component.$destroy, 'complete');

    component.ngOnDestroy();

    expect(component.$destroy.next).toHaveBeenCalled();
    expect(component.$destroy.complete).toHaveBeenCalled();
  });

  it('should not resubscribe to form valueChanges if already subscribed', () => {
    component.submitter = mockSubmitter;
    jest.spyOn(component.form.valueChanges, 'pipe').mockImplementation(() => ({ subscribe: jest.fn() }) as any);
    component.submitter = mockSubmitter; // set again, should not resubscribe

    expect(component.form.valueChanges.pipe).not.toHaveBeenCalled();
  });

  it('should enable all form controls when file is set', () => {
    component.submitter = mockSubmitter;

    Object.values(component.form.controls).forEach((control) => {
      expect(control.enabled).toBe(true);
    });
  });

  it('should emit changes with correct types when form changes', (done) => {
    component.submitter = mockSubmitter;

    component.$changes.subscribe((val) => {
      expect(typeof val.name).toBe('string');
      done();
    });

    component.form.get('name')?.setValue('Person');
  });

  it('should not throw if ngOnDestroy is called multiple times', () => {
    expect(() => {
      component.ngOnDestroy();
      component.ngOnDestroy();
    }).not.toThrow();
  });
});
