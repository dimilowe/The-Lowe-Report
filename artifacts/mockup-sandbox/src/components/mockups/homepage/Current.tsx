import "./_group.css";
import { Bookmark, Menu, Search } from "lucide-react";

type Post = {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
};

const posts: Post[] = [
  {
    id: 1,
    category: "Tech",
    title: "The 2027 Tech Jobs Playbook: 10 High-Growth Roles, Real Compensation, and Where Capital Is Flowing",
    excerpt: "A guide to the roles, skills, and pay shaping the next technology job market.",
    image: "https://thelowereport.com/api/files/blog-1794375676991-nd7fn4.jpg",
    slug: "the-2027-tech-jobs-playbook-10-high-growth-roles-real-compensation-and-where-capital-is-flowing",
  },
  {
    id: 2,
    category: "Business",
    title: "How To Sell Anything Online With Short Form Content",
    excerpt: "A practical four-step approach to finding an audience and selling through short-form content.",
    image: "https://thelowereport.com/api/files/blog-1786200147451-gyma9n.jpg",
    slug: "how-to-sell-anything-online-with-short-form-content",
  },
  {
    id: 3,
    category: "Business",
    title: "What Makes A Great Marketing Strategy In 2027?",
    excerpt: "A strategy built around margins, the channels your business can afford, and steady creative testing.",
    image: "https://thelowereport.com/api/files/blog-1794415399176-oo2b2t.jpg",
    slug: "what-makes-a-great-marketing-strategy-in-2027",
  },
  {
    id: 4,
    category: "Business",
    title: "Top Ways To Market Music As A Solo Artist In 2026",
    excerpt: "Ideas for independent artists building a more consistent audience.",
    image: "https://thelowereport.com/api/files/blog-1785777102161-dysbz6.jpg",
    slug: "top-ways-to-market-music-as-a-solo-artist-in-2026",
  },
  {
    id: 5,
    category: "Business",
    title: "Why a Daily Routine Is An Entrepreneur's Best Asset",
    excerpt: "The small daily choices that help business owners stay focused and consistent.",
    image: "https://thelowereport.com/api/files/blog-1784573535387-cz4zjp.jpg",
    slug: "why-a-daily-routine-is-an-entrepreneur-s-best-asset",
  },
  {
    id: 6,
    category: "Culture",
    title: "Why \"Follow Your Passion\" Is Terrible Career Advice",
    excerpt: "A closer look at the popular advice that can leave people with fewer options.",
    image: "https://thelowereport.com/api/files/blog-1782690577568-0z6s9j.jpg",
    slug: "why-follow-your-passion-is-terrible-career-advice",
  },
  {
    id: 7,
    category: "Business",
    title: "The Great Leap: A 4-Part Framework for Knowing When to Quit Your 9-to-5",
    excerpt: "A decision framework for evaluating the next step in your career.",
    image: "https://thelowereport.com/api/files/blog-1782595894697-pt2chm.jpg",
    slug: "the-great-leap-a-4-part-framework-for-knowing-when-to-quit-your-9-to-5",
  },
  {
    id: 8,
    category: "Lifestyle",
    title: "The Law of Resistance: How to Force Action When You Feel Like Doing Nothing",
    excerpt: "A practical way to start when motivation is low.",
    image: "https://thelowereport.com/api/files/blog-1782224883195-bmfq6z.jpg",
    slug: "the-law-of-resistance-how-to-force-action-when-you-feel-like-doing-nothing",
  },
];

const categoryNames = ["Celebrities", "Business", "Fashion", "Lifestyle", "Tech"];
const storyHref = (post: Post) => `/newsletter/${post.slug}`;

function StoryImage({ post, className }: { post: Post; className: string }) {
  return (
    <div
      className={`bg-gray-200 bg-cover bg-center ${className}`}
      role="img"
      aria-label={`Image for ${post.title}`}
      style={{ backgroundImage: `url("${post.image}")` }}
    />
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-black">{children}</p>;
}

function Byline() {
  return <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-black">By The Lowe Report</p>;
}

export function Current() {
  const [leftOne, leftTwo, lead, ...rail] = posts;
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 py-4 md:px-6">
          <div className="flex items-center justify-start">
            <a className="hidden border border-black bg-black px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white sm:inline-flex" href="/store">Products</a>
          </div>
          <a className="justify-self-center font-serif text-3xl font-black uppercase leading-none tracking-tight text-black md:text-5xl" href="/">
            The Lowe Report
          </a>
          <div className="flex items-center justify-end gap-2">
            <a aria-label="Search articles" className="hidden p-2 text-black sm:inline-flex" href="/newsletter"><Search className="h-5 w-5" /></a>
            <button aria-label="Saved items" className="p-2 text-black"><Bookmark className="h-5 w-5" /></button>
            <button aria-label="Open menu" className="inline-flex items-center gap-2 p-2 text-sm font-semibold uppercase tracking-[0.14em] text-black">
              <span className="hidden md:inline">Menu</span><Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <nav aria-label="Article categories" className="border-b border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-6 text-xs font-semibold uppercase tracking-[0.2em] text-gray-700 md:px-6">
          {categoryNames.map((category) => <a key={category} href="/newsletter" className="hover:text-orange-600">{category}</a>)}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_2fr_0.95fr] lg:gap-8">
          <div className="space-y-10">
            {[leftOne, leftTwo].map((post) => (
              <a key={post.id} href={storyHref(post)} className="group block text-center">
                <StoryImage post={post} className="mb-5 aspect-[4/5] w-full" />
                <Eyebrow>{post.category}</Eyebrow>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight group-hover:text-orange-600">{post.title}</h2>
                <Byline />
              </a>
            ))}
          </div>

          <a href={storyHref(lead)} className="group block">
            <StoryImage post={lead} className="aspect-[4/5] w-full md:aspect-[5/4] lg:aspect-[4/5]" />
            <div className="mx-auto max-w-3xl pt-6 text-center">
              <Eyebrow>{lead.category}</Eyebrow>
              <h1 className="font-serif text-4xl font-semibold leading-none tracking-tight group-hover:text-orange-600 md:text-6xl">{lead.title}</h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">{lead.excerpt}</p>
              <Byline />
            </div>
          </a>

          <aside className="space-y-8">
            {rail.map((post) => (
              <a key={post.id} href={storyHref(post)} className="group grid grid-cols-[1fr_88px] gap-5 border-b border-gray-200 pb-8">
                <div>
                  <Eyebrow>{post.category}</Eyebrow>
                  <h2 className="text-xl font-semibold leading-tight tracking-tight group-hover:text-orange-600">{post.title}</h2>
                  <Byline />
                </div>
                <StoryImage post={post} className="aspect-[4/5] w-full" />
              </a>
            ))}
          </aside>
        </div>

        <section className="mt-16 border-t border-black pt-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Latest</p>
            <h2 className="mt-2 font-serif text-4xl font-semibold tracking-tight">The Briefing</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {posts.slice(1, 4).map((post) => (
              <a key={post.id} href={storyHref(post)} className="group block border-t border-gray-200 pt-5">
                <Eyebrow>{post.category}</Eyebrow>
                <h3 className="text-2xl font-semibold leading-tight tracking-tight group-hover:text-orange-600">{post.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{post.excerpt}</p>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 px-6 py-12 text-center text-sm text-gray-600">
        The Lowe Report · Culture, style, media, and the business of modern influence.
      </footer>
    </div>
  );
}
