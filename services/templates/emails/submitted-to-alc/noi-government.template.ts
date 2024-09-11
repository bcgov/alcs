import { build } from '..';
import { notificationOnly } from '../partials/notification-only.template';

export const template = build(
  `<p>
    Agricultural Land Commission <b>{{ childType }}</b> NOI ID: <b>{{ fileNumber }} ({{ applicantName }})</b> has been successfully submitted to the Agricultural Land Commission. A read-only copy of the Notice of Intent (NOI) has been submitted to the <b>{{ governmentName }}</b> for informational purposes. Should the {{ governmentName}} wish to comment on the NOI, please submit comments directly to the ALC. 
  </p>
  <p>
    Please log into the ALC Portal to view the NOI.
  </p>
  ${notificationOnly}`,
);
