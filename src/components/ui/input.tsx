import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "min-h-12 w-full min-w-0 rounded-none border border-input bg-background px-4 py-3 text-body text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-2 aria-invalid:border-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
