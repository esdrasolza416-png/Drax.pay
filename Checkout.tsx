import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/supabase-helpers';
import { QrCode, CreditCard, Receipt, ShieldCheck, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Checkout() {
  const { productId } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [form, setForm] = useState({ name: '', email: '', cpf: '', phone: '' });
  const [cardForm, setCardForm] = useState({ number: '', holder: '', expiry: '', cvv: '', installments: '1' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const fetch = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', productId).single();
      if (data) setProduct(data);
    };
    fetch();
  }, [productId]);

  const handlePurchase = async () => {
    if (!form.name || !form.email) {
      toast.error('Preencha nome e e-mail');
      return;
    }
    if (!product) return;
    setLoading(true);

    const platformFee = Number(product.price) * 0.0389 + 2.49;
    const netAmount = Number(product.price) - platformFee;

    // Create sale
    const { error } = await supabase.from('sales').insert({
      product_id: product.id,
      seller_id: product.user_id,
      buyer_name: form.name,
      buyer_email: form.email,
      buyer_cpf: form.cpf,
      buyer_phone: form.phone,
      amount: product.price,
      platform_fee: Math.round(platformFee * 100) / 100,
      net_amount: Math.round(netAmount * 100) / 100,
      payment_method: paymentMethod === 'pix' ? 'pix' : paymentMethod === 'card' ? 'credit_card' : 'boleto',
      status: 'approved',
    });

    if (!error) {
      // Update seller wallet
      const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', product.user_id).single();
      if (wallet) {
        await supabase.from('wallets').update({
          available_balance: Number(wallet.available_balance) + Math.round(netAmount * 100) / 100,
        }).eq('user_id', product.user_id);
      }

      // Create notification
      await supabase.from('notifications').insert({
        user_id: product.user_id,
        title: 'Nova venda realizada!',
        message: `${form.name} comprou ${product.name} por ${formatCurrency(Number(product.price))} via ${paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'card' ? 'Cartão' : 'Boleto'}`,
        type: 'sale',
      });

      setSuccess(true);
    } else {
      toast.error('Erro ao processar pagamento');
    }
    setLoading(false);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="glass-card p-10 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold mb-2">Pagamento confirmado!</h1>
          <p className="text-muted-foreground mb-6">Sua compra foi processada com sucesso.</p>
          <p className="text-sm text-muted-foreground">Você receberá os detalhes no e-mail {form.email}</p>
        </div>
      </div>
    );
  }

  const methods = [
    { id: 'pix', label: 'Pix', icon: QrCode },
    { id: 'card', label: 'Cartão', icon: CreditCard },
    { id: 'boleto', label: 'Boleto', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xl font-heading font-bold gradient-text">Drax Pay</span>
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" /> Pagamento 100% seguro
        </div>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Product summary */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                <Receipt className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-heading font-semibold">{product.name}</h2>
              <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border text-right">
            <p className="text-3xl font-heading font-bold gradient-text">{formatCurrency(Number(product.price))}</p>
          </div>
        </div>

        {/* Customer data */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4">Dados do comprador</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Nome completo</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-input border-border mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-input border-border mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">CPF</Label>
                <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} className="bg-input border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-input border-border mt-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4">Forma de pagamento</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  paymentMethod === m.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                <m.icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">{m.label}</span>
              </button>
            ))}
          </div>

          {paymentMethod === 'pix' && (
            <div className="text-center py-4">
              <div className="w-40 h-40 bg-secondary rounded-lg mx-auto mb-3 flex items-center justify-center">
                <QrCode className="w-20 h-20 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">QR Code será gerado após confirmar</p>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Número do cartão</Label>
                <Input value={cardForm.number} onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })} placeholder="0000 0000 0000 0000" className="bg-input border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Nome impresso</Label>
                <Input value={cardForm.holder} onChange={(e) => setCardForm({ ...cardForm, holder: e.target.value })} className="bg-input border-border mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Validade</Label>
                  <Input value={cardForm.expiry} onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })} placeholder="MM/AA" className="bg-input border-border mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">CVV</Label>
                  <Input value={cardForm.cvv} onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })} placeholder="000" className="bg-input border-border mt-1" />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'boleto' && (
            <div className="text-center py-4">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">O boleto será gerado após confirmar</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button onClick={handlePurchase} disabled={loading} className="w-full h-12 text-base gap-2" size="lg">
          <ShieldCheck className="w-5 h-5" />
          {loading ? 'Processando...' : 'Finalizar Pagamento'}
        </Button>

        <p className="text-center text-[10px] text-muted-foreground">
          Seus dados estão protegidos com criptografia SSL 256-bit.
        </p>

        <div className="text-center text-xs text-muted-foreground space-x-3 pb-8">
          <a href="#" className="hover:text-foreground">Termos de uso</a>
          <a href="#" className="hover:text-foreground">Privacidade</a>
          <a href="#" className="hover:text-foreground">Suporte 24h</a>
        </div>
      </div>
    </div>
  );
}
