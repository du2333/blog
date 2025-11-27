import { FeaturedTransmission } from "@/components/featured-transmission";
import TechButton from "@/components/ui/tech-button";
import { getPostsFn } from "@/functions/posts";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Activity, Cpu, Database, Radio, Zap } from "lucide-react";

const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: () => getPostsFn({ data: { offset: 0, limit: 4 } }),
});

export const Route = createFileRoute("/")({
  component: App,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQuery);
  },
});

function App() {
  const router = useRouter();
  const { data: posts } = useSuspenseQuery(postsQuery);

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section - Split Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
        {/* Left: Typography & Identity */}
        <div className="lg:col-span-7 relative z-10">
          <div className="flex items-center gap-3 mb-4 text-zzz-lime font-mono text-sm tracking-[0.2em]">
            <span className="animate-pulse">●</span> SYSTEM_ONLINE
            <span className="w-12 h-px bg-zzz-lime/50"></span>
            <span>VER 3.0</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black font-sans italic uppercase leading-[0.85] tracking-tighter mb-6">
            <span className="block text-transparent bg-clip-text bg-linear-to-br from-white to-gray-600 mb-4 tracking-tighter hover:text-white transition-colors duration-500">
              New Eridu
            </span>
            <span
              className="block text-zzz-lime glitch-text"
              data-text="ARCHIVES"
            >
              档案库
            </span>
          </h1>

          <p className="text-lg text-gray-400 font-mono max-w-lg leading-relaxed border-l-2 border-zzz-lime/50 pl-6">
            记录数字领域的异常。避免侵蚀。
            <br />
            <span className="text-zzz-white font-bold">
              // 代理人，请保持连接。
            </span>
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <TechButton
              variant="primary"
              onClick={() => router.navigate({ to: "/" })}
              icon={<Zap size={18} />}
            >
              开始同步
            </TechButton>
            <TechButton
              variant="secondary"
              onClick={() => router.navigate({ to: "/" })}
              icon={<Database size={18} />}
            >
              浏览日志
            </TechButton>
          </div>
        </div>

        {/* Right: System Dashboard / Status */}
        <div className="lg:col-span-5 relative">
          {/* Decor background */}
          <div className="absolute -inset-4 bg-stripe-pattern opacity-5 rounded-xl -z-10"></div>

          <div className="bg-zzz-dark/50 backdrop-blur-sm border border-zzz-gray p-6 rounded-lg relative overflow-hidden group hover:border-zzz-lime/50 transition-colors">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <Activity size={100} />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center border-b border-zzz-gray/50 pb-2">
                <span className="font-mono text-zzz-lime text-xs">
                  SYSTEM STATUS
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-zzz-lime rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-zzz-lime/20 rounded-full"></div>
                  <div className="w-2 h-2 bg-zzz-lime/20 rounded-full"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-3 rounded border border-zzz-gray/30">
                  <div className="text-gray-500 text-xs font-mono mb-1 flex items-center gap-2">
                    <Radio size={12} /> ETHER_NET
                  </div>
                  <div className="text-2xl font-bold font-sans text-zzz-cyan">
                    98.4%
                  </div>
                </div>
                <div className="bg-black/40 p-3 rounded border border-zzz-gray/30">
                  <div className="text-gray-500 text-xs font-mono mb-1 flex items-center gap-2">
                    <Cpu size={12} /> LOAD
                  </div>
                  <div className="text-2xl font-bold font-sans text-zzz-orange">
                    42ms
                  </div>
                </div>
              </div>

              <div className="space-y-2 h-20 overflow-hidden relative">
                <div className="text-xs text-gray-500 font-mono sticky top-0 bg-zzz-dark/95 z-10">
                  RECENT_ACTIVITY_LOG
                </div>
                <div className="text-xs font-mono space-y-1 text-gray-400 animate-[scroll-up_4s_linear_infinite]">
                  <div className="flex justify-between">
                    <span>&gt; Indexing sector 7...</span>
                    <span className="text-zzz-lime">OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>&gt; Updating cache...</span>
                    <span className="text-zzz-lime">DONE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>&gt; Bangboo connection...</span>
                    <span className="text-zzz-orange">WAIT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>&gt; Verifying hollow data...</span>
                    <span className="text-zzz-lime">OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>&gt; Syncing proxies...</span>
                    <span className="text-zzz-cyan">SYNC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Marquee Separator */}
      <div className="overflow-hidden py-4 bg-zzz-lime/5 border-y border-zzz-lime/10 relative">
        <div className="whitespace-nowrap flex gap-8 text-zzz-lime/40 font-black font-mono text-4xl uppercase select-none animate-[scroll_20s_linear_infinite]">
          <span>Don't go into the Hollow</span>
          <span>//</span>
          <span>Avoid Corruption</span>
          <span>//</span>
          <span>Stay Connected</span>
          <span>//</span>
          <span>Proxy Network Online</span>
          <span>//</span>
          <span>Don't go into the Hollow</span>
          <span>//</span>
          <span>Avoid Corruption</span>
          <span>//</span>
          <span>Stay Connected</span>
          <span>//</span>
        </div>
      </div>

      {/* Bento Grid Section */}
      <FeaturedTransmission posts={posts} />

      {/* Additional "Ad" / Banner */}
      <div className="border-t-2 border-b-2 border-zzz-gray py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-stripe-pattern opacity-5"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 text-zzz-orange font-mono text-xs font-bold border border-zzz-orange px-2 py-1 rounded uppercase animate-pulse">
            Warning: Ether Corruption
          </div>
          <h3 className="text-2xl md:text-4xl font-black font-sans italic uppercase text-white mb-4">
            "The only way out is{" "}
            <span className="text-stroke-lime text-zzz-lime/20">through</span>."
          </h3>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-zzz-gray rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
