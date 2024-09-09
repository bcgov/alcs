import { build } from '.';
import { notificationOnly } from './partials/notification-only.template';

export const template = build(
  `<mj-text font-size='16px'>
    This email is to advise that the above noted <b>{{ childType }}</b> application has been reviewed by the <b>{{ governmentName }}</b> which has determined not to forward your application to the Agricultural Land Commission for further review.
  </mj-text>
  <mj-text font-size='16px'>
    If you have any questions about this outcome, please contact {{ governmentName }}.
  </mj-text>
  <mj-text font-size='16px'>
    If you are an agent acting on behalf of the applicant(s)/landowner(s), it is your responsibility to advise your client(s) of this, and any future, correspondence.
  </mj-text>
  <mj-text font-size='16px'>
    Login to the ALC Portal for further information on your application.
  </mj-text>
  ${notificationOnly}`,
);
