import { build } from '.';
import { notificationOnly } from './partials/notification-only.template';

export const template = build(
  `<p>
    This email is to advise that the above noted <b>{{ childType }}</b> application is considered to be incomplete by the <b>{{ governmentName }}</b> and consequently it has been returned to the applicant.
  </p>
  <p>
    Please login to the ALC Portal to view the comments left by the {{ governmentName }}. Please review, edit and re-submit the application.
  </p>
  <p>
    NOTE: Re-submitted applications do not require an additional application fee.
  </p>
  <p>
    If you are an agent acting on behalf of the applicant(s)/landowner(s), it is your responsibility to advise your client(s) of this, and any future, correspondence.
  </p>
  ${notificationOnly}`,
);
