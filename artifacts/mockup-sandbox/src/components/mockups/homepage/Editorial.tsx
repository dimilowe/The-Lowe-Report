import "./_group.css";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type Post = {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  slug: string;
  image: string;
};

const posts: Post[] = [
  {
    id: 1,
    category: "Tech",
    title: "The 2027 Tech Jobs Playbook: 10 High-Growth Roles, Real Compensation, and Where Capital Is Flowing",
    excerpt: "A guide to the roles, skills, and pay shaping the next technology job market.",
    slug: "the-2027-tech-jobs-playbook-10-high-growth-roles-real-compensation-and-where-capital-is-flowing",
    image: "/__mockup/images/lowe-cover-creator-economy.jpg",
  },
  {
    id: 2,
    category: "Business",
    title: "How To Sell Anything Online With Short Form Content",
    excerpt: "A practical four-step approach to finding an audience and selling through short-form content.",
    slug: "how-to-sell-anything-online-with-short-form-content",
    image: "/__mockup/images/lowe-shortform-commerce.jpg",
  },
  {
    id: 3,
    category: "Business",
    title: "What Makes A Great Marketing Strategy In 2027?",
    excerpt: "A strategy built around margins, the channels your business can afford, and steady creative testing.",
    slug: "what-makes-a-great-marketing-strategy-in-2027",
    image: "/__mockup/images/lowe-shortform-commerce.jpg",
  },
  {
    id: 4,
    category: "Business",
    title: "Top Ways To Market Music As A Solo Artist In 2026",
    excerpt: "Ideas for independent artists building a more consistent audience.",
    slug: "top-ways-to-market-music-as-a-solo-artist-in-2026",
    image: "/__mockup/images/lowe-independent-music.jpg",
  },
  {
    id: 5,
    category: "Business",
    title: "Why a Daily Routine Is An Entrepreneur's Best Asset",
    excerpt: "The small daily choices that help business owners stay focused and consistent.",
    slug: "why-a-daily-routine-is-an-entrepreneur-s-best-asset",
    image: "/__mockup/images/lowe-cover-creator-economy.jpg",
  },
  {
    id: 6,
    category: "Culture",
    title: "Why \"Follow Your Passion\" Is Terrible Career Advice",
    excerpt: "A closer look at the popular advice that can leave people with fewer options.",
    slug: "why-follow-your-passion-is-terrible-career-advice",
    image: "/__mockup/images/lowe-independent-music.jpg",
  },
  {
    id: 7,
    category: "Business",
    title: "The Great Leap: A 4-Part Framework for Knowing When to Quit Your 9-to-5",
    excerpt: "A decision framework for evaluating the next step in your career.",
    slug: "the-great-leap-a-4-part-framework-for-knowing-when-to-quit-your-9-to-5",
    image: "/__mockup/images/lowe-cover-creator-economy.jpg",
  },
  {
    id: 8,
    category: "Lifestyle",
    title: "The Law of Resistance: How to Force Action When You Feel Like Doing Nothing",
    excerpt: "A practical way to start when motivation is low.",
    slug: "the-law-of-resistance-how-to-force-action-when-you-feel-like-doing-nothing",
    image: "/__mockup/images/lowe-shortform-commerce.jpg",
  },
];

const categories = ["Celebrities", "Business", "Fashion", "Lifestyle", "Tech"];
const href = (post: Post) => `/newsletter/${post.slug}`;

function SectionLabel({ children }: { children: string }) {
  return <span className="lr-label">{children}</span>;
}

function StoryLink({ post, className = "" }: { post: Post; className?: string }) {
  return (
    <a className={`lr-story-link ${className}`} href={href(post)}>
      <span className="lr-story-category">{post.category}</span>
      <span className="lr-story-title">{post.title}</span>
      <span className="lr-story-meta">The Lowe Report <ArrowUpRight aria-hidden="true" /></span>
    </a>
  );
}

