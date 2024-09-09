import { build } from '..';
import { notificationOnly } from '../partials/notification-only.template';

export const template = build(
  `<p>
      This email is to acknowledge that the Agricultural Land Commission (ALC) is in receipt of the above noted <b>{{ childType }}</b> application. Please refer to the ALC Application ID in all future correspondence with this office. A copy of this application has been forwarded to the <b>{{ governmentName }}</b> for information purposes.
    </p>
    <p>
      There is no application fee associated with registering a Restrictive Covenant.
    </p>
    <p>
      Please be advised that the status of the application in the ALC Portal will update and a notification email will be sent out as the application moves through each stage of the application review process. Should the ALC Land Use Planner require any additional information or clarification regarding the application, they will contact you. Further information about the application process can be obtained from the ALC website.
    </p>
    <p>
      If you are an agent acting on behalf of the applicant(s) / landowner(s), it is your responsibility to advise them of this, and any future, correspondence.
    </p>
    <p>
      Please log into the ALC Portal for further updates on the application as it progresses.
    </p>
    ${notificationOnly}`,
);
