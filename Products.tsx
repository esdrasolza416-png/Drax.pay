import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { uploadProductImage, formatCurrency } from '@/lib/supabase-helpers';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Search, MoreVertical, Edit, Trash2, Package, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  payment_type: string;
  category: string;
  image_url: string | null;
  sales_page_url: string | null;
  guarantee_days: number;
  affiliate_enabled: boolean;
  affiliate_commission: number;
}

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', payment_type: 'one_time', category: 'digital', sales_page_url: '', guarantee_days: '7' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setProducts(data as Product[]);
  }, [user]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', description: '', price: '', payment_type: 'one_time', category: 'digital', sales_page_url: '', guarantee_days: '7' });
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price.toString(),
      payment_type: p.payment_type,
      category: p.category || 'digital',
      sales_page_url: p.sales_page_url || '',
      guarantee_days: (p.guarantee_days || 7).toString(),
    });
    setImagePreview(p.image_url);
    setImageFile(null);
    setModalOpen(true);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user || !form.name || !form.price) {
      toast.error('Preencha nome e preço');
      return;
    }
    setSaving(true);

    let imageUrl = editProduct?.image_url || null;
    if (imageFile) {
      const url = await uploadProductImage(imageFile, user.id);
      if (url) imageUrl = url;
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      payment_type: form.payment_type,
      category: form.category,
      sales_page_url: form.sales_page_url || null,
      guarantee_days: parseInt(form.guarantee_days) || 7,
      image_url: imageUrl,
      user_id: user.id,
    };

    if (editProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editProduct.id);
      if (error) toast.error('Erro ao atualizar');
      else toast.success('Produto atualizado!');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) toast.error('Erro ao criar produto');
      else toast.success('Produto criado!');
    }

    setSaving(false);
    setModalOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir');
    else { toast.success('Produto excluído'); fetchProducts(); }
  };

  const toggleStatus = async (p: Product) => {
    const newStatus = p.status === 'active' ? 'inactive' : 'active';
    await supabase.from('products').update({ status: newStatus }).eq('id', p.id);
    fetchProducts();
  };

  const filtered = products.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-heading font-bold">Meus Produtos</h1>
          <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Adicionar Produto</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-input border-border" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground">
            <option value="all">Todos</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>

        {/* Product list */}
        {filtered.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">Crie seu primeiro produto para começar a vender.</p>
            <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Criar produto</Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((p) => (
              <div key={p.id} className="glass-card p-4 flex items-center gap-4">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {p.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <h3 className="font-medium truncate">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{formatCurrency(p.price)}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(p)}><Edit className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStatus(p)}>{p.status === 'active' ? 'Pausar' : 'Ativar'}</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editProduct ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-sm text-muted-foreground">Tipo de pagamento</Label>
              <select value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })} className="w-full mt-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                <option value="one_time">Pagamento único</option>
                <option value="subscription">Assinatura</option>
              </select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Nome do produto</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do produto" className="bg-input border-border mt-1" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Descrição</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 500) })}
                placeholder="Explique o que o comprador vai receber"
                className="w-full mt-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none h-24"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{form.description.length}/500</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Categoria</Label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                <option value="digital">Digital</option>
                <option value="course">Curso</option>
                <option value="ebook">E-book</option>
                <option value="service">Serviço</option>
                <option value="physical">Físico</option>
              </select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Imagem do produto</Label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImageDrop}
                className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('product-image')?.click()}
              >
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                    <button onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-destructive-foreground" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Arraste ou clique para selecionar</p>
                    <p className="text-xs text-muted-foreground">JPG ou PNG • até 10MB</p>
                  </>
                )}
                <input id="product-image" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Página de vendas</Label>
              <Input value={form.sales_page_url} onChange={(e) => setForm({ ...form, sales_page_url: e.target.value })} placeholder="https://" className="bg-input border-border mt-1" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Preço (R$)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0,00" className="bg-input border-border mt-1" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Garantia</Label>
              <select value={form.guarantee_days} onChange={(e) => setForm({ ...form, guarantee_days: e.target.value })} className="w-full mt-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                <option value="7">7 dias</option>
                <option value="15">15 dias</option>
                <option value="30">30 dias</option>
                <option value="0">Sem garantia</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : editProduct ? 'Salvar' : 'Continuar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
