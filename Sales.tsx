import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/supabase-helpers';
import DashboardLayout from '@/components/DashboardLayout';
import { ShoppingCart, DollarSign, RefreshCw, QrCode, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Sales() {
  const { user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [tab, setTab] = useState('approved');
  const [stats, setStats] = useState({ total: 0, netAmount: 0, pixCount: 0, refunded: 0, chargeback: 0 });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('sales')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      if (data) {
        setSales(data);
        const approved = data.filter(s => s.status === 'approved');
        setStats({
          total: data.length,
          netAmount: approved.reduce((s, v) => s + Number(v.net_amount), 0),
          pixCount: approved.filter(s => s.payment_method === 'pix').length,
          refunded: data.filter(s => s.status === 'refunded').reduce((s, v) => s + Number(v.amount), 0),
          chargeback: data.filter(s => s.status === 'chargeback').length,
        });
      }
    };
    fetch();
  }, [user]);

  const kpis = [
    { label: 'Total de transações', value: stats.total.toString(), icon: ShoppingCart },
    { label: 'Receita após taxas', value: formatCurrency(stats.netAmount), icon: DollarSign },
    { label: 'Pagamentos via Pix', value: stats.pixCount.toString(), icon: QrCode },
    { label: 'Total reembolsado', value: formatCurrency(stats.refunded), icon: RefreshCw },
    { label: 'Disputas financeiras', value: stats.chargeback.toString(), icon: AlertTriangle },
  ];

  const filteredSales = sales.filter(s => s.status === tab);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Minhas Vendas</h1>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <k.icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{k.label}</span>
              </div>
              <p className="text-xl font-heading font-bold">{k.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-0">
          {['approved', 'pending', 'refunded'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'approved' ? 'Aprovadas' : t === 'pending' ? 'Pendentes' : 'Reembolsadas'}
            </button>
          ))}
        </div>

        {filteredSales.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold mb-2">Nenhuma venda encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4">Publique seu produto e comece a divulgar.</p>
            <Link to="/products"><Button className="gap-2"><Plus className="w-4 h-4" /> Criar Produto</Button></Link>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Comprador</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Método</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Valor</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSales.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3">
                      <p className="font-medium">{s.buyer_name}</p>
                      <p className="text-xs text-muted-foreground">{s.buyer_email}</p>
                    </td>
                    <td className="p-3 capitalize">{s.payment_method === 'credit_card' ? 'Cartão' : s.payment_method}</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(Number(s.net_amount))}</td>
                    <td className="p-3 text-right text-muted-foreground">{new Date(s.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
