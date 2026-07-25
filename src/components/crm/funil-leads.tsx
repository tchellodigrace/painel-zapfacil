"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  ArrowRight,
  ArrowLeft,
  LayoutGrid,
  List,
  DollarSign,
  TrendingUp,
  Target,
  GripVertical,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  notes: string;
  estimatedValue: number;
  stage: StageKey;
  createdAt: string;
}

type StageKey =
  | "novo_lead"
  | "tentativa"
  | "contatado"
  | "interessado"
  | "negociacao"
  | "fechado"
  | "perdido";

// ─── Stage Config ────────────────────────────────────────────────────────────

const STAGES: { key: StageKey; label: string; color: string; bgClass: string; borderClass: string; textClass: string; badgeClass: string; dotClass: string }[] = [
  { key: "novo_lead", label: "Novo Lead", color: "blue", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/30", textClass: "text-blue-600 dark:text-blue-400", badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", dotClass: "bg-blue-500" },
  { key: "tentativa", label: "Tentativa de Contato", color: "amber", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/30", textClass: "text-amber-600 dark:text-amber-400", badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", dotClass: "bg-amber-500" },
  { key: "contatado", label: "Contatado", color: "cyan", bgClass: "bg-cyan-500/10", borderClass: "border-cyan-500/30", textClass: "text-cyan-600 dark:text-cyan-400", badgeClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300", dotClass: "bg-cyan-500" },
  { key: "interessado", label: "Interessado", color: "purple", bgClass: "bg-purple-500/10", borderClass: "border-purple-500/30", textClass: "text-purple-600 dark:text-purple-400", badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300", dotClass: "bg-purple-500" },
  { key: "negociacao", label: "Negociação", color: "orange", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/30", textClass: "text-orange-600 dark:text-orange-400", badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300", dotClass: "bg-orange-500" },
  { key: "fechado", label: "Fechado", color: "emerald", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/30", textClass: "text-emerald-600 dark:text-emerald-400", badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", dotClass: "bg-emerald-500" },
  { key: "perdido", label: "Perdido", color: "red", bgClass: "bg-red-500/10", borderClass: "border-red-500/30", textClass: "text-red-600 dark:text-red-400", badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300", dotClass: "bg-red-500" },
];

const STAGE_KEYS: StageKey[] = ["novo_lead", "tentativa", "contatado", "interessado", "negociacao", "fechado", "perdido"];

const OPEN_STAGES: StageKey[] = ["novo_lead", "tentativa", "contatado", "interessado", "negociacao"];

function getStageConfig(key: StageKey) {
  return STAGES.find((s) => s.key === key)!;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

// ─── Default Empty Lead ──────────────────────────────────────────────────────

function emptyLead(stage: StageKey = "novo_lead"): Omit<Lead, "id" | "createdAt"> {
  return {
    name: "",
    phone: "",
    email: "",
    tags: [],
    notes: "",
    estimatedValue: 0,
    stage,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FunilLeads() {
  // ── State ──
  const [leads, setLeads] = useState<Lead[]>([]);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<StageKey | null>(null);

  // Form state for add
  const [addForm, setAddForm] = useState<Omit<Lead, "id" | "createdAt">>(emptyLead());
  const [addTagInput, setAddTagInput] = useState("");

  // Form state for edit
  const [editForm, setEditForm] = useState<Omit<Lead, "id" | "createdAt">>(emptyLead());
  const [editTagInput, setEditTagInput] = useState("");

  // ── Refs for kanban drag ──
  const kanbanRef = useRef<HTMLDivElement>(null);

  // ── Derived ──
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    leads.forEach((l) => l.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = searchQuery.toLowerCase().trim();
      if (q && !lead.name.toLowerCase().includes(q) && !lead.phone.includes(q) && !lead.email.toLowerCase().includes(q)) {
        return false;
      }
      if (activeTagFilter && !lead.tags.includes(activeTagFilter)) {
        return false;
      }
      return true;
    });
  }, [leads, searchQuery, activeTagFilter]);

  const stats = useMemo(() => {
    const openLeads = leads.filter((l) => OPEN_STAGES.includes(l.stage));
    const pipelineValue = openLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
    const fechados = leads.filter((l) => l.stage === "fechado").length;
    const total = leads.length;
    const conversionRate = total > 0 ? ((fechados / total) * 100) : 0;
    return { pipelineValue, conversionRate, total };
  }, [leads]);

  // ── Actions ──

  const openAddDialog = useCallback(() => {
    setAddForm(emptyLead());
    setAddTagInput("");
    setAddDialogOpen(true);
  }, []);

  const closeAddDialog = useCallback(() => {
    setAddDialogOpen(false);
  }, []);

  const handleAddLead = useCallback(() => {
    if (!addForm.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!addForm.phone.trim()) {
      toast.error("Telefone é obrigatório");
      return;
    }
    const newLead: Lead = {
      ...addForm,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [...prev, newLead]);
    setAddDialogOpen(false);
    toast.success(`Lead "${newLead.name}" adicionado com sucesso!`);
  }, [addForm]);

  const openEditDialog = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setEditForm({ name: lead.name, phone: lead.phone, email: lead.email, tags: [...lead.tags], notes: lead.notes, estimatedValue: lead.estimatedValue, stage: lead.stage });
    setEditTagInput("");
    setEditDialogOpen(true);
  }, []);

  const handleEditLead = useCallback(() => {
    if (!editingLead) return;
    if (!editForm.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!editForm.phone.trim()) {
      toast.error("Telefone é obrigatório");
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === editingLead.id ? { ...l, ...editForm } : l)));
    setEditDialogOpen(false);
    setEditingLead(null);
    toast.success(`Lead "${editForm.name}" atualizado!`);
  }, [editingLead, editForm]);

  const handleDeleteLead = useCallback((leadId: string, leadName: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    toast.success(`Lead "${leadName}" removido.`);
  }, []);

  const moveLead = useCallback((leadId: string, direction: "left" | "right") => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const currentIndex = STAGE_KEYS.indexOf(l.stage);
        if (direction === "right" && currentIndex < STAGE_KEYS.length - 1) {
          const newStage = STAGE_KEYS[currentIndex + 1];
          toast.success(`"${l.name}" movido para ${getStageConfig(newStage).label}`);
          return { ...l, stage: newStage };
        }
        if (direction === "left" && currentIndex > 0) {
          const newStage = STAGE_KEYS[currentIndex - 1];
          toast.success(`"${l.name}" movido para ${getStageConfig(newStage).label}`);
          return { ...l, stage: newStage };
        }
        return l;
      })
    );
  }, []);

  const moveLeadToStage = useCallback((leadId: string, targetStage: StageKey) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        toast.success(`"${l.name}" movido para ${getStageConfig(targetStage).label}`);
        return { ...l, stage: targetStage };
      })
    );
  }, []);

  // ── Drag handlers ──
  const handleDragStart = useCallback((e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", leadId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stageKey: StageKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageKey);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, stageKey: StageKey) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) {
      moveLeadToStage(leadId, stageKey);
    }
    setDraggedLeadId(null);
  }, [moveLeadToStage]);

  const handleDragEnd = useCallback(() => {
    setDraggedLeadId(null);
    setDragOverStage(null);
  }, []);

  // ── Tag helpers ──
  const addTagToForm = (isEdit: boolean) => {
    const tag = isEdit ? editTagInput.trim() : addTagInput.trim();
    if (!tag) return;
    if (isEdit) {
      if (editForm.tags.includes(tag)) { toast.error("Tag já existe"); return; }
      setEditForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      setEditTagInput("");
    } else {
      if (addForm.tags.includes(tag)) { toast.error("Tag já existe"); return; }
      setAddForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      setAddTagInput("");
    }
  };

  const removeTagFromForm = (isEdit: boolean, tag: string) => {
    if (isEdit) {
      setEditForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
    } else {
      setAddForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
    }
  };

  // ── Render ──

  return (
    <div className="space-y-4">
      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pipeline</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(stats.pipelineValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Taxa de Conversão</p>
              <p className="text-lg font-bold text-foreground">{stats.conversionRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total de Leads</p>
              <p className="text-lg font-bold text-foreground">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {allTags.length > 0 && (
            <>
              <button
                onClick={() => setActiveTagFilter(null)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTagFilter === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Todas
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeTagFilter === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center border border-input rounded-md">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={openAddDialog} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Lead</span>
          </Button>
        </div>
      </div>

      {/* ── Kanban View ── */}
      {viewMode === "kanban" && (
        <div
          ref={kanbanRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 lg:overflow-x-visible lg:grid lg:grid-cols-7"
        >
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage.key);
            const isDragOver = dragOverStage === stage.key;
            return (
              <div
                key={stage.key}
                className={`snap-start shrink-0 w-[280px] lg:w-auto rounded-xl border transition-colors p-3 flex flex-col gap-2 min-h-[200px] ${
                  isDragOver
                    ? `border-2 border-dashed ${stage.borderClass} ${stage.bgClass}`
                    : `border ${stage.borderClass} ${stage.bgClass}`
                }`}
                onDragOver={(e) => handleDragOver(e, stage.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 px-1">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${stage.dotClass}`} />
                  <h3 className={`text-sm font-semibold truncate ${stage.textClass}`}>
                    {stage.label}
                  </h3>
                  <Badge variant="secondary" className="ml-auto text-xs h-5 min-w-[20px] flex items-center justify-center">
                    {stageLeads.length}
                  </Badge>
                </div>

                {/* Column Value */}
                <p className="text-xs text-muted-foreground px-1">
                  {formatCurrency(stageLeads.reduce((s, l) => s + l.estimatedValue, 0))}
                </p>

                {/* Cards */}
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[60vh] pr-1 custom-scrollbar">
                  {stageLeads.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                      Nenhum lead
                    </div>
                  )}
                  {stageLeads.map((lead) => {
                    const stageIdx = STAGE_KEYS.indexOf(lead.stage);
                    return (
                      <Card
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                          draggedLeadId === lead.id ? "opacity-40 scale-95" : ""
                        }`}
                      >
                        <CardContent className="p-3 space-y-2">
                          {/* Name + Actions */}
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="text-sm font-medium truncate">{lead.name}</span>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                onClick={() => openEditDialog(lead)}
                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.id, lead.name)}
                                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          {/* Phone */}
                          <p className="text-xs text-muted-foreground truncate pl-5">
                            {lead.phone ? formatPhone(lead.phone) : "Sem telefone"}
                          </p>

                          {/* Value */}
                          {lead.estimatedValue > 0 && (
                            <div className="flex items-center gap-1 pl-5">
                              <DollarSign className="h-3 w-3 text-emerald-500" />
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(lead.estimatedValue)}
                              </span>
                            </div>
                          )}

                          {/* Tags */}
                          {lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pl-5">
                              {lead.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Move arrows */}
                          <div className="flex items-center gap-1 pl-5 pt-1">
                            <button
                              disabled={stageIdx === 0}
                              onClick={() => moveLead(lead.id, "left")}
                              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                            <button
                              disabled={stageIdx === STAGE_KEYS.length - 1}
                              onClick={() => moveLead(lead.id, "right")}
                              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── List View ── */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum lead encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredLeads.map((lead) => {
                    const sc = getStageConfig(lead.stage);
                    const stageIdx = STAGE_KEYS.indexOf(lead.stage);
                    return (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phone ? formatPhone(lead.phone) : "—"}</TableCell>
                        <TableCell>{lead.email || "—"}</TableCell>
                        <TableCell>
                          <Badge className={`${sc.badgeClass} border-0 text-xs`}>
                            <span className={`mr-1 h-1.5 w-1.5 rounded-full inline-block ${sc.dotClass}`} />
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {lead.estimatedValue > 0 ? formatCurrency(lead.estimatedValue) : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {lead.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              disabled={stageIdx === 0}
                              onClick={() => moveLead(lead.id, "left")}
                              className="p-1.5 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground hover:text-foreground"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              disabled={stageIdx === STAGE_KEYS.length - 1}
                              onClick={() => moveLead(lead.id, "right")}
                              className="p-1.5 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground hover:text-foreground"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEditDialog(lead)}
                              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id, lead.name)}
                              className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {filteredLeads.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum lead encontrado.
                </div>
              )}
              {filteredLeads.map((lead) => {
                const sc = getStageConfig(lead.stage);
                const stageIdx = STAGE_KEYS.indexOf(lead.stage);
                return (
                  <div key={lead.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{lead.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {lead.phone ? formatPhone(lead.phone) : "Sem telefone"}
                        </p>
                      </div>
                      <Badge className={`${sc.badgeClass} border-0 text-[10px] shrink-0`}>{sc.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {lead.email && <span className="truncate">{lead.email}</span>}
                      {lead.estimatedValue > 0 && (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                          {formatCurrency(lead.estimatedValue)}
                        </span>
                      )}
                    </div>
                    {lead.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lead.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        disabled={stageIdx === 0}
                        onClick={() => moveLead(lead.id, "left")}
                        className="p-1.5 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        disabled={stageIdx === STAGE_KEYS.length - 1}
                        onClick={() => moveLead(lead.id, "right")}
                        className="p-1.5 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex-1" />
                      <button
                        onClick={() => openEditDialog(lead)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id, lead.name)}
                        className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Add Dialog ── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Novo Lead
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-name">Nome *</Label>
              <Input
                id="add-name"
                placeholder="Nome do lead"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-phone">Telefone *</Label>
                <Input
                  id="add-phone"
                  placeholder="(11) 99999-9999"
                  value={addForm.phone}
                  onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-value">Valor Estimado (R$)</Label>
                <Input
                  id="add-value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={addForm.estimatedValue || ""}
                  onChange={(e) => setAddForm((f) => ({ ...f, estimatedValue: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-stage">Etapa</Label>
                <Select
                  value={addForm.stage}
                  onValueChange={(v) => setAddForm((f) => ({ ...f, stage: v as StageKey }))}
                >
                  <SelectTrigger id="add-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar tag..."
                  value={addTagInput}
                  onChange={(e) => setAddTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTagToForm(false); } }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addTagToForm(false)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {addForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {addForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        onClick={() => removeTagFromForm(false, tag)}
                        className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-notes">Observações</Label>
              <Textarea
                id="add-notes"
                placeholder="Anotações sobre o lead..."
                rows={3}
                value={addForm.notes}
                onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAddDialog}>
              Cancelar
            </Button>
            <Button onClick={handleAddLead}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) { setEditDialogOpen(false); setEditingLead(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Editar Lead
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                placeholder="Nome do lead"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone *</Label>
                <Input
                  id="edit-phone"
                  placeholder="(11) 99999-9999"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-value">Valor Estimado (R$)</Label>
                <Input
                  id="edit-value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={editForm.estimatedValue || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, estimatedValue: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stage">Etapa</Label>
                <Select
                  value={editForm.stage}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, stage: v as StageKey }))}
                >
                  <SelectTrigger id="edit-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar tag..."
                  value={editTagInput}
                  onChange={(e) => setEditTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTagToForm(true); } }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addTagToForm(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {editForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {editForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        onClick={() => removeTagFromForm(true, tag)}
                        className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea
                id="edit-notes"
                placeholder="Anotações sobre o lead..."
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingLead(null); }}>
              Cancelar
            </Button>
            <Button onClick={handleEditLead}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
