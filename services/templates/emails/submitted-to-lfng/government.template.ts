import { build } from '..';
import { notificationOnly } from '../partials/notification-only.template';
import { appFees } from './applicant.template';

export const template = build(
  `<p>
    Agricultural Land Commission <b>{{ childType }}</b> Application ID: <b>{{ fileNumber }} ({{ applicantName }})</b> has been successfully submitted to the <b>{{ governmentName }}</b>. The Applicant has been instructed to contact the {{ governmentName }} for payment instructions regarding the applicable application fee.
  </p>
  <table cellpadding="0" cellspacing="0" width="100%" border="0" style="color: #000000; font-family: Helvetica, Arial, sans-serif; font-size:13px; line-height: 22px; table-layout: auto; width: 100%; border: none; border-collapse: collapse;">
    <tr style="text-align: left; font-size: 16px; border: 1px solid black;">
      <th style="padding-left: 8px; border-right: 1px solid black;">Application Type</th>
      <th style="padding-left: 8px">{{ governmentName }} Portion of Fee</th>
    </tr>
    ${appFees
      .map((a) => {
        return `
        <tr style="font-size: 16px; border: 1px solid black;">
          <td style="padding-left: 8px; border-right: 1px solid black;">${a.type}</td>
          <td style="padding-left: 8px">$${a.fee}</td>
        </tr>
        `;
      })
      .join('')}
  </table>
  <p>
    Please log into the ALC Portal to view the application.
  </p>
  ${notificationOnly}
`,
);
