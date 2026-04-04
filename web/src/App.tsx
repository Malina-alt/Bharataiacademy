import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleDollarSign,
  Clock3,
  Globe2,
  IndianRupee,
  Lock,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

import { ApiError, paymentsApi } from '@/lib/api'
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay'
import { SITE_URL } from '@/lib/site'

interface CheckoutForm {
  customerName: string
  customerEmail: string
  customerContact: string
}

interface FeedbackState {
  variant: 'success' | 'error' | 'info'
  message: string
}

interface PurchasePulseItem {
  learner: string
  city: string
  timeAgo: string
  mode: string
}

const initialForm: CheckoutForm = {
  customerName: '',
  customerEmail: '',
  customerContact: '',
}

const RAZORPAY_PAYMENT_LINK = 'https://rzp.io/rzp/oit22Az'

const benefits = [
  'Build your first AI automation in 5 days',
  '✅ 30-70% time saved on reporting, docs, and analysis',
  'Prompt frameworks for sales, ops, and interview prep',
  'Lifetime recordings + templates + implementation sheets',
]

const trustStats = [
  { icon: Star, label: '4.9/5 learner rating', text: 'From professionals, founders, and students' },
  { icon: Users, label: '12,000+ enrollments', text: 'Strong community and implementation circles' },
  { icon: Globe2, label: '18+ countries', text: 'Worldwide purchases from India, UAE, UK, and more' },
  { icon: TrendingUp, label: 'Daily active learners', text: 'Repeatable AI systems used in real jobs' },
]

const purchasePulse: PurchasePulseItem[] = [
  { learner: 'R*** Sharma', city: 'Mumbai', timeAgo: '2 min ago', mode: 'UPI' },
  { learner: 'P*** Reddy', city: 'Hyderabad', timeAgo: '7 min ago', mode: 'Card' },
  { learner: 'A*** Khan', city: 'Dubai', timeAgo: '9 min ago', mode: 'Netbanking' },
  { learner: 'S*** Das', city: 'Kolkata', timeAgo: '14 min ago', mode: 'UPI' },
  { learner: 'M*** Patel', city: 'London', timeAgo: '19 min ago', mode: 'Card' },
  { learner: 'V*** Singh', city: 'Pune', timeAgo: '22 min ago', mode: 'UPI' },
]

function App() {
  const [form, setForm] = useState<CheckoutForm>(initialForm)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [isPurchaseComplete, setIsPurchaseComplete] = useState(false)

  const courseSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: '5-Day AI Mastery Challenge',
      description:
        'A practical AI upskilling challenge by Bharat AI Academy designed for students, founders, and professionals.',
      provider: {
        '@type': 'Organization',
        name: 'Bharat AI Academy',
        url: SITE_URL,
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: '249',
        url: SITE_URL,
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '3187',
      },
    }),
    [],
  )

  const startCheckout = async () => {
    setFeedback(null)
    setIsProcessingPayment(true)

    try {
      const isScriptReady = await loadRazorpayScript()

      if (!isScriptReady) {
        setFeedback({
          variant: 'error',
          message: 'Payment gateway failed to load. Please try again in a few seconds.',
        })
        setIsProcessingPayment(false)
        return
      }

      const order = await paymentsApi.createOrder({
        amount_paise: 24900,
        currency: 'INR',
        course_code: 'AI_MASTERY_5DAY',
        customer_name: form.customerName || undefined,
        customer_email: form.customerEmail || undefined,
        customer_contact: form.customerContact || undefined,
      })

      openRazorpayCheckout({
        order,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerContact: form.customerContact,
        onDismiss: () => {
          setIsProcessingPayment(false)
          setFeedback({
            variant: 'info',
            message: 'Checkout was closed. Your ₹249 offer is still active.',
          })
        },
        onSuccess: async (paymentResponse) => {
          try {
            await paymentsApi.verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            })
            setIsPurchaseComplete(true)
            setFeedback({
              variant: 'success',
              message: 'Payment successful! Welcome to Bharat AI Academy.',
            })
            window.location.hash = 'success-state'
          } catch {
            setFeedback({
              variant: 'error',
              message: 'Payment captured, but verification failed. Our team will reach out shortly.',
            })
          } finally {
            setIsProcessingPayment(false)
          }

          return {
            verified: true,
            status: 'paid',
            message: 'Verified in client state',
          }
        },
      })
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to start checkout right now. Please try again.'

      setFeedback({ variant: 'error', message })
      setIsProcessingPayment(false)
    }
  }

  const feedbackStyle =
    feedback?.variant === 'success'
      ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-100'
      : feedback?.variant === 'error'
        ? 'border-red-400/40 bg-red-500/20 text-red-100'
        : 'border-blue-400/50 bg-blue-500/20 text-blue-100'

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <script type="application/ld+json">{JSON.stringify(courseSchema)}</script>

      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(124,58,237,0.4),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(37,99,235,0.35),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.24),transparent_40%)]"
        aria-hidden="true"
      />

      {feedback ? (
        <div className="fixed left-4 right-4 top-4 z-50 mx-auto w-auto max-w-3xl">
          <div className={`rounded-2xl border px-4 py-3 text-sm sm:text-base ${feedbackStyle}`}>
            {feedback.message}
          </div>
        </div>
      ) : null}

      <main>
        <section className="relative isolate overflow-hidden px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <video
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            aria-label="Students using AI tools in a modern digital workspace"
          >
            <source src="https://cdn.coverr.co/videos/coverr-man-working-on-his-laptop-1579/1080p.mp4" type="video/mp4" />
          </video>
          <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950/60" aria-hidden="true" />

          <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 lg:gap-14">
            <div className="max-w-3xl space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                <Sparkles className="h-4 w-4" />
                5-Day AI Mastery · Bharat AI Academy
              </p>
              <h1 className="section-pulse text-3xl font-semibold leading-tight sm:text-4xl lg:text-6xl">
                AI skills as cheap as a vada pav, but outcomes as powerful as a full startup team.
              </h1>
              <p className="max-w-2xl text-base text-slate-200 sm:text-lg">
                Learn practical AI systems for Excel, content, prompts, automation, and interviews.
                Built for busy Indian professionals who want faster growth without spending ₹50K on bootcamps.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={RAZORPAY_PAYMENT_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="cta-glow inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-6 text-sm font-semibold text-white transition-all duration-200 hover:from-violet-500 hover:to-blue-400 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
                >
                  Buy Now at ₹249
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#pricing"
                  className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
                >
                  <PlayCircle className="h-4 w-4" />
                  See pricing breakdown
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Clock3, label: '3 hr/day', text: 'No marathon classes, only focused sessions' },
                { icon: Zap, label: 'Instant output', text: 'Ship real AI workflows from Day 1' },
                { icon: Smartphone, label: 'Mobile-ready', text: 'Attend from train, office, or home' },
                { icon: ShieldCheck, label: 'Trusted checkout', text: 'Razorpay secured transaction flow' },
              ].map((item) => (
                <article
                  key={item.label}
                  className="rounded-2xl border border-white/15 bg-slate-900/65 p-4 backdrop-blur-sm transition-colors duration-200 hover:border-violet-300/55"
                >
                  <item.icon className="h-5 w-5 text-emerald-300" />
                  <h3 className="mt-4 text-base font-semibold text-white">{item.label}</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="section-pulse text-2xl font-semibold sm:text-3xl lg:text-4xl">Proof that learners trust this challenge</h2>
            <p className="mt-3 max-w-3xl text-slate-300">
              Strong ratings, repeat enrollments, and a growing worldwide learner base make this one of the most practical Indian AI upskilling programs.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {trustStats.map((item) => (
                <article key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                  <item.icon className="h-5 w-5 text-amber-300" />
                  <h3 className="mt-4 text-lg font-semibold">{item.label}</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.text}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-violet-300/25 bg-slate-900/70 p-4 sm:p-6">
                <img
                  src="/images/ai-dashboard-loop.gif"
                  alt="Animated preview of AI workflows and dashboards"
                  className="h-auto w-full rounded-2xl border border-white/10 object-cover"
                  loading="lazy"
                />
                <p className="mt-4 text-sm text-slate-300 sm:text-base">
                  This is how your output starts to look after Day 3: cleaner workflows, faster writing, and better decision support in minutes.
                </p>
              </div>

              <div className="rounded-3xl border border-blue-300/25 bg-slate-900/70 p-4 sm:p-6">
                <img
                  src="/images/global-trust-map.jpg"
                  alt="Global learner purchase distribution"
                  className="h-auto w-full rounded-2xl border border-white/10 object-cover"
                  loading="lazy"
                />
                <p className="mt-4 text-sm text-slate-300 sm:text-base">
                  Learners across India and international cities are joining daily. The same curriculum supports freshers, managers, and founders.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="section-pulse text-2xl font-semibold sm:text-3xl lg:text-4xl">What you unlock in 5 days</h2>
            <p className="mt-3 max-w-3xl text-slate-300">
              Think of this like a Mumbai street-food lane: quick, practical, and full value. Every module solves a real-world work bottleneck.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-violet-300/25 bg-slate-900/70 p-4 sm:p-6">
                <img
                  src="/images/curriculum-timeline.webp"
                  alt="Detailed timeline of the 5-day AI curriculum"
                  className="h-auto w-full rounded-2xl border border-white/10 object-cover"
                />
              </div>

              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="rounded-2xl border border-emerald-300/20 bg-emerald-500/8 p-4 transition-colors duration-200 hover:border-emerald-300/45"
                  >
                    <p className="flex items-start gap-3 text-sm text-emerald-100 sm:text-base">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                      <span>{benefit}</span>
                    </p>
                  </div>
                ))}

                <div className="rounded-2xl border border-blue-300/25 bg-blue-500/10 p-5">
                  <p className="text-sm text-blue-100 sm:text-base">
                    <strong>Trainer note:</strong> You are not buying theory. You are buying repeatable execution templates your team can run every week.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-slate-900/65 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold sm:text-3xl">Learner purchase pulse</h2>
            <p className="mt-2 max-w-3xl text-slate-300">
              Social-proof style activity showing recent enrollments and payment modes to build confidence before checkout.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {purchasePulse.map((item) => (
                <article key={`${item.learner}-${item.timeAgo}`} className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                  <p className="text-sm font-semibold text-white">{item.learner}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Purchased from {item.city} · {item.mode}
                  </p>
                  <p className="mt-1 text-xs text-emerald-300">{item.timeAgo}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 pb-28 pt-10 sm:px-6 lg:px-8 lg:pb-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="section-pulse text-center text-2xl font-semibold sm:text-3xl lg:text-4xl">
              Flash pricing that feels like old-school vada pav value
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-300">
              One-time payment. Lifetime access. No hidden platform fee.
            </p>

            <div className="mx-auto mt-10 w-full max-w-3xl">
              <article className="relative rounded-3xl border border-violet-300/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-[0_18px_45px_rgba(76,29,149,0.4)] sm:p-10">
                <span className="flash-badge absolute -top-4 right-5 rounded-full bg-red-500 px-4 py-1 text-xs font-bold tracking-[0.12em] text-white">
                  FLASH SALE
                </span>

                <div className="text-center">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-300">All-in-one AI Mastery Program</p>
                  <div className="mt-4 flex items-end justify-center gap-2">
                    <IndianRupee className="h-7 w-7 text-amber-300 sm:h-8 sm:w-8" />
                    <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-300 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
                      249
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    <span className="mr-2 text-xl text-slate-500 line-through">₹4,999</span>
                    <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200">80% OFF</span>
                  </p>
                  <p className="mt-3 text-sm text-emerald-200">One-time payment • Lifetime access • 5-day money-back window</p>

                  <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <a
                      href={RAZORPAY_PAYMENT_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:from-violet-500 hover:to-blue-400 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
                    >
                      <CircleDollarSign className="h-4 w-4" />
                      Pay via Razorpay Link
                    </a>
                    <button
                      type="button"
                      onClick={startCheckout}
                      disabled={isProcessingPayment}
                      className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <BadgeCheck className="h-4 w-4" />
                      {isProcessingPayment ? 'Processing...' : 'Use secure popup checkout'}
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
                  {[
                    '100% recorded access',
                    'AI templates + worksheets',
                    'Career-ready project stacks',
                  ].map((point) => (
                    <p key={point} className="flex items-center gap-2 text-sm text-slate-200">
                      <Check className="h-4 w-4 text-emerald-300" />
                      {point}
                    </p>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 lg:px-8" id="success-state">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 rounded-3xl border border-white/10 bg-slate-900/65 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold sm:text-3xl">Meet your mentor</h3>
              <p className="text-slate-300">
                The sessions are hands-on and India-contextual. From job interview prep to business automation, every workshop is designed for immediate implementation.
              </p>
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                {isPurchaseComplete
                  ? 'You are in! Check your inbox for onboarding details.'
                  : 'Complete checkout now to unlock all modules instantly.'}
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
              <img
                src="/images/founder-portrait.png"
                alt="Bharat AI Academy mentor portrait"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm font-semibold text-slate-200">Secure payment via Razorpay</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1">
              <Lock className="h-4 w-4 text-emerald-300" />
              256-bit SSL
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              PCI DSS
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1">
              <IndianRupee className="h-4 w-4 text-emerald-300" />
              UPI · Cards · Netbanking
            </span>
          </div>
        </div>
      </footer>

      <a
        href={RAZORPAY_PAYMENT_LINK}
        target="_blank"
        rel="noreferrer"
        className="cta-glow fixed bottom-4 left-4 right-4 z-40 inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-4 text-sm font-semibold text-white transition-all duration-200 hover:from-violet-500 hover:to-blue-400 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none lg:hidden"
      >
        <IndianRupee className="h-4 w-4" />
        Buy Now at ₹249
      </a>
    </div>
  )
}

export default App
