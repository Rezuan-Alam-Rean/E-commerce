import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-6 rounded-[var(--radius-lg)] bg-white p-10 shadow-[var(--shadow)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Insider Access
          </p>
          <h3 className="mt-3 font-serif text-3xl text-foreground">
            Get market-ready drops in your inbox.
          </h3>
        </div>
        <form className="flex w-full max-w-md flex-col gap-4 md:flex-row">
          <Input placeholder="Enter your email" type="email" required />
          <Button type="submit">Notify Me</Button>
        </form>
      </div>
    </section>
  );
}
