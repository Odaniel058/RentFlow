import React, { useEffect, useState } from "react";
import { Building2, Check, ChevronDown, FileText, Moon, RotateCcw, Save, Shield, Sun, Trash2, Upload, UserPlus, Users } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/contexts/AppDataContext";
import { useTheme } from "@/components/ThemeProvider";
import { defaultCompanySettings } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { dedupeCategoryOptions } from "@/lib/inventory";
import { toast } from "sonner";

// ─── Team Members ────────────────────────────────────────────────────────────

type TeamRole = "admin" | "manager" | "operator" | "financial" | "viewer";
type TeamStatus = "active" | "pending";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamStatus;
  addedAt: string;
}

const ROLE_LABELS: Record<TeamRole, string> = {
  admin: "Administrador",
  manager: "Gerente",
  operator: "Operador",
  financial: "Financeiro",
  viewer: "Visualizador",
};

const ROLE_DESC: Record<TeamRole, string> = {
  admin: "Acesso completo ao sistema",
  manager: "Reservas, orcamentos e clientes",
  operator: "Agenda e movimentacao de equipamentos",
  financial: "Modulo financeiro e relatorios",
  viewer: "Somente leitura",
};

const ROLE_COLORS: Record<TeamRole, string> = {
  admin: "bg-primary/15 text-primary border-primary/25",
  manager: "bg-blue-500/15 text-blue-500 border-blue-500/25",
  operator: "bg-orange-500/15 text-orange-500 border-orange-500/25",
  financial: "bg-green-500/15 text-green-500 border-green-500/25",
  viewer: "bg-muted text-muted-foreground border-border",
};

const teamKey = (tenantId: string) => `rentflow_team_${tenantId}`;

