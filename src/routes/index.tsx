import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Hello World 2</h1>
      <Link to="/db">DB</Link>
      <div>
        Image CDN Test
        <img
          src="https://bbb.dukda.com/images/test.png"
          alt="test"
          width={1000}
        />
      </div>
    </div>
  );
}
