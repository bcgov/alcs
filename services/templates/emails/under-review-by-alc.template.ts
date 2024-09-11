import { build } from '.';
import { notificationOnly } from './partials/notification-only.template';

export const template = build(
  `<p>
    Your application is now under review by the ALC Commissioners. You may be contacted during this review period if additional information or clarification is required. No further action is required from you at this time.
  </p>
  <p>
    If you are an agent acting on behalf of the applicant(s)/landowner(s), it is your responsibility to advise your client(s) of this, and any future, correspondence.
  </p>
  <p>
    Login to the ALC Portal for further updates on your application as it progresses through the application process.
  </p>
  ${notificationOnly}`,
);
