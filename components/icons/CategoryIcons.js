import { BrickWall, Caravan, Container, Drill, LayoutGrid, Sprout, SprayCan, Tractor } from 'lucide-react';
import { GeneratorIcon, LiftIcon } from './EquipmentIcons';

const lucideProps = { size: 24, strokeWidth: 1.6 };

/** One icon per category, keyed by `dbKey` (lib/categories.js). */
const CATEGORY_ICONS = {
  earthmoving: (props) => <Tractor {...lucideProps} {...props} />,
  'access-platforms': LiftIcon,
  tools: (props) => <Drill {...lucideProps} {...props} />,
  'power-generators': GeneratorIcon,
  concrete: (props) => <BrickWall {...lucideProps} {...props} />,
  garden: (props) => <Sprout {...lucideProps} {...props} />,
  cleaning: (props) => <SprayCan {...lucideProps} {...props} />,
  trailers: (props) => <Caravan {...lucideProps} {...props} />,
  'other-equipment': (props) => <Container {...lucideProps} {...props} />,
};

const Fallback = (props) => <LayoutGrid {...lucideProps} {...props} />;

export function CategoryIcon({ category, ...props }) {
  const Icon = CATEGORY_ICONS[category] || Fallback;
  return <Icon aria-hidden="true" {...props} />;
}
