export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-gray-600">
        <p className="text-pretty">
          © {new Date().getFullYear()} EventOpia — Tailored event workflows for VIT-AP University.
        </p>
      </div>
    </footer>
  )
}
