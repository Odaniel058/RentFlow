import React, { useEffect, useState } from "react";
import { Building2, FileText, Moon, RotateCcw, Save, Sun, Upload } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/contexts/AppDataContext";
import { useTheme } from "@/components/ThemeProvider";
import { defaultCompanySettings } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { dedupeCategoryOptions } from "@/lib/inventory";
import { toast } from "sonner";

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { state, updateSettings, resetData } = useAppData();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState(state.settings);
  const [saving, setSaving] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState("");

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
    </PageTransition>
  );
};

export default SettingsPage;
