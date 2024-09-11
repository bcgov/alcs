import { build } from '..';
import { feesTable } from '../partials/fees-table.template';
import { notificationOnly } from '../partials/notification-only.template';
import { appFees } from './applicant.template';

export const template = build(
  `<p>
    Agricultural Land Commission <b>{{ childType }}</b> Application ID: <b>{{ fileNumber }} ({{ applicantName }})</b> has been successfully submitted to the <b>{{ governmentName }}</b>. The Applicant has been instructed to contact the {{ governmentName }} for payment instructions regarding the applicable application fee.
  </p>
  ${feesTable('Application Type', '{{ governmentName }} Portion of Fee', appFees)}
  <p>
    Please log into the ALC Portal to view the application.
  </p>
  ${notificationOnly}
`,
);
