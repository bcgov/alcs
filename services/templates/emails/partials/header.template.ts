import * as config from 'config';

export const header = `
  <mj-section background-color="white" padding="40px 0px 0px 0px">
    <mj-column width="400px">
      <mj-text font-size="21px"><b>{{ parentTypeLabel }} ID #{{fileNumber}}</b></mj-text>
      <mj-text font-size="15px">Owner Name: <b>{{applicantName}}</b></mj-text>
      <mj-text font-size="15px">Status: <b>{{status}}</b></mj-text>
    </mj-column>
    <mj-column width="200px">
      <mj-image
        align="right"
        width="86px"
        height="56px"
        src="${config.get<string>(
          'PORTAL.FRONTEND_ROOT',
        )}/assets/email/alc_logo.png"
      ></mj-image>
    </mj-column>
  </mj-section>
  `;
