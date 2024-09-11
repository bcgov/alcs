import { header } from './partials/header.template';
import { portalButton } from './partials/portal-button.template';
import { footer } from './partials/footer.template';

export const build = (
  content: string,
  includeButton: boolean = true,
): string => `
${header}
${content}
${includeButton ? portalButton : ''}
${footer}
`;
