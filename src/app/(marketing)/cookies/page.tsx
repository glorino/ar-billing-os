"use client"

export default function CookiesPage() {
  return (
    <div className="space-y-12 pb-20">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative mx-auto max-w-4xl text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Cookie Policy</h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: June 1, 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 space-y-10">
        <div>
          <h2 className="text-xl font-bold mb-3">What Are Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">Cookies are small text files placed on your device when you visit a website. They help us recognize your browser and remember certain information to improve your experience.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">How We Use Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">We use cookies to keep you logged in, remember your preferences, understand how you use our platform, and measure the effectiveness of our marketing. Cookies help us provide a better, faster, and safer experience.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Types of Cookies</h2>
          <div className="text-muted-foreground leading-relaxed space-y-2">
            <p><strong className="text-foreground">Essential Cookies:</strong> Required for the platform to function. Cannot be disabled.</p>
            <p><strong className="text-foreground">Analytics Cookies:</strong> Help us understand usage patterns. Can be disabled.</p>
            <p><strong className="text-foreground">Preference Cookies:</strong> Remember your settings and choices. Can be disabled.</p>
            <p><strong className="text-foreground">Marketing Cookies:</strong> Used to deliver relevant advertisements. Can be disabled.</p>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Managing Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that disabling essential cookies may affect platform functionality.</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">For questions about our cookie practices, contact us at privacy@arbilling.com.</p>
        </div>
      </section>
    </div>
  )
}
