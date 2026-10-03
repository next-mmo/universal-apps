import { useState } from 'react';
import { View } from 'react-native';

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@package/ui-native';

export function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Button variant='outline' onPress={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' size='sm' onPress={() => setOpen(false)}>Cancel</Button>
            <Button variant='destructive' size='sm' onPress={() => setOpen(false)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}
