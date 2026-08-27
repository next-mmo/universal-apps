import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  InputLabel,
  Separator,
  Switch,
  ThemeRoot,
  useTheme,
} from '@package/ui-native';
import type { Palette } from '@package/ui/src/tokens';

export function Playground() {
  return (
    <ThemeRoot defaultMode='light'>
      <PlaygroundScreen />
    </ThemeRoot>
  );
}

function PlaygroundScreen() {
  const { mode, palette, setMode } = useTheme();
  const [pinned, setPinned] = useState(false);
  const [name, setName] = useState('');

  return (
    <ScrollView style={[styles.root, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.foreground }]}>ui-native playground</Text>
        <Button variant='outline' onPress={() => setMode(mode === 'light' ? 'dark' : 'light')}>
          {mode === 'light' ? 'Dark mode' : 'Light mode'}
        </Button>
      </View>

      <Section palette={palette} title='Buttons'>
        <View style={styles.row}>
          <Button>Default</Button>
          <Button variant='secondary'>Secondary</Button>
          <Button variant='destructive'>Delete</Button>
          <Button variant='outline'>Outline</Button>
          <Button variant='ghost'>Ghost</Button>
          <Button variant='link'>Link</Button>
        </View>
        <View style={styles.row}>
          <Button size='sm' variant='secondary'>Small</Button>
          <Button size='lg' variant='secondary'>Large</Button>
          <Button size='icon' variant='outline' onPress={() => setPinned(!pinned)}>★</Button>
        </View>
      </Section>

      <Section palette={palette} title='Badges'>
        <View style={styles.row}>
          <Badge>Default</Badge>
          <Badge variant='secondary'>Secondary</Badge>
          <Badge variant='destructive'>Destructive</Badge>
          <Badge variant='outline'>Outline</Badge>
          <Badge variant='success'>Done</Badge>
          <Badge variant='warning'>In progress</Badge>
        </View>
      </Section>

      <Section palette={palette} title='Card + form controls'>
        <Card>
          <CardHeader>
            <CardTitle>New task</CardTitle>
            <CardDescription>Schema would come from @package/pro-core.</CardDescription>
          </CardHeader>
          <CardContent style={styles.form}>
            <InputLabel>Task</InputLabel>
            <Input value={name} onChangeText={setName} placeholder='What needs doing?' />
            <View style={[styles.row, styles.switchRow]}>
              <Switch checked={pinned} onCheckedChange={setPinned} />
              <Text style={{ color: palette.foreground }}>Pin to top</Text>
            </View>
          </CardContent>
          <CardFooter>
            <Button onPress={() => setName('')}>Create</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section palette={palette} title='Separator'>
        <Text style={{ color: palette.foreground }}>Above the divider</Text>
        <Separator />
        <Text style={{ color: palette.foreground }}>Below the divider</Text>
      </Section>
    </ScrollView>
  );
}

function Section({ palette, title, children }: { palette: Palette; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: palette.mutedForeground }]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionBody: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  switchRow: {
    gap: 10,
  },
  form: {
    gap: 12,
  },
});
