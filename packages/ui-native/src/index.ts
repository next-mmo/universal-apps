/**
 * Barrel for @package/ui-native.
 *
 * Deliberate exception to the workspace "no package-root index" rule: React
 * Native consumers import from a single package entry (Metro/bundler
 * convention), unlike the DOM packages' deep-path style.
 */
export { Button, type ButtonProps, buttonVariants, type ButtonVariant, type ButtonSize } from './components/ui/button';
export { Badge, type BadgeProps, badgeVariants, type BadgeVariant } from './components/ui/badge';
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion';
export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
export { Checkbox, type CheckboxProps } from './components/ui/checkbox';
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/ui/dialog';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from './components/ui/dropdown-menu';
export { Input, InputLabel, type InputProps } from './components/ui/input';
export { Label } from './components/ui/label';
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './components/ui/popover';
export { Select, SelectValue, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectContent, SelectSeparator } from './components/ui/select';
export { Separator } from './components/ui/separator';
export { Skeleton } from './components/ui/skeleton';
export { Switch, type SwitchProps } from './components/ui/switch';
export {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from './components/ui/table';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
export { Textarea, type TextareaProps } from './components/ui/textarea';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/ui/tooltip';
export { Avatar, AvatarImage, AvatarFallback, avatarVariants, type AvatarProps, type AvatarImageProps, type AvatarFallbackProps, type AvatarSize, type AvatarShape } from './components/ui/avatar';
export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription, type DrawerProps } from './components/ui/drawer';
export { Toggle, toggleVariants, type ToggleProps, type ToggleVariant, type ToggleSize } from './components/ui/toggle';
export { ToggleGroup, ToggleGroupItem, type ToggleGroupProps, type ToggleGroupItemProps } from './components/ui/toggle-group';
export { toast, Toaster, toastStore, type ToastAction, type ToastData, type ToasterProps } from './components/ui/toast';
export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut, useCommand } from './components/ui/command';
export { Combobox, type ComboboxOption, type ComboboxProps } from './components/ui/combobox';
export { Calendar, type CalendarProps } from './components/ui/calendar';
export { DatePicker, type DatePickerProps } from './components/ui/date-picker';
