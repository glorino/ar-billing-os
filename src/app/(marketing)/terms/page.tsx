"use client"

export default function TermsPage() {
  return (
    <div className="space-y-12 pb-20">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative mx-auto max-w-4xl text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Terms of Service</h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: June 1, 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 space-y-10">
        <div>
          <h2 className="text-xl font-bold mb-3">Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">By accessing or using AR Billing, you agree to these Terms of Service. If you do not agree, do not use the service. We may update these terms periodically, and continued use constitutes acceptance of changes.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Account Terms</h2>
          <p className="text-muted-foreground leading-relaxed">You must provide accurate information when creating an account. You are responsible for maintaining the security of your credentials and for all activity under your account. You must be at least 18 years old to use this service.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Payment Terms</h2>
          <p className="text-muted-foreground leading-relaxed">Paid plans are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to change pricing with 30 days notice. Failure to pay may result in account suspension.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">AR Billing and its original content, features, and functionality are owned by AR Billing Inc. and are protected by copyright, trademark, and other intellectual property laws. You retain ownership of data you input into the service.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">AR Billing Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Termination</h2>
          <p className="text-muted-foreground leading-relaxed">We may terminate or suspend your account at any time for violation of these terms. Upon termination, your right to use the service ceases immediately. We will provide data export for 30 days after termination.</p>
        </div>
      </section>
    </div>
  )
}
