"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import type { UnlockState } from "@/app/sidequests/[slug]/actions";

interface AccessCodeFormProps {
  action: (previous: UnlockState, formData: FormData) => Promise<UnlockState>;
  contactHref: string;
}

export default function AccessCodeForm({ action, contactHref }: AccessCodeFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, {});

  // The server set the access cookie; re-render the page with the story.
  useEffect(() => {
    if (state.unlocked) router.refresh();
  }, [state.unlocked, router]);

  return (
    <form
      action={formAction}
      className="rounded-xl border border-dotted border-gray-300 p-5 dark:border-neutral-700"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
        <LockClosedIcon aria-hidden className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
        This side quest is confidential
      </div>
      <label htmlFor="access-code" className="mt-1 block text-xs leading-5 text-gray-500 dark:text-neutral-400">
        Enter your access code to read the full story.
      </label>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          id="access-code"
          name="code"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
          placeholder="XXXX-XXXX"
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "access-code-error" : undefined}
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm tracking-wider text-black outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-neutral-600"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Checking…" : "Unlock"}
        </button>
      </div>
      <p aria-live="polite" id="access-code-error" className="mt-2 min-h-5 text-xs text-red-600 dark:text-red-400">
        {state.error}
      </p>
      <p className="text-xs leading-5 text-gray-500 dark:text-neutral-400">
        Don’t have a code?{" "}
        <a href={contactHref} className="bio-text-link transition-colors hover:text-black dark:hover:text-white">
          Ask me for access
        </a>
        .
      </p>
    </form>
  );
}
