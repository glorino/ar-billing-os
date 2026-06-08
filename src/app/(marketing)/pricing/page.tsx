"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"

const plans = [
  {
    name: "Starter",
    monthlyPrice: 29,
    annualPrice: 24,
    description: "Perfect for small businesses getting started with AR automation.",
    features: [
      "Up to 100 invoices/month",
      "1 user",
      "Email support",
      "Basic templates",
      "Standard reports",
      "Payment tracking",
    ],
    popular: false,
    borderGradient: "linear-gradient(135deg, #667eea, #4facfe)",
  },
  {
    name: "Growth",
    monthlyPrice: 99,
    annualPrice: 82,
    description: "For growing teams that need advanced automation and AI insights.",
    features: [
      "Up to 1,000 invoices/month",
      "5 users",
      "Priority support",
      "AI-powered features",
      "Custom templates",
      "Advanced analytics",
      "Smart collections",
      "API access",
    ],
    popular: true,
    borderGradient: "linear-gradient(135deg, #a855f7, #7c3aed)",
  },
  {
    name: "Enterprise",
    monthlyPrice: 499,
    annualPrice: 416,
    description: "For large organizations with complex AR needs and custom requirements.",
    features: [
      "Unlimited invoices",
      "Unlimited users",
      "Dedicated support",
      "Custom integrations",
      "White-label options",
      "Advanced security",
      "SLA guarantee",
      "Custom training",
      "Dedicated account manager",
    ],
    popular: false,
    borderGradient: "linear-gradient(135deg, #22c55e, #16a34a)",
  },
]

