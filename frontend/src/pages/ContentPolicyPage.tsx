import { Copyright } from 'lucide-react'
import { LegalLink, LegalPage, type LegalSection } from '@/components/legal/LegalPage'

const sections: LegalSection[] = [
  {
    id: 'what-watchloom-is',
    title: 'What Watchloom is',
    paragraphs: [
      'Watchloom is a catalog and tracking tool. It shows information about movies, series, and anime and lets you keep a personal watchlist.',
      'Watchloom does not host, stream, or offer downloads of any film, episode, or other copyrighted work, and it does not link to unauthorized copies.',
    ],
  },
  {
    id: 'sources',
    title: 'Where the catalog comes from',
    paragraphs: ['Titles, descriptions, ratings, and artwork are supplied by independent services:'],
    bullets: [
      <>Movie and series information and images come from <LegalLink to="https://www.themoviedb.org/">TMDB</LegalLink>. This product uses the TMDB API but is not endorsed or certified by TMDB.</>,
      <>Anime information and images come from <LegalLink to="https://anilist.co/">AniList</LegalLink>.</>,
      <>Streaming availability is taken from TMDB’s watch provider data, which is supplied by JustWatch.</>,
      <>Trailers are embedded from YouTube and play from YouTube’s own servers.</>,
    ],
  },
  {
    id: 'ownership',
    title: 'Artwork and trademarks',
    paragraphs: [
      'Posters, backdrops, logos, titles, and names belong to their respective owners. They appear on Watchloom only to identify and describe the works in the catalog. Watchloom claims no ownership of them.',
    ],
  },
  {
    id: 'accuracy',
    title: 'Accuracy',
    paragraphs: [
      'Catalog details can be incomplete, out of date, or wrong, and streaming availability changes often and differs by country. A title appearing on Watchloom is not a promise that it is available on any service.',
    ],
  },
  {
    id: 'community',
    title: 'Community comments',
    paragraphs: ['Comments shared on the home page are public. When you post one, do not include:'],
    bullets: [
      'Harassment, hate speech, or threats.',
      'Spam, advertising, or links to pirated or unauthorized copies of any work.',
      'Private information about yourself or anyone else.',
      'Material that infringes someone else’s rights or breaks the law.',
    ],
  },
  {
    id: 'moderation',
    title: 'Removal of comments',
    paragraphs: [
      'Comments that break these rules may be removed, and repeated misuse may lead to an account being limited or suspended. You can edit or delete your own comment at any time from the community section of the home page.',
    ],
  },
  {
    id: 'reporting',
    title: 'Reporting a copyright or content concern',
    paragraphs: [
      <>Because artwork and descriptions are provided by TMDB and AniList, a correction or removal made with them is also reflected on Watchloom. For a concern about Watchloom itself, such as a community comment, contact the maintainer through <LegalLink to="https://ankitmohanty.in">ankitmohanty.in</LegalLink>.</>,
      'To help the report be handled quickly, include:',
    ],
    bullets: [
      'The page address or the title the report is about.',
      'What the problem is and, for a copyright concern, the work you believe is affected.',
      'Your relationship to that work, for example the owner or an authorized representative.',
      'A way to reach you for follow-up.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    paragraphs: [
      <>This policy may be updated as Watchloom changes. It should be read together with the <LegalLink to="/terms">terms and conditions</LegalLink>.</>,
    ],
  },
]

const ContentPolicyPage = () => (
  <LegalPage
    icon={Copyright}
    kicker="Content"
    title="Content & copyright"
    intro="Where Watchloom’s catalog comes from, who owns it, and how to raise a concern."
    lastUpdated="November 13, 2026"
    sections={sections}
  />
)

export default ContentPolicyPage
