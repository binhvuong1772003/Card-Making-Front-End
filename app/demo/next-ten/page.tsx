import Link from "next/link";
import manifest from "@/docs/references/clone-handoffs/next-ten-manifest.json";

export default function Page() {
  return <main className="min-h-screen bg-stone-100 px-6 py-12 text-stone-900">
    <div className="mx-auto max-w-6xl">
      <p className="text-sm uppercase tracking-widest text-stone-500">CardMaking · Đợt 2</p>
      <h1 className="mt-3 text-3xl font-semibold">10 mẫu thiệp mới</h1>
      <p className="mt-3 max-w-2xl text-stone-600">Bản dựng trang nội dung từ Chung Đôi. Mở từng mẫu để xem desktop hoặc điện thoại. Các bản này đang được đối chiếu, chưa xuất bản.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {manifest.templates.map(template => <Link key={template.slug} href={`/demo/${template.slug}`} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
          {/* Local rendered preview, never the source catalogue thumbnail. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/demo/${template.slug}/preview.webp`} alt={template.title} width={480} height={330} className="aspect-[16/11] w-full object-cover object-top" />
          <div className="p-5"><h2 className="font-semibold">{template.title}</h2><p className="mt-1 text-sm text-stone-500">Xem bản nội dung →</p></div>
        </Link>)}
      </div>
    </div>
  </main>;
}
