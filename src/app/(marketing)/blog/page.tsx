"use client"

const posts = [
  { title: "10 Strategies to Reduce Days Sales Outstanding", excerpt: "Learn proven techniques to accelerate cash flow and reduce the time it takes to collect payments from customers.", date: "Jun 5, 2026", author: "Sarah Chen", readTime: "8 min", category: "Best Practices", gradient: "from-blue-500 to-cyan-400" },
  { title: "Automating Your AR Process: A Complete Guide", excerpt: "Discover how automation can transform your accounts receivable workflow and eliminate manual data entry.", date: "Jun 1, 2026", author: "Marcus Johnson", readTime: "12 min", category: "Automation", gradient: "from-purple-500 to-pink-400" },
  { title: "The True Cost of Late Payments on Your Business", excerpt: "Late payments affect more than just cash flow. Understand the full impact on your business operations.", date: "May 28, 2026", author: "Aisha Patel", readTime: "6 min", category: "Finance", gradient: "from-emerald-500 to-teal-400" },
  { title: "Building Effective Collections Workflows", excerpt: "Design collections processes that are professional, effective, and maintain positive customer relationships.", date: "May 22, 2026", author: "David Okoro", readTime: "10 min", category: "Collections", gradient: "from-orange-500 to-red-400" },
  { title: "AR Metrics Every CFO Should Track", excerpt: "From DSO to CEI, these key metrics will give you complete visibility into your receivables performance.", date: "May 18, 2026", author: "Sarah Chen", readTime: "7 min", category: "Analytics", gradient: "from-cyan-500 to-blue-400" },
  { title: "How AI is Transforming Accounts Receivable", excerpt: "Explore how artificial intelligence is revolutionizing invoice processing, payment prediction, and risk assessment.", date: "May 12, 2026", author: "Marcus Johnson", readTime: "9 min", category: "Innovation", gradient: "from-pink-500 to-rose-400" },
]

const categoryColors: Record<string, string> = {
  "Best Practices": "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
  Automation: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  Finance: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
  Collections: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
  Analytics: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
  Innovation: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
}

export default function BlogPage() {
  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-blue-500/10" />
        <div className="relative mx-auto max-w-4xl text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">Blog & Insights</h1>
          <p className="mt-4 text-lg text-muted-foreground">Expert insights on accounts receivable, billing, and financial operations.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.title} className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group">
              <div className={`h-48 bg-gradient-to-br ${post.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[post.category]}`}>{post.category}</span>
                  <span className="text-xs text-muted-foreground">{post.readTime} read</span>
                </div>
                <h3 className="font-semibold text-lg leading-snug">{post.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">{post.author}</span>
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
