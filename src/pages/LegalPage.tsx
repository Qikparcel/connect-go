import { Link } from "react-router-dom";
import { DOCS, type DocKey } from "../../supabase/functions/_shared/policies";

const LegalPage = ({ page }: { page: DocKey }) => {
  const doc = DOCS[page];
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-20">
        <Link to="/" className="text-sm text-primary hover:underline">← Back to home</Link>
        <h1 className="mt-6 text-4xl font-black text-foreground">{doc.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">QikParcel OÜ · Last updated {doc.updated}</p>
        <p className="mt-6 text-muted-foreground">{doc.intro}</p>
        {doc.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="text-xl font-bold text-foreground">{s.h}</h2>
            {s.p?.map((t) => <p key={t} className="mt-3 text-muted-foreground">{t}</p>)}
            {s.list && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                {s.list.map((t) => <li key={t}>{t}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
};

export default LegalPage;
