import { TestBed } from '@angular/core/testing';
import { PortalStatusDataSourceService, TreeNode } from './portal-status-data-source.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthenticationService, ICurrentUser } from '../../authentication/authentication.service';
import { BehaviorSubject } from 'rxjs';

describe('PortalStatusDataSourceService', () => {
  let service: PortalStatusDataSourceService;
  let mockAuthenticationService: DeepMocked<AuthenticationService>;
  let currentUser: BehaviorSubject<ICurrentUser | undefined>;

  beforeEach(() => {
    mockAuthenticationService = createMock();
    currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
      ],
    });
    mockAuthenticationService.$currentUser = currentUser;
    service = TestBed.inject(PortalStatusDataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load initial data', () => {
    expect(service.data).toBeTruthy();
    expect(service.data.length).toBeGreaterThan(0);
  });

  it('should filter data', () => {
    service.filter('With ALC');
    expect(service.data.length).toBe(1);

    const node: TreeNode = service.data[0];
    expect(node.item.label).toEqual('With ALC');
  });

  it('should reset data when filtering with empty text', () => {
    service.filter('');
    expect(service.data.length).toBeGreaterThan(0);
  });
});
