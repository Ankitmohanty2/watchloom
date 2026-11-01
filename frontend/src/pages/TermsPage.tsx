import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

const TermsPage = () => {
  return (
    <div className="bg-background text-foreground">
      <div className="container-custom py-12">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-brand-muted"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary-600/30 bg-primary-500/10">
              <FileText className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground-strong sm:text-4xl">
                Terms of Service
              </h1>
              <p className="text-muted">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="max-w-none">
            <div className="space-y-8 rounded-2xl border border-border/10 bg-surface p-6 shadow-xl sm:p-10">
              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Agreement to Terms
                </h2>
                <p className="text-muted leading-relaxed">
                  By accessing or using Watchloom, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Use License
                </h2>
                <p className="text-muted leading-relaxed mb-4">
                  Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                  <li>Access and use the Watchloom platform for personal, non-commercial purposes</li>
                  <li>Create and maintain a personal library of entertainment content</li>
                  <li>Track your viewing progress and statistics</li>
                  <li>Share your public profile and lists (if enabled)</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  User Accounts
                </h2>
                <p className="text-muted leading-relaxed mb-4">
                  When you create an account with us, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized access or security breach</li>
                  <li>Not create multiple accounts or share your account with others</li>
                </ul>
                <p className="text-muted leading-relaxed mt-4">
                  We reserve the right to suspend or terminate your account if you violate these terms.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Acceptable Use
                </h2>
                <p className="text-muted leading-relaxed mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                  <li>Use the service for any illegal or unauthorized purpose</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit any malware, viruses, or harmful code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Scrape, spider, or harvest data from the platform</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Impersonate any person or entity</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Content and Intellectual Property
                </h2>
                <p className="text-muted leading-relaxed">
                  All content provided through Watchloom, including text, graphics, logos, images, and software, is the property of Watchloom or its content suppliers and is protected by copyright and other intellectual property laws.
                </p>
                <p className="text-muted leading-relaxed mt-4">
                  Media information and images are sourced from third-party providers (TMDB and AniList) and remain the property of their respective copyright holders.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  User-Generated Content
                </h2>
                <p className="text-muted leading-relaxed mb-4">
                  You retain ownership of content you create (ratings, reviews, lists). By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content in connection with the service.
                </p>
                <p className="text-muted leading-relaxed">
                  You are responsible for the content you post and must ensure it does not violate any laws or third-party rights.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Third-Party Links and Services
                </h2>
                <p className="text-muted leading-relaxed">
                  Our service may contain links to third-party websites or services (TMDB, AniList, etc.) that are not owned or controlled by Watchloom. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party services.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Disclaimer of Warranties
                </h2>
                <p className="text-muted leading-relaxed">
                  The service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Limitation of Liability
                </h2>
                <p className="text-muted leading-relaxed">
                  To the maximum extent permitted by law, Watchloom shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Data Accuracy
                </h2>
                <p className="text-muted leading-relaxed">
                  We source media information from third-party APIs (TMDB and AniList). While we strive for accuracy, we cannot guarantee that all information is complete, accurate, or up-to-date. Content availability and details may vary by region.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Service Modifications
                </h2>
                <p className="text-muted leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue the service (or any part thereof) at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the service.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Termination
                </h2>
                <p className="text-muted leading-relaxed">
                  We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the service will immediately cease.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Governing Law
                </h2>
                <p className="text-muted leading-relaxed">
                  These Terms shall be governed and construed in accordance with applicable laws, without regard to its conflict of law provisions. Any disputes arising from these terms shall be resolved through binding arbitration.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Changes to Terms
                </h2>
                <p className="text-muted leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the service after any changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Contact Information
                </h2>
                <p className="text-muted leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 rounded-lg border border-primary-600/30 bg-primary-500/10 p-4">
                  <p className="text-foreground-strong">
                    <strong>Email:</strong> legal@watchloom.com
                  </p>
                </div>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  API Attribution
                </h2>
                <p className="text-muted leading-relaxed">
                  This product uses the TMDB API but is not endorsed or certified by TMDB. Anime data is provided by AniList. All media content, images, and metadata are the property of their respective copyright holders.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsPage

