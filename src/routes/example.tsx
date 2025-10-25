import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/example')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <div>Hello "/example"!</div>
      <Link to="/" className="text-blue-500 hover:text-blue-600">Home</Link>
    </div>
  )
}