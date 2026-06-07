import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// Deployed as a GitHub Pages project site at https://hayek.github.io/appfeedback-docs.
export default defineConfig({
  site: 'https://hayek.github.io',
  base: '/appfeedback-docs',
  integrations: [
    starlight({
      title: 'AppFeedback',
      tagline: 'Feedback, straight to GitHub.',
      description: 'One feedback SDK for Apple, Android, and Web — every submission becomes a GitHub issue in one byte-exact format.',
      customCss: ['./src/styles/theme.css'],
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://hayek.github.io/appfeedback-docs/og.png' } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://hayek.github.io/appfeedback-docs/og.png' } },
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/hayek/appfeedback-web' },
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Overview', link: '/' },
            { label: 'Quickstart', link: '/guides/quickstart/' },
            { label: 'Installation', link: '/guides/installation/' },
            { label: 'Playground', link: '/playground/', badge: 'Live' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'The relay (Web)', link: '/guides/relay/' },
            { label: 'Security model', link: '/guides/security/' },
            { label: 'Theming & localization', link: '/guides/theming/' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Wire format', link: '/reference/wire-format/' },
            { label: 'API reference', link: '/reference/api/' },
          ],
        },
      ],
    }),
  ],
})
