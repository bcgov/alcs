import 'zone.js';
import 'zone.js/testing';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ComplianceAndEnforcementService } from '../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ComplianceAndEnforcementSearchTableComponent } from './c-and-e-file-search-table.component';

describe('ComplianceAndEnforcementSearchTableComponent', () => {
  let component: ComplianceAndEnforcementSearchTableComponent;
  let fixture: ComponentFixture<ComplianceAndEnforcementSearchTableComponent>;
  let mockRouter: DeepMocked<Router>;
  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementService>;

  beforeEach(() => {
    mockRouter = createMock();
    mockComplianceAndEnforcementService = createMock();

    TestBed.configureTestingModule({
      declarations: [ComplianceAndEnforcementSearchTableComponent],
      providers: [
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ComplianceAndEnforcementService,
          useValue: mockComplianceAndEnforcementService,
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

  it('should populate datasource and clear loading when cAndEFiles input is set', () => {
    const rows = [{ fileNumber: 'C-1', responsibleParties: ['A'], isCrown: false } as any];

    component.cAndEFiles = rows;

    expect(component._cAndEFiles).toEqual(rows);
    expect(component.dataSource).toEqual(rows);
    expect(component.isLoading).toBeFalsy();
  });

  it('should emit table change event with current sort and pagination state', () => {
    const emitSpy = jest.spyOn(component.tableChange, 'emit');

    component.onTableChange();

    expect(component.isLoading).toBeTruthy();
    expect(emitSpy).toHaveBeenCalledWith({
      pageIndex: 0,
      itemsPerPage: 20,
      sortDirection: 'desc',
      sortField: 'dateSubmitted',
      tableType: 'INQR',
    });
  });

  it('should update pagination state and emit page change event', () => {
    const emitSpy = jest.spyOn(component.tableChange, 'emit');

    component.onPageChange({ pageIndex: 2, pageSize: 50, length: 200 } as any);

    expect(component.pageIndex).toBe(2);
    expect(component.itemsPerPage).toBe(50);
    expect(emitSpy).toHaveBeenCalledWith({
      pageIndex: 2,
      itemsPerPage: 50,
      sortDirection: 'desc',
      sortField: 'dateSubmitted',
      tableType: 'INQR',
    });
  });

  it('should reset page index and update sort state before emitting', () => {
    const emitSpy = jest.spyOn(component.tableChange, 'emit');

    component.onSortChange({ direction: 'asc', active: 'localGovernmentName' } as any);

    expect(component.pageIndex).toBe(0);
    expect(component.sortDirection).toBe('asc');
    expect(component.sortField).toBe('localGovernmentName');
    expect(emitSpy).toHaveBeenCalledWith({
      pageIndex: 0,
      itemsPerPage: 20,
      sortDirection: 'asc',
      sortField: 'localGovernmentName',
      tableType: 'INQR',
    });
  });

  it('should open the selected record in a new tab', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    mockRouter.createUrlTree.mockReturnValue({} as any);
    mockRouter.serializeUrl.mockReturnValue('/compliance-and-enforcement/C-1');

    component.onSelectRecord({ fileNumber: 'C-1' } as any);

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/compliance-and-enforcement/C-1']);
    expect(mockRouter.serializeUrl).toHaveBeenCalledWith({} as any);
    expect(openSpy).toHaveBeenCalledWith('/compliance-and-enforcement/C-1', '_blank');
  });

  it('should delegate property owner resolution to the compliance service', () => {
    const record = { isCrown: true, responsibleParties: ['A', 'B'] } as any;
    mockComplianceAndEnforcementService.propertyOwnerName.mockReturnValue('Crown et al.');

    const result = component.propertyOwnerName(record);

    expect(mockComplianceAndEnforcementService.propertyOwnerName).toHaveBeenCalledWith(true, ['A', 'B']);
    expect(result).toBe('Crown et al.');
  });
});
