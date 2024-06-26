import { TestBed } from '@angular/core/testing';
import { FileTypeDataSourceService, TreeNode } from './file-type-data-source.service';

describe('FileTypeDataSourceService', () => {
  let service: FileTypeDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileTypeDataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load initial data', () => {
    expect(service.data).toBeTruthy();
    expect(service.data.length).toBeGreaterThan(0);
  });

  it('should filter data', () => {
    service.filter('Utility/Energy Planning');
    expect(service.data.length).toBe(1);

    const node: TreeNode = service.data[0];
    expect(node.item.label).toEqual('Planning Reviews');
  });

  it('should reset data when filtering with empty text', () => {
    service.filter('');
    expect(service.data.length).toBeGreaterThan(0);
  });
});
