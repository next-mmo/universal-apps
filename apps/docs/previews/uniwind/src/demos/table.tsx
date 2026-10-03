import { Text } from 'react-native';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@package/ui-native';

const tasks = [
  { text: 'Write docs', status: 'In progress' },
  { text: 'Ship release', status: 'Open' },
];

export function TableDemo() {
  return (
    <Table className='w-full max-w-sm'>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.text}>
            <TableCell>
              <Text className='font-sans text-sm text-foreground'>{task.text}</Text>
            </TableCell>
            <TableCell>
              <Text className='font-sans text-sm text-muted-foreground'>{task.status}</Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
