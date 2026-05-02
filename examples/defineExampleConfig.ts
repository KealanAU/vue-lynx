import { defineConfig } from '@lynx-js/rspeedy'
import type { Config, RsbuildPlugin } from '@lynx-js/rspeedy'

function pluginExamplePrintUrls(
  entries: Record<string, unknown>,
  envNames: string[],
): RsbuildPlugin {
  return {
    name: 'example:print-urls',
    enforce: 'pre',
    setup(api) {
      api.modifyRsbuildConfig((config, { mergeRsbuildConfig }) => {
        return mergeRsbuildConfig(config, {
          server: {
            printUrls: ({
              urls,
              port,
              protocol,
            }: {
              urls: string[]
              port: number
              protocol: string
              routes: unknown
            }) => {
              const base = urls.at(-1) ?? `${protocol}://localhost:${port}`
              const result: { url: string; label: string }[] = []
              for (const entry of Object.keys(entries)) {
                for (const env of envNames) {
                  const bundle = `${entry}.${env}.bundle`
                  result.push({
                    label: env.charAt(0).toUpperCase() + env.slice(1),
                    url: `${base}/${bundle}`,
                  })
                  if (env === 'web') {
                    result.push({
                      label: '↵',
                      url: `${base}/__web_preview?casename=${encodeURIComponent(bundle)}`,
                    })
                  }
                }
              }
              return result
            },
          },
        } as Parameters<typeof mergeRsbuildConfig>[0])
      })
    },
  }
}

export function defineExampleConfig(config: Config): Config {
  const entries = config.source?.entry ?? {}
  const envNames = Object.keys(config.environments ?? {})

  return defineConfig({
    ...config,
    plugins: [...(config.plugins ?? []), pluginExamplePrintUrls(entries, envNames)],
  })
}
