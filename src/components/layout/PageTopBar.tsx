import ThemeToggle from "@/components/core/ThemeToggle";
import PillLink from "@/components/layout/PillLink";
import CommandPaletteTrigger from "@/components/palette/CommandPaletteTrigger";

/** Top of every inner page: the back pill on the left, search and the theme switcher on the right. */
export default function PageTopBar({ href, label }: { href: string; label: string }) {
  return (
    <div className="-my-2.5 flex w-full items-center justify-between gap-4">
      <PillLink href={href} label={label} caret="left" />
      <div className="flex shrink-0 items-center">
        <CommandPaletteTrigger />
        <ThemeToggle />
      </div>
    </div>
  );
}
