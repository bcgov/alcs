import { build } from '..';
import { notificationOnly } from '../partials/notification-only.template';

export const template = build(
  `<p>
    This email is to advise that the Reasons for Decision for the above noted application has been released.
  </p>
  <p>
    You can access the decision document by clicking the link(s) below:
  </p>
  <p>
    <ul style="list-style-position: inside; padding: 0; margin: 0;">
      {{#each documents}}
      <li><a href={{url}}>{{name}}</a></li>
      {{/each}}
    </ul>
  </p>
  <p>
    The decision can also be accessed via the ALC Portal and Public Search tool.
  </p>
  <p>
    Further correspondence with respect to this application should be directed to the ALC Land Use Planner for your region, found on the ALC website <a href="https://www.alc.gov.bc.ca/contact#land-use-planner" target="_blank">Contact Us</a> page. 
  </p>
  <p>
    If you are an agent acting on behalf of the applicant(s)/landowner(s), it is your responsibility to advise them of this, and any future, correspondence.
  </p>
  ${notificationOnly}`,
);
