export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <form
        action="/api/login"
        method="POST"
        className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl"
      >
        <h1 className="text-lg font-semibold text-white">Mementos Admin</h1>
        <p className="mt-1 text-sm text-neutral-400">Enter the dashboard password.</p>

        <input type="hidden" name="from" value={from ?? "/"} />

        <input
          type="password"
          name="password"
          autoFocus
          placeholder="Password"
          className="mt-6 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-blue-500"
        />

        {error && (
          <p className="mt-3 text-sm text-red-400">Wrong password. Try again.</p>
        )}

        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-500"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
