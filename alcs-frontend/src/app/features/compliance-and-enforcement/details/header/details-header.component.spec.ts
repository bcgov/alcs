import { DetailsHeaderComponent } from './details-header.component';
import { ComplianceAndEnforcementDto } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { Status } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';

jest.mock('../../../../services/compliance-and-enforcement/compliance-and-enforcement.service', () => ({
  ...jest.requireActual('../../../../services/compliance-and-enforcement/compliance-and-enforcement.service'),
  statusFromFile: jest.fn(),
}));

import { statusFromFile } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DetailsHeaderComponent', () => {
  let fixture: ComponentFixture<DetailsHeaderComponent>;
  let component: DetailsHeaderComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    declarations: [DetailsHeaderComponent],
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    fixture = TestBed.createComponent(DetailsHeaderComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set file, fileNumber, and status when file input is set', () => {
    const file: ComplianceAndEnforcementDto = { fileNumber: '123' } as ComplianceAndEnforcementDto;
    (statusFromFile as jest.Mock).mockReturnValue(Status.OPEN);

    component.file = file;

    expect(component.file).toBe(file);
    expect(component.fileNumber).toBe('123');
    expect(component.status).toBe(Status.OPEN);
    expect(statusFromFile).toHaveBeenCalledWith(file);
  });

  it('should not set file, fileNumber, or status if file input is undefined', () => {
    component.file = undefined;
    expect(component.file).toBeUndefined();
    expect(component.fileNumber).toBeUndefined();
    expect(component.status).toBeNull();
  });

  it('should complete $destroy on ngOnDestroy', () => {
    const nextSpy = jest.spyOn(component.$destroy, 'next');
    const completeSpy = jest.spyOn(component.$destroy, 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
