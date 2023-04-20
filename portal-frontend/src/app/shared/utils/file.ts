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
