import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  InputLabel,
  Separator,
  Switch,
} from '@package/ui-native';

import './index.css';

export default function App() {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [username, setUsername] = useState('universal-dev');

  const toggleTheme = useCallback(() => {
    Uniwind.setTheme(isDark ? 'light' : 'dark');
  }, [isDark]);

  const resetUsername = useCallback(() => {
    setUsername('universal-dev');
  }, []);

  const openDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 py-12 max-w-lg mx-auto w-full space-y-6">
        {/* Header */}
        <View className="space-y-2">
          <View className="flex-row items-center gap-2">
            <Badge variant="default">Expo</Badge>
            <Badge variant="secondary">Uniwind</Badge>
            <Badge variant="outline">Tailwind v4</Badge>
          </View>
          <Text className="text-3xl font-bold tracking-tight text-foreground">
            Expo + Uniwind
          </Text>
          <Text className="text-sm text-muted-foreground leading-relaxed">
            Running the shared Apple-inspired design system with @package/ui-native on Expo.
          </Text>
        </View>

        <Separator />

        {/* Theme Controller */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance & Theme</CardTitle>
            <CardDescription>
              Toggle dynamic theme resolution with Uniwind.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-foreground">
                Current mode: <Text className="font-bold capitalize">{theme ?? 'dark'}</Text>
              </Text>
              <Button size="sm" variant="outline" onPress={toggleTheme}>
                Switch to {isDark ? 'Light' : 'Dark'}
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Form Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Form Controls</CardTitle>
            <CardDescription>
              Native inputs and switches powered by shared design tokens.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <View className="space-y-1.5">
              <InputLabel>Developer Username</InputLabel>
              <Input
                value={username}
                onChangeText={setUsername}
                placeholder="Enter handle..."
              />
            </View>

            <View className="flex-row items-center justify-between pt-2">
              <View className="space-y-0.5">
                <Text className="text-sm font-medium text-foreground">Push Notifications</Text>
                <Text className="text-xs text-muted-foreground">Receive real-time build updates</Text>
              </View>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </View>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button size="sm" variant="secondary" onPress={resetUsername}>
              Reset
            </Button>
            <Button size="sm" onPress={openDialog}>
              Confirm Settings
            </Button>
          </CardFooter>
        </Card>

        {/* Buttons Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>
              React Native Pressable primitives with Uniwind active pseudo-classes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="flex-row flex-wrap gap-2">
              <Button size="sm" variant="default">Default</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
              <Button size="sm" variant="outline">Outline</Button>
              <Button size="sm" variant="destructive">Destructive</Button>
            </View>
          </CardContent>
        </Card>

        {/* Modal Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Profile Changes</DialogTitle>
              <DialogDescription>
                Saved handle: <Text className="font-semibold">{username}</Text>. Notifications are{' '}
                <Text className="font-semibold">{notifications ? 'enabled' : 'disabled'}</Text>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose onPress={closeDialog}>
                <Button variant="outline" onPress={closeDialog}>
                  Cancel
                </Button>
              </DialogClose>
              <Button onPress={closeDialog}>
                Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </View>
    </ScrollView>
  );
}
