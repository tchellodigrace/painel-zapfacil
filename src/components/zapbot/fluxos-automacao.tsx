"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GitBranch,
  Plus,
  Trash2,
  Pencil,
  Play,
  Pause,
  Zap,
  MessageSquare,
  Clock,
  Tag,
  Bell,
  ArrowRight,
  ToggleLeft,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type TriggerType =
  | "palavra_chave"
  | "horario"
  | "etapa_funil"
  | "nova_mensagem"
  | "sempre";

type ConditionOperator =
  | "contem"
  | "igual"
  | "comeca_com"
  | "termina_com";

type ActionType =
  | "responder_mensagem"
  | "mover_funil"
  | "adicionar_tag"
  | "enviar_notificacao"
  | "pausar_bot";

interface FlowAction {
  id: string;
  type: ActionType;
  value: string;
}

interface AutomationFlow {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: TriggerType;
  operator: ConditionOperator;
  conditionValue: string;
  actions: FlowAction[];
  createdAt: number;
}

// ─── Constants & Mappings ────────────────────────────────────────────────────

const TRIGGER_LABELS: Record<TriggerType, string> = {
  palavra_chave: "Palavra-chave",
  horario: "Hor\u00e1rio",
  etapa_funil: "Etapa do Funil",
  nova_mensagem: "Nova Mensagem",
  sempre: "Sempre",
};

const TRIGGER_COLORS: Record<TriggerType, string> = {
  palavra_chave: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  horario: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  etapa_funil: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  nova_mensagem: "bg-primary/15 text-primary dark:text-primary/80 border-primary/30",
  sempre: "bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/30",
};

const TRIGGER_ICONS: Record<TriggerType, React.ReactNode> = {
  palavra_chave: <Zap className="h-3.5 w-3.5" />,
  horario: <Clock className="h-3.5 w-3.5" />,
  etapa_funil: <GitBranch className="h-3.5 w-3.5" />,
  nova_mensagem: <MessageSquare className="h-3.5 w-3.5" />,
  sempre: <ToggleLeft className="h-3.5 w-3.5" />,
};

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  contem: "Cont\u00e9m",
  igual: "Igual a",
  comeca_com: "Come\u00e7a com",
  termina_com: "Termina com",
};

const ACTION_LABELS: Record<ActionType, string> = {
  responder_mensagem: "Responder Mensagem",
  mover_funil: "Mover no Funil",
  adicionar_tag: "Adicionar Tag",
  enviar_notificacao: "Enviar Notifica\u00e7\u00e3o",
  pausar_bot: "Pausar Bot",
};

const ACTION_COLORS: Record<ActionType, string> = {
  responder_mensagem: "bg-primary/15 text-primary dark:text-primary/80 border-primary/30",
  mover_funil: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  adicionar_tag: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  enviar_notificacao: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  pausar_bot: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
};

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  responder_mensagem: <MessageSquare className="h-3.5 w-3.5" />,
  mover_funil: <GitBranch className="h-3.5 w-3.5" />,
  adicionar_tag: <Tag className="h-3.5 w-3.5" />,
  enviar_notificacao: <Bell className="h-3.5 w-3.5" />,
  pausar_bot: <Pause className="h-3.5 w-3.5" />,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createAction(type: ActionType = "responder_mensagem"): FlowAction {
  return { id: generateId(), type, value: "" };
}

