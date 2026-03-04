import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Trophy, FileText, LifeBuoy, BarChart3, CreditCard, QrCode, Receipt, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const benefits = [
  { icon: Zap, title: 'Saque rápido', desc: 'Receba seu dinheiro na conta em minutos.' },
  { icon: TrendingUp, title: 'Projetado para escalar', desc: 'Cresça suas vendas com taxas competitivas.' },
  { icon: Trophy, title: 'Premiações e benefícios', desc: 'Vantagens exclusivas para quem fatura mais.' },
  { icon: FileText, title: 'Menos burocracia', desc: 'Cadastro simples e rápido.' },
  { icon: LifeBuoy, title: 'Suporte 24h', desc: 'Atendimento todos os dias da semana.' },
  { icon: BarChart3, title: 'Métricas em tempo real', desc: 'Acompanhe suas vendas instantaneamente.' },
];

const paymentMethods = [
  { icon: QrCode, title: 'Pix', desc: 'Receba instantaneamente' },
  { icon: CreditCard, title: 'Cartão de Crédito', desc: 'Parcelamento automático' },
  { icon: Receipt, title: 'Boleto Bancário', desc: 'Compensação em até 3 dias' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="text-xl font-heading font-bold gradient-text">Drax Pay</Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#benefits" className="hover:text-foreground transition-colors">Recursos</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Taxas</a>
            <a href="#support" className="hover:text-foreground transition-colors">Suporte</a>
            <Link to="/login" className="hover:text-foreground transition-colors">Entrar</Link>
          </nav>
          <Link to="/register">
            <Button size="sm">Criar conta</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-6">
              Plataforma de pagamentos
            </span>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl font-heading font-bold leading-tight mb-6"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            Na Drax Pay, taxa{' '}
            <span className="gradient-text">0% no Pix</span>*
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            Receba pagamentos de forma rápida, segura e sem burocracia.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Link to="/register">
              <Button size="lg" className="gap-2 text-base px-8">
                Criar conta grátis <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#benefits">
              <Button variant="outline" size="lg" className="text-base px-8">
                Saber mais
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.h2
            className="text-3xl font-heading font-bold text-center mb-14"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Tudo que você precisa para{' '}
            <span className="gradient-text">crescer</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                className="glass-card p-6 hover:border-primary/30 transition-all duration-300"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto text-center">
          <motion.h2
            className="text-3xl font-heading font-bold mb-4"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            A melhor plataforma de pagamento para{' '}
            <span className="gradient-text">receber online</span>
          </motion.h2>
          <p className="text-muted-foreground mb-12 max-w-lg mx-auto">
            Aceite os principais métodos de pagamento do Brasil.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {paymentMethods.map((m, i) => (
              <motion.div
                key={m.title}
                className="glass-card p-8 text-center hover:glow-border transition-all duration-500"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <m.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-1">{m.title}</h3>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-heading font-bold mb-4">
              Taxas feitas para o{' '}
              <span className="gradient-text">seu negócio</span>
            </h2>
            <p className="text-muted-foreground mb-10">
              A solução de pagamento online com as melhores condições do mercado.
            </p>
            <div className="glass-card p-10 glow-border">
              <p className="text-muted-foreground text-sm mb-2">A partir de</p>
              <p className="text-5xl md:text-6xl font-heading font-bold gradient-text mb-2">
                3,89%
              </p>
              <p className="text-2xl font-heading text-muted-foreground mb-6">+ R$ 2,49</p>
              <Link to="/register">
                <Button size="lg" className="px-10">Começar agora</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Support */}
      <section id="support" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto text-center max-w-2xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-heading font-bold mb-4">
              O melhor <span className="gradient-text">suporte</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Suporte 24 horas por dia, 7 dias por semana para ajudar você a crescer.
            </p>
            <Link to="/register">
              <Button size="lg" className="px-10">Criar conta grátis</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-lg font-heading font-bold gradient-text">Drax Pay</span>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Termos de uso</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Contato</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Drax Pay. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
