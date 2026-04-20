import React, { useState, useMemo } from "react";
import { Search, X, Save, Trash2, ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  SavedFilter,
  getSavedFilters,
  saveFilter,
  deleteFilter,
  generateFilterId,
} from "@/lib/search-filters";

interface EquipmentSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  brand: string;
  onBrandChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  categories: string[];
  brands: string[];
  resultCount: number;
  tenantId: string;
}

export const AdvancedEquipmentSearch: React.FC<EquipmentSearchProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  brand,
  onBrandChange,
  status,
  onStatusChange,
  categories,
  brands,
  resultCount,
  tenantId,
}) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(
    getSavedFilters(tenantId)
  );
  const [filterName, setFilterName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (category !== "Todas") count++;
    if (brand !== "Todas") count++;
    if (status !== "Todos") count++;
    return count;
  }, [search, category, brand, status]);

  const hasActiveFilters = activeFilterCount > 0;

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast.error("Digite um nome para o filtro");
      return;
    }

    const newFilter: SavedFilter = {
      id: generateFilterId(),
      name: filterName,
      searchText: search || undefined,
      category: category !== "Todas" ? category : undefined,
      brand: brand !== "Todas" ? brand : undefined,
      status: status !== "Todos" ? status : undefined,
      createdAt: Date.now(),
    };

    saveFilter(tenantId, newFilter);
    setSavedFilters(getSavedFilters(tenantId));
    setFilterName("");
    setSaveDialogOpen(false);
    toast.success(`Filtro "${filterName}" salvo com sucesso`);
  };

  const handleApplyFilter = (filter: SavedFilter) => {
    onSearchChange(filter.searchText || "");
    onCategoryChange(filter.category || "Todas");
    onBrandChange(filter.brand || "Todas");
    onStatusChange(filter.status || "Todos");
    toast.success(`Filtro "${filter.name}" aplicado`);
  };

  const handleDeleteFilter = (filterId: string) => {
    deleteFilter(tenantId, filterId);
    setSavedFilters(getSavedFilters(tenantId));
    toast.success("Filtro removido");
  };

  const handleClearFilters = () => {
    onSearchChange("");
    onCategoryChange("Todas");
    onBrandChange("Todas");
    onStatusChange("Todos");
    toast.success("Filtros limpos");
  };

  return (
    <div className="space-y-4">
      {/* Search Bar e Filtros Principais */}
      <div className="glass-card p-4 premium-shadow">
        <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, modelo, série..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={brand}
              onChange={(e) => onBrandChange(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {["Todos", "available", "reserved", "maintenance", "unavailable"].map(
            (s) => {
              const active = status === s;
              const label =
                s === "Todos"
                  ? "Todos"
                  : s === "available"
                    ? "Disponível"
                    : s === "reserved"
                      ? "Reservado"
                      : s === "maintenance"
                        ? "Manutenção"
                        : "Indisponível";

              return (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "border-primary/30 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "border-border/60 bg-surface/50 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            }
          )}

          {/* Ações de Filtro */}
          <div className="ml-auto flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Limpar
              </Button>
            )}

            {hasActiveFilters && (
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Salvar filtro
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card premium-shadow-lg">
                  <DialogHeader>
                    <DialogTitle>Salvar filtro</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Nome do filtro
                      </label>
                      <Input
                        placeholder="Ex: Cameras 4K, Iluminação LED..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        className="mt-2"
                        autoFocus
                      />
                    </div>
                    <div className="bg-surface/50 rounded-lg p-3 text-xs space-y-1">
                      {search && (
                        <p>
                          <span className="text-muted-foreground">Busca:</span>{" "}
                          {search}
                        </p>
                      )}
                      {category !== "Todas" && (
                        <p>
                          <span className="text-muted-foreground">Categoria:</span>{" "}
                          {category}
                        </p>
                      )}
                      {brand !== "Todas" && (
                        <p>
                          <span className="text-muted-foreground">Marca:</span>{" "}
                          {brand}
                        </p>
                      )}
                      {status !== "Todos" && (
                        <p>
                          <span className="text-muted-foreground">Status:</span>{" "}
                          {status}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleSaveFilter}
                      className="w-full"
                      variant="gold"
                    >
                      Salvar filtro
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Dropdown de Filtros Salvos */}
            {savedFilters.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    Filtros
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="glass-card premium-shadow-lg w-56"
                >
                  <DropdownMenuLabel className="text-xs uppercase tracking-wider">
                    Filtros salvos
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {savedFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm hover:bg-surface/50 rounded"
                    >
                      <button
                        onClick={() => handleApplyFilter(filter)}
                        className="flex-1 text-left text-xs hover:text-primary transition-colors"
                      >
                        {filter.name}
                      </button>
                      <button
                        onClick={() => handleDeleteFilter(filter.id)}
                        className="p-1 hover:bg-red-500/10 rounded text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Info Bar */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {resultCount} equipamento{resultCount !== 1 ? "s" : ""} encontrado
            {activeFilterCount > 0 && `s (${activeFilterCount} filtro${activeFilterCount !== 1 ? "s" : ""})`}
          </span>
          {hasActiveFilters && (
            <div className="flex gap-2">
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                  {search}
                  <button
                    onClick={() => onSearchChange("")}
                    className="ml-1 hover:opacity-70"
                  >
                    ✕
                  </button>
                </span>
              )}
              {category !== "Todas" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-medium">
                  {category}
                  <button
                    onClick={() => onCategoryChange("Todas")}
                    className="ml-1 hover:opacity-70"
                  >
                    ✕
                  </button>
                </span>
              )}
              {brand !== "Todas" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-medium">
                  {brand}
                  <button
                    onClick={() => onBrandChange("Todas")}
                    className="ml-1 hover:opacity-70"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
