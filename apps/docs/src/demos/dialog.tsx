import { Button } from '@package/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@package/ui/dialog';

/** Live dialog demo shared by the Dialog docs page and the framework preview. */
export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' size='sm'>Cancel</Button>
          <Button variant='destructive' size='sm'>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
