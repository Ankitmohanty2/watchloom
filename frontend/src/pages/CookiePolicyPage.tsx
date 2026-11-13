import { Cookie } from 'lucide-react'
import { LegalLink, LegalPage, type LegalSection } from '@/components/legal/LegalPage'

const StorageKey = ({ children }: { children: string }) => (
  <code className="rounded-md bg-surface-alt px-1.5 py-0.5 text-[13px] text-foreground-strong">{children}</code>
)

const sections: LegalSection[] = [
  {
    id: 'summary',
    title: 'The short version',
    paragraphs: [
      'Watchloom does not set cookies of its own, and its code contains no advertising or analytics trackers. It keeps a small amount of information in your browser’s local storage so the site can work, and it embeds content from other services that may use their own cookies.',
    ],
  },
  {
    id: 'local-storage',
    title: 'What Watchloom stores in your browser',
    paragraphs: ['Local storage is kept on your device by your browser. Watchloom uses these entries:'],
    bullets: [
      <><StorageKey>auth-storage</StorageKey> keeps you signed in. It holds your sign-in tokens and a copy of your account details, such as your display name and email address, and it is emptied when you sign out.</>,
      <><StorageKey>watchloom-theme</StorageKey> remembers whether you chose the light or dark appearance.</>,
      <><StorageKey>watchloom-catalog-cache</StorageKey> holds a copy of public catalog lists, such as trending titles, so the home page can appear quickly on your next visit. It contains no personal information and is refreshed automatically; copies older than a day are discarded.</>,
    ],
  },
  {
    id: 'third-parties',
    title: 'Content from other services',
    paragraphs: [
      'Some parts of a page are loaded directly from other companies. When that happens your browser connects to them, and they may set cookies or use storage under their own policies:',
    ],
    bullets: [
      <>YouTube plays trailers. The trailer window uses YouTube’s privacy-enhanced player, and background previews use the standard YouTube player. See <LegalLink to="https://policies.google.com/privacy">Google’s privacy policy</LegalLink>.</>,
      <>Google Fonts supplies the typefaces used across the site.</>,
      <>TMDB and AniList supply posters, backdrops, and streaming service logos.</>,
      <>Vercel serves the website and Render hosts the application server. Both receive standard request information such as your IP address.</>,
    ],
  },
  {
    id: 'background-trailers',
    title: 'Background trailer previews',
    paragraphs: [
      'Featured titles can play a muted trailer preview behind the page. Previews are switched off automatically when your device asks for reduced motion or reduced data use, and you can pause one at any time with the pause button beside it. When no preview plays, the YouTube player is not loaded.',
    ],
  },
  {
    id: 'managing',
    title: 'Managing storage',
    paragraphs: [
      'You can clear Watchloom’s stored information at any time through your browser’s site data settings. Clearing it signs you out and resets the appearance to the default. Your account, library, and progress stay saved on the server and return when you sign in again.',
      'If your browser blocks local storage, Watchloom still works for browsing, but it cannot keep you signed in between visits or remember your theme.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    paragraphs: [
      <>This page is updated when the site changes what it stores. For how account information is handled, see the <LegalLink to="/privacy">privacy policy</LegalLink>.</>,
    ],
  },
]

const CookiePolicyPage = () => (
  <LegalPage
    icon={Cookie}
    kicker="Cookies"
    title="Cookies & storage"
    intro="What Watchloom keeps in your browser, why it is there, and how to remove it."
    lastUpdated="November 13, 2026"
    sections={sections}
  />
)

export default CookiePolicyPage
