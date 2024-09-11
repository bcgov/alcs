import { build } from '.';
import { notificationOnly } from './partials/notification-only.template';

export const template = build(
  `<p>
    This email is to advise that the above noted <b>{{ childType }}</b> application does not fall within the jurisdiction of the <b>{{ governmentName }}</b> and consequently it has been returned to the applicant. 
  </p>
  <p>
    Please login to the ALC Portal to select the correct Local or First Nation Government jurisdiction and re-submit the application. 
  </p>
  <p>
    If you are an agent acting on behalf of the applicant(s)/landowner(s), it is your responsibility to advise your client(s) of this, and any future, correspondence.
  </p>
  ${notificationOnly}`,
);
