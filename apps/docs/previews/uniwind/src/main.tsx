import { AppRegistry } from 'react-native';

import { Preview } from './preview';
import './index.css';

AppRegistry.registerComponent('DocsUniwindPreview', () => Preview);
AppRegistry.runApplication('DocsUniwindPreview', {
  initialProps: {},
  rootTag: document.getElementById('root')!,
});
window.parent.postMessage({ type: 'docs-preview-ready', framework: 'uniwind' }, '*');
