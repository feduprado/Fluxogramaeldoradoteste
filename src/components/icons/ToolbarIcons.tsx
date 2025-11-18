import { createElement } from 'react';
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;
type IconNode = Array<[string, Record<string, string>]>;

const IconBase = ({ children, ...props }: IconProps) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

const createIcon = (iconNode: IconNode) => {
  const Icon = (props: IconProps) => (
    <IconBase {...props}>
      {iconNode.map(([tag, attrs], index) => {
        const { key, ...rest } = attrs;
        return createElement(tag, {
          ...rest,
          key: key ?? index,
        });
      })}
    </IconBase>
  );

  return Icon;
};

export const CircleIcon = createIcon([["circle",{"cx":"12","cy":"12","r":"10","key":"1mglay"}]]);
export const SquareIcon = createIcon([["rect",{"width":"18","height":"18","x":"3","y":"3","rx":"2","key":"afitv7"}]]);
export const DiamondIcon = createIcon([["path",{"d":"M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z","key":"1f1r0c"}]]);
export const Trash2Icon = createIcon([["path",{"d":"M3 6h18","key":"d0wm0j"}],["path",{"d":"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6","key":"4alrt4"}],["path",{"d":"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2","key":"v07s0e"}],["line",{"x1":"10","x2":"10","y1":"11","y2":"17","key":"1uufr5"}],["line",{"x1":"14","x2":"14","y1":"11","y2":"17","key":"xtxkd"}]]);
export const Undo2Icon = createIcon([["path",{"d":"M9 14 4 9l5-5","key":"102s5s"}],["path",{"d":"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11","key":"f3b9sd"}]]);
export const Redo2Icon = createIcon([["path",{"d":"m15 14 5-5-5-5","key":"12vg1m"}],["path",{"d":"M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13","key":"6uklza"}]]);
export const EraserIcon = createIcon([["path",{"d":"m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21","key":"182aya"}],["path",{"d":"M22 21H7","key":"t4ddhn"}],["path",{"d":"m5 11 9 9","key":"1mo9qw"}]]);
export const SparklesIcon = createIcon([["path",{"d":"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z","key":"4pj2yx"}],["path",{"d":"M20 3v4","key":"1olli1"}],["path",{"d":"M22 5h-4","key":"1gvqau"}],["path",{"d":"M4 17v2","key":"vumght"}],["path",{"d":"M5 18H3","key":"zchphs"}]]);
export const DownloadIcon = createIcon([["path",{"d":"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","key":"ih7n3h"}],["polyline",{"points":"7 10 12 15 17 10","key":"2ggqvy"}],["line",{"x1":"12","x2":"12","y1":"15","y2":"3","key":"1vk2je"}]]);
export const UploadIcon = createIcon([["path",{"d":"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","key":"ih7n3h"}],["polyline",{"points":"17 8 12 3 7 8","key":"t8dd8p"}],["line",{"x1":"12","x2":"12","y1":"3","y2":"15","key":"widbto"}]]);
export const CopyIcon = createIcon([["rect",{"width":"14","height":"14","x":"8","y":"8","rx":"2","ry":"2","key":"17jyea"}],["path",{"d":"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2","key":"zix9uf"}]]);
export const ZoomInIcon = createIcon([["circle",{"cx":"11","cy":"11","r":"8","key":"4ej97u"}],["line",{"x1":"21","x2":"16.65","y1":"21","y2":"16.65","key":"13gj7c"}],["line",{"x1":"11","x2":"11","y1":"8","y2":"14","key":"1vmskp"}],["line",{"x1":"8","x2":"14","y1":"11","y2":"11","key":"durymu"}]]);
export const ZoomOutIcon = createIcon([["circle",{"cx":"11","cy":"11","r":"8","key":"4ej97u"}],["line",{"x1":"21","x2":"16.65","y1":"21","y2":"16.65","key":"13gj7c"}],["line",{"x1":"8","x2":"14","y1":"11","y2":"11","key":"durymu"}]]);
export const Maximize2Icon = createIcon([["polyline",{"points":"15 3 21 3 21 9","key":"mznyad"}],["polyline",{"points":"9 21 3 21 3 15","key":"1avn1i"}],["line",{"x1":"21","x2":"14","y1":"3","y2":"10","key":"ota7mn"}],["line",{"x1":"3","x2":"10","y1":"21","y2":"14","key":"1atl0r"}]]);
export const MoonIcon = createIcon([["path",{"d":"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z","key":"a7tn18"}]]);
export const SunIcon = createIcon([["circle",{"cx":"12","cy":"12","r":"4","key":"4exip2"}],["path",{"d":"M12 2v2","key":"tus03m"}],["path",{"d":"M12 20v2","key":"1lh1kg"}],["path",{"d":"m4.93 4.93 1.41 1.41","key":"149t6j"}],["path",{"d":"m17.66 17.66 1.41 1.41","key":"ptbguv"}],["path",{"d":"M2 12h2","key":"1t8f8n"}],["path",{"d":"M20 12h2","key":"1q8mjw"}],["path",{"d":"m6.34 17.66-1.41 1.41","key":"1m8zz5"}],["path",{"d":"m19.07 4.93-1.41 1.41","key":"1shlcs"}]]);
