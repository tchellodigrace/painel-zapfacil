"use client";

import { useState } from "react";
import { useZapBotProStore, type MenuItem, type SubMenuItem } from "@/hooks/use-zapbot-pro-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Bot,
  Plus,
  Trash2,
  Pencil,
  GripVertical,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Menu,
  Zap,
  Eye,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

// =============================================
// Preview do menu (simula WhatsApp)
// =============================================
function PreviewMenu() {
  const { mensagemBoasVindas, menuItems, mensagemPadrao } = useZapBotProStore();

  const menuAtivo = menuItems.filter((m) => m.ativo);
  const menuText = menuAtivo
    .map((m) => `*${m.numero}.* ${m.titulo}`)
    .join("\n");

  const msgCompleta = mensagemBoasVindas
    .replace("{menu}", menuText)
    .replace("{empresa}", "Minha Empresa");

  return (
    <Card className="bg-[#e5ddd5] border-0 overflow-hidden min-w-0">
      <CardHeader className="bg-[#075e54] text-white py-3 px-4">
        <CardTitle className="text-sm font-normal flex items-center gap-2">
          <Bot className="h-4 w-4 shrink-0" />
          Chatbot - Minha Empresa
          <span className="ml-auto text-[10px] opacity-70">online</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <div className="max-w-[85%] ml-auto">
          <div className="bg-[#dcf8c6] rounded-xl rounded-tr-none p-3 shadow-sm">
            <pre className="text-[13px] text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
              {msgCompleta || "Mensagem de boas-vindas nao configurada"}
            </pre>
          </div>
        </div>

        <p className="text-[10px] text-center text-gray-500">- - - - - - - - -</p>

        {menuAtivo.length > 0 && (
          <div className="max-w-[85%] mr-auto">
            <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm">
              <p className="text-[13px] text-gray-800">1</p>
            </div>
          </div>
        )}

        <div className="max-w-[85%] ml-auto">
          <div className="bg-[#dcf8c6] rounded-xl rounded-tr-none p-3 shadow-sm">
            <pre className="text-[13px] text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
              {menuAtivo[0]?.resposta || "..."}
            </pre>
          </div>
        </div>

        {menuAtivo.some((m) => m.submenu.length > 0) && (
          <>
            <div className="max-w-[85%] mr-auto">
              <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm">
                <p className="text-[13px] text-gray-800">
                  {menuAtivo.find((m) => m.submenu.length > 0)?.submenu[0]
                    ?.numero || "3.1"}
                </p>
              </div>
            </div>
            <div className="max-w-[85%] ml-auto">
              <div className="bg-[#dcf8c6] rounded-xl rounded-tr-none p-3 shadow-sm">
                <pre className="text-[13px] text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {menuAtivo.find((m) => m.submenu.length > 0)?.submenu[0]
                    ?.resposta || "..."}
                </pre>
              </div>
            </div>
          </>
        )}

        {mensagemPadrao && (
          <>
            <div className="max-w-[85%] mr-auto">
              <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm">
                <p className="text-[13px] text-gray-800">xyz</p>
              </div>
            </div>
            <div className="max-w-[85%] ml-auto">
              <div className="bg-[#dcf8c6] rounded-xl rounded-tr-none p-3 shadow-sm">
                <pre className="text-[13px] text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {mensagemPadrao}
                </pre>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// Formulario de menu item
// =============================================
interface MenuItemFormProps {
  item?: MenuItem;
  onSave: (data: { numero: string; titulo: string; resposta: string; ativo: boolean }) => void;
  onCancel: () => void;
}

function MenuItemForm({ item, onSave, onCancel }: MenuItemFormProps) {
  const [numero, setNumero] = useState(item?.numero || "");
  const [titulo, setTitulo] = useState(item?.titulo || "");
  const [resposta, setResposta] = useState(item?.resposta || "");
  const [ativo, setAtivo] = useState(item?.ativo ?? true);

  function salvar() {
    if (!numero.trim() || !titulo.trim() || !resposta.trim()) {
      toast.error("Preencha todos os campos!");
      return;
    }
    onSave({ numero: numero.trim(), titulo: titulo.trim(), resposta: resposta.trim(), ativo });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[80px_1fr] gap-3">
        <div className="space-y-2">
          <Label>Numero</Label>
          <Input
            placeholder="1"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Titulo da opcao</Label>
          <Input
            placeholder="Ex: Horario de funcionamento"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Resposta automatica</Label>
        <Textarea
          placeholder="Digite a resposta que o bot enviara quando o cliente escolher esta opcao..."
          value={resposta}
          onChange={(e) => setResposta(e.target.value)}
          rows={5}
        />
        <p className="text-[11px] text-gray-400">
          Use *texto* para negrito, _texto_ para italico. Variaveis: {"{empresa}"}, {"{nome}"}, {"{telefone}"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={ativo} onCheckedChange={setAtivo} />
        <Label>Opcao ativa</Label>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={salvar}
        >
          <Zap className="h-4 w-4 mr-1 shrink-0" />
          {item ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </div>
  );
}

// =============================================
// Sub-menu form
// =============================================
interface SubMenuFormProps {
  menuId?: string;
  subItem?: SubMenuItem;
  onSave: (data: { numero: string; titulo: string; resposta: string; ativo: boolean }) => void;
  onCancel: () => void;
}

function SubMenuForm({ subItem, onSave, onCancel }: SubMenuFormProps) {
  const [numero, setNumero] = useState(subItem?.numero || "");
  const [titulo, setTitulo] = useState(subItem?.titulo || "");
  const [resposta, setResposta] = useState(subItem?.resposta || "");
  const [ativo, setAtivo] = useState(subItem?.ativo ?? true);

  function salvar() {
    if (!numero.trim() || !titulo.trim() || !resposta.trim()) {
      toast.error("Preencha todos os campos!");
      return;
    }
    onSave({ numero: numero.trim(), titulo: titulo.trim(), resposta: resposta.trim(), ativo });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[80px_1fr] gap-3">
        <div className="space-y-2">
          <Label>Numero</Label>
          <Input
            placeholder="3.1"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Titulo do sub-menu</Label>
          <Input
            placeholder="Ex: Detalhes - Corte"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Resposta</Label>
        <Textarea
          placeholder="Resposta do sub-menu..."
          value={resposta}
          onChange={(e) => setResposta(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={ativo} onCheckedChange={setAtivo} />
        <Label>Sub-opcao ativa</Label>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={salvar}
        >
          {subItem ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </div>
  );
}

// =============================================
// Main component
// =============================================
export function ZapBotChatbot() {
  const {
    chatbotAtivo,
    setChatbotAtivo,
    mensagemBoasVindas,
    setMensagemBoasVindas,
    mensagemPadrao,
    setMensagemPadrao,
    menuItems,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    addSubmenuItem,
    updateSubmenuItem,
    removeSubmenuItem,
  } = useZapBotProStore();

  const [showPreview, setShowPreview] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddSub, setShowAddSub] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<{ menuId: string; sub: SubMenuItem } | null>(null);

  function copiarMensagem(texto: string) {
    navigator.clipboard.writeText(texto);
    toast.success("Mensagem copiada!");
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chatbot de Menu</h2>
          <p className="text-gray-500 text-sm mt-1">
            Configure as respostas automaticas do seu WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={chatbotAtivo}
              onCheckedChange={setChatbotAtivo}
            />
            <Label className="text-sm font-medium">
              {chatbotAtivo ? "Ativo" : "Inativo"}
            </Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-1 shrink-0" />
            Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mensagens base */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                Mensagem de Boas-Vindas
              </CardTitle>
              <CardDescription>
                Enviada quando um cliente manda a primeira mensagem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={mensagemBoasVindas}
                onChange={(e) => setMensagemBoasVindas(e.target.value)}
                rows={5}
                placeholder="Ola! Bem-vindo(a)..."
              />
              <div className="flex flex-wrap gap-1.5">
                {["{menu}", "{empresa}", "{nome}", "{telefone}"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setMensagemBoasVindas(mensagemBoasVindas + tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">
                Use *texto* para negrito e _texto_ para italico no WhatsApp
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-gray-400 shrink-0" />
                Mensagem Padrao
              </CardTitle>
              <CardDescription>
                Enviada quando o cliente digita algo que nao esta no menu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={mensagemPadrao}
                onChange={(e) => setMensagemPadrao(e.target.value)}
                rows={3}
                placeholder="Desculpe, nao entendi..."
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => copiarMensagem(mensagemPadrao)}
              >
                <Copy className="h-3 w-3 mr-1 shrink-0" />
                Copiar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview WhatsApp */}
        {showPreview && <PreviewMenu />}

        {/* Menu items (full width on mobile, right side on desktop when no preview) */}
      </div>

      {/* Menu items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Menu className="h-4 w-4 text-primary shrink-0" />
                Itens do Menu
              </CardTitle>
              <CardDescription className="mt-1">
                Opcoes que o cliente pode escolher ({menuItems.filter((m) => m.ativo).length} ativos)
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90"
              onClick={() => setShowAddItem(true)}
            >
              <Plus className="h-4 w-4 mr-1 shrink-0" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {menuItems.length === 0 ? (
            <div className="text-center py-8">
              <Menu className="h-10 w-10 text-gray-300 mx-auto mb-3 shrink-0" />
              <p className="text-sm text-gray-400">
                Nenhum item no menu. Adicione opcoes para o chatbot responder.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {menuItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Menu item */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50">
                    <span className="h-8 w-8 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold shrink-0">
                      {item.numero}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {item.titulo}
                        </span>
                        {!item.ativo && (
                          <Badge variant="secondary" className="text-[10px]">Inativo</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {item.resposta}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setShowAddSub(item.id)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setEditingItem(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 shrink-0"
                        onClick={() => {
                          removeMenuItem(item.id);
                          toast.success("Item removido!");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Sub-items */}
                  {item.submenu.length > 0 && (
                    <div className="border-t border-gray-200 bg-white">
                      {item.submenu.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center gap-3 p-2.5 pl-12 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-xs font-mono text-primary bg-primary/5 px-2 py-0.5 rounded shrink-0">
                            {sub.numero}
                          </span>
                          <span className="text-sm flex-1 truncate">{sub.titulo}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() =>
                              setEditingSub({ menuId: item.id, sub })
                            }
                          >
                            <Pencil className="h-3 w-3 shrink-0" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 shrink-0"
                            onClick={() => {
                              removeSubmenuItem(item.id, sub.id);
                              toast.success("Sub-item removido!");
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview mobile (below menu) */}
      {showPreview && (
        <div className="lg:hidden">
          <PreviewMenu />
        </div>
      )}

      {/* Dialog: Add/Edit Menu Item */}
      <Dialog
        open={showAddItem || !!editingItem}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddItem(false);
            setEditingItem(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Opcao" : "Nova Opcao do Menu"}
            </DialogTitle>
          </DialogHeader>
          <MenuItemForm
            item={editingItem || undefined}
            onSave={(data) => {
              if (editingItem) {
                updateMenuItem(editingItem.id, data);
                toast.success("Opcao atualizada!");
              } else {
                addMenuItem(data);
                toast.success("Opcao adicionada!");
              }
              setShowAddItem(false);
              setEditingItem(null);
            }}
            onCancel={() => {
              setShowAddItem(false);
              setEditingItem(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog: Add Sub-item */}
      <Dialog
        open={!!showAddSub}
        onOpenChange={(open) => {
          if (!open) setShowAddSub(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Sub-Menu</DialogTitle>
          </DialogHeader>
          <SubMenuForm
            onSave={(data) => {
              if (showAddSub) {
                addSubmenuItem(showAddSub, data);
                toast.success("Sub-menu adicionado!");
              }
              setShowAddSub(null);
            }}
            onCancel={() => setShowAddSub(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Sub-item */}
      <Dialog
        open={!!editingSub}
        onOpenChange={(open) => {
          if (!open) setEditingSub(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Sub-Menu</DialogTitle>
          </DialogHeader>
          {editingSub && (
            <SubMenuForm
              subItem={editingSub.sub}
              onSave={(data) => {
                updateSubmenuItem(editingSub.menuId, editingSub.sub.id, data);
                toast.success("Sub-menu atualizado!");
                setEditingSub(null);
              }}
              onCancel={() => setEditingSub(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}