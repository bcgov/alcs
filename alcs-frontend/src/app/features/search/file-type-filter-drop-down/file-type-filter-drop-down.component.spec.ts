import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTypeFilterDropDownComponent } from './file-type-filter-drop-down.component';

describe('FileTypeFilterDropDownComponent', () => {
  let component: FileTypeFilterDropDownComponent;
  let fixture: ComponentFixture<FileTypeFilterDropDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileTypeFilterDropDownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileTypeFilterDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
