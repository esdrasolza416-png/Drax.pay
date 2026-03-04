import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Link2, TrendingUp } from 'lucide-react';

export default function Affiliates() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Meus Afiliados</h1>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Afiliados ativos</span>
            </div>
            <p className="text-2xl font-heading font-bold">0</p>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Links gerados</span>
            </div>
            <p className="text-2xl font-heading font-bold">0</p>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Vendas via afiliados</span>
            </div>
            <p className="text-2xl font-heading font-bold">0</p>
          </div>
        </div>

        <div className="glass-card p-10 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">Nenhum afiliado ainda</h3>
          <p className="text-sm text-muted-foreground">
            Ative a opção de afiliados nos seus produtos para permitir que outros promovam e vendam por você.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
