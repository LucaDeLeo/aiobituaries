export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-[--border] py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-[--text-muted]">
          © {currentYear} AI Obituaries
        </p>
      </div>
    </footer>
  )
}
