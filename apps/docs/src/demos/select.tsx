import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@package/ui/select';

/** Live select demo shared by the Select docs page and the framework preview. */
export function SelectDemo() {
  return (
    <Select defaultValue='normal'>
      <SelectTrigger className='w-44'>
        <SelectValue placeholder='Priority' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='low'>Low</SelectItem>
        <SelectItem value='normal'>Normal</SelectItem>
        <SelectItem value='high'>High</SelectItem>
      </SelectContent>
    </Select>
  );
}
