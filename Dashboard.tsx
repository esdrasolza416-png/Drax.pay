import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/supabase-helpers';
import DashboardLayout from '@/components/DashboardLayout';
import { DollarSign, ShoppingCart, Eye, EyeOff, CreditCard, QrCode, Receipt, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [showValues, setShowValues] = useState(true);
  const [stats, setStats] = useState({ totalSales: 0, totalAmount: 0, pixAmount: 0, cardAmount: 0, boletoAmount: 0, refunded: 0 });
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const since = new Date();
      since.setDate(since.getDate() - parseInt(period));

      const { data: sales } = await supabase
        .from('sales')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'approved')
        .gte('created_at', since.toISOString());

      if (sales) {
        const totalAmount = sales.reduce((s, v) => s + Number(v.net_amount), 0);
        const pixAmount = sales.filter(s => s.payment_method === 'pix').reduce((s, v) => s + Number(v.net_amount), 0);
        const cardAmount = sales.filter(s => s.payment_method === 'credit_card').reduce((s, v) => s + Number(v.net_amount), 0);
        const boletoAmount = sales.filter(s => s.payment_method === 'boleto').reduce((s, v) => s + Number(v.net_amount), 0);
        setStats({ totalSales: sales.length, totalAmount, pixAmount, cardAmount, boletoAmount, refunded: 0 });
      }
    };
    fetchStats();
  }, [user, period]);

  const cards = [
    { label: 'Vendas realizadas', value: formatCurrency(stats.totalAmount), icon: DollarSign, accent: true },
    { label: 'Quantidade de vendas', value: stats.totalSales.toString(), icon: ShoppingCart },
  ];

  const paymentBreakdown = [
    { method: 'Pix', icon: QrCode, value: stats.pixAmount, conversion: stats.totalSales ? Math.round((stats.pixAmount / (stats.totalAmount || 1)) * 100) : 0 },
    { method: 'Cartão de Crédito', icon: CreditCard, value: stats.cardAmount, conversion: stats.totalSales ? Math.round((stats.cardAmount / (stats.totalAmount || 1)) * 100) : 0 },
    { method: 'Boleto', icon: Receipt, value: stats.boletoAmount, conversion: stats.totalSales ? Math.round((stats.boletoAmount / (stats.totalAmount || 1)) * 100) : 0 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Visão geral do seu negócio</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
            >
              <option value="1">Hoje</option>
              <option value="7">7 dias</option>
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
            </select>
            <Link to="/products">
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Criar produto</Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {cards.map((c) => (
            <div key={c.label} className={`glass-card p-6 ${c.accent ? 'border-l-2 border-l-primary glow-border' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowValues(!showValues)} className="text-muted-foreground hover:text-foreground">
                    {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <c.icon className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </div>
              <p className="text-3xl font-heading font-bold">
                {showValues ? c.value : '••••'}
              </p>
            </div>
          ))}
        </div>

        {/* Payment breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4">Meios de pagamento</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 text-muted-foreground font-medium">Meio</th>
                  <th className="text-right pb-3 text-muted-foreground font-medium">Conversão</th>
                  <th className="text-right pb-3 text-muted-foreground font-medium">Valor total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paymentBreakdown.map((p) => (
                  <tr key={p.method}>
                    <td className="py-3 flex items-center gap-2">
                      <p.icon className="w-4 h-4 text-primary" />
                      {p.method}
                    </td>
                    <td className="py-3 text-right">{p.conversion}%</td>
                    <td className="py-3 text-right font-medium">{showValues ? formatCurrency(p.value) : '••••'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty state */}
        {stats.totalSales === 0 && (
          <div className="glass-card p-10 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold mb-2">Nenhuma venda ainda</h3>
            <p className="text-sm text-muted-foreground mb-4">Publique seu produto e comece a divulgar para gerar resultados.</p>
            <Link to="/products">
              <Button className="gap-2"><Plus className="w-4 h-4" /> Criar produto</Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
