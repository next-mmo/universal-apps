/**
 * Barrel for @package/ui-native.
 *
 * Deliberate exception to the workspace "no package-root index" rule: React
 * Native consumers import from a single package entry (Metro/bundler
 * convention), unlike the DOM packages' deep-path style.
 */
export { Button, type ButtonProps } from './components/ui/button';
export { Badge } from './components/ui/badge';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
export { Input, InputLabel, type InputProps } from './components/ui/input';
export { Separator } from './components/ui/separator';
export { Switch, type SwitchProps } from './components/ui/switch';
