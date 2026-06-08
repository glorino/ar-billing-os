"use client"

export default function PrivacyPage() {
  return (
    <div className="space-y-12 pb-20">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative mx-auto max-w-4xl text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: June 1, 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 space-y-10">
        <div>
          <h2 className="text-xl font-bold mb-3">Information Collection</h2>
          <p className="text-muted-foreground leading-relaxed">We collect information you provide directly, such as your name, email address, billing information, and any data you input into our platform. We also collect usage data including IP addresses, browser types, and interaction patterns to improve our services.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Data Usage</h2>
          <p className="text-muted-foreground leading-relaxed">Your data is used to provide, maintain, and improve our services, process transactions, send communications, and comply with legal obligations. We do not sell your personal information to third parties.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">We share data with trusted service providers who assist in operating our platform, including payment processors, cloud hosting providers, and analytics services. All providers are contractually bound to protect your information.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Security</h2>
          <p className="text-muted-foreground leading-relaxed">We implement industry-standard security measures including encryption at rest and in transit, regular security audits, SOC 2 compliance, and access controls to protect your data.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">We use essential cookies for platform functionality, analytics cookies to understand usage patterns, and preference cookies to remember your settings. You can manage cookies through your browser settings.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">You have the right to access, correct, delete, or port your personal data. You can also object to or restrict processing. Contact us at privacy@arbilling.com to exercise these rights.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">For questions about this policy, contact us at privacy@arbilling.com or write to: AR Billing Inc., 123 Business Ave, Suite 100, San Francisco, CA 94105.</p>
        </div>
      </section>
    </div>
  )
}
