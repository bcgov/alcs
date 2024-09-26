import { header } from './partials/header.template';
import { portalButton } from './partials/portal-button.template';
import { footer } from './partials/footer.template';

export const build = (
  content: string,
  includeButton: boolean = true,
  isNotification: boolean = false,
): string => `
${header(isNotification)}
${content}
${includeButton ? portalButton : ''}
${footer}
`;
