// src/components/public/sections/NewsletterSection.tsx
export default function NewsletterSection() {
  return (
    <div className="bg-brand-primary text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
      <div className="max-w-2xl">
        <h3 className="font-serif font-black text-3xl md:text-4xl mb-3">
          Academic rigour, journalistic flair
        </h3>
        <p className="text-sm md:text-base font-medium opacity-90">
          Get the latest insights and analysis delivered straight to your inbox.
        </p>
      </div>
      <form action="/api/newsletter" method="POST" className="w-full md:w-auto flex flex-col sm:flex-row gap-2 shrink-0">
        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          className="px-4 py-3 text-sm font-semibold text-black outline-none min-w-[250px]"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-black text-white font-extrabold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
