import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-green-600 text-white hover:bg-green-700",
        outline: "border border-green-600 text-green-700 bg-white hover:bg-green-50",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  as?: "button" | "a";
  href?: string;
}

/**
 * Button: Accessible, variant-based button component.
 */
export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant, as = "button", href, ...props }, ref) => {
    if (as === "a" && href) {
      return (
        <Link
          href={href}
          className={buttonVariants({ variant, className })}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {props.children}
        </Link>
      );
    }
    return (
      <button
        className={buttonVariants({ variant, className })}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      >
        {props.children}
      </button>
    );
  }
);
Button.displayName = "Button"; 