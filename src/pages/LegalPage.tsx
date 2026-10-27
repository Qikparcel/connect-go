import { Link } from "react-router-dom";

const TITLES = { privacy: "Privacy Policy", terms: "Terms", "prohibited-items": "Prohibited Items" } as const;

const LegalPage = ({ page }: { page: keyof typeof TITLES }) => (
  <main className="min-h-screen bg-background">
    <div className="container mx-auto max-w-2xl px-4 py-20">
      <Link to="/" className="text-sm text-primary hover:underline">← Back to home</Link>
      <h1 className="mt-6 text-4xl font-black text-foreground">{TITLES[page]}</h1>
      <p className="mt-6 text-muted-foreground">
        This page is being finalised. For questions in the meantime, message us on{" "}
        <a href="https://wa.me/447443191370" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">WhatsApp</a>.
      </p>
    </div>
  </main>
);

export default LegalPage;
