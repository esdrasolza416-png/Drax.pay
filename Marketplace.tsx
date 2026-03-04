import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/supabase-helpers';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Package, ExternalLink, Flame, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function Marketplace() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    if (category !== 'all' && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Marketplace</h1>
          <p className="text-sm text-muted-foreground">Descubra produtos para promover</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-input border-border" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground">
            <option value="all">Todas as categorias</option>
            <option value="digital">Digital</option>
            <option value="course">Curso</option>
            <option value="ebook">E-book</option>
            <option value="service">Serviço</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-sm text-muted-foreground">O marketplace ainda não tem produtos disponíveis.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="glass-card overflow-hidden hover:border-primary/30 transition-all duration-300 group">
                <div className="aspect-video bg-secondary relative overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge className="text-[10px] bg-primary/90"><Flame className="w-3 h-3 mr-1" /> Novo</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-semibold truncate mb-1">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Ganhe até</p>
                      <p className="font-heading font-bold text-primary">{formatCurrency(p.price)}</p>
                    </div>
                    <Link to={`/checkout/${p.id}`}>
                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                        <ExternalLink className="w-3 h-3" /> Ver produto
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
