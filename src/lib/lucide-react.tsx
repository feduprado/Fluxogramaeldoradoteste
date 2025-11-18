import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

type IconComponent = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

const createIcon = (
  children: React.ReactNode,
  options?: { fill?: string }
): IconComponent => {
  const Component = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill={options?.fill ?? 'none'}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  ));
  Component.displayName = 'Icon';
  return Component;
};

export const Circle = createIcon(
  <circle cx="12" cy="12" r="8" fill="currentColor" stroke="none" />,
  { fill: 'none' }
);

export const Square = createIcon(
  <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />,
  { fill: 'none' }
);

export const Diamond = createIcon(
  <path d="M12 4L19 12L12 20L5 12Z" fill="currentColor" stroke="none" />,
  { fill: 'none' }
);

export const Trash2 = createIcon(
  <>
    <polyline points="3 7 21 7" />
    <path d="M8 7V5h8v2" />
    <rect x="5" y="7" width="14" height="13" rx="2" />
    <line x1="10" y1="11" x2="10" y2="18" />
    <line x1="14" y1="11" x2="14" y2="18" />
  </>
);

export const Undo2 = createIcon(
  <>
    <path d="M9 14H4v-5" />
    <path d="M4 9c2-3 6.5-4 9.6-1.9 3.1 2 4.4 6.2 3 9.7" />
  </>
);

export const Redo2 = createIcon(
  <>
    <path d="M15 14h5V9" />
    <path d="M20 9c-2-3-6.5-4-9.6-1.9C7.3 9.1 6 13.3 7.4 16.8" />
  </>
);

export const Eraser = createIcon(
  <>
    <path d="M17 4L7 14l5 6h5l-5-6" />
    <path d="M12 20h8" />
  </>
);

export const Sparkles = createIcon(
  <>
    <path d="M12 3v6" />
    <path d="M9 6h6" />
    <path d="M6 15l2 2-2 2-2-2 2-2Z" />
    <path d="M18 11l2 2-2 2-2-2 2-2Z" />
  </>
);

export const Download = createIcon(
  <>
    <path d="M12 5v10" />
    <polyline points="8 11 12 15 16 11" />
    <path d="M5 19h14" />
  </>
);

export const Upload = createIcon(
  <>
    <path d="M12 19V9" />
    <polyline points="8 13 12 9 16 13" />
    <path d="M5 5h14" />
  </>
);

export const Copy = createIcon(
  <>
    <rect x="9" y="9" width="10" height="12" rx="2" />
    <path d="M5 15V5h10" />
  </>
);

export const ZoomIn = createIcon(
  <>
    <circle cx="11" cy="11" r="6" />
    <path d="M11 8v6" />
    <path d="M8 11h6" />
    <path d="M16 16l4 4" />
  </>
);

export const ZoomOut = createIcon(
  <>
    <circle cx="11" cy="11" r="6" />
    <path d="M8 11h6" />
    <path d="M16 16l4 4" />
  </>
);

export const Maximize2 = createIcon(
  <>
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </>
);

export const Moon = createIcon(
  <path d="M21 12.8A8 8 0 1 1 11.2 3 6 6 0 0 0 21 12.8Z" />
);

export const Sun = createIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </>
);

export const Users = createIcon(
  <>
    <circle cx="9" cy="10" r="3" />
    <path d="M3 21c0-3.3 2.7-6 6-6" />
    <circle cx="17" cy="13" r="3" />
    <path d="M14 21c0-2.5 1.5-4.6 3.5-5.5" />
  </>
);

export const XIcon = createIcon(
  <>
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </>
);

export const ChevronLeft = createIcon(
  <polyline points="15 18 9 12 15 6" />
);

export const ChevronRight = createIcon(
  <polyline points="9 6 15 12 9 18" />
);

export const ChevronUpIcon = createIcon(
  <polyline points="6 15 12 9 18 15" />
);

export const ChevronDownIcon = createIcon(
  <polyline points="6 9 12 15 18 9" />
);

export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;

export const MoreHorizontal = createIcon(
  <>
    <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
  </>
);

export const MoreHorizontalIcon = MoreHorizontal;

export const CircleIcon = createIcon(
  <circle cx="12" cy="12" r="4" />
);

export const CheckIcon = createIcon(
  <polyline points="4 12 9 17 20 6" />
);

export const MinusIcon = createIcon(<line x1="5" y1="12" x2="19" y2="12" />);

export const PanelLeftIcon = createIcon(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="9" y1="4" x2="9" y2="20" />
  </>
);

export const GripVerticalIcon = createIcon(
  <>
    <circle cx="9" cy="6" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="15" cy="6" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="9" cy="18" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="15" cy="18" r="0.8" fill="currentColor" stroke="none" />
  </>
);

export const ArrowLeft = createIcon(
  <>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </>
);

export const ArrowRight = createIcon(
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>
);

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="6" />
    <line x1="16" y1="16" x2="21" y2="21" />
  </>
);

export const BreadcrumbIcon = MoreHorizontal;

export const DownloadIcon = Download;
export const UploadIcon = Upload;

export const UsersIcon = Users;

export const SparklesIcon = Sparkles;

export const CircleDotIcon = CircleIcon;

export const CopyIcon = Copy;

export const ZoomInIcon = ZoomIn;
export const ZoomOutIcon = ZoomOut;

export const MaximizeIcon = Maximize2;
