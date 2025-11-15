'use client';

import * as React from 'react';

import {
  Tabs as BaseTabs,
  TabsList as BaseTabsList,
  TabsTrigger as BaseTabsTrigger,
  TabsContent as BaseTabsContent,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent as BaseDialogContent,
  DialogDescription as BaseDialogDescription,
  DialogFooter as BaseDialogFooter,
  DialogHeader as BaseDialogHeader,
  DialogTitle as BaseDialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent as BaseSheetContent,
  SheetDescription as BaseSheetDescription,
  SheetFooter as BaseSheetFooter,
  SheetHeader as BaseSheetHeader,
  SheetTitle as BaseSheetTitle,
} from '@/components/ui/sheet';
import {
  Accordion as BaseAccordion,
  AccordionContent as BaseAccordionContent,
  AccordionItem as BaseAccordionItem,
  AccordionTrigger as BaseAccordionTrigger,
} from '@/components/ui/accordion';
import {
  Collapsible as BaseCollapsible,
  CollapsibleContent as BaseCollapsibleContent,
  CollapsibleTrigger as BaseCollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Progress as BaseProgress } from '@/components/ui/progress';
import { Slider as BaseSlider } from '@/components/ui/slider';
import {
  Select as BaseSelect,
  SelectContent as BaseSelectContent,
  SelectGroup as BaseSelectGroup,
  SelectItem as BaseSelectItem,
  SelectLabel as BaseSelectLabel,
  SelectSeparator as BaseSelectSeparator,
  SelectTrigger as BaseSelectTrigger,
  SelectValue as BaseSelectValue,
} from '@/components/ui/select';
import { Switch as BaseSwitch } from '@/components/ui/switch';
import {
  DropdownMenu as BaseDropdownMenu,
  DropdownMenuContent as BaseDropdownMenuContent,
  DropdownMenuGroup as BaseDropdownMenuGroup,
  DropdownMenuItem as BaseDropdownMenuItem,
  DropdownMenuLabel as BaseDropdownMenuLabel,
  DropdownMenuSeparator as BaseDropdownMenuSeparator,
  DropdownMenuSub as BaseDropdownMenuSub,
  DropdownMenuSubContent as BaseDropdownMenuSubContent,
  DropdownMenuSubTrigger as BaseDropdownMenuSubTrigger,
  DropdownMenuTrigger as BaseDropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover as BasePopover,
  PopoverContent as BasePopoverContent,
  PopoverTrigger as BasePopoverTrigger,
} from '@/components/ui/popover';
import {
  HoverCard as BaseHoverCard,
  HoverCardContent as BaseHoverCardContent,
  HoverCardTrigger as BaseHoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

const glassPanel =
  'rounded-3xl border border-white/10 bg-[rgba(9,14,24,0.92)] text-white shadow-[0_30px_90px_rgba(3,7,18,0.75)] backdrop-blur-2xl';
const menuPanel =
  'rounded-2xl border border-white/10 bg-[rgba(5,8,16,0.94)] text-white shadow-[0_25px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl';
const controlFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-0';

export function HevyTabs({ className, ...props }: React.ComponentProps<typeof BaseTabs>) {
  return <BaseTabs className={cn('gap-4 text-white', className)} {...props} />;
}

export function HevyTabsList({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabsList>) {
  return (
    <BaseTabsList
      className={cn(
        'rounded-[22px] border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/65',
        className,
      )}
      {...props}
    />
  );
}

export function HevyTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabsTrigger>) {
  return (
    <BaseTabsTrigger
      className={cn(
        'rounded-[18px] border border-transparent px-3 py-2 text-[12px] font-medium text-white/70 transition-all data-[state=active]:border-white/10 data-[state=active]:bg-white/15 data-[state=active]:text-white',
        className,
      )}
      {...props}
    />
  );
}

export function HevyTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabsContent>) {
  return <BaseTabsContent className={cn('pt-4', className)} {...props} />;
}

