import { build } from '.';
import { notificationOnly } from './partials/notification-only.template';

export const template = build(
  `<p>
    This email is to advise that the above noted <b>{{ childType }}</b> application has been received by the <b>{{ governmentName }}</b> for review.
  </p>
  <p>
    If you have not already done so, please contact the {{ governmentName }} to determine the preferred form of payment as the application may not be processed until payment is received.
  </p>
  <p>
    If you are an agent acting on behalf of the applicant(s)/landowner(s), it is your responsibility to advise your client(s) of this, and any future, correspondence.
  </p>
  <p>
    Login to the ALC Portal for further updates on your application as it progresses through the application process.
  </p>
  ${notificationOnly}`,
);
