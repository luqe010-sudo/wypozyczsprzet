/** Line icons for machine types that lucide-react does not cover. */
function Icon({ size = 26, children, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function ExcavatorIcon(props) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="23" width="17" height="5.5" rx="2.75" />
      <path d="M5 23v-8.5a1 1 0 0 1 1-1h5.5l3.5 4.5v5" />
      <path d="M15 18 22.5 7.5 28 12.5" />
      <path d="M28 12.5v6.2c-2.6 1-4.6.2-5.8-2L28 12.5Z" />
    </Icon>
  );
}

export function CompactorIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 27.5h17.5l4-3.5" />
      <rect x="7" y="15" width="13" height="9" rx="1.5" />
      <path d="M10 15v-2.5h6V15" />
      <path d="M20 19 27 5.5h2.5" />
    </Icon>
  );
}

export function LiftIcon(props) {
  return (
    <Icon {...props}>
      <rect x="5" y="24" width="22" height="4.5" rx="1" />
      <path d="M9 24 23 13M23 24 9 13" />
      <rect x="5.5" y="9.5" width="21" height="3.5" rx="0.75" />
      <path d="M7.5 9.5V4h17v5.5" />
    </Icon>
  );
}

export function GeneratorIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="9" width="25" height="15.5" rx="2" />
      <path d="M8 24.5V28M24 24.5V28M10 9V5.5h12V9" />
      <path d="m17 12-3.5 5h5L15 21.5" />
    </Icon>
  );
}
