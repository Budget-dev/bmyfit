import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <span className="text-6xl font-extrabold tracking-tight text-neutral-300 dark:text-neutral-700">
          404
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-neutral-100">
            Page Not Found
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            The page you are looking for does not exist, has been moved, or has expired.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" className="w-full sm:w-auto">
              Return to BMYFIT Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
