import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

const PrivacyPage = () => {
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
              <Shield className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground-strong sm:text-4xl">
                Privacy Policy
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
                  Introduction
                </h2>
                <p className="text-muted leading-relaxed">
                  Welcome to Watchloom. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our entertainment tracking platform.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Information We Collect
                </h2>
                <p className="text-muted leading-relaxed mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                  <li>Account information (email address, username, password)</li>
                  <li>Profile information (display name, profile picture)</li>
                  <li>Watchlist data and viewing preferences</li>
                  <li>Episode tracking and progress information</li>
                  <li>Ratings and reviews you submit</li>
                  <li>Communication preferences and settings</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  How We Use Your Information
                </h2>
                <p className="text-muted leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Create and manage your account</li>
                  <li>Track your watching progress and maintain your library</li>
                  <li>Generate personalized statistics and recommendations</li>
                  <li>Send you updates and notifications (if opted in)</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Protect against fraudulent or illegal activity</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Data Storage and Security
                </h2>
                <p className="text-muted leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal data. Your password is encrypted using industry-standard hashing algorithms. We store your data on secure servers and use SSL/TLS encryption for data transmission.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Third-Party Services
                </h2>
                <p className="text-muted leading-relaxed mb-4">
                  We use third-party services to enhance our platform:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                  <li><strong>TMDB (The Movie Database):</strong> For movie and TV show information</li>
                  <li><strong>AniList:</strong> For anime information and metadata</li>
                  <li><strong>MongoDB Atlas:</strong> For secure data storage</li>
                </ul>
                <p className="text-muted leading-relaxed mt-4">
                  These services have their own privacy policies governing their use of your information.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Your Rights
                </h2>
                <p className="text-muted leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted ml-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt out of marketing communications</li>
                  <li>Object to processing of your personal data</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Cookies and Tracking
                </h2>
                <p className="text-muted leading-relaxed">
                  We use cookies and similar tracking technologies to maintain your session and remember your preferences. You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our service.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Data Retention
                </h2>
                <p className="text-muted leading-relaxed">
                  We retain your personal data for as long as your account is active or as needed to provide you services. If you delete your account, we will remove your personal data within 30 days, except where we are required to retain it for legal purposes.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Children's Privacy
                </h2>
                <p className="text-muted leading-relaxed">
                  Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Changes to This Policy
                </h2>
                <p className="text-muted leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="mb-3 font-display text-xl font-semibold text-foreground-strong">
                  Contact Us
                </h2>
                <p className="text-muted leading-relaxed">
                  If you have any questions about this privacy policy or our data practices, please contact us at:
                </p>
                <div className="mt-4 rounded-lg border border-primary-600/30 bg-primary-500/10 p-4">
                  <p className="text-foreground-strong">
                    <strong>Email:</strong> privacy@watchloom.com
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage

