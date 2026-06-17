'use client';

import { useTransition } from 'react';

interface DeleteButtonProps {
  action: () => Promise<void>;
  label?: string;
  confirmMessage?: string;
  className?: string;
}

export function DeleteButton({
  action,
  label = 'Delete',
  confirmMessage = 'Are you sure you want to delete this?',
  className = 'text-sm underline text-accent hover:text-red-600',
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm(confirmMessage)) {
      e.preventDefault();
      return;
    }
  };

  return (
    <form action={action}>
      <button
        type="submit"
        onClick={handleClick}
        disabled={isPending}
        className={className}
      >
        {isPending ? 'Deleting...' : label}
      </button>
    </form>
  );
}
