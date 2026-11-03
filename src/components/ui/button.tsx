import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-12 items-center justify-center gap-3 border px-6 py-3 text-small font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-editorial)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground hover:border-secondary-foreground hover:bg-secondary-foreground",
        outline:
          "border-foreground bg-background text-foreground hover:bg-foreground hover:text-background",
        ghost:
          "border-transparent text-foreground underline decoration-transparent underline-offset-4 hover:decoration-current",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Button({
  className,
  variant,
  asChild = false,
  type,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
