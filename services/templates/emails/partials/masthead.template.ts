import * as config from 'config';

export const masthead = `
<table border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td style="width: 400px; vertical-align: top;" align="left" vertical-align:top>
      <p style="font-size: 21px;"><b>{{ parentTypeLabel }} ID #{{ fileNumber }}</b></p>
      <p>Name: <b>{{ applicantName }}</b></p>
      <p>Status: <b>{{ status }}</b></p>
    </td>
    <td style="width: 200px; vertical-align: top;" align="right">
      <table border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width: 86px">
        <img height="56" src="${config.get<string>('PORTAL.FRONTEND_ROOT')}/assets/email/alc_logo.png" style="border: 0; display: block; outline: none; text-decoration: none; height: 56px; width: 100%; font-size:13px;" width="86" />
        </td>
      </tr>
      </table>
    </td>
  </tr>
</table>
`;
