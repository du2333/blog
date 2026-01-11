import { Outlet, createFileRoute } from '@tanstack/react-router'
import { blogConfig } from '@/blog.config'

export const Route = createFileRoute('/_public/post')({
  component: RouteComponent,
  loader: async () => {
    return {
      title: '全部文章',
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
      },
      {
        name: 'description',
        content: blogConfig.description,
      },
    ],
  }),
})

function RouteComponent() {
  return <Outlet />
}