export function Editorial() {
  const [lead, shortForm, marketing, music, routine, passion, leap, resistance] = posts;

  return (
    <div className="lr-editorial">
      <style>{`
        .lr-editorial {
          --lr-paper: #f4f0e8;
          --lr-ink: #171716;
          --lr-soft-ink: #635f58;
          --lr-rule: #c9c2b7;
          --lr-red: #c93b26;
          --lr-yellow: #f3d454;
          background: var(--lr-paper);
          color: var(--lr-ink);
          font-family: Georgia, "Times New Roman", serif;
          min-height: 100vh;
          overflow: hidden;
        }
        .lr-editorial * { box-sizing: border-box; }
        .lr-editorial a { color: inherit; text-decoration: none; }
        .lr-editorial a:focus-visible { outline: 3px solid var(--lr-red); outline-offset: 5px; }
        .lr-masthead { max-width: 1480px; margin: 0 auto; padding: 0 5.3vw; }
        .lr-topline { display: flex; justify-content: space-between; align-items: center; padding: 14px 0 12px; border-bottom: 1px solid var(--lr-ink); font: 700 10px/1.2 Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        .lr-topline span:last-child { color: var(--lr-red); }
        .lr-brand { display: flex; align-items: center; justify-content: center; min-height: clamp(86px, 12vw, 160px); border-bottom: 1px solid var(--lr-ink); }
        .lr-brand a { font: 900 clamp(38px, 8.2vw, 112px)/.82 Georgia, "Times New Roman", serif; letter-spacing: -.085em; text-transform: uppercase; white-space: nowrap; }
        .lr-brand a span { color: var(--lr-red); }
        .lr-nav { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px clamp(20px, 4vw, 62px); padding: 17px 0 18px; border-bottom: 4px solid var(--lr-ink); font: 700 11px/1 Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        .lr-nav a { transition: color .18s ease; }
        .lr-nav a:hover, .lr-story-link:hover .lr-story-title { color: var(--lr-red); }
        .lr-main { max-width: 1480px; margin: 0 auto; padding: 30px 5.3vw 0; }
        .lr-edition { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 17px; font: 700 10px/1.3 Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        .lr-edition strong { color: var(--lr-red); }
        .lr-edition .lr-edition-mark { display: flex; align-items: center; gap: 8px; }
        .lr-edition-mark::before { content: ""; display: block; width: 27px; height: 1px; background: var(--lr-red); }
        .lr-lead-grid { display: grid; grid-template-columns: minmax(0, 1.76fr) minmax(260px, .7fr); min-height: 610px; border-top: 1px solid var(--lr-ink); border-bottom: 1px solid var(--lr-ink); }
        .lr-cover { position: relative; display: flex; flex-direction: column; align-items: stretch; min-height: 0; overflow: hidden; background: var(--lr-paper); color: var(--lr-ink); }
        .lr-cover-image { position: relative; display: block; width: 100%; height: clamp(310px, 35vw, 440px); background: url("/__mockup/images/lowe-cover-creator-economy.jpg") center 34% / cover; transform: scale(1.005); transition: transform .7s ease; }
        .lr-cover:hover .lr-cover-image { transform: scale(1.045); }
        .lr-cover-copy { position: relative; z-index: 1; width: 100%; padding: 22px 30px 30px; }
        .lr-cover-kicker { display: inline-block; padding: 8px 10px; background: var(--lr-yellow); color: var(--lr-ink); font: 800 10px/1 Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        .lr-cover h1 { max-width: 780px; margin: 16px 0 12px; font-size: clamp(38px, 4.25vw, 58px); font-weight: 500; line-height: .97; letter-spacing: -.055em; text-wrap: pretty; }
        .lr-cover p { max-width: 620px; margin: 0; color: var(--lr-soft-ink); font: 14px/1.55 Arial, sans-serif; }
        .lr-cover-byline { display: flex; align-items: center; gap: 13px; margin-top: 25px; font: 700 10px/1 Arial, sans-serif; letter-spacing: .15em; text-transform: uppercase; }
        .lr-cover-byline::before { content: ""; width: 34px; height: 1px; background: var(--lr-red); }
        .lr-latest { padding: 25px 0 6px 28px; }
        .lr-latest-head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 4px solid var(--lr-ink); padding-bottom: 13px; }
        .lr-latest-head h2 { margin: 0; font-size: 31px; line-height: .9; letter-spacing: -.06em; }
        .lr-label { color: var(--lr-red); font: 800 9px/1.2 Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        .lr-latest-list { display: flex; flex-direction: column; }
        .lr-latest-item { padding: 19px 0 17px; border-bottom: 1px solid var(--lr-rule); }
        .lr-story-link { display: block; }
        .lr-story-category { display: block; margin-bottom: 8px; color: var(--lr-red); font: 800 9px/1 Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        .lr-story-title { display: block; font-size: clamp(19px, 2vw, 25px); font-weight: 500; line-height: 1.02; letter-spacing: -.04em; transition: color .18s ease; }
        .lr-story-meta { display: flex; align-items: center; gap: 5px; margin-top: 12px; color: var(--lr-soft-ink); font: 700 9px/1 Arial, sans-serif; letter-spacing: .12em; text-transform: uppercase; }
        .lr-story-meta svg { width: 12px; height: 12px; }
        .lr-index { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--lr-ink); font: 700 9px/1.2 Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
        .lr-index span:last-child { color: var(--lr-soft-ink); }
        .lr-section { padding: 67px 0 72px; }
        .lr-section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 25px; }
        .lr-section-heading h2 { margin: 8px 0 0; font-size: clamp(42px, 6vw, 76px); font-weight: 500; line-height: .85; letter-spacing: -.07em; }
        .lr-section-heading p { max-width: 260px; margin: 0 0 3px; color: var(--lr-soft-ink); font: 13px/1.5 Arial, sans-serif; }
        .lr-feature-strip { display: grid; grid-template-columns: 1.18fr 1fr 1fr; border-top: 1px solid var(--lr-ink); border-bottom: 1px solid var(--lr-ink); }
        .lr-feature { min-width: 0; }
        .lr-feature + .lr-feature { border-left: 1px solid var(--lr-ink); }
        .lr-feature-image { display: block; width: 100%; aspect-ratio: 1.42; background-position: center; background-size: cover; filter: saturate(.87); }
        .lr-feature:first-child .lr-feature-image { aspect-ratio: 1.42; }
        .lr-feature-body { padding: 19px 22px 25px; }
        .lr-feature:first-child .lr-feature-body { padding-left: 0; }
        .lr-feature:last-child .lr-feature-body { padding-right: 0; }
        .lr-feature .lr-story-title { max-width: 440px; font-size: clamp(22px, 2.6vw, 34px); }
        .lr-feature:first-child .lr-story-title { font-size: clamp(27px, 3.6vw, 46px); }
        .lr-feature .lr-story-meta { margin-top: 16px; }
        .lr-band { position: relative; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 30px; margin: 0 -5.3vw; padding: 43px 5.3vw 47px; background: var(--lr-red); color: var(--lr-paper); }
        .lr-band::after { content: "LR"; position: absolute; right: 5.3vw; top: 50%; transform: translateY(-54%); font: 900 clamp(100px, 20vw, 250px)/.7 Georgia, serif; letter-spacing: -.12em; color: rgba(255,255,255,.08); pointer-events: none; }
        .lr-band-copy { position: relative; z-index: 1; }
        .lr-band .lr-label { color: var(--lr-yellow); }
        .lr-band h2 { max-width: 850px; margin: 12px 0 0; font-size: clamp(35px, 6vw, 73px); font-weight: 500; line-height: .9; letter-spacing: -.065em; }
        .lr-band-link { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; width: 70px; height: 70px; border: 1px solid rgba(255,255,255,.65); border-radius: 50%; transition: color .2s ease, background .2s ease; }
        .lr-band-link:hover { color: var(--lr-red); background: var(--lr-paper); }
        .lr-band-link svg { width: 25px; height: 25px; }
        .lr-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8vw; padding: 72px 0 78px; }
        .lr-bottom-col { border-top: 4px solid var(--lr-ink); }
        .lr-bottom-title { display: flex; align-items: center; justify-content: space-between; padding: 14px 0 18px; }
        .lr-bottom-title h2 { margin: 0; font-size: 36px; font-weight: 500; letter-spacing: -.06em; }
        .lr-bottom-story { display: grid; grid-template-columns: 94px 1fr; gap: 17px; align-items: start; padding: 17px 0; border-top: 1px solid var(--lr-rule); }
        .lr-bottom-story img { display: block; width: 94px; aspect-ratio: 1; object-fit: cover; }
        .lr-bottom-story .lr-story-title { font-size: clamp(19px, 2.2vw, 27px); }
        .lr-footer { background: var(--lr-ink); color: var(--lr-paper); padding: 35px 5.3vw 32px; }
        .lr-footer-inner { max-width: 1480px; margin: auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
        .lr-footer-brand { font-size: clamp(30px, 5vw, 57px); font-weight: 900; line-height: .8; letter-spacing: -.08em; text-transform: uppercase; }
        .lr-footer p { max-width: 320px; margin: 0; color: #c9c2b7; font: 12px/1.5 Arial, sans-serif; text-align: right; }
        @media (max-width: 820px) {
          .lr-masthead, .lr-main { padding-left: 22px; padding-right: 22px; }
          .lr-lead-grid { grid-template-columns: 1fr; }
          .lr-cover { min-height: 0; display: flex; flex-direction: column; align-items: stretch; overflow: hidden; background: var(--lr-paper); color: var(--lr-ink); }
          .lr-cover-image { position: relative; inset: auto; display: block; width: 100%; height: clamp(250px, 48vw, 390px); background: url("/__mockup/images/lowe-cover-creator-economy.jpg") center 34% / cover; transform: none; }
          .lr-cover:hover .lr-cover-image { transform: none; }
          .lr-cover-copy { width: 100%; padding: 21px 22px 26px; }
          .lr-cover-kicker { background: var(--lr-yellow); }
          .lr-cover h1 { max-width: 740px; margin: 15px 0 12px; font-size: clamp(37px, 6.4vw, 56px); line-height: .98; letter-spacing: -.055em; }
          .lr-cover p { max-width: 620px; color: var(--lr-soft-ink); font-size: 14px; }
          .lr-cover-byline { color: var(--lr-ink); }
          .lr-latest { padding: 25px 0 0; }
          .lr-latest-list { display: grid; grid-template-columns: 1fr 1fr; column-gap: 22px; }
          .lr-section { padding: 52px 0 58px; }
          .lr-band { margin: 0 -22px; padding: 36px 22px; }
          .lr-band::after { right: 22px; }
          .lr-bottom-grid { gap: 35px; }
        }
        @media (max-width: 560px) {
          .lr-topline { font-size: 8px; letter-spacing: .1em; }
          .lr-topline span:first-child { max-width: 58%; }
          .lr-brand { min-height: 90px; }
          .lr-brand a { font-size: clamp(34px, 10vw, 50px); }
          .lr-nav { gap: 12px 19px; padding: 15px 0; font-size: 9px; letter-spacing: .12em; }
          .lr-main { padding-top: 23px; }
          .lr-edition { font-size: 8px; }
          .lr-cover-image { height: min(74vw, 290px); background-position: 58% 33%; }
          .lr-cover-copy { padding: 19px 20px 23px; }
          .lr-cover-kicker { font-size: 9px; line-height: 1.2; }
          .lr-cover h1 { max-width: 100%; margin: 14px 0 10px; font-size: clamp(34px, 9.2vw, 41px); line-height: 1.02; letter-spacing: -.045em; }
          .lr-cover p { font-size: 13px; line-height: 1.5; }
          .lr-latest-list { grid-template-columns: 1fr; }
          .lr-latest-item { padding: 16px 0; }
          .lr-latest-head h2 { font-size: 27px; }
          .lr-index { font-size: 8px; }
          .lr-section-heading { display: block; }
          .lr-section-heading p { margin-top: 14px; }
          .lr-feature-strip { grid-template-columns: 1fr; }
          .lr-feature + .lr-feature { border-left: 0; border-top: 1px solid var(--lr-ink); }
          .lr-feature-image, .lr-feature:first-child .lr-feature-image { aspect-ratio: 1.65; }
          .lr-feature-body, .lr-feature:first-child .lr-feature-body, .lr-feature:last-child .lr-feature-body { padding: 17px 0 22px; }
          .lr-feature .lr-story-title, .lr-feature:first-child .lr-story-title { font-size: 29px; }
          .lr-band { grid-template-columns: 1fr auto; gap: 10px; }
          .lr-band-link { width: 52px; height: 52px; }
          .lr-bottom-grid { grid-template-columns: 1fr; gap: 44px; padding: 54px 0; }
          .lr-bottom-title h2 { font-size: 32px; }
          .lr-footer-inner { align-items: flex-start; flex-direction: column; }
          .lr-footer p { text-align: left; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lr-editorial *, .lr-editorial *::before, .lr-editorial *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
        }
      `}</style>

      <header className="lr-masthead">
        <div className="lr-topline">
          <span>Culture, style, media &amp; the business of modern influence</span>
          <span>Independent perspective</span>
        </div>
        <div className="lr-brand">
          <a href="/" aria-label="The Lowe Report home">The Lowe <span>Report</span></a>
        </div>
        <nav className="lr-nav" aria-label="Sections">
          {categories.map((category) => <a href="/newsletter" key={category}>{category}</a>)}
          <a href="/store">Products</a>
        </nav>
      </header>

      <main className="lr-main">
        <div className="lr-edition">
          <span className="lr-edition-mark">The culture business, in focus</span>
          <strong>Stories for what’s next</strong>
        </div>

        <section className="lr-lead-grid" aria-label="Featured stories">
          <a href={href(lead)} className="lr-cover">
            <span className="lr-cover-image" aria-hidden="true" />
            <span className="lr-cover-copy">
              <span className="lr-cover-kicker">The 2027 work issue · Tech</span>
              <h1>{lead.title}</h1>
              <p>{lead.excerpt} The new economy is being built by people who know how to turn a point of view into a living.</p>
              <span className="lr-cover-byline">The Lowe Report <ArrowUpRight aria-hidden="true" /></span>
            </span>
          </a>

          <aside className="lr-latest" aria-labelledby="lr-latest-heading">
            <div className="lr-latest-head">
              <div><SectionLabel>Read the room</SectionLabel><h2 id="lr-latest-heading">The latest</h2></div>
              <ArrowDownRight aria-hidden="true" />
            </div>
            <div className="lr-latest-list">
              {[shortForm, marketing, music].map((post) => (
                <div className="lr-latest-item" key={post.id}><StoryLink post={post} /></div>
              ))}
            </div>
          </aside>
        </section>

        <div className="lr-index"><span>01 — The Lowe Report briefing</span><span>Creator business / Media / Culture</span></div>

        <section className="lr-section" aria-labelledby="lr-business-heading">
          <div className="lr-section-heading">
            <div><SectionLabel>Attention is an economy</SectionLabel><h2 id="lr-business-heading">Making moves.</h2></div>
            <p>Useful reads for people building a living, an audience, or a whole new lane.</p>
          </div>
          <div className="lr-feature-strip">
            {[shortForm, marketing, music].map((post, index) => (
              <article className="lr-feature" key={post.id}>
                <a href={href(post)} className="lr-feature-image" aria-label={post.title} style={{ backgroundImage: `url("${index === 2 ? music.image : shortForm.image}")` }} />
                <div className="lr-feature-body"><StoryLink post={post} /></div>
              </article>
            ))}
          </div>
        </section>

        <section className="lr-band" aria-label="Culture dispatch">
          <div className="lr-band-copy"><SectionLabel>Culture dispatch</SectionLabel><h2>Good advice. Bad advice. Who gets to decide?</h2></div>
          <a className="lr-band-link" href={href(passion)} aria-label={`Read ${passion.title}`}><ArrowUpRight aria-hidden="true" /></a>
        </section>

        <section className="lr-bottom-grid" aria-label="More from The Lowe Report">
          <div className="lr-bottom-col">
            <div className="lr-bottom-title"><h2>Work, on your terms.</h2><SectionLabel>Point of view</SectionLabel></div>
            {[passion, leap].map((post) => (
              <div className="lr-bottom-story" key={post.id}>
                <img src={post.image} alt="" loading="lazy" />
                <StoryLink post={post} />
              </div>
            ))}
          </div>
          <div className="lr-bottom-col">
            <div className="lr-bottom-title"><h2>The practice.</h2><SectionLabel>Small shifts</SectionLabel></div>
            {[routine, resistance].map((post) => (
              <div className="lr-bottom-story" key={post.id}>
                <img src={post.image} alt="" loading="lazy" />
                <StoryLink post={post} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="lr-footer">
        <div className="lr-footer-inner">
          <div className="lr-footer-brand">The Lowe Report</div>
          <p>Culture, style, media, and the business of modern influence.<br />Independent perspective for a changing world.</p>
        </div>
      </footer>
    </div>
  );
}
