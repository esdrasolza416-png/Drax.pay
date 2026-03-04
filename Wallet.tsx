import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/supabase-helpers';
import DashboardLayout from '@/components/DashboardLayout';
import { Wallet as WalletIcon, ArrowDownToLine, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: w } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
      if (w) setWallet(w);
      const { data: wd } = await supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (wd) setWithdrawals(wd);
    };
    fetch();

    const channel = supabase
      .channel('wallet-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleWithdraw = async () => {
    if (!user || !wallet) return;
    const val = parseFloat(amount);
    if (!val || val < 10) {
      toast.error('Valor mínimo: R$ 10,00');
      return;
    }
    if (val > Number(wallet.available_balance)) {
      toast.error('Saldo insuficiente');
      return;
    }
    setLoading(true);
    const fee = 2;
    const netAmount = val - fee;
    const { error } = await supabase.from('withdrawals').insert({
      user_id: user.id,
      amount: val,
      fee,
      net_amount: netAmount,
      status: 'pending',
    });
    if (!error) {
      await supabase.from('wallets').update({
        available_balance: Number(wallet.available_balance) - val,
        total_withdrawn: Number(wallet.total_withdrawn) + netAmount,
      }).eq('user_id', user.id);
      toast.success('Saque solicitado!');
      setAmount('');
    } else {
      toast.error('Erro ao solicitar saque');
    }
    setLoading(false);
  };

  const statusIcon = (s: string) => {
    if (s === 'completed') return <CheckCircle className="w-4 h-4 text-success" />;
    if (s === 'rejected') return <XCircle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-warning" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Carteira</h1>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card p-6 border-l-2 border-l-primary glow-border">
            <p className="text-sm text-muted-foreground mb-1">Saldo disponível</p>
            <p className="text-3xl font-heading font-bold">{formatCurrency(Number(wallet?.available_balance || 0))}</p>
            <p className="text-xs text-muted-foreground mt-1">Disponível para saque imediato</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Saldo pendente</p>
            <p className="text-2xl font-heading font-bold">{formatCurrency(Number(wallet?.pending_balance || 0))}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Total sacado</p>
            <p className="text-2xl font-heading font-bold">{formatCurrency(Number(wallet?.total_withdrawn || 0))}</p>
          </div>
        </div>

        {/* Withdraw */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-primary" /> Solicitar Saque
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Valor do saque (R$)</Label>
              <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="bg-input border-border mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Mínimo: R$ 10,00 • Taxa: R$ 2,00</p>
            </div>
            <div className="flex items-end">
              <Button onClick={handleWithdraw} disabled={loading} className="w-full gap-2">
                <WalletIcon className="w-4 h-4" /> {loading ? 'Processando...' : 'Solicitar Saque'}
              </Button>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4">Histórico de Saques</h3>
          {withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum saque realizado</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    {statusIcon(w.status)}
                    <div>
                      <p className="font-medium">{formatCurrency(Number(w.net_amount))}</p>
                      <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <Badge variant={w.status === 'completed' ? 'default' : w.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {w.status === 'completed' ? 'Concluído' : w.status === 'rejected' ? 'Recusado' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
