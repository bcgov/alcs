import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TagCategoryDto } from '../../../../../services/tag/tag-category/tag-category.dto';
import { TagCategoryService } from '../../../../../services/tag/tag-category/tag-category.service';

@Component({
  selector: 'app-tag-category-dialog',
  templateUrl: './tag-category-dialog.component.html',
  styleUrls: ['./tag-category-dialog.component.scss'],
})
export class TagCategoryDialogComponent {
  name = '';
  uuid = '';

  isLoading = false;
  isEdit = false;
  showNameWarning = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TagCategoryDto | undefined,
    private dialogRef: MatDialogRef<TagCategoryDialogComponent>,
    private tagCategoryService: TagCategoryService,
  ) {
    if (data) {
      this.uuid = data.uuid;
      this.name = data.name;
    }
    this.isEdit = !!data;
  }

  async onSubmit() {
    this.isLoading = true;

    const dto: TagCategoryDto = {
      uuid: this.uuid,
      name: this.name,
    };

    if (this.isEdit) {
      try {
        await this.tagCategoryService.update(this.uuid, dto);
      } catch (e) {
        this.showWarning();
        this.isLoading = false;
        return;
      }
    } else {
      try {
        await this.tagCategoryService.create(dto);
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
    this.name = '';
  }
}
