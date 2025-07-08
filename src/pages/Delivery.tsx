import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Truck, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeliverySettings {
  id: string;
  max_km: number | null;
  price: number | null;
  time_min: number | null;
}

const Delivery = () => {
  const [deliveryData, setDeliveryData] = useState({
    id: '',
    type: 'fixo' as 'fixo' | 'por_km',
    price: '',
    maxDistance: '',
    minOrderValue: '',
    timeMin: '',
    active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeliverySettings();
  }, []);

  const fetchDeliverySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('frete')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setDeliveryData({
          id: data.id,
          type: 'fixo', // Assumindo tipo fixo por padrão, pode ser expandido
          price: data.price?.toString() || '',
          maxDistance: data.max_km?.toString() || '',
          minOrderValue: '0', // Não existe na tabela atual, pode ser adicionado
          timeMin: data.time_min?.toString() || '',
          active: true
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de frete:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações de frete",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const deliverySettings = {
        max_km: deliveryData.maxDistance ? parseFloat(deliveryData.maxDistance) : null,
        price: deliveryData.price ? parseFloat(deliveryData.price) : null,
        time_min: deliveryData.timeMin ? parseInt(deliveryData.timeMin) : null,
      };

      let error;

      if (deliveryData.id) {
        // Atualizar configurações existentes
        const { error: updateError } = await supabase
          .from('frete')
          .update(deliverySettings)
          .eq('id', deliveryData.id);
        error = updateError;
      } else {
        // Criar novas configurações
        const { error: insertError } = await supabase
          .from('frete')
          .insert([{ ...deliverySettings, id: crypto.randomUUID() }]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações de frete salvas com sucesso!",
      });

      // Recarregar dados
      fetchDeliverySettings();
    } catch (error) {
      console.error('Erro ao salvar configurações de frete:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações de frete",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value) || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações de Frete</h1>
          <p className="text-muted-foreground mt-2">
            Configure as regras de entrega da sua loja
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Tipo de Frete
            </CardTitle>
            <CardDescription>
              Escolha como o frete será calculado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Cálculo</Label>
              <Select
                value={deliveryData.type}
                onValueChange={(value: 'fixo' | 'por_km') => setDeliveryData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixo">Frete Fixo</SelectItem>
                  <SelectItem value="por_km">Por Quilometragem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={deliveryData.active}
                onCheckedChange={(checked) => setDeliveryData(prev => ({ ...prev, active: checked }))}
              />
              <Label>Entrega ativa</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações de Preço</CardTitle>
            <CardDescription>
              Defina os valores e limites de entrega
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  {deliveryData.type === 'fixo' ? 'Valor do Frete' : 'Valor por KM'}
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={deliveryData.price}
                  onChange={(e) => setDeliveryData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0,00"
                />
                {deliveryData.price && (
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(deliveryData.price)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDistance">Distância Máxima (KM)</Label>
                <Input
                  id="maxDistance"
                  type="number"
                  step="0.1"
                  min="0"
                  value={deliveryData.maxDistance}
                  onChange={(e) => setDeliveryData(prev => ({ ...prev, maxDistance: e.target.value }))}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minOrderValue">Valor Mínimo do Pedido</Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={deliveryData.minOrderValue}
                  onChange={(e) => setDeliveryData(prev => ({ ...prev, minOrderValue: e.target.value }))}
                  placeholder="0,00"
                />
                {deliveryData.minOrderValue && parseFloat(deliveryData.minOrderValue) > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(deliveryData.minOrderValue)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeMin">Tempo de Entrega (minutos)</Label>
                <Input
                  id="timeMin"
                  type="number"
                  min="0"
                  value={deliveryData.timeMin}
                  onChange={(e) => setDeliveryData(prev => ({ ...prev, timeMin: e.target.value }))}
                  placeholder="30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo das Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo de frete:</span>
                <span className="font-medium">
                  {deliveryData.type === 'fixo' ? 'Frete Fixo' : 'Por Quilometragem'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {deliveryData.type === 'fixo' ? 'Valor do frete:' : 'Valor por KM:'}
                </span>
                <span className="font-medium">
                  {deliveryData.price ? formatPrice(deliveryData.price) : 'Não definido'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distância máxima:</span>
                <span className="font-medium">
                  {deliveryData.maxDistance ? `${deliveryData.maxDistance} km` : 'Não definido'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tempo de entrega:</span>
                <span className="font-medium">
                  {deliveryData.timeMin ? `${deliveryData.timeMin} minutos` : 'Não definido'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${deliveryData.active ? 'text-green-600' : 'text-red-600'}`}>
                  {deliveryData.active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Delivery;
