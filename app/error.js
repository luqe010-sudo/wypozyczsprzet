'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Coś poszło nie tak</h1>
      <p className="mb-6 text-slate-600 dark:text-slate-400">Nie udało się wczytać tej strony. Spróbuj ponownie za chwilę.</p>
      <button type="button" onClick={reset} className="h-11 rounded-lg bg-market-yellow px-5 text-sm font-semibold text-market-navy hover:bg-amber-300">
        Spróbuj ponownie
      </button>
    </div>
  );
}
