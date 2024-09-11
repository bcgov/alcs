import { build } from '..';
import { notificationOnly } from '../partials/notification-only.template';

export const template = build(
  `<p>
    This email is to advise that the {{ governmentName }}'s review of the above noted {{ childType }} application requires further attention. The ALC has returned the application to the {{ governmentName }} for their action.
  </p>
  <p>
    Please login to the ALC Portal to view the ALC's comments for the {{ governmentName }}.
  </p>
  ${notificationOnly}`,
);
