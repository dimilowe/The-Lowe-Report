import AdSlot from "./AdSlot";

/** One sponsored card after the article body, before further recommendations. */
export default function ArticleAd({ articleKey, enabled = true }: { articleKey: string; enabled?: boolean }) {
  return <AdSlot placement="tlr_article_native" refreshKey={articleKey} enabled={enabled}
    reserveHeight={280} className="tlr-native-ad not-prose mx-auto my-10 w-full max-w-3xl" />;
}
