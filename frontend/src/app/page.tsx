import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/Navbar";

// Decorative strip: abstract portraits, one of them "found".
const FRAMES = [
    { bg: "#2330D8", fg: "#8FA0FF" },
    { bg: "#0E1130", fg: "#ECEEF8" },
    { bg: "#8FA0FF", fg: "#2330D8" },
    { bg: "#ECEEF8", fg: "#0E1130" },
];
const MATCH = 2;

function PhotoStrip() {
    return (
        <div aria-hidden className="relative mx-auto w-[210px] sm:w-[240px] -rotate-3">
            <div className="space-y-3 rounded-md bg-white p-3 shadow-[0_30px_60px_-25px_rgba(14,17,48,0.5)]">
                {FRAMES.map((f, i) => (
                    <div key={i} className={i === MATCH ? "focus-frame" : ""} data-snap={i === MATCH ? "" : undefined}>
                        <svg viewBox="0 0 120 90" className="block w-full">
                            <rect width="120" height="90" fill={f.bg} />
                            <circle cx="60" cy="38" r="16" fill={f.fg} />
                            <ellipse cx="60" cy="92" rx="32" ry="26" fill={f.fg} />
                        </svg>
                    </div>
                ))}
                <div className="h-8" />
            </div>
            <span
                className="absolute -right-4 rounded-full bg-focus px-3 py-1 text-sm font-bold text-ink"
                style={{ top: `${(MATCH + 0.45) * 24}%` }}
            >
                Match
            </span>
        </div>
    );
}

const STEPS = [
    { title: "Host uploads", body: "Add the event's photos to an album. Every face is indexed the moment a photo lands." },
    { title: "Share the link", body: "Send guests the album link. They don't need an account." },
    { title: "Guest takes a selfie", body: "We compare it with the faces in the album and show every photo they're in." },
];

const EVENTS = [
    { title: "Weddings", body: "Hundreds of guests, thousands of photos. Everyone finds their own in seconds." },
    { title: "Conferences", body: "Share the photographer's gallery without sending a 2,000-photo link around." },
    { title: "Parties and reunions", body: "Upload from your phone after the night out, share one link in the group chat." },
];

// Demo pricing: not enforced anywhere in the app yet.
const PLANS = [
    { name: "Free", price: "$0", unit: "", blurb: "Try it on a small gathering.", features: ["1 album", "Up to 50 photos", "Unlimited guest searches"], featured: false },
    { name: "Event", price: "$19", unit: "per event", blurb: "One event, everything included.", features: ["1 album", "Up to 1,000 photos", "Unlimited guest searches", "Delete anytime"], featured: true },
    { name: "Studio", price: "$49", unit: "per month", blurb: "For photographers who shoot every week.", features: ["Unlimited albums", "Up to 10,000 photos each", "Unlimited guest searches", "Delete anytime"], featured: false },
];

const FAQ = [
    { q: "Do guests need an account?", a: "No. Guests open the link, take a selfie or upload a photo, and see their matches." },
    { q: "Do you keep guest selfies?", a: "No. A selfie is used for the search and then discarded. Only faces from photos the host uploads are indexed." },
    { q: "What happens when I delete a photo or an album?", a: "The photo or album, and its face data, are removed from the album and from face search straight away." },
    { q: "Which photos work best?", a: "Clear, front-facing faces in decent light. Each result shows a match percentage so guests can judge for themselves." },
    { q: "Which file types can I upload?", a: "PNG and JPG. You can add many photos at once." },
];

const cta = "inline-flex items-center rounded-full px-7 py-3.5 text-lg font-semibold transition-colors";

