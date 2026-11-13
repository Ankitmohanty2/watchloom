import { ShieldCheck } from 'lucide-react'
import { LegalLink, LegalPage, type LegalSection } from '@/components/legal/LegalPage'

const sections: LegalSection[] = [
  {
    id: 'about-this-policy',
    title: 'About this policy',
    paragraphs: [
      'Watchloom is a personal project for discovering movies, series, and anime and keeping a watchlist. This policy describes the information the site uses to provide those features.',
      'The site does not host or stream movies, series, or anime.',
    ],
  },
  {
    id: 'information',
    title: 'Information Watchloom uses',
    paragraphs: ['Depending on the features you use, Watchloom stores:'],
    bullets: [
      'Account details such as your email address, username, display name, and a password hash used to sign you in.',
      'A profile photo, if you choose to upload one.',
      'Your watchlist status, ratings, preferences, and saved season and episode progress.',
      'A community comment, if you choose to publish one. Your display name and comment are shown publicly in the community carousel; your email and watchlist are not.',
      'Short-lived email codes used for account verification and password changes.',
    ],
  },
  {
    id: 'use',
    title: 'How information is used',
    paragraphs: [
      'Account and watchlist information is used to sign you in, show your library and progress, personalize your experience, and protect account changes. Email codes are sent only for the account action you request.',
      'Public comments are used to display the community carousel. Do not include private or sensitive information in a comment.',    ],
  },
  {
    id: 'storage',
    title: 'Browser storage',
    paragraphs: [
      'Watchloom stores sign-in session information, your theme preference, and a short-lived copy of catalog lists in your browser’s local storage. This keeps you signed in, remembers your selected appearance, and lets the home page appear quickly on your next visit. You can clear this storage in your browser settings; clearing sign-in data will sign you out.',
      <>The <LegalLink to="/cookies">cookies and storage policy</LegalLink> lists each item and explains what embedded services may store.</>,
    ],
  },
  {
    id: 'providers',
    title: 'Hosting and service providers',
    paragraphs: [
      'Account and library data is stored in a database hosted by MongoDB Atlas. The website is served by Vercel and the application server is hosted by Render. Account emails are sent through the configured email delivery provider. These providers process information, such as your IP address and request details, to operate their services and under their own policies.',
      'Catalog details and artwork are obtained from services such as TMDB and AniList, trailers are played through YouTube, and fonts are loaded from Google Fonts. Your browser contacts these services directly when their content is shown, and they are governed by their own terms and privacy practices. Watchloom does not control their availability or policies.',
    ],
  },
  {
    id: 'choices',
    title: 'Your choices',
    paragraphs: [
      'You can remove a profile photo, update or remove your public comment, change library statuses, and unmark saved episodes in the site. You can also clear local storage in your browser to remove locally saved session and theme settings.',
      'Watchloom currently has no self-service account deletion control and does not publish a dedicated privacy contact address. Do not place private account details in public comments.',
    ],
  },
  {
    id: 'retention-security',
    title: 'Retention and security',
    paragraphs: [
      'Account and library information is kept to provide Watchloom’s features. Verification and password-change codes are short-lived and intended for one use. The project uses measures such as password hashing and protected account routes, but no website can guarantee absolute security.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    paragraphs: [
      'This policy may be updated when Watchloom changes. The date at the top of this page shows when it was last revised.',
    ],
  },
]

const PrivacyPolicyPage = () => (
  <LegalPage
    icon={ShieldCheck}
    kicker="Privacy"
    title="Privacy policy"
    intro="A plain-language overview of the information Watchloom uses and the choices available to you."
    lastUpdated="November 13, 2026"
    sections={sections}
  />
)

export default PrivacyPolicyPage
