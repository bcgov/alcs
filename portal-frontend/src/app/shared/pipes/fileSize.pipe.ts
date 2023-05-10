import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filesize',
})
export class FileSizePipe implements PipeTransform {
  transform(size: number, extension: string = 'MB') {
    const fileSize = Math.round((size / (1024 * 1024)) * 100) / 100;
    return Math.max(fileSize, 0.01) + extension;
  }
}
