import { TestBed } from '@angular/core/testing';
import { PortalStatusDataSourceService, TreeNode } from './portal-status-data-source.service';

describe('PortalStatusDataSourceService', () => {
  let service: PortalStatusDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
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
