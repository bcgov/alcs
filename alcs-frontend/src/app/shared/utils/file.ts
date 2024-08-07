export const downloadFileFromUrl = (url: string, fileName: string) => {
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = fileName;
  if (window.webkitURL == null) {
    downloadLink.onclick = (event: MouseEvent) => document.body.removeChild(<Node>event.target);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
  }
  downloadLink.click();
};

export const openFileInline = (url: string, fileName: string) => {
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.title = fileName;

    const object = newWindow.document.createElement('object');
    object.data = url;
    object.style.borderWidth = '0';
    object.style.width = '100%';
    object.style.height = '100%';

    newWindow.document.body.appendChild(object);
    newWindow.document.body.style.backgroundColor = 'rgb(14, 14, 14)';
    newWindow.document.body.style.height = '100%';
    newWindow.document.body.style.width = '100%';
    newWindow.document.body.style.margin = '0';
    newWindow.document.body.style.overflow = 'hidden';
  }
};

export const splitExtension = (documentName: string) => {
  const lastPeriod = documentName.lastIndexOf('.');

  if (lastPeriod <= 0  || lastPeriod === documentName.length - 1) {
    return {
      fileName: documentName,
      extension: '',
    };
  }
  
  return {
    fileName: documentName.substring(0, lastPeriod),
    extension: documentName.substring(lastPeriod),
  };
};