export {
  Dialog as HevyDialog,
  BaseDialogHeader as HevyDialogHeader,
  BaseDialogTitle as HevyDialogTitle,
  BaseDialogDescription as HevyDialogDescription,
  BaseDialogFooter as HevyDialogFooter,
};

export const HevyDialogContent = React.forwardRef<
  React.ElementRef<typeof BaseDialogContent>,
  React.ComponentPropsWithoutRef<typeof BaseDialogContent>
>(({ className, ...props }, ref) => (
  <BaseDialogContent
    ref={ref}
    className={cn(glassPanel, controlFocus, className)}
    {...props}
  />
));
HevyDialogContent.displayName = 'HevyDialogContent';

export {
  Sheet as HevySheet,
  BaseSheetHeader as HevySheetHeader,
  BaseSheetTitle as HevySheetTitle,
  BaseSheetDescription as HevySheetDescription,
  BaseSheetFooter as HevySheetFooter,
};

export const HevySheetContent = React.forwardRef<
  React.ElementRef<typeof BaseSheetContent>,
  React.ComponentPropsWithoutRef<typeof BaseSheetContent>
>(({ className, ...props }, ref) => (
  <BaseSheetContent
    ref={ref}
    className={cn(
      'border-white/10 bg-gradient-to-b from-black/60 to-[#0b111d]/95 text-white backdrop-blur-2xl',
      className,
    )}
    {...props}
  />
));
HevySheetContent.displayName = 'HevySheetContent';

export {
  BaseAccordion as HevyAccordion,
  BaseAccordionItem as HevyAccordionItem,
  BaseAccordionContent as HevyAccordionContent,
};

export const HevyAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof BaseAccordionTrigger>,
  React.ComponentPropsWithoutRef<typeof BaseAccordionTrigger>
>(({ className, ...props }, ref) => (
  <BaseAccordionTrigger
    ref={ref}
    className={cn(
      'rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10',
      className,
    )}
    {...props}
  />
));
HevyAccordionTrigger.displayName = 'HevyAccordionTrigger';

export const HevyCollapsible = BaseCollapsible;
export const HevyCollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof BaseCollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof BaseCollapsibleTrigger>
>(({ className, ...props }, ref) => (
  <BaseCollapsibleTrigger
    ref={ref}
    className={cn(
      'rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80',
      className,
    )}
    {...props}
  />
));
HevyCollapsibleTrigger.displayName = 'HevyCollapsibleTrigger';
export const HevyCollapsibleContent = BaseCollapsibleContent;

export function HevyProgress({
  className,
  ...props
}: React.ComponentProps<typeof BaseProgress>) {
  return (
    <BaseProgress
      className={cn(
        'h-3 overflow-hidden rounded-full border border-white/10 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-blue-500',
        className,
      )}
      {...props}
    />
  );
}

export function HevySlider({
  className,
  ...props
}: React.ComponentProps<typeof BaseSlider>) {
  return (
    <BaseSlider
      className={cn(
        'h-10 [&>[data-orientation=horizontal]]:h-1 [&>[data-orientation=horizontal]]:bg-white/15 [&_[role=slider]]:size-5 [&_[role=slider]]:border-white/20 [&_[role=slider]]:bg-white',
        className,
      )}
      {...props}
    />
  );
}

export {
  BaseSelect as HevySelect,
  BaseSelectGroup as HevySelectGroup,
  BaseSelectLabel as HevySelectLabel,
  BaseSelectSeparator as HevySelectSeparator,
  BaseSelectValue as HevySelectValue,
};

export const HevySelectTrigger = React.forwardRef<
  React.ElementRef<typeof BaseSelectTrigger>,
  React.ComponentPropsWithoutRef<typeof BaseSelectTrigger>
>(({ className, ...props }, ref) => (
  <BaseSelectTrigger
    ref={ref}
    className={cn(
      'rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 placeholder:text-white/40',
      className,
    )}
    {...props}
  />
));
HevySelectTrigger.displayName = 'HevySelectTrigger';

