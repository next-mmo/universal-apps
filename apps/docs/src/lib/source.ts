import { loader } from 'fumadocs-core/source';
import * as collections from '../../.source/server';

export const source = loader({
  baseUrl: '/docs',
  source: collections.docs.toFumadocsSource(),
});
