import { AppRegistry } from 'react-native';

import { Playground } from './playground';

AppRegistry.registerComponent('NativePlayground', () => Playground);
AppRegistry.runApplication('NativePlayground', {
  initialProps: {},
  rootTag: document.getElementById('root')!,
});
