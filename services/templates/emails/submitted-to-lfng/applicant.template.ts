import { build } from '..';
import { feesTable } from '../partials/fees-table.template';
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
${feesTable('Application Type', '{{ governmentName }} Portion of Fee', appFees)}
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
