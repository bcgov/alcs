import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionerTagsHeaderComponent } from './commissioner-tags-header.component';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { FileTagService } from '../../../services/common/file-tag.service';

describe('CommissionerTagsHeaderComponent', () => {
  let component: CommissionerTagsHeaderComponent;
  let fixture: ComponentFixture<CommissionerTagsHeaderComponent>;
  let mockFileTagService: DeepMocked<FileTagService>;

  beforeEach(async () => {
    mockFileTagService = createMock();

    await TestBed.configureTestingModule({
      declarations: [CommissionerTagsHeaderComponent],
      providers: [
        {
          provide: FileTagService,
          useValue: mockFileTagService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommissionerTagsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
