import { build } from '..';
import { notificationOnly } from '../partials/notification-only.template';

export const template = build(
  `<p>
    This email is to advise that the above noted <b>{{ childType }}</b> Notice of Intent has been cancelled and will not be considered further.   
  </p>
  <p>
    If you are an agent acting on behalf of the applicant(s)/landowner(s), it is your responsibility to advise your client(s) of this, and any future, correspondence.
  </p>
  ${notificationOnly}`,
);
