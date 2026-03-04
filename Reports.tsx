import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/supabase-helpers';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('sales')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (data) {
        const grouped: Record<string, number> = {};
        data.forEach((s) => {
          const day = new Date(s.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          grouped[day] = (grouped[day] || 0) + Number(s.net_amount);
        });
        setChartData(Object.entries(grouped).map(([date, value]) => ({ date, value })));
      }
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Relatórios</h1>

        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Vendas por período
          </h3>
          {chartData.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Dados insuficientes para gerar relatório</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
                <XAxis dataKey="date" stroke="hsl(0 0% 50%)" fontSize={12} />
                <YAxis stroke="hsl(0 0% 50%)" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 15%)', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(0 0% 95%)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Valor']}
                />
                <Bar dataKey="value" fill="hsl(152 58% 38%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