const getTeam = (tenantId: string): TeamMember[] => {
  try {
    const stored = localStorage.getItem(teamKey(tenantId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTeam = (tenantId: string, members: TeamMember[]) => {
  localStorage.setItem(teamKey(tenantId), JSON.stringify(members));
};

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// ─── Invite Dialog ────────────────────────────────────────────────────────────

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onInvite: (name: string, email: string, role: TeamRole) => void;
}

const InviteDialog: React.FC<InviteDialogProps> = ({ open, onClose, onInvite }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("operator");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onInvite(name.trim(), email.trim(), role);
    setName("");
    setEmail("");
    setRole("operator");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar membro da equipe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input
              placeholder="Ex.: Ana Ferreira"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="ana@suaempresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Funcao</Label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TeamRole)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none"
              >
                {(Object.keys(ROLE_LABELS) as TeamRole[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]} — {ROLE_DESC[r]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <Shield className="inline h-3.5 w-3.5 mr-1.5 text-primary" />
            O convite sera enviado por email. O usuario so tera acesso apos aceitar.
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="gradient-gold text-primary-foreground">
              <UserPlus className="h-4 w-4 mr-2" />
              Enviar convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { state, updateSettings, resetData } = useAppData();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState(state.settings);
  const [saving, setSaving] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>(() =>
    user ? getTeam(user.tenantId) : []
  );

  useEffect(() => {
    setForm(state.settings);
  }, [state.settings]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, logoUrl: String(reader.result) }));
      toast.success("Logo carregada com sucesso.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateSettings({
      ...form,
      equipmentCategories: dedupeCategoryOptions(form.equipmentCategories),
    });
    setSaving(false);
    toast.success("Configurações salvas.");
  };

  const addCategory = () => {
    const trimmed = categoryDraft.trim();
    if (!trimmed) return;

    setForm((current) => ({
      ...current,
      equipmentCategories: dedupeCategoryOptions([...current.equipmentCategories, trimmed]),
    }));
    setCategoryDraft("");
  };

  const removeCategory = (category: string) => {
    setForm((current) => ({
      ...current,
      equipmentCategories: current.equipmentCategories.filter((item) => item !== category),
    }));
  };

  const handleInvite = (name: string, email: string, role: TeamRole) => {
    if (!user) return;
    const existing = team.find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      toast.error("Ja existe um membro com esse email.");
      return;
    }
    const newMember: TeamMember = {
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      name,
      email,
      role,
      status: "pending",
      addedAt: new Date().toISOString(),
    };
    const updated = [...team, newMember];
    saveTeam(user.tenantId, updated);
    setTeam(updated);
    toast.success(`Convite enviado para ${email}.`);
  };

  const handleRemoveMember = (id: string) => {
    if (!user) return;
    const updated = team.filter((m) => m.id !== id);
    saveTeam(user.tenantId, updated);
    setTeam(updated);
    toast.success("Membro removido da equipe.");
  };

  const handleChangeRole = (id: string, role: TeamRole) => {
    if (!user) return;
    const updated = team.map((m) => (m.id === id ? { ...m, role } : m));
    saveTeam(user.tenantId, updated);
    setTeam(updated);
    toast.success("Funcao atualizada.");
  };

  return (
    <PageTransition>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">Dados da locadora, tema e informações usadas em PDFs e contratos.</p>
        </div>

        <div className="glass-card p-6 premium-shadow space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Dados da empresa</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da empresa</Label>
              <Input value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Contato principal</Label>
              <Input value={form.contactName || user?.name || ""} onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input value={form.cnpj} onChange={(event) => setForm((current) => ({ ...current, cnpj: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Preferência visual</Label>
              <select value={theme} onChange={() => toggleTheme()} className="h-10 rounded-md border border-input bg-background px-3 text-sm w-full">
                <option value={theme}>{theme === "dark" ? "Escuro premium" : "Claro premium"}</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Textarea rows={3} value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} />
          </div>
          <div className="flex justify-end">
            <Button className="gradient-gold text-primary-foreground" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>

        <div className="glass-card p-6 premium-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-semibold">Equipe e acessos</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Gerencie quem tem acesso ao sistema e com qual funcao.</p>
              </div>
            </div>
            <Button size="sm" className="gradient-gold text-primary-foreground" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar membro
            </Button>
          </div>

          {/* Linha do usuario atual (admin logado) */}
          <div className="space-y-2">
            <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/60 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-gold text-primary-foreground text-sm font-bold">
                {initials(user?.name || "A")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${ROLE_COLORS.admin}`}>
                  <Check className="h-3 w-3" />
                  {ROLE_LABELS.admin}
                </span>
                <span className="rounded-full bg-green-500/15 border border-green-500/25 text-green-500 px-2.5 py-1 text-xs font-medium">
                  Ativo
                </span>
              </div>
            </div>

            {team.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum membro convidado ainda</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Convide sua equipe para colaborar no sistema.</p>
              </div>
            )}

            {team.map((member) => (
              <div key={member.id} className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/60 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                  {initials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <select
                      value={member.role}
                      onChange={(e) => handleChangeRole(member.id, e.target.value as TeamRole)}
                      className={`appearance-none rounded-full border px-2.5 py-1 text-xs font-medium pr-6 cursor-pointer ${ROLE_COLORS[member.role]}`}
                      style={{ background: "transparent" }}
                    >
                      {(Object.keys(ROLE_LABELS) as TeamRole[]).map((r) => (
                        <option key={r} value={r} className="bg-background text-foreground">
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3" />
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${member.status === "active" ? "bg-green-500/15 border-green-500/25 text-green-500" : "bg-yellow-500/15 border-yellow-500/25 text-yellow-500"}`}>
                    {member.status === "active" ? "Ativo" : "Pendente"}
                  </span>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Remover membro"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {(Object.keys(ROLE_LABELS) as TeamRole[]).map((r) => (
              <div key={r} className="rounded-lg border border-border/50 bg-muted/30 p-2.5">
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium mb-1.5 ${ROLE_COLORS[r]}`}>
                  {ROLE_LABELS[r]}
                </span>
                <p className="text-xs text-muted-foreground leading-snug">{ROLE_DESC[r]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-6">
          <div className="glass-card p-6 premium-shadow">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Logo e documentos</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">A logo aparece em orçamentos e contratos PDF.</p>
            <label className="border-2 border-dashed border-border rounded-2xl p-8 text-center block cursor-pointer hover:border-primary/40 transition-colors">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo da locadora" className="mx-auto max-h-28 object-contain mb-4" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
              )}
              <p className="text-sm font-medium">{form.logoUrl ? "Trocar logo" : "Enviar logo da locadora"}</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou SVG com persistência local.</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 premium-shadow">
              <h2 className="font-semibold mb-4">Categorias de equipamentos</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Essas categorias aparecem no cadastro e na edicao dos equipamentos.
              </p>
              <div className="flex gap-3">
                <Input
                  value={categoryDraft}
                  onChange={(event) => setCategoryDraft(event.target.value)}
                  placeholder="Ex.: Drone, Energia, Transmissao"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCategory();
                    }
                  }}
                />
                <Button variant="outline" onClick={addCategory}>
                  Adicionar
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {form.equipmentCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="rounded-full border border-border/60 bg-surface px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                    title="Remover categoria"
                  >
                    {category} ×
                  </button>
                ))}
              </div>
            </div>
            <div className="glass-card p-6 premium-shadow">
              <h2 className="font-semibold mb-4">Aparência</h2>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Tema do sistema</p>
                  <p className="text-xs text-muted-foreground">Alterne entre claro e escuro mantendo a identidade premium.</p>
                </div>
                <Button variant="outline" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {theme === "dark" ? "Modo claro" : "Modo escuro"}
                </Button>
              </div>
            </div>

            <div className="glass-card p-6 premium-shadow">
              <h2 className="font-semibold mb-4">Ambiente mockado</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Se quiser reiniciar a base para o estado original do demo, podemos restaurar tudo sem perder a estrutura do app.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setForm(defaultCompanySettings); updateSettings(defaultCompanySettings); toast.success("Configurações padrão restauradas."); }}>
                  Restaurar padrão
                </Button>
                <Button variant="outline" onClick={() => { resetData(); toast.success("Base mock restaurada."); }}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar dados
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} />
    </PageTransition>
  );
};

export default SettingsPage;
