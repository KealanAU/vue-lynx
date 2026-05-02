import { defineExampleConfig } from '../defineExampleConfig.ts';
import { pluginVueLynx } from 'vue-lynx/plugin';

export default defineExampleConfig({
  environments: {
    web: {},
    lynx: {},
  },
  source: {
    entry: {
      main: './src/index.ts',
    },
  },
  plugins: [
    pluginVueLynx({
      optionsApi: false,
      enableCSSSelector: true,
    }),
  ],
});
