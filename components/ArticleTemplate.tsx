'use client';

import Link from 'next/link';
import ArticleAd from '@/components/ads/ArticleAd';
import { 
  ArrowRight,
  Zap,
  CheckCircle,
  AlertTriangle,
  Maximize,
  Image,
  Calculator,
  Heart,
  Activity,
  Scale,
  TrendingUp,
  Target,
  Footprints,
  Clock,
  FileImage,
  Video,
  Smartphone,
  Users,
  Building,
  Briefcase,
  Eye,
  Type,
  Palette,
  Music,
  Grid,
  Square,
  Crop,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Info,
  Lightbulb,
  Star,
  Flame
} from 'lucide-react';
import { ArticleContent, ClusterTheme } from '@/lib/articleTypes';
import MoreFreeTools from '@/components/MoreFreeTools';
import MonetizationBar from '@/components/MonetizationBar';
import PostResultUpsell from '@/components/PostResultUpsell';

const iconMap: Record<string, any> = {
  Zap, CheckCircle, AlertTriangle, Maximize, Image, Calculator, Heart, Activity,
  Scale, TrendingUp, Target, Footprints, Clock, FileImage, Video, Smartphone,
  Users, Building, Briefcase, Eye, Type, Palette, Music, Grid, Square, Crop,
  Instagram, Youtube, Linkedin, Twitter, ArrowRight, Info, Lightbulb, Star, Flame
};

const themeStyles = {
  'instagram': {
    heroGradient: 'bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500',
    ctaBg: 'bg-gradient-to-r from-pink-50 to-purple-50',
    ctaBorder: 'border-pink-200',
    ctaIconColor: 'text-pink-600',
    buttonGradient: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600',
    proTipBg: 'bg-pink-50',
    proTipBorder: 'border-pink-200',
    specBgs: ['bg-pink-100', 'bg-purple-100', 'bg-orange-100', 'bg-blue-100'],
    specTextColors: ['text-pink-600', 'text-purple-600', 'text-orange-600', 'text-blue-600'],
    sectionIconColor: 'text-pink-500',
  },
  'youtube': {
    heroGradient: 'bg-gradient-to-br from-red-500 to-red-600',
    ctaBg: 'bg-gradient-to-r from-red-50 to-orange-50',
    ctaBorder: 'border-red-200',
    ctaIconColor: 'text-red-600',
    buttonGradient: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    proTipBg: 'bg-red-50',
    proTipBorder: 'border-red-200',
    specBgs: ['bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-pink-100'],
    specTextColors: ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-pink-600'],
    sectionIconColor: 'text-red-500',
  },
  'linkedin': {
    heroGradient: 'bg-gradient-to-br from-blue-600 to-blue-700',
    ctaBg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    ctaBorder: 'border-blue-200',
    ctaIconColor: 'text-blue-600',
    buttonGradient: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
    proTipBg: 'bg-blue-50',
    proTipBorder: 'border-blue-200',
    specBgs: ['bg-blue-100', 'bg-indigo-100', 'bg-sky-100', 'bg-cyan-100'],
    specTextColors: ['text-blue-600', 'text-indigo-600', 'text-sky-600', 'text-cyan-600'],
    sectionIconColor: 'text-blue-500',
  },
  'tiktok': {
    heroGradient: 'bg-gradient-to-br from-gray-900 via-pink-500 to-cyan-400',
    ctaBg: 'bg-gradient-to-r from-pink-50 to-cyan-50',
    ctaBorder: 'border-pink-200',
    ctaIconColor: 'text-gray-900',
    buttonGradient: 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700',
    proTipBg: 'bg-pink-50',
    proTipBorder: 'border-pink-200',
    specBgs: ['bg-pink-100', 'bg-cyan-100', 'bg-gray-100', 'bg-purple-100'],
    specTextColors: ['text-pink-600', 'text-cyan-600', 'text-gray-600', 'text-purple-600'],
    sectionIconColor: 'text-gray-900',
  },
  'twitter': {
    heroGradient: 'bg-gradient-to-br from-blue-400 to-blue-500',
    ctaBg: 'bg-gradient-to-r from-blue-50 to-sky-50',
    ctaBorder: 'border-blue-200',
    ctaIconColor: 'text-blue-500',
    buttonGradient: 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600',
    proTipBg: 'bg-blue-50',
    proTipBorder: 'border-blue-200',
    specBgs: ['bg-blue-100', 'bg-sky-100', 'bg-indigo-100', 'bg-cyan-100'],
    specTextColors: ['text-blue-600', 'text-sky-600', 'text-indigo-600', 'text-cyan-600'],
    sectionIconColor: 'text-blue-500',
  },
  'health': {
    heroGradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
    ctaBg: 'bg-gradient-to-r from-orange-50 to-amber-50',
    ctaBorder: 'border-orange-200',
    ctaIconColor: 'text-orange-600',
    buttonGradient: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    proTipBg: 'bg-orange-50',
    proTipBorder: 'border-orange-200',
    specBgs: ['bg-orange-100', 'bg-amber-100', 'bg-yellow-100', 'bg-red-100'],
    specTextColors: ['text-orange-600', 'text-amber-600', 'text-yellow-600', 'text-red-600'],
    sectionIconColor: 'text-orange-500',
  },
  'social-media': {
    heroGradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
    ctaBg: 'bg-gradient-to-r from-purple-50 to-pink-50',
    ctaBorder: 'border-purple-200',
    ctaIconColor: 'text-purple-600',
    buttonGradient: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    proTipBg: 'bg-purple-50',
    proTipBorder: 'border-purple-200',
    specBgs: ['bg-purple-100', 'bg-pink-100', 'bg-indigo-100', 'bg-fuchsia-100'],
    specTextColors: ['text-purple-600', 'text-pink-600', 'text-indigo-600', 'text-fuchsia-600'],
    sectionIconColor: 'text-purple-500',
  },
};

