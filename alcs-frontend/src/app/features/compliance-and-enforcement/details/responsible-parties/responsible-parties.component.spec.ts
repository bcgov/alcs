import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResponsiblePartiesDetailsComponent } from './responsible-parties.component';
import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ResponsiblePartiesService } from '../../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../services/toast/toast.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, Subject } from 'rxjs';
import { 
  ResponsiblePartyDto, 
  ResponsiblePartyType, 
  FOIPPACategory 
} from '../../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.dto';

describe('ResponsiblePartiesDetailsComponent', () => {
  let component: ResponsiblePartiesDetailsComponent;
  let fixture: ComponentFixture<ResponsiblePartiesDetailsComponent>;
  let mockActivatedRoute: DeepMocked<ActivatedRoute>;
  let mockRouter: DeepMocked<Router>;
  let mockService: DeepMocked<ComplianceAndEnforcementService>;
  let mockResponsiblePartiesService: DeepMocked<ResponsiblePartiesService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockActivatedRoute = createMock<ActivatedRoute>();
    mockRouter = createMock<Router>();
    mockService = createMock<ComplianceAndEnforcementService>();
    mockResponsiblePartiesService = createMock<ResponsiblePartiesService>();
    mockToastService = createMock<ToastService>();

    TestBed.configureTestingModule({
      declarations: [ResponsiblePartiesDetailsComponent],
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
      ],
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
    expect(component.getPartyTypeDisplay(currentOwner)).toBe('Property Owner Since: Jan 1, 2022');
    expect(component.getPartyTypeDisplay(operator)).toBe('Operator');
  });

  it('should handle inline editing states correctly', () => {
    const partyUuid = 'test-uuid';
    
    expect(component.isEditing(partyUuid, 'email')).toBe(false);
    
    component.startEditing(partyUuid, 'email');
    expect(component.isEditing(partyUuid, 'email')).toBe(true);
    
    component.cancelInlineEdit(partyUuid, 'email');
    expect(component.isEditing(partyUuid, 'email')).toBe(false);
  });

  it('should complete $destroy on ngOnDestroy', () => {
    const nextSpy = jest.spyOn(component.$destroy, 'next');
    const completeSpy = jest.spyOn(component.$destroy, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
