import * as config from 'config';

export const header = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <b>{{ parentTypeLabel }} ID #{{ fileNumber }}</b>
    Name: <b>{{ applicantName }}</b>
    Status: <b>{{ status }}</b></div>
    <img height="56" src="${config.get<string>(
      'PORTAL.FRONTEND_ROOT',
    )}/assets/email/alc_logo.png" style="border:0;display:block;outline:none;text-decoration:none;height:56px;width:100%;font-size:13px;" width="86" />
`;