type ThemeKey = keyof typeof themeStyles;

function getThemeFromCluster(clusterSlug: string): ThemeKey {
  if (clusterSlug.includes('instagram')) return 'instagram';
  if (clusterSlug.includes('youtube')) return 'youtube';
  if (clusterSlug.includes('linkedin')) return 'linkedin';
  if (clusterSlug.includes('tiktok')) return 'tiktok';
  if (clusterSlug.includes('twitter')) return 'twitter';
  if (clusterSlug.includes('health') || clusterSlug.includes('fitness') || clusterSlug.includes('calorie')) return 'health';
  if (clusterSlug.includes('social')) return 'social-media';
  return 'health';
}

function getThemeFromPlatform(platform?: string): ThemeKey {
  if (!platform) return 'health';
  const p = platform.toLowerCase();
  if (p.includes('instagram')) return 'instagram';
  if (p.includes('youtube')) return 'youtube';
  if (p.includes('linkedin')) return 'linkedin';
  if (p.includes('tiktok')) return 'tiktok';
  if (p.includes('twitter') || p.includes('x.com')) return 'twitter';
  return 'social-media';
}

interface ArticleTemplateProps {
  article: {
    slug: string;
    title: string;
    cluster_slug: string;
    content: ArticleContent;
  };
  clusterName: string;
  clusterPath: string;
  theme: ClusterTheme;
  adsEnabled?: boolean;
}

