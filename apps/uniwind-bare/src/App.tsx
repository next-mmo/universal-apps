import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './lib/universal/ui-native/components/ui/button';
import './index.css';

export default function App() {
  return (
    <View className="flex-1 bg-slate-950 items-center justify-center p-6">
      <View className="max-w-md w-full items-center space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-8">
        <Text className="text-3xl font-bold text-slate-50">uniwind-bare</Text>
        <Text className="text-slate-400 text-sm text-center mb-4">
          Universal Apps bare React Native starter powered by Uniwind and Tailwind CSS v4.
        </Text>
        <Button variant="default" size="default" onPress={() => console.log('Pressed!')}>
          Get Started
        </Button>
      </View>
    </View>
  );
}
