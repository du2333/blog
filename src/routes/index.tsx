import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

const getOK = createServerFn().handler(() => {
  return env.OK;
});

export const Route = createFileRoute("/")({
  loader: () => getOK(),
  component: App,
});

function App() {
  const ok = Route.useLoaderData();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Hello World</h1>
      <p>The value of OK is: {ok ?? "No value found"}</p>
    </div>
  );
}