export const HevySelectContent = React.forwardRef<
  React.ElementRef<typeof BaseSelectContent>,
  React.ComponentPropsWithoutRef<typeof BaseSelectContent>
>(({ className, ...props }, ref) => (
  <BaseSelectContent ref={ref} className={cn(menuPanel, className)} {...props} />
));
HevySelectContent.displayName = 'HevySelectContent';

export const HevySelectItem = React.forwardRef<
  React.ElementRef<typeof BaseSelectItem>,
  React.ComponentPropsWithoutRef<typeof BaseSelectItem>
>(({ className, ...props }, ref) => (
  <BaseSelectItem
    ref={ref}
    className={cn(
      'rounded-xl px-3 py-2 text-sm text-white/80 data-[highlighted]:bg-white/10 data-[state=checked]:bg-white/20',
      className,
    )}
    {...props}
  />
));
HevySelectItem.displayName = 'HevySelectItem';

export const HevySwitch = React.forwardRef<
  React.ElementRef<typeof BaseSwitch>,
  React.ComponentPropsWithoutRef<typeof BaseSwitch>
>(({ className, ...props }, ref) => (
  <BaseSwitch
    ref={ref}
    className={cn(
      'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-sky-400 data-[state=checked]:to-blue-500',
      className,
    )}
    {...props}
  />
));
HevySwitch.displayName = 'HevySwitch';

export {
  BaseDropdownMenu as HevyDropdownMenu,
  BaseDropdownMenuTrigger as HevyDropdownMenuTrigger,
  BaseDropdownMenuGroup as HevyDropdownMenuGroup,
  BaseDropdownMenuSeparator as HevyDropdownMenuSeparator,
  BaseDropdownMenuLabel as HevyDropdownMenuLabel,
  BaseDropdownMenuSub as HevyDropdownMenuSub,
  BaseDropdownMenuSubTrigger as HevyDropdownMenuSubTrigger,
  BaseDropdownMenuSubContent as HevyDropdownMenuSubContent,
};

export const HevyDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof BaseDropdownMenuContent>,
  React.ComponentPropsWithoutRef<typeof BaseDropdownMenuContent>
>(({ className, ...props }, ref) => (
  <BaseDropdownMenuContent ref={ref} className={cn(menuPanel, className)} {...props} />
));
HevyDropdownMenuContent.displayName = 'HevyDropdownMenuContent';

export const HevyDropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof BaseDropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof BaseDropdownMenuItem>
>(({ className, ...props }, ref) => (
  <BaseDropdownMenuItem
    ref={ref}
    className={cn(
      'rounded-xl px-3 py-2 text-sm text-white/75 data-[highlighted]:bg-white/10 data-[state=checked]:bg-white/20',
      className,
    )}
    {...props}
  />
));
HevyDropdownMenuItem.displayName = 'HevyDropdownMenuItem';

export { BasePopover as HevyPopover, BasePopoverTrigger as HevyPopoverTrigger };

export const HevyPopoverContent = React.forwardRef<
  React.ElementRef<typeof BasePopoverContent>,
  React.ComponentPropsWithoutRef<typeof BasePopoverContent>
>(({ className, ...props }, ref) => (
  <BasePopoverContent ref={ref} className={cn(menuPanel, className)} {...props} />
));
HevyPopoverContent.displayName = 'HevyPopoverContent';

export { BaseHoverCard as HevyHoverCard, BaseHoverCardTrigger as HevyHoverCardTrigger };

export const HevyHoverCardContent = React.forwardRef<
  React.ElementRef<typeof BaseHoverCardContent>,
  React.ComponentPropsWithoutRef<typeof BaseHoverCardContent>
>(({ className, ...props }, ref) => (
  <BaseHoverCardContent ref={ref} className={cn(menuPanel, className)} {...props} />
));
HevyHoverCardContent.displayName = 'HevyHoverCardContent';
