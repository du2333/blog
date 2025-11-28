import { FeaturedTransmission } from "@/components/featured-transmission";
import TechButton from "@/components/ui/tech-button";
import { HERO_ASSETS } from "@/config/assets";
import { getPostsFn } from "@/functions/posts";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowRight, Disc } from "lucide-react";

const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: () => getPostsFn({ data: { offset: 0, limit: 4 } }),
});

export const Route = createFileRoute("/")({
  component: App,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQuery);
  },
  head: () => ({
    links: [...HERO_ASSETS],
  }),
});

function App() {
  const router = useRouter();
  const { data: posts } = useSuspenseQuery(postsQuery);

  return (
    <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-[1600px] mx-auto">
        {/* Hero Section - Split Layout */}
        <section className="text-center py-10 relative">
          <h2 className="text-5xl md:text-8xl font-black font-sans italic uppercase text-transparent bg-clip-text bg-linear-to-br from-white to-gray-600 mb-4 tracking-tighter">
            New Eridu
            <br />
            <span className="text-stroke-lime text-zzz-lime">Chronicles</span>
          </h2>
          <p className="max-w-xl mx-auto text-gray-400 font-mono">
            Documenting the anomalies of the digital realm. Avoid corruption.
            Stay connected.
          </p>

          {/* Decorative elements */}
          <div className="absolute top-0 left-10 text-zzz-gray/20 hidden md:block">
            <Disc size={120} className="animate-spin-slow" />
          </div>
        </section>

        {/* Latest Section Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-4 w-4 bg-zzz-lime transform rotate-45"></div>
          <h3 className="text-xl font-bold font-sans uppercase tracking-widest text-white">
            Latest Transmissions
          </h3>
          <div className="h-px bg-zzz-gray flex-1"></div>
          <span className="font-mono text-xs text-zzz-lime">LATEST_4</span>
        </div>

        {/* Bento Grid Section */}
        <FeaturedTransmission posts={posts} />

        {/* View All Button */}
        <div className="flex justify-center mt-12">
          <TechButton
            variant="secondary"
            onClick={() => router.navigate({ to: "/db" })}
            icon={<ArrowRight size={16} />}
          >
            ACCESS FULL DATABASE
          </TechButton>
        </div>
      </div>
    </main>
  );
}
