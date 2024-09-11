import { build } from '.';
import { notificationOnly } from './partials/notification-only.template';

export const template = build(
  `<p>
    This email is to advise that the above noted <b>{{ childType }}</b> application has been reviewed by the <b>{{ governmentName }}</b> which has determined not to forward your application to the Agricultural Land Commission for further review.
  </p>
  <p>
    If you have any questions about this outcome, please contact {{ governmentName }}.
  </p>
  <p>
    If you are an agent acting on behalf of the applicant(s)/landowner(s), it is your responsibility to advise your client(s) of this, and any future, correspondence.
  </p>
  <p>
    Login to the ALC Portal for further information on your application.
  </p>
  ${notificationOnly}`,
);
