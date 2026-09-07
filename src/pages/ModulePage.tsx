interface ModulePageProps { eyebrow: string; title: string; description: string; }

export function ModulePage({ eyebrow, title, description }: ModulePageProps) {
  return (
    <section className="page module-page">
      <p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p>
      <div className="empty-state">
        <span className="brand-mark large">S</span><h2>Módulo preparado</h2>
        <p>La navegación y protección por roles están activas. Las funciones de este módulo se incorporarán en su entregable correspondiente.</p>
      </div>
    </section>
  );
}
