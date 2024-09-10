import { build } from '..';
import { notificationOnly } from '../partials/notification-only.template';

export const appFees = [
  { type: 'Exclusion', fee: 750 },
  { type: 'Subdivision', fee: 750 },
  { type: 'Non-Farm Use', fee: 750 },
  { type: 'Non-Adhering Residential Use', fee: 450 },
  { type: 'Soil or Fill Use', fee: 750 },
  { type: 'Inclusion', fee: 0 },
];

export const template = build(`
<p>This email is to acknowledge that you have submitted the above noted <b>{{ childType }}</b> application to the <b>{{ governmentName }}</b>.
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
  Contact the {{ governmentName }} for its payment options. Please include your assigned Application ID with your payment. 
</p>
<p>
  NOTE: There is no additional fee for re-submission if the {{ governmentName }} returns your application.
</p>
<p>
  If you are an agent acting on behalf of the applicant(s) / landowner(s), it is your responsibility to advise them of this, and any future, correspondence.
</p>
<p>
  Please log into the ALC Portal for further updates on the application as it progresses.
</p>
${notificationOnly}
`);
