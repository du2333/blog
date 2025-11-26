import { MOCK_POSTS } from '@/lib/constants';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PostDetail } from '@/components/post-detail';

export const Route = createFileRoute('/post/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const post = MOCK_POSTS.find((post) => post.id === id);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h2 className="text-4xl font-black text-zzz-orange uppercase">
          Error 404
        </h2>
        <p className="font-mono text-gray-400">
          Data corruption detected. Log entry not found.
        </p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="text-zzz-lime underline font-bold font-mono"
        >
          RETURN TO DATABASE
        </button>
      </div>
    );
  }

  return <PostDetail post={post} />;
}
