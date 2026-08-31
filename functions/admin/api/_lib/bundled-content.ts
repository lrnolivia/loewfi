import about from '../../../../src/shared/content/fixtures/about.json';
import avedastudio from '../../../../src/shared/content/fixtures/avedastudio.json';
import cksteele from '../../../../src/shared/content/fixtures/cksteele.json';
import contact from '../../../../src/shared/content/fixtures/contact.json';
import home from '../../../../src/shared/content/fixtures/home.json';
import hydroviv from '../../../../src/shared/content/fixtures/hydroviv.json';
import siteConfig from '../../../../src/shared/content/fixtures/site-config.json';
import { validateContentCollection } from '../../../../src/shared/content/validation';

export function readBundledContent() {
  return validateContentCollection({
    projects: [hydroviv, cksteele, avedastudio],
    pages: [home, about, contact],
    siteConfig,
  });
}
