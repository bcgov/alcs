import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toast/toast.service';

const BYTES_PER_MEGABYTE = 1048576;

export const verifyFileSize = (file: File, toastService: ToastService) => {
  if (file.size > environment.maxFileSize) {
    const niceSize = environment.maxFileSize / BYTES_PER_MEGABYTE;
    toastService.showWarningToast(`Maximum file size is ${niceSize}MB, please choose a smaller file`);
    return false;
  }
  return true;
};
