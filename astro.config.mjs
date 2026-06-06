import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// NOTE: `site` is a placeholder canonical URL; set it (and `base` for a GitHub
// Pages project site) when the hosting target is finalized.
export default defineConfig({
  site: 'https://appfeedback.dev',
  integrations: [
    starlight({
      title: 'AppFeedback',
      tagline: 'Feedback, straight to GitHub.',
      description: 'One feedback SDK for Apple, Android, and Web — every submission becomes a GitHub issue in one byte-exact format.',
      customCss: ['./src/styles/theme.css'],
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
