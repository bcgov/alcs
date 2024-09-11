import { build } from '..';
import { notificationOnly } from '../partials/notification-only.template';

export const template = build(
  `<p>
      Agricultural Land Commission <b>{{ childType }}</b> Application ID: <b>{{ fileNumber }} ({{ applicantName }})</b> has been successfully submitted to the Agricultural Land Commission. A read-only copy of the application has been submitted to the <b>{{ governmentName }}</b> for informational purposes. Should the {{ governmentName }} wish to comment on the application, please submit comments directly to the ALC. 
    </p>
    <p>
      Please log into the ALC Portal to view the application.
    </p>
    ${notificationOnly}`,
);