function getExampleFlows(): AutomationFlow[] {
  return [
    {
      id: generateId(),
      name: "Boas-vindas Autom\u00e1ticas",
      description:
        "Envia mensagem de boas-vindas quando um novo contato envia qualquer mensagem.",
      enabled: true,
      trigger: "nova_mensagem",
      operator: "contem",
      conditionValue: "",
      actions: [
        { id: generateId(), type: "responder_mensagem", value: "Ol\u00e1! Bem-vindo(a) \u00e0 nossa empresa. Como posso ajudar?" },
        { id: generateId(), type: "adicionar_tag", value: "novo_lead" },
      ],
      createdAt: Date.now() - 86400000,
    },
    {
      id: generateId(),
      name: "Palavra-chave: PRE\u00c7O",
      description:
        "Quando o cliente digita algo que cont\u00e9m 'pre\u00e7o', envia o cat\u00e1logo e notifica o vendedor.",
      enabled: true,
      trigger: "palavra_chave",
      operator: "contem",
      conditionValue: "pre\u00e7o",
      actions: [
        { id: generateId(), type: "responder_mensagem", value: "Segue nosso cat\u00e1logo de pre\u00e7os atualizado!" },
        { id: generateId(), type: "mover_funil", value: "interesse" },
        { id: generateId(), type: "enviar_notificacao", value: "vendedor_responsavel" },
      ],
      createdAt: Date.now() - 43200000,
    },
    {
      id: generateId(),
      name: "Aus\u00eancia Autom\u00e1tica",
      description:
        "Fora do hor\u00e1rio comercial, pausa o bot autom\u00e1tico e envia mensagem de aus\u00eancia.",
      enabled: false,
      trigger: "horario",
      operator: "igual",
      conditionValue: "18:00-09:00",
      actions: [
        { id: generateId(), type: "responder_mensagem", value: "No momento estamos fora do hor\u00e1rio. Retornaremos em breve!" },
        { id: generateId(), type: "pausar_bot", value: "" },
      ],
      createdAt: Date.now() - 3600000,
    },
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ZapBotFluxos() {
  const [flows, setFlows] = useState<AutomationFlow[]>(() => getExampleFlows());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTrigger, setFormTrigger] = useState<TriggerType>("palavra_chave");
  const [formOperator, setFormOperator] = useState<ConditionOperator>("contem");
  const [formConditionValue, setFormConditionValue] = useState("");
  const [formActions, setFormActions] = useState<FlowAction[]>([createAction()]);
  const [formEnabled, setFormEnabled] = useState(true);

  // ─── Stats ────────────────────────────────────────────────────────────────

  const totalFlows = flows.length;
  const activeFlows = flows.filter((f) => f.enabled).length;
  const triggerCounts = flows.reduce<Record<string, number>>((acc, f) => {
    acc[f.trigger] = (acc[f.trigger] || 0) + 1;
    return acc;
  }, {});
  const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0];

  // ─── Dialog Helpers ────────────────────────────────────────────────────────

  function resetForm() {
    setFormName("");
    setFormDescription("");
    setFormTrigger("palavra_chave");
    setFormOperator("contem");
    setFormConditionValue("");
    setFormActions([createAction()]);
    setFormEnabled(true);
    setEditingId(null);
  }

  function openCreateDialog() {
    resetForm();
    setDialogOpen(true);
  }

  function openEditDialog(flow: AutomationFlow) {
    setEditingId(flow.id);
    setFormName(flow.name);
    setFormDescription(flow.description);
    setFormTrigger(flow.trigger);
    setFormOperator(flow.operator);
    setFormConditionValue(flow.conditionValue);
    setFormActions(flow.actions.map((a) => ({ ...a })));
    setFormEnabled(flow.enabled);
    setDialogOpen(true);
  }

  function handleSave() {
    if (!formName.trim()) {
      toast.error("Informe o nome do fluxo.");
      return;
    }
    if (formActions.length === 0) {
      toast.error("Adicione pelo menos uma a\u00e7\u00e3o ao fluxo.");
      return;
    }

    if (editingId) {
      setFlows((prev) =>
        prev.map((f) =>
          f.id === editingId
            ? {
                ...f,
                name: formName.trim(),
                description: formDescription.trim(),
                enabled: formEnabled,
                trigger: formTrigger,
                operator: formOperator,
                conditionValue: formConditionValue.trim(),
                actions: formActions,
              }
            : f
        )
      );
      toast.success("Fluxo atualizado com sucesso!");
    } else {
      const newFlow: AutomationFlow = {
        id: generateId(),
        name: formName.trim(),
        description: formDescription.trim(),
        enabled: formEnabled,
        trigger: formTrigger,
        operator: formOperator,
        conditionValue: formConditionValue.trim(),
        actions: formActions,
        createdAt: Date.now(),
      };
      setFlows((prev) => [newFlow, ...prev]);
      toast.success("Fluxo criado com sucesso!");
    }
    setDialogOpen(false);
    resetForm();
  }

  function handleDelete(id: string) {
    setFlows((prev) => prev.filter((f) => f.id !== id));
    toast.success("Fluxo removido.");
  }

  function handleToggle(id: string) {
    setFlows((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const next = !f.enabled;
        toast.success(next ? `"${f.name}" ativado.` : `"${f.name}" desativado.`);
        return { ...f, enabled: next };
      })
    );
  }

  function addActionRow() {
    setFormActions((prev) => [...prev, createAction()]);
  }

  function removeActionRow(id: string) {
    setFormActions((prev) => {
      if (prev.length <= 1) {
        toast.error("O fluxo precisa de pelo menos uma a\u00e7\u00e3o.");
        return prev;
      }
      return prev.filter((a) => a.id !== id);
    });
  }

  function updateAction(id: string, field: keyof FlowAction, value: string) {
    setFormActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  }

  // ─── Flow Diagram Sub-component ──────────────────────────────────────────

  function FlowDiagram({ flow }: { flow: AutomationFlow }) {
    return (
      <div className="flex flex-wrap items-center gap-2 py-3">
        {/* Trigger badge */}
        <Badge
          variant="outline"
          className={`gap-1.5 border text-xs font-medium ${TRIGGER_COLORS[flow.trigger]}`}
        >
          {TRIGGER_ICONS[flow.trigger]}
          <span className="uppercase tracking-wide">SE</span>: {TRIGGER_LABELS[flow.trigger]}
        </Badge>

        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />

        {/* Condition badge */}
        {flow.conditionValue ? (
          <Badge
            variant="outline"
            className="gap-1 border text-xs font-medium bg-muted/50 text-muted-foreground"
          >
            <span className="uppercase tracking-wide">SE</span> [{OPERATOR_LABELS[flow.operator]}] &ldquo;{flow.conditionValue}&rdquo;
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="gap-1 border text-xs font-medium bg-muted/50 text-muted-foreground"
          >
            <span className="uppercase tracking-wide">SE</span> (qualquer)
          </Badge>
        )}

        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />

        {/* ENTAO label + action badges */}
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          ENT\u00c3O
        </span>

        {flow.actions.map((action, idx) => (
          <span key={action.id} className="flex items-center gap-2">
            {idx > 0 && (
              <span className="text-muted-foreground text-xs">+</span>
            )}
            <Badge
              variant="outline"
              className={`gap-1.5 border text-xs font-medium ${ACTION_COLORS[action.type]}`}
            >
              {ACTION_ICONS[action.type]}
              {ACTION_LABELS[action.type]}
              {action.value && (
                <span className="opacity-70 max-w-[140px] truncate">
                  : {action.value}
                </span>
              )}
            </Badge>
          </span>
        ))}
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Fluxos de Automa\u00e7\u00e3o
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Configure gatilhos, condi\u00e7\u00f5es e a\u00e7\u00f5es autom\u00e1ticas
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Fluxo
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Fluxo" : "Criar Novo Fluxo"}
              </DialogTitle>
              <DialogDescription>
                Defina o gatilho, condi\u00e7\u00e3o e a\u00e7\u00f5es do fluxo de automa\u00e7\u00e3o.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 mt-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="flow-name">Nome do Fluxo</Label>
                <Input
                  id="flow-name"
                  placeholder="Ex: Boas-vindas autom\u00e1ticas"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="flow-desc">Descri\u00e7\u00e3o</Label>
                <Textarea
                  id="flow-desc"
                  placeholder="Descreva o objetivo deste fluxo..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Enabled toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Ativar fluxo</Label>
                  <p className="text-xs text-muted-foreground">
                    Fluxos desativados n\u00e3o ser\u00e3o executados
                  </p>
                </div>
                <Switch
                  checked={formEnabled}
                  onCheckedChange={setFormEnabled}
                />
              </div>

              <Separator />

              {/* Trigger */}
              <div className="space-y-2">
                <Label>Gatilho (SE)</Label>
                <Select
                  value={formTrigger}
                  onValueChange={(v) => setFormTrigger(v as TriggerType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o gatilho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="palavra_chave">Palavra-chave</SelectItem>
                    <SelectItem value="horario">Hor\u00e1rio</SelectItem>
                    <SelectItem value="etapa_funil">Etapa do Funil</SelectItem>
                    <SelectItem value="nova_mensagem">Nova Mensagem</SelectItem>
                    <SelectItem value="sempre">Sempre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Operador</Label>
                  <Select
                    value={formOperator}
                    onValueChange={(v) => setFormOperator(v as ConditionOperator)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Operador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contem">Cont\u00e9m</SelectItem>
                      <SelectItem value="igual">Igual a</SelectItem>
                      <SelectItem value="comeca_com">Come\u00e7a com</SelectItem>
                      <SelectItem value="termina_com">Termina com</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor da condi\u00e7\u00e3o</Label>
                  <Input
                    placeholder="Ex: pre\u00e7o, ol\u00e1, 09:00..."
                    value={formConditionValue}
                    onChange={(e) => setFormConditionValue(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>A\u00e7\u00f5es (ENT\u00c3O)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addActionRow}
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-3">
                  {formActions.map((action, idx) => (
                    <div
                      key={action.id}
                      className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end rounded-lg border p-3"
                    >
                      <div className="space-y-1">
                        {idx === 0 && (
                          <span className="text-xs text-muted-foreground">
                            Tipo
                          </span>
                        )}
                        <Select
                          value={action.type}
                          onValueChange={(v) =>
                            updateAction(action.id, "type", v)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="A\u00e7\u00e3o" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="responder_mensagem">
                              Responder Mensagem
                            </SelectItem>
                            <SelectItem value="mover_funil">
                              Mover no Funil
                            </SelectItem>
                            <SelectItem value="adicionar_tag">
                              Adicionar Tag
                            </SelectItem>
                            <SelectItem value="enviar_notificacao">
                              Enviar Notifica\u00e7\u00e3o
                            </SelectItem>
                            <SelectItem value="pausar_bot">Pausar Bot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        {idx === 0 && (
                          <span className="text-xs text-muted-foreground">
                            Par\u00e2metro
                          </span>
                        )}
                        <Input
                          placeholder={
                            action.type === "pausar_bot"
                              ? "(opcional)"
                              : action.type === "responder_mensagem"
                                ? "Texto da mensagem..."
                                : "Valor..."
                          }
                          value={action.value}
                          onChange={(e) =>
                            updateAction(action.id, "value", e.target.value)
                          }
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeActionRow(action.id)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover a\u00e7\u00e3o</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Zap className="h-4 w-4" />
                {editingId ? "Salvar Altera\u00e7\u00f5es" : "Criar Fluxo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2.5">
                <GitBranch className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-display">{totalFlows}</p>
                <p className="text-xs text-muted-foreground">Total de Fluxos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/15 p-2.5">
                <Play className="h-5 w-5 text-primary dark:text-primary/80" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-display">{activeFlows}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-500/15 p-2.5">
                <Pause className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-display">{totalFlows - activeFlows}</p>
                <p className="text-xs text-muted-foreground">Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/15 p-2.5">
                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-display">
                  {topTrigger ? topTrigger[1] : 0}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Gatilho:{" "}
                  {topTrigger
                    ? TRIGGER_LABELS[topTrigger[0] as TriggerType]
                    : "\u2014"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow List */}
      {flows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <GitBranch className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              Nenhum fluxo criado
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Crie seu primeiro fluxo de automa\u00e7\u00e3o para come\u00e7ar a automatizar
              respostas no WhatsApp.
            </p>
            <Button className="mt-4 gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Criar Fluxo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {flows.map((flow) => (
            <Card
              key={flow.id}
              className={`transition-opacity ${
                flow.enabled ? "" : "opacity-60"
              }`}
            >
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`rounded-lg p-2 shrink-0 ${
                        flow.enabled
                          ? "bg-primary/15"
                          : "bg-muted"
                      }`}
                    >
                      {flow.enabled ? (
                        <Play className="h-4 w-4 text-primary dark:text-primary/80" />
                      ) : (
                        <Pause className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">
                        {flow.name}
                      </CardTitle>
                      {flow.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {flow.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={flow.enabled}
                      onCheckedChange={() => handleToggle(flow.id)}
                      aria-label={`Ativar/desativar ${flow.name}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(flow)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(flow.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Visual flow diagram */}
                <FlowDiagram flow={flow} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
