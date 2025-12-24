import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TagDto } from '../../../../services/tag/tag.dto';
import { TagService } from '../../../../services/tag/tag.service';
import { TagCategoryService } from '../../../../services/tag/tag-category/tag-category.service';
import { TagCategoryDto } from 'src/app/services/tag/tag-category/tag-category.dto';
import { Subject, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-tag-dialog',
    templateUrl: './tag-dialog.component.html',
    styleUrls: ['./tag-dialog.component.scss'],
    standalone: false
})
export class TagDialogComponent implements OnInit {
  destroy = new Subject<void>();
  uuid = '';
  name = '';
  category: TagCategoryDto | undefined = {
    uuid: '',
    name: '',
  };
  isActive = 'true';
  categoryId = '';

  isLoading = false;
  isEdit = false;
  showNameWarning = false;
  nameControl = new FormControl();

  categories: TagCategoryDto[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TagDto | undefined,
    private dialogRef: MatDialogRef<TagDialogComponent>,
    private tagService: TagService,
    private tagCategoryService: TagCategoryService,
  ) {
    if (data) {
      this.uuid = data.uuid;
      this.name = data.name;
      this.category = data.category ? data.category : undefined;
      this.categoryId = data.category ? data.category.uuid : '';
      this.isActive = data.isActive.toString();
    }
    this.isEdit = !!data;
  }

  async ngOnInit(): Promise<void> {
    this.fetchCategories();

    this.tagCategoryService.$categories
      .pipe(takeUntil(this.destroy))
      .subscribe((result: { data: TagCategoryDto[]; total: number }) => {
        this.categories = result.data;
      });
  }

  async fetchCategories() {
    this.tagCategoryService.fetch(0, 0);
  }

  async onSubmit() {
    this.isLoading = true;
    const dto: TagDto = {
      uuid: this.uuid,
      name: this.name,
      category: this.categoryId && this.categoryId !== '' ? {
        uuid: this.categoryId,
        name: '',
      } : undefined,
      isActive: this.isActive === 'true',
    };

    if (this.isEdit) {
      try {
        await this.tagService.update(this.uuid, dto);
      } catch (e) {
        this.showWarning();
        this.isLoading = false;
        return;
      }
    } else {
      try {
        await this.tagService.create(dto);
      } catch (e) {
        this.showWarning();
        this.isLoading = false;
        return;
      }
    }
    this.isLoading = false;
    this.dialogRef.close(true);
  }

  onChange() {
    this.showNameWarning = false;
  }

  private showWarning() {
    this.showNameWarning = true;
    this.nameControl.setErrors({"invalid": true});
  }
}
