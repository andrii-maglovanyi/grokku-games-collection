import Link from "next/link";

export default function Help() {
  return (
    <main className="justify-top flex min-h-screen flex-col items-center p-24">
      <h1 className="mb-8 text-4xl font-bold">Help</h1>
      <Link href="/help/faq">
        <a className="text-blue-500">FAQ</a>
      </Link>
    </main>
  );
}