const faqs = [
  {
    question: "How does the free trial work?",
    answer: "Start a 14-day free trial with full access to all features in your chosen plan. No credit card required. Cancel anytime before the trial ends and you won't be charged.",
  },
  {
    question: "Can I switch plans at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, the change takes effect at your next billing date.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), ACH bank transfers, and wire transfers for annual Enterprise plans.",
  },
  {
    question: "Is there a setup fee?",
    answer: "No, there are no setup fees for any plan. You can get started immediately after signing up. Enterprise plans may include optional onboarding services.",
  },
  {
    question: "What happens when I exceed my invoice limit?",
    answer: "We'll notify you when you approach your limit. You can upgrade to a higher plan at any time to increase your invoice volume, or we can create a custom plan for your needs.",
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      {/* Hero */}
      <section
        style={{
          padding: "6rem 0",
          textAlign: "center",
          background: "linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%)",
        }}
      >
        <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#1e293b",
            }}
          >
            Simple, transparent{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              pricing
            </span>
          </h1>
          <p
            style={{
              margin: "1.5rem auto 0",
              maxWidth: "42rem",
              fontSize: "1.125rem",
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            No hidden fees. No surprises. Choose the plan that fits your business.
          </p>

          {/* Toggle */}
          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: !annual ? 600 : 400,
                color: !annual ? "#1e293b" : "#94a3b8",
              }}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              style={{
                position: "relative",
                height: "2rem",
                width: "3.5rem",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                backgroundColor: annual ? "#667eea" : "#e2e8f0",
                transition: "background-color 0.3s ease",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "3px",
                  left: annual ? "calc(100% - 22px)" : "3px",
                  height: "18px",
                  width: "18px",
                  borderRadius: "9999px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  transition: "left 0.3s ease",
                }}
              />
            </button>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: annual ? 600 : 400,
                color: annual ? "#1e293b" : "#94a3b8",
              }}
            >
              Annual{" "}
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section style={{ paddingBottom: "6rem" }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div
            style={{
              display: "grid",
              gap: "2rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              alignItems: "stretch",
            }}
          >
            {plans.map((plan) => (
              <div
                key={plan.name}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "1rem",
                  backgroundColor: "#ffffff",
                  overflow: "hidden",
                  border: plan.popular
                    ? `1px solid #e2e8f0`
                    : "1px solid #e2e8f0",
                  borderTop: `3px solid`,
                  borderImage: `${plan.borderGradient} 1`,
                  boxShadow: plan.popular
                    ? "0 20px 60px rgba(118, 75, 162, 0.15), 0 8px 20px rgba(118, 75, 162, 0.1)"
                    : "0 1px 3px rgba(0,0,0,0.05)",
                  transform: plan.popular ? "scale(1.03)" : "none",
                  zIndex: plan.popular ? 10 : 1,
                }}
              >
                {plan.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-1px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                      color: "#ffffff",
                      padding: "0.375rem 1rem",
                      borderRadius: "0 0 9999px 9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <div style={{ padding: plan.popular ? "2.5rem 2rem 0" : "2rem 2rem 0" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.875rem",
                      color: "#64748b",
                      lineHeight: 1.6,
                    }}
                  >
                    {plan.description}
                  </p>
                </div>
                <div style={{ padding: "1.5rem 2rem" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                    <span style={{ fontSize: "3rem", fontWeight: 800, color: "#1e293b" }}>
                      ${annual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#94a3b8" }}>/mo</span>
                  </div>
                  {annual && (
                    <div
                      style={{
                        marginTop: "0.25rem",
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                      }}
                    >
                      Billed ${plan.annualPrice * 12}/year
                    </div>
                  )}
                </div>
                <ul
                  style={{
                    padding: "0 2rem",
                    marginBottom: "2rem",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    listStyle: "none",
                    margin: "0 2rem 2rem",
                  }}
                >
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        fontSize: "0.875rem",
                        color: "#334155",
                        lineHeight: 1.5,
                      }}
                    >
                      <Check
                        style={{
                          width: "1rem",
                          height: "1rem",
                          marginTop: "2px",
                          flexShrink: 0,
                          color: plan.popular ? "#7c3aed" : plan.name === "Enterprise" ? "#16a34a" : "#667eea",
                        }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <div style={{ padding: "0 2rem 2rem" }}>
                  <Link
                    href="/sign-up"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      width: "100%",
                      height: "3rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                      ...(plan.popular
                        ? {
                            background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                            color: "#ffffff",
                            boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
                          }
                        : {
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#ffffff",
                            color: "#475569",
                          }),
                    }}
                  >
                    Get Started
                    <ArrowRight style={{ width: "1rem", height: "1rem" }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        style={{
          padding: "6rem 0",
          background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2
              style={{
                fontSize: "clamp(1.875rem, 4vw, 2.5rem)",
                fontWeight: 800,
                color: "#1e293b",
                letterSpacing: "-0.02em",
              }}
            >
              Frequently Asked Questions
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  overflow: "hidden",
                  boxShadow: openFaq === i ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                  transition: "box-shadow 0.2s ease",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1.25rem 1.5rem",
                    textAlign: "left",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "#1e293b",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <span>{faq.question}</span>
                  <span
                    style={{
                      marginLeft: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "1.75rem",
                      height: "1.75rem",
                      borderRadius: "9999px",
                      backgroundColor: openFaq === i ? "#ede9fe" : "#f1f5f9",
                      color: openFaq === i ? "#7c3aed" : "#64748b",
                      fontSize: "1rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {openFaq === i ? "\u2212" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div
                    style={{
                      padding: "0 1.5rem 1.25rem",
                      fontSize: "0.875rem",
                      color: "#64748b",
                      lineHeight: 1.7,
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ paddingTop: "1rem" }}>{faq.answer}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        style={{
          padding: "6rem 0",
          textAlign: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <h2
            style={{
              fontSize: "clamp(1.875rem, 4vw, 2.5rem)",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Still have questions?
          </h2>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "1.125rem",
              color: "rgba(255,255,255,0.85)",
              maxWidth: "36rem",
              margin: "1rem auto 0",
              lineHeight: 1.7,
            }}
          >
            Our team is here to help you find the right plan for your business.
          </p>
          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <Link
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                height: "3rem",
                padding: "0 1.5rem",
                borderRadius: "0.5rem",
                backgroundColor: "#ffffff",
                color: "#764ba2",
                fontSize: "0.875rem",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                transition: "all 0.2s ease",
              }}
            >
              Contact Sales
              <ArrowRight style={{ width: "1rem", height: "1rem" }} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