export default function ArticleTemplate({ article, clusterName, clusterPath, adsEnabled = true }: ArticleTemplateProps) {
  const { content } = article;
  const HeroIcon = iconMap[content.hero.icon] || Image;
  const CtaIcon = content.quickCTA?.icon ? iconMap[content.quickCTA.icon] || Zap : Zap;
  
  const themeKey = content.hero.platform 
    ? getThemeFromPlatform(content.hero.platform) 
    : getThemeFromCluster(article.cluster_slug);
  const styles = themeStyles[themeKey];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          
          <nav className="mb-8 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href={clusterPath} className="hover:text-orange-600">{clusterName}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{article.title.split(' – ')[0]}</span>
          </nav>

          <article className="prose prose-gray max-w-none">
            <div className="text-center mb-10">
              <div className={`inline-flex items-center justify-center w-16 h-16 ${styles.heroGradient} rounded-2xl mb-4 shadow-lg`}>
                <HeroIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {content.hero.title}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {content.hero.subtitle}
              </p>
            </div>

            {content.quickCTA && (
              <div className={`${styles.ctaBg} rounded-2xl p-6 border ${styles.ctaBorder} mb-10`}>
                <div className="flex items-center gap-3 mb-3">
                  <CtaIcon className={`w-6 h-6 ${styles.ctaIconColor}`} />
                  <span className="font-semibold text-gray-900">{content.quickCTA.title}</span>
                </div>
                <p className="text-gray-700 mb-4">
                  {content.quickCTA.description}
                </p>
                <Link 
                  href={`/tools/${content.quickCTA.toolSlug}`}
                  className={`inline-flex items-center gap-2 px-5 py-3 ${styles.buttonGradient} text-white font-medium rounded-xl transition-all group shadow-md hover:shadow-lg`}
                >
                  {content.quickCTA.buttonText}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}

            {content.sections.map((section, idx) => {
              const SectionIcon = iconMap[section.icon] || CheckCircle;
              return (
                <section key={idx} className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <SectionIcon className={`w-6 h-6 ${styles.sectionIconColor}`} />
                    {section.heading}
                  </h2>
                  
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: p }} />
                  ))}

                  {section.specs && section.specs.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Specifications</h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {section.specs.map((spec, sIdx) => {
                            const SpecIcon = iconMap[spec.icon] || CheckCircle;
                            const bgClass = styles.specBgs[sIdx % styles.specBgs.length];
                            const textClass = styles.specTextColors[sIdx % styles.specTextColors.length];
                            return (
                              <div key={sIdx} className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${bgClass} rounded-lg flex items-center justify-center`}>
                                  <SpecIcon className={`w-5 h-5 ${textClass}`} />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">{spec.label}</p>
                                  <p className="font-semibold text-gray-900">{spec.value}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {section.tips && section.tips.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {section.tips.map((tip, tIdx) => (
                        <div key={tIdx} className="bg-white rounded-xl p-5 border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-2">{tip.title}</h4>
                          <p className="text-gray-700 text-sm">{tip.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.proTip && (
                    <div className={`${styles.proTipBg} rounded-xl p-5 border ${styles.proTipBorder}`}>
                      <p className="text-gray-700">
                        <strong>Pro tip:</strong> {section.proTip}
                      </p>
                    </div>
                  )}
                </section>
              );
            })}

            {content.faqs && content.faqs.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {content.faqs.map((faq, fIdx) => (
                    <div key={fIdx} className="bg-white rounded-xl p-5 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                      <p className="text-gray-700 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <ArticleAd articleKey={`article:${article.slug}`} enabled={adsEnabled} />

            {content.bottomCTA && (
              <div className={`${styles.ctaBg} rounded-2xl p-8 border ${styles.ctaBorder} text-center mb-16`}>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{content.bottomCTA.heading}</h2>
                <p className="text-gray-700 mb-6">{content.bottomCTA.description}</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link 
                    href={`/tools/${content.bottomCTA.primaryTool.slug}`}
                    className={`inline-flex items-center gap-2 px-5 py-3 ${styles.buttonGradient} text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg`}
                  >
                    {content.bottomCTA.primaryTool.name}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  {content.bottomCTA.secondaryTool && (
                    <Link 
                      href={`/tools/${content.bottomCTA.secondaryTool.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl transition-all shadow-md hover:shadow-lg border border-gray-200"
                    >
                      {content.bottomCTA.secondaryTool.name}
                    </Link>
                  )}
                </div>
              </div>
            )}

            <MoreFreeTools exclude={content.quickCTA ? [`/tools/${content.quickCTA.toolSlug}`] : []} />
            <PostResultUpsell />
          </article>
        </div>
      </div>
      <MonetizationBar />
    </>
  );
}
