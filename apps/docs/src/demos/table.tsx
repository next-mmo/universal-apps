import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@package/ui/table';

const tasks = [
  { text: 'Write docs', status: 'In progress' },
  { text: 'Ship release', status: 'Open' },
];

/** Live table demo shared by the Table docs page and the framework preview. */
export function TableDemo() {
  return (
    <Table className='max-w-sm'>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.text}>
            <TableCell>{task.text}</TableCell>
            <TableCell>{task.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
