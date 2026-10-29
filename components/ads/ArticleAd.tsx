import AdSlot from "./AdSlot";
import type { AdPageContext } from "./AdSlot";

/** One sponsored card after the article body, before further recommendations. */
export default function ArticleAd({
  articleKey,
  pageCtx,
  enabled = true,
}: {
  articleKey: string;
  pageCtx?: AdPageContext;
  enabled?: boolean;
}) {
  return <AdSlot placement="tlr_article_native" refreshKey={articleKey} enabled={enabled}
    pageCtx={pageCtx}
    reserveHeight={280} className="tlr-native-ad not-prose mx-auto my-10 w-full max-w-3xl" />;
}
