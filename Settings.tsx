import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { uploadAvatar } from '@/lib/supabase-helpers';
import DashboardLayout from '@/components/DashboardLayout';
import { Camera, Save, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ full_name: '', bank_name: '', bank_agency: '', bank_account: '', pix_key: '' });
  const [passwords, setPasswords] = useState({ current: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (data) {
        setProfile(data);
        setForm({
          full_name: data.full_name || '',
          bank_name: data.bank_name || '',
          bank_agency: data.bank_agency || '',
          bank_account: data.bank_account || '',
          pix_key: data.pix_key || '',
        });
        setAvatarPreview(data.avatar_url);
      }
    };
    fetch();
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    let avatarUrl = profile?.avatar_url;
    if (avatarFile) {
      const url = await uploadAvatar(avatarFile, user.id);
      if (url) avatarUrl = url;
    }

    const { error } = await supabase.from('profiles').update({
      ...form,
      avatar_url: avatarUrl,
    }).eq('user_id', user.id);

    if (error) toast.error('Erro ao salvar');
    else toast.success('Perfil atualizado!');
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.confirm) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (passwords.new_password.length < 6) {
      toast.error('Mínimo 6 caracteres');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: passwords.new_password });
    if (error) toast.error('Erro ao alterar senha');
    else {
      toast.success('Senha alterada!');
      setPasswords({ current: '', new_password: '', confirm: '' });
    }
  };

  const initials = form.full_name ? form.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-heading font-bold">Configurações</h1>

        {/* Avatar */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4">Foto de perfil</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-lg">{initials}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">JPG ou PNG, máximo 5MB</p>
          </div>
        </div>

        {/* Profile */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4">Dados pessoais</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Nome completo</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="bg-input border-border mt-1" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">E-mail</Label>
              <Input value={user?.email || ''} disabled className="bg-input border-border mt-1 opacity-60" />
            </div>
          </div>
        </div>

        {/* Bank */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4">Dados bancários</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Banco</Label>
              <Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="Ex: Nubank" className="bg-input border-border mt-1" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Agência</Label>
              <Input value={form.bank_agency} onChange={(e) => setForm({ ...form, bank_agency: e.target.value })} className="bg-input border-border mt-1" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Conta</Label>
              <Input value={form.bank_account} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} className="bg-input border-border mt-1" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Chave Pix</Label>
              <Input value={form.pix_key} onChange={(e) => setForm({ ...form, pix_key: e.target.value })} className="bg-input border-border mt-1" />
            </div>
          </div>
        </div>

        <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar perfil'}
        </Button>

        {/* Password */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> Alterar senha</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Nova senha</Label>
              <Input type="password" value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} className="bg-input border-border mt-1" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Confirmar nova senha</Label>
              <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="bg-input border-border mt-1" />
            </div>
            <Button variant="outline" onClick={handleChangePassword}>Alterar senha</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
