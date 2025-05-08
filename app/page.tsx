import { Button } from "@/components/ui/button";

/**
 * Homepage: Only renders a signup/login card with a 'Start Creating' button.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center px-4 py-8 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white text-center">Welcome to Recipe Sharing!</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-center">Sign up or log in to start creating and sharing your favorite recipes.</p>
        <Button as="a" href="/auth/sign-in" variant="primary" className="w-full text-base py-2 rounded-lg">
          Start Creating
        </Button>
        <p className="text-xs text-center mt-4 text-slate-600 dark:text-slate-300">
          Don&apos;t have an account?{' '}
          <a href="/auth/sign-up" className="text-emerald-700 dark:text-emerald-400 hover:underline">Sign Up</a>
        </p>
      </div>
    </main>
  );
}
