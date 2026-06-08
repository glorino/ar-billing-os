"use client"
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-animated">
      <div className="w-full max-w-md mx-auto p-8">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your AR Billing account</p>
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" placeholder="you@company.com" className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" placeholder="••••••••" className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          </div>
          <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Sign In</button>
          <p className="text-center text-sm text-muted-foreground">Don&apos;t have an account? <a href="/sign-up" className="text-primary hover:underline">Sign up</a></p>
        </div>
      </div>
    </div>
  )
}
