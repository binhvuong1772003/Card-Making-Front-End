import Link from "next/link";
import manifest from "@/docs/references/clone-handoffs/third-ten-manifest.json";

export default function Page() {
  return <main className="min-h-screen bg-stone-100 px-6 py-12 text-stone-900"><div className="mx-auto max-w-6xl">
    <p className="text-sm uppercase tracking-widest text-stone-500">CardMaking · Đợt 3</p>
    <h1 className="mt-3 text-3xl font-semibold">Thêm 10 mẫu thiệp mới</h1>
    <p className="mt-3 max-w-2xl text-stone-600">Bản dựng trang nội dung từ Chung Đôi, đang đối chiếu. Có bản xem desktop, điện thoại và link nguồn cho từng mẫu.</p>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{manifest.templates.map(template => <article key={template.slug} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <Link href={`/demo/${template.slug}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/demo/${template.slug}/preview.webp`} alt={template.title} width={480} height={330} className="aspect-[16/11] w-full object-cover object-top" />
      </Link>
      <div className="p-5"><h2 className="font-semibold">{template.title}</h2><div className="mt-3 flex gap-5 text-sm"><Link href={`/demo/${template.slug}`} className="underline">Xem bản dựng</Link><a href={template.demo} target="_blank" rel="noreferrer" className="text-stone-500 underline">Nguồn Chung Đôi ↗</a></div></div>
    </article>)}</div>
    <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6"><h2 className="font-semibold">10 link nguồn để copy qua Claude</h2><pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all text-sm text-stone-600">{manifest.templates.map(t => `${t.title}\n${t.demo}`).join("\n\n")}</pre></section>
  </div></main>;
}
