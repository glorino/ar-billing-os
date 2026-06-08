"use client"
export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-animated">
      <div className="w-full max-w-md mx-auto p-8">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">Start your free trial today</p>
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First name</label>
              <input type="text" placeholder="John" className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Last name</label>
              <input type="text" placeholder="Doe" className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Work email</label>
            <input type="email" placeholder="you@company.com" className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" placeholder="••••••••" className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          </div>
          <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Get Started Free</button>
          <p className="text-center text-sm text-muted-foreground">Already have an account? <a href="/sign-in" className="text-primary hover:underline">Sign in</a></p>
        </div>
      </div>
    </div>
  )
}
