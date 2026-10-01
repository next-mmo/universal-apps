import '../global.css';
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Button } from '@package/ui-native';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <View className="flex-1 bg-slate-950 items-center justify-center p-6 min-h-screen">
      <View className="max-w-md w-full items-center space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <Text className="text-3xl font-bold text-slate-50 tracking-tight">Nativewind v5 Web</Text>
        <Text className="text-slate-400 text-sm text-center">
          Universal Apps design system running on Expo Web with Nativewind v5 RC0 and Tailwind CSS v4.
        </Text>
        <View className="flex-row items-center gap-3 pt-4">
          <Button variant="default" onPress={() => setCount((c) => c + 1)}>
            Count: {count}
          </Button>
          <Button variant="outline" onPress={() => setCount(0)}>
            Reset
          </Button>
        </View>
      </View>
    </View>
  );
}
