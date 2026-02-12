import * as React from "react";
import { cn } from "@/lib/utils";

export interface LucideProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  size?: number | string;
  color?: string;
  fill?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
}

export type LucideIcon = React.ForwardRefExoticComponent<
  LucideProps & React.RefAttributes<HTMLElement>
>;

const createLineIcon = (iconClass: string): LucideIcon => {
  const Component = React.forwardRef<HTMLElement, LucideProps>(
    (
      {
        className,
        color,
        fill,
        size,
        style,
        strokeWidth: _strokeWidth,
        absoluteStrokeWidth: _absoluteStrokeWidth,
        ...props
      },
      ref
    ) => {
      const resolvedSize = typeof size === "number" ? `${size}px` : size;
      return (
        <i
          ref={ref}
          className={cn("app-lineicon lni", `lni-${iconClass}`, className)}
          style={{
            color: color ?? fill,
            fontSize: resolvedSize,
            ...style,
          }}
          {...props}
        />
      );
    }
  );

  Component.displayName = `LineIcon(${iconClass})`;
  return Component;
};

const iconMap = {
  Activity: "heart",
  AlertTriangle: "ban-2",
  ArrowLeft: "arrow-left",
  ArrowRight: "arrow-right",
  Award: "certificate-badge-1",
  BarChart3: "bar-chart-4",
  BookOpen: "book-1",
  Bot: "copilot",
  Brain: "bulb-4",
  Calendar: "calendar-days",
  CalendarDays: "calendar-days",
  CalendarRange: "calendar-days",
  Check: "check",
  CheckCircle: "check-circle-1",
  CheckCircle2: "check-circle-1",
  ChevronDown: "chevron-down",
  ChevronDownIcon: "chevron-down",
  ChevronLeft: "chevron-left",
  ChevronLeftIcon: "chevron-left",
  ChevronRight: "arrow-right",
  ChevronRightIcon: "arrow-right",
  ChevronUp: "chevron-up",
  Circle: "minus-circle",
  Clock: "refresh-circle-1-clockwise",
  Cloud: "cloud-2",
  CloudOff: "cloud-bolt-2",
  Compass: "compass-drafting-2",
  Copy: "clipboard",
  Crown: "crown-3",
  Dumbbell: "dumbbell-1",
  Eye: "eye",
  FileText: "file-multiple",
  Flag: "flag-1",
  Flame: "firework-rocket-4",
  Gem: "gemini",
  GripVertical: "menu-meatballs-2",
  Hash: "hashnode",
  History: "refresh-circle-1-clockwise",
  Home: "home-2",
  Infinity: "line",
  Info: "info",
  LineChart: "trend-up-1",
  Loader2: "spinner-3",
  LogIn: "enter-down",
  Mail: "proton-mail-symbol",
  Medal: "badge-decagram-percent",
  MessageSquareText: "message-3-text",
  Minus: "minus",
  Moon: "moon-half-right-5",
  MoreHorizontal: "menu-meatballs-1",
  Mountain: "mountains-2",
  Palette: "colour-palette-3",
  PanelLeft: "menu-hamburger-1",
  Paperclip: "paperclip-1",
  PartyPopper: "party-spray",
  PenTool: "pen-to-square",
  Pin: "map-pin-5",
  Plus: "plus",
  RefreshCw: "refresh-circle-1-clockwise",
  Rocket: "rocket-5",
  Search: "search-1",
  Send: "aeroplane-1",
  Settings: "gear-1",
  Shield: "shield-2",
  ShieldCheck: "shield-2-check",
  Sparkles: "star-fat",
  Sprout: "leaf-1",
  Star: "star-fat",
  Sun: "sun-1",
  Sunrise: "sun-1",
  Sword: "shield-dollar",
  Target: "target-user",
  Trash2: "trash-3",
  TrendingUp: "trend-up-1",
  Trophy: "trophy-1",
  User: "user-4",
  UserCircle2: "user-4",
  X: "xmark",
  XCircle: "xmark-circle",
  Zap: "bolt-2",
} as const;

