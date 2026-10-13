import aveda01 from '../../portfolio/assets/images/avedastudio/avedastudio-01.jpg?url';
import aveda02 from '../../portfolio/assets/images/avedastudio/avedastudio-02.jpg?url';
import aveda04 from '../../portfolio/assets/images/avedastudio/avedastudio-04.jpg?url';
import aveda07 from '../../portfolio/assets/images/avedastudio/avedastudio-07.jpg?url';
import ckSteeleHero from '../../portfolio/assets/graphics/cksteele/cksteele-07.jpg?url';
import hydrovivHero from '../../portfolio/assets/graphics/hydroviv/hydroviv-01.png?url';

const bundledAssets: Record<string, string> = {
  'portfolio/assets/images/avedastudio/avedastudio-01.jpg': aveda01,
  'portfolio/assets/images/avedastudio/avedastudio-02.jpg': aveda02,
  'portfolio/assets/images/avedastudio/avedastudio-04.jpg': aveda04,
  'portfolio/assets/images/avedastudio/avedastudio-07.jpg': aveda07,
  'portfolio/assets/graphics/cksteele/cksteele-07.jpg': ckSteeleHero,
  'portfolio/assets/graphics/hydroviv/hydroviv-01.png': hydrovivHero,
};

export function adminAssetUrl(repositoryPath: string): string {
  return bundledAssets[repositoryPath] ?? `/${repositoryPath}`;
}
