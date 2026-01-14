import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, Subject } from 'rxjs';
import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ComplianceAndEnforcementPropertyService } from '../../../../services/compliance-and-enforcement/property/property.service';
import {
  FOIPPACategory,
  ResponsiblePartyDto,
  ResponsiblePartyType
} from '../../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.dto';
import { ResponsiblePartiesService } from '../../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { ResponsiblePartiesDetailsComponent } from './responsible-parties.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ResponsiblePartiesDetailsComponent', () => {
  let component: ResponsiblePartiesDetailsComponent;
  let fixture: ComponentFixture<ResponsiblePartiesDetailsComponent>;
  let mockActivatedRoute: DeepMocked<ActivatedRoute>;
  let mockRouter: DeepMocked<Router>;
  let mockService: DeepMocked<ComplianceAndEnforcementService>;
  let mockResponsiblePartiesService: DeepMocked<ResponsiblePartiesService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockPropertyService: DeepMocked<ComplianceAndEnforcementPropertyService>;

  beforeEach(async () => {
    mockActivatedRoute = createMock<ActivatedRoute>();
    mockRouter = createMock<Router>();
    mockService = createMock<ComplianceAndEnforcementService>();
    mockResponsiblePartiesService = createMock<ResponsiblePartiesService>();
    mockToastService = createMock<ToastService>();
    mockPropertyService = createMock<ComplianceAndEnforcementPropertyService>();

    TestBed.configureTestingModule({
    declarations: [ResponsiblePartiesDetailsComponent],
    imports: [],
    providers: [
        {
            provide: ActivatedRoute,
            useValue: mockActivatedRoute,
        },
        {
            provide: Router,
            useValue: mockRouter,
        },
        {
            provide: ComplianceAndEnforcementService,
            useValue: mockService,
        },
        {
            provide: ResponsiblePartiesService,
            useValue: mockResponsiblePartiesService,
        },
        {
            provide: ToastService,
            useValue: mockToastService,
        },
        {
            provide: ComplianceAndEnforcementPropertyService,
            useValue: mockPropertyService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    fixture = TestBed.createComponent(ResponsiblePartiesDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set editing from route data on ngOnInit', () => {
    const dataSubject = new Subject<any>();
    mockActivatedRoute.data = dataSubject as any;
    component.ngOnInit();
    dataSubject.next({ editing: 'parties' });
    expect(component.editing).toBe('parties');
  });

  it('should load responsible parties when file is set', () => {
    const fileSubject = new Subject<any>();
    mockService.$file = fileSubject as any;
    mockResponsiblePartiesService.fetchByFileNumber.mockResolvedValue([]);
    
    component.ngOnInit();
    const file = { fileNumber: '123', property: { ownershipTypeCode: 'SMPL' } };
    fileSubject.next(file);

    expect(component.file).toBe(file);
    expect(component.fileNumber).toBe('123');
    expect(component.isPropertyCrown).toBe(false);
  });

  it('should detect Crown property correctly', () => {
    const fileSubject = new Subject<any>();
    mockService.$file = fileSubject as any;
    mockResponsiblePartiesService.fetchByFileNumber.mockResolvedValue([]);
    
    component.ngOnInit();
    const file = { fileNumber: '123', property: { ownershipTypeCode: 'CRWN' } };
    fileSubject.next(file);

    expect(component.isPropertyCrown).toBe(true);
  });

  it('should get party display name correctly', () => {
    const individualParty: ResponsiblePartyDto = {
      uuid: '1',
      partyType: ResponsiblePartyType.PROPERTY_OWNER,
      foippaCategory: FOIPPACategory.INDIVIDUAL,
      isPrevious: false,
      individualName: 'John Doe',
    };

    const organizationParty: ResponsiblePartyDto = {
      uuid: '2',
      partyType: ResponsiblePartyType.PROPERTY_OWNER,
      foippaCategory: FOIPPACategory.ORGANIZATION,
      isPrevious: false,
      organizationName: 'ABC Company',
    };

    expect(component.getPartyDisplayName(individualParty)).toBe('John Doe');
    expect(component.getPartyDisplayName(organizationParty)).toBe('ABC Company');
  });

  it('should format party type display correctly', () => {
    const previousOwner: ResponsiblePartyDto = {
      uuid: '1',
      partyType: ResponsiblePartyType.PROPERTY_OWNER,
      foippaCategory: FOIPPACategory.INDIVIDUAL,
      isPrevious: true,
      ownerSince: 1640995200000, // Jan 1, 2022
    };

    const currentOwner: ResponsiblePartyDto = {
      uuid: '2',
      partyType: ResponsiblePartyType.PROPERTY_OWNER,
      foippaCategory: FOIPPACategory.INDIVIDUAL,
      isPrevious: false,
      ownerSince: 1640995200000, // Jan 1, 2022
    };

    const operator: ResponsiblePartyDto = {
      uuid: '3',
      partyType: ResponsiblePartyType.OPERATOR,
      foippaCategory: FOIPPACategory.INDIVIDUAL,
      isPrevious: false,
    };

    expect(component.getPartyTypeDisplay(previousOwner)).toBe('Previous Property Owner');
    const actualFormattedDate = component.getPartyTypeDisplay(currentOwner);
    expect(actualFormattedDate).toMatch(/Property Owner Since: .+/);
    expect(component.getPartyTypeDisplay(operator)).toBe('Operator');
  });

  it('should handle inline editing save', async () => {
    const mockParty = { uuid: 'test-uuid', foippaCategory: FOIPPACategory.INDIVIDUAL } as any;
    const updateSpy = jest.spyOn(mockResponsiblePartiesService, 'update').mockReturnValue(of({} as any));
    const loadSpy = jest.spyOn(component, 'loadResponsibleParties');
    
    await component.saveInlineEdit(mockParty, 'email', 'test@example.com');
    
    expect(updateSpy).toHaveBeenCalledWith('test-uuid', { individualEmail: 'test@example.com' });
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should complete $destroy on ngOnDestroy', () => {
    const nextSpy = jest.spyOn(component.$destroy, 'next');
    const completeSpy = jest.spyOn(component.$destroy, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
