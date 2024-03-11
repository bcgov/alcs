export const openPdfFile = (fileName: string, data: any) => {
  const blob = new Blob([data], { type: 'application/pdf' });
  var downloadURL = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadURL;
  downloadLink.download = fileName;
  if (window.webkitURL == null) {
    downloadLink.onclick = (event: MouseEvent) => document.body.removeChild(<Node>event.target);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
  }
  downloadLink.click();
};

export const openFileIframe = (fileName: string, url: string) => {
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.title = fileName;

    const iframe = newWindow.document.createElement('iframe');
    iframe.src = url;
    iframe.style.borderWidth = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';

    newWindow.document.body.appendChild(iframe);
    newWindow.document.body.style.backgroundColor = 'rgb(82, 86, 89)';
    newWindow.document.body.style.height = '100%';
    newWindow.document.body.style.width = '100%';
    newWindow.document.body.style.margin = '0';
    newWindow.document.body.style.overflow = 'hidden';
  }
};
