import { masthead } from './masthead.template';

export const header = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document</title>
</head>
<body style="padding: 0; margin: 0;">
  <!--[if mso]>
  <table width="600" align="center" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td>
  <![endif]-->

  <div style="max-width: 600px; margin: 0 auto; padding-top: 40px; font-family: Helvetica, Arial, sans-serif;">
    ${masthead}
`;
