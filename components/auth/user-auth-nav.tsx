"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function UserAuthNav() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setIsSignedIn(!!session);
      setIsLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) return null;

  if (!isSignedIn) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button as="a" href="/auth/sign-up" variant="primary">
          Sign Up
        </Button>
        <Button as="a" href="/auth/sign-in" variant="outline">
          Log In
        </Button>
      </div>
    );
  }

  return <SignOutButton />;
}

function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsLoading(true);
    setHasError(null);
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);
    if (error) setHasError(error.message);
    // Optionally, reload the page or redirect
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button type="button" variant="outline" onClick={handleSignOut} disabled={isLoading}>
        {isLoading ? "Signing out..." : "Sign Out"}
      </Button>
      {hasError && <p className="text-red-600 text-xs mt-1">{hasError}</p>}
    </div>
  );
} 