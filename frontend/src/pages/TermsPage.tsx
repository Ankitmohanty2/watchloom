import { FileText } from 'lucide-react'
import { LegalPage, type LegalSection } from '@/components/legal/LegalPage'

const sections: LegalSection[] = [
  {
    id: 'about-watchloom',
    title: 'About Watchloom',
    paragraphs: [
      'Watchloom is an independently maintained personal project for discovering movies, series, and anime and keeping track of what you want to watch. It is a catalog and tracking tool; it does not host or stream media.',
    ],
  },
  {
    id: 'your-account',
    title: 'Your account',
    paragraphs: [
      'If you create an account, provide information that is accurate and keep your sign-in details private. You are responsible for activity carried out through your account. Sign out when using a shared device.',
      'You may stop using Watchloom at any time. Access may be limited or suspended when needed to protect the service, its users, or the security of an account.',
    ],
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    paragraphs: ['Use Watchloom lawfully and in a way that does not interfere with other people or the service. In particular, do not:'],
    bullets: [
      'Attempt to access another person’s account or non-public data.',
      'Probe, disrupt, overload, or bypass the service’s security or rate limits.',
      'Use automated scraping or bulk collection to copy the catalog or service data.',
      'Upload or submit material that violates another person’s rights or applicable law.',
    ],
  },
  {
    id: 'your-library',
    title: 'Your library and preferences',
    paragraphs: [
      'Your watchlist, episode progress, ratings, notes, and preferences are associated with your account so Watchloom can provide its tracking features. You remain responsible for the information you add. You give Watchloom permission to store and process it only as needed to operate those features.',
    ],
  },
  {
    id: 'community-feedback',
    title: 'Community feedback',
    paragraphs: [
      'If you choose to share a comment on the home page and confirm the public-display checkbox, your comment and current display name will appear in the Watchloom community carousel. Do not include private or sensitive information. You can update or remove your comment from the same section at any time.',
    ],
  },
  {
    id: 'catalog-data',
    title: 'Catalog data and third-party services',
    paragraphs: [
      'Catalog details, ratings, and artwork may come from independent third-party services, including TMDB and AniList. Their data can be incomplete, change over time, or be unavailable. The providers retain their rights in their respective names, marks, images, and data.',
      'Links to external sites are provided for convenience. Those sites have their own terms and policies, and Watchloom does not control them.',
    ],
  },
  {
    id: 'availability',
    title: 'Availability and changes',
    paragraphs: [
      'Watchloom is provided as available. Features may change, be interrupted, or be discontinued as the project is maintained. Catalog information is provided for discovery and personal tracking and is not a guarantee of availability on any streaming service.',
    ],
  },
  {
    id: 'limits',
    title: 'Liability',
    paragraphs: [
      'To the extent permitted by applicable law, the project maintainer is not responsible for indirect or consequential loss arising from use of the service, third-party catalog data, or temporary service interruptions. Nothing in these terms limits rights that cannot legally be limited.',
    ],
  },
  {
    id: 'updates',
    title: 'Updates to these terms',
    paragraphs: [
      'These terms may be updated as Watchloom changes. The current version and its update date will appear on this page. If you continue using Watchloom after an update, you agree to the revised terms to the extent permitted by applicable law.',
    ],
  },
]

const TermsPage = () => (
  <LegalPage
    icon={FileText}
    kicker="Terms"
    title="Terms & conditions"
    intro="A clear guide to using this personal project and keeping your watchlist in one place."
    lastUpdated="November 2, 2026"
    sections={sections}
  />
)

export default TermsPage
