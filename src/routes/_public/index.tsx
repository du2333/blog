import { LoadingFallback } from "@/components/common/loading-fallback";
import { FeaturedTransmission } from "@/components/home/featured-transmission";
import TechButton from "@/components/ui/tech-button";
import { featuredPostsQuery } from "@/features/posts/posts.query";
import { HERO_ASSETS } from "@/lib/config/assets";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowRight, Disc } from "lucide-react";

export const Route = createFileRoute("/_public/")({
  component: App,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(featuredPostsQuery);
  },
  head: () => ({
    links: [...HERO_ASSETS],
  }),
  pendingComponent: LoadingFallback,
});

function App() {
  const router = useRouter();
  const { data: posts } = useSuspenseQuery(featuredPostsQuery);

  return (
    <div className="flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-[1600px] mx-auto fill-mode-forwards">
      {/* Hero Section - Split Layout */}
      <section className="text-center py-10 relative">
        <h2 className="text-5xl md:text-8xl font-black font-sans italic uppercase text-transparent bg-clip-text bg-linear-to-br from-white to-gray-600 mb-4 tracking-tighter leading-[1.1]">
          新艾利都
          <br />
          <span className="text-stroke-lime text-zzz-lime">编年史</span>
        </h2>
        <p className="max-w-xl mx-auto text-gray-400 font-mono">
          记录数字领域的异常现象。规避「侵蚀」，保持连接。
        </p>

        {/* Decorative elements */}
        <div className="absolute top-0 left-10 text-zzz-gray/20 hidden md:block">
          <Disc size={120} className="animate-spin-slow" />
        </div>
      </section>

      {/* Latest Section Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="h-4 w-4 bg-zzz-lime transform rotate-45"></div>
        <h3 className="text-xl font-bold font-sans uppercase tracking-widest text-white">
          最新传输
        </h3>
        <div className="h-px bg-zzz-gray flex-1"></div>
        <span className="font-mono text-xs text-zzz-lime">LATEST_4</span>
      </div>

      {/* Bento Grid Section */}
      <FeaturedTransmission posts={posts} />

      <div className="flex justify-center mt-12">
        <TechButton
          variant="secondary"
          onClick={() => router.navigate({ to: "/database" })}
          icon={<ArrowRight size={16} />}
        >
          访问完整数据库
        </TechButton>
      </div>
    </div>
  );
}
