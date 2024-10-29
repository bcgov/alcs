import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild, type OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-tags-header',
  templateUrl: './tags-header.component.html',
  styleUrl: './tags-header.component.scss',
})
export class TagsHeaderComponent {
  tags: string[] = [];
  allTags: string[] = ['Angular', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'SCSS'];
  filteredTags: Observable<string[]>;
  currentTag = 'hello';
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagControl = new FormControl();

  hovered = false;
  showPlaceholder = false;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement> | undefined;

  constructor() {
    this.filteredTags = this.tagControl.valueChanges.pipe(
      startWith(''),
      map((tag: string | null) => (tag ? this._filter(tag) : this.allTags.slice())),
    );
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
    this.tagControl.setValue(null);
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  selectTag(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;

    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    if (this.tagInput) this.tagInput.nativeElement.value = '';
    this.tagControl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTags.filter((tag) => tag.toLowerCase().includes(filterValue));
  }
}
