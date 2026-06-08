"use client"

export default function GdprPage() {
  return (
    <div className="space-y-12 pb-20">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative mx-auto max-w-4xl text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">GDPR Compliance</h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: June 1, 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 space-y-10">
        <div>
          <h2 className="text-xl font-bold mb-3">Data Controller</h2>
          <p className="text-muted-foreground leading-relaxed">AR Billing Inc. acts as the data controller for personal data processed through our platform. We determine the purposes and means of processing your personal data.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Data Processing</h2>
          <p className="text-muted-foreground leading-relaxed">We process personal data based on legitimate interest, contractual necessity, consent, and legal obligations. Processing activities include customer management, payment processing, analytics, and communication.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Your Rights</h2>
          <div className="text-muted-foreground leading-relaxed space-y-2">
            <p>Under GDPR, you have the right to:</p>
            <p>• <strong className="text-foreground">Access</strong> — Request a copy of your personal data</p>
            <p>• <strong className="text-foreground">Rectification</strong> — Correct inaccurate personal data</p>
            <p>• <strong className="text-foreground">Erasure</strong> — Request deletion of your personal data</p>
            <p>• <strong className="text-foreground">Restriction</strong> — Restrict processing of your data</p>
            <p>• <strong className="text-foreground">Portability</strong> — Receive your data in a machine-readable format</p>
            <p>• <strong className="text-foreground">Objection</strong> — Object to processing based on legitimate interest</p>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">We retain personal data only as long as necessary for the purposes outlined in our Privacy Policy. Account data is retained for the duration of the account plus 30 days after deletion. Transaction records are retained for 7 years as required by financial regulations.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">International Transfers</h2>
          <p className="text-muted-foreground leading-relaxed">Your data may be transferred to and processed in countries outside the European Economic Area. We ensure appropriate safeguards are in place, including Standard Contractual Clauses and adequacy decisions where applicable.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">For GDPR-related inquiries or to exercise your rights, contact our Data Protection Officer at dpo@arbilling.com or write to: AR Billing Inc., Attn: DPO, 123 Business Ave, Suite 100, San Francisco, CA 94105.</p>
        </div>
      </section>
    </div>
  )
}
