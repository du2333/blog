import { getDb } from "@/db";
import { testTable } from "@/db/schema";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const addTestDataToDbSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const addTestDataToDb = createServerFn({ method: "POST" })
  .inputValidator(addTestDataToDbSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    await db.insert(testTable).values({ name: data.name, age: data.age });

    throw redirect({ to: "/example" });
  });

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const addTestDataToDbMutation = useMutation({
    mutationFn: addTestDataToDb,
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Hello World 2</h1>
      <button
        onClick={() => {
          addTestDataToDbMutation.mutate({ data: { name: "John", age: 20 } });
        }}
        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 cursor-pointer"
      >
        {addTestDataToDbMutation.isPending ? "Adding..." : "Click me"}
      </button>
    </div>
  );
}