export const Activity = createLineIcon(iconMap.Activity);
export const AlertTriangle = createLineIcon(iconMap.AlertTriangle);
export const ArrowLeft = createLineIcon(iconMap.ArrowLeft);
export const ArrowRight = createLineIcon(iconMap.ArrowRight);
export const Award = createLineIcon(iconMap.Award);
export const BarChart3 = createLineIcon(iconMap.BarChart3);
export const BookOpen = createLineIcon(iconMap.BookOpen);
export const Bot = createLineIcon(iconMap.Bot);
export const Brain = createLineIcon(iconMap.Brain);
export const Calendar = createLineIcon(iconMap.Calendar);
export const CalendarDays = createLineIcon(iconMap.CalendarDays);
export const CalendarRange = createLineIcon(iconMap.CalendarRange);
export const Check = createLineIcon(iconMap.Check);
export const CheckCircle = createLineIcon(iconMap.CheckCircle);
export const CheckCircle2 = createLineIcon(iconMap.CheckCircle2);
export const ChevronDown = createLineIcon(iconMap.ChevronDown);
export const ChevronDownIcon = createLineIcon(iconMap.ChevronDownIcon);
export const ChevronLeft = createLineIcon(iconMap.ChevronLeft);
export const ChevronLeftIcon = createLineIcon(iconMap.ChevronLeftIcon);
export const ChevronRight = createLineIcon(iconMap.ChevronRight);
export const ChevronRightIcon = createLineIcon(iconMap.ChevronRightIcon);
export const ChevronUp = createLineIcon(iconMap.ChevronUp);
export const Circle = createLineIcon(iconMap.Circle);
export const Clock = createLineIcon(iconMap.Clock);
export const Cloud = createLineIcon(iconMap.Cloud);
export const CloudOff = createLineIcon(iconMap.CloudOff);
export const Compass = createLineIcon(iconMap.Compass);
export const Copy = createLineIcon(iconMap.Copy);
export const Crown = createLineIcon(iconMap.Crown);
export const Dumbbell = createLineIcon(iconMap.Dumbbell);
export const Eye = createLineIcon(iconMap.Eye);
export const FileText = createLineIcon(iconMap.FileText);
export const Flag = createLineIcon(iconMap.Flag);
export const Flame = createLineIcon(iconMap.Flame);
export const Gem = createLineIcon(iconMap.Gem);
export const GripVertical = createLineIcon(iconMap.GripVertical);
export const Hash = createLineIcon(iconMap.Hash);
export const History = createLineIcon(iconMap.History);
export const Home = createLineIcon(iconMap.Home);
export const Infinity = createLineIcon(iconMap.Infinity);
export const Info = createLineIcon(iconMap.Info);
export const LineChart = createLineIcon(iconMap.LineChart);
export const Loader2 = createLineIcon(iconMap.Loader2);
export const LogIn = createLineIcon(iconMap.LogIn);
export const Mail = createLineIcon(iconMap.Mail);
export const Medal = createLineIcon(iconMap.Medal);
export const MessageSquareText = createLineIcon(iconMap.MessageSquareText);
export const Minus = createLineIcon(iconMap.Minus);
export const Moon = createLineIcon(iconMap.Moon);
export const MoreHorizontal = createLineIcon(iconMap.MoreHorizontal);
export const Mountain = createLineIcon(iconMap.Mountain);
export const Palette = createLineIcon(iconMap.Palette);
export const PanelLeft = createLineIcon(iconMap.PanelLeft);
export const Paperclip = createLineIcon(iconMap.Paperclip);
export const PartyPopper = createLineIcon(iconMap.PartyPopper);
export const PenTool = createLineIcon(iconMap.PenTool);
export const Pin = createLineIcon(iconMap.Pin);
export const Plus = createLineIcon(iconMap.Plus);
export const RefreshCw = createLineIcon(iconMap.RefreshCw);
export const Rocket = createLineIcon(iconMap.Rocket);
export const Search = createLineIcon(iconMap.Search);
export const Send = createLineIcon(iconMap.Send);
export const Settings = createLineIcon(iconMap.Settings);
export const Shield = createLineIcon(iconMap.Shield);
export const ShieldCheck = createLineIcon(iconMap.ShieldCheck);
export const Sparkles = createLineIcon(iconMap.Sparkles);
export const Sprout = createLineIcon(iconMap.Sprout);
export const Star = createLineIcon(iconMap.Star);
export const Sun = createLineIcon(iconMap.Sun);
export const Sunrise = createLineIcon(iconMap.Sunrise);
export const Sword = createLineIcon(iconMap.Sword);
export const Target = createLineIcon(iconMap.Target);
export const Trash2 = createLineIcon(iconMap.Trash2);
export const TrendingUp = createLineIcon(iconMap.TrendingUp);
export const Trophy = createLineIcon(iconMap.Trophy);
export const User = createLineIcon(iconMap.User);
export const UserCircle2 = createLineIcon(iconMap.UserCircle2);
export const X = createLineIcon(iconMap.X);
export const XCircle = createLineIcon(iconMap.XCircle);
export const Zap = createLineIcon(iconMap.Zap);
