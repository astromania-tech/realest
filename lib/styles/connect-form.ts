/**
 * Connect form controls: same shape as signup `@/components/ui/input`,
 * with a light idle border so fields read as typeable before focus.
 */
export const CONNECT_CONTROL_CLASS =
  "border-muted-foreground/35 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:border-muted-foreground/40 dark:bg-input/30 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

/** Extra classes for `<Input>` / `<Textarea>` that already include base input styles. */
export const CONNECT_INPUT_CLASS =
  "border-muted-foreground/35 dark:border-muted-foreground/40";
