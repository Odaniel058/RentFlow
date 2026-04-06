import { Link, useLocation } from "react-router-dom";
import { ChevronRight, LayoutDashboard } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inventory": "Inventario",
  "/inventario": "Inventario",
  "/reservations": "Reservas",
  "/locacoes": "Reservas",
  "/reservas": "Reservas",
  "/quotes": "Propostas",
  "/propostas": "Propostas",
  "/orcamentos": "Propostas",
  "/clients": "Clientes",
  "/clientes": "Clientes",
  "/kits": "Kits",
  "/contracts": "Contratos",
  "/contratos": "Contratos",
  "/calendar": "Agenda",
  "/agenda": "Agenda",
  "/calendario": "Agenda",
  "/finance": "Financeiro",
  "/financial": "Financeiro",
  "/financeiro": "Financeiro",
  "/reports": "Relatorios",
  "/relatorios": "Relatorios",
  "/settings": "Configuracoes",
  "/configuracoes": "Configuracoes",
};

export const Breadcrumb = () => {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);

  if (pathParts.length === 0) return null;

  const breadcrumbs: { label: string; path: string; current: boolean }[] = [
    { label: "Início", path: "/dashboard", current: false },
  ];

  let accumulatedPath = "";
  pathParts.forEach((part, index) => {
    accumulatedPath += `/${part}`;
    const isLast = index === pathParts.length - 1;
    const routePath = accumulatedPath.replace(/^\/#/, "");
    const label = ROUTE_LABELS[routePath] ?? ROUTE_LABELS[`/${part}`] ?? part;
    breadcrumbs.push({ label, path: `#${routePath}`, current: isLast });
  });

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
      <LayoutDashboard className="h-3.5 w-3.5 flex-shrink-0 mr-0.5" />
      {breadcrumbs.map((crumb, i) => (
        <div key={i} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="h-3 w-3 flex-shrink-0 text-muted-foreground/40" />
          {crumb.current ? (
            <span className="font-medium text-foreground truncate">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors truncate flex-shrink-0">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};
