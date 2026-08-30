/**
 * Barrel for @package/ui-native.
 *
 * Deliberate exception to the workspace "no package-root index" rule: React
 * Native consumers import from a single package entry (Metro/bundler
 * convention), unlike the DOM packages' deep-path style.
 */
export { Button, type ButtonProps } from './components/ui/button';
export { Badge } from './components/ui/badge';
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
export { Checkbox, type CheckboxProps } from './components/ui/checkbox';
export {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/ui/dialog';
export {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from './components/ui/dropdown-menu';
export { Input, InputLabel, type InputProps } from './components/ui/input';
export { Label } from './components/ui/label';
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './components/ui/popover';
export { Select, SelectValue, SelectItem, SelectGroup, SelectLabel, SelectTrigger } from './components/ui/select';
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
} from './components/ui/table';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
export { Textarea, type TextareaProps } from './components/ui/textarea';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/ui/tooltip';
