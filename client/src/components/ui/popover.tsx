import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import gsap from "gsap"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }

      if (node) {
        gsap.killTweensOf(node);
        gsap.fromTo(
          node,
          { opacity: 0, scale: 0.96, y: -4 },
          { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: "power2.out" }
        );
      }
    },
    [ref]
  );

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={setRefs}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-md border border-border/60 p-4 text-popover-foreground shadow-lg outline-none backdrop-blur-xl bg-popover/80 dark:bg-popover/75 dark:border-border/40 origin-[--radix-popover-content-transform-origin]",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