export default function Home() {
    return (
        <main className="overflow-x-clip">
            <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-36 md:grid-cols-[1.3fr_1fr]">
                <div>
                    <h1 className="text-[2.6rem] font-extrabold leading-[0.95] sm:text-7xl">
                        Find your photos in the crowd.
                    </h1>
                    <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
                        Hosts upload an event&apos;s photos once. Guests take a selfie and get every photo they&apos;re in.
                    </p>
                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        <Link href="/dashboard" className={`${cta} bg-booth text-white hover:bg-booth-dark`}>Create an album</Link>
                        <a href="#how" className={`${cta} text-ink ring-1 ring-inset ring-ink/20 hover:bg-white`}>How it works</a>
                    </div>
                </div>
                <PhotoStrip />
            </section>

            <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-24">
                <h2 className="max-w-lg text-3xl font-bold sm:text-4xl">Three steps, and nobody scrolls through 800 photos.</h2>
                <ol className="mt-12 grid gap-10 md:grid-cols-3">
                    {STEPS.map((s, i) => (
                        <li key={s.title} className="border-t-2 border-ink pt-5">
                            <span className="font-display text-5xl font-extrabold text-booth">{i + 1}</span>
                            <h3 className="mt-3 text-xl font-bold">{s.title}</h3>
                            <p className="mt-2 max-w-xs leading-relaxed text-ink/70">{s.body}</p>
                        </li>
                    ))}
                </ol>
                <p className="mt-12 max-w-xl text-ink/70">
                    You stay in control. Delete a photo and it leaves the album and the face search straight away.
                </p>
            </section>

            <section className="mx-auto max-w-6xl px-5 pb-24">
                <h2 className="max-w-lg text-3xl font-bold sm:text-4xl">Built for events where nobody owns the camera.</h2>
                <ul className="mt-10 grid gap-4 md:grid-cols-3">
                    {EVENTS.map((e) => (
                        <li key={e.title} className="rounded-3xl bg-white p-6">
                            <h3 className="text-xl font-bold">{e.title}</h3>
                            <p className="mt-2 leading-relaxed text-ink/70">{e.body}</p>
                        </li>
                    ))}
                </ul>
            </section>

            <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-24">
                <h2 className="max-w-xl text-3xl font-bold sm:text-4xl">Pay per event, or by the month.</h2>
                <p className="mt-3 text-sm text-ink/60">Demo pricing. Plans aren&apos;t enforced yet, so everything is free to try.</p>
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {PLANS.map((p) => (
                        <div key={p.name} className={`flex flex-col rounded-3xl p-7 ${p.featured ? "bg-ink text-white" : "bg-white"}`}>
                            <h3 className="text-xl font-bold">{p.name}</h3>
                            <p className={`mt-1 text-sm ${p.featured ? "text-white/70" : "text-ink/60"}`}>{p.blurb}</p>
                            <p className="mt-6 flex items-baseline gap-2">
                                <span className="font-display text-5xl font-extrabold">{p.price}</span>
                                <span className={`text-sm ${p.featured ? "text-white/70" : "text-ink/60"}`}>{p.unit}</span>
                            </p>
                            <ul className="mt-6 flex-1 space-y-3">
                                {p.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2.5">
                                        <Check className={`mt-0.5 h-5 w-5 shrink-0 ${p.featured ? "text-focus" : "text-booth"}`} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/dashboard"
                                className={`${cta} mt-8 justify-center ${p.featured ? "bg-focus text-ink hover:bg-white" : "bg-booth text-white hover:bg-booth-dark"}`}
                            >
                                {p.name === "Free" ? "Start free" : `Choose ${p.name}`}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 pb-24">
                <h2 className="text-3xl font-bold sm:text-4xl">Questions hosts ask</h2>
                <div className="mt-8 divide-y divide-ink/15 border-y border-ink/15">
                    {FAQ.map((f) => (
                        <details key={f.q} className="group py-5">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                                {f.q}
                                <span aria-hidden className="text-2xl font-normal text-booth transition-transform group-open:rotate-45">+</span>
                            </summary>
                            <p className="mt-3 max-w-xl leading-relaxed text-ink/70">{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 pb-20">
                <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-booth p-8 text-white sm:flex-row sm:items-center sm:p-12">
                    <h2 className="max-w-md text-3xl font-bold sm:text-4xl">Start with your next event.</h2>
                    <Link href="/dashboard" className={`${cta} bg-focus text-ink hover:bg-white`}>Create an album</Link>
                </div>
            </section>

            <footer className="border-t border-ink/10">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8 text-sm text-ink/60">
                    <Logo />
                    <p>© {new Date().getFullYear()} Photo Finder</p>
                </div>
            </footer>
        </main>
    );
}
