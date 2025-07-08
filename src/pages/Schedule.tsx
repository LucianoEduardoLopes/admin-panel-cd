import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Schedule {
  id: string;
  dia_semana: string;
  hora_inicio: string | null;
  hora_fim: string | null;
  is_open?: boolean;
}

interface ScheduleData {
  [key: string]: {
    id: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

const WEEKDAYS = [
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca', label: 'Terça-feira' },
  { key: 'quarta', label: 'Quarta-feira' },
  { key: 'quinta', label: 'Quinta-feira' },
  { key: 'sexta', label: 'Sexta-feira' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('horarios_funcionamento')
        .select('*');

      if (error) throw error;

      const scheduleMap: ScheduleData = {};
      
      // Inicializar todos os dias
      WEEKDAYS.forEach(day => {
        scheduleMap[day.key] = {
          id: '',
          isOpen: false,
          openTime: '09:00',
          closeTime: '18:00'
        };
      });

      // Preencher com dados existentes
      data?.forEach((schedule: Schedule) => {
        if (schedule.dia_semana) {
          scheduleMap[schedule.dia_semana] = {
            id: schedule.id,
            isOpen: !!(schedule.hora_inicio && schedule.hora_fim),
            openTime: schedule.hora_inicio || '09:00',
            closeTime: schedule.hora_fim || '18:00'
          };
        }
      });

      setScheduleData(scheduleMap);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar horários de funcionamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = (day: string, field: string, value: any) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Preparar dados para inserção/atualização
      const schedulePromises = WEEKDAYS.map(async (day) => {
        const dayData = scheduleData[day.key];
        
        const scheduleEntry = {
          dia_semana: day.key,
          hora_inicio: dayData.isOpen ? dayData.openTime : null,
          hora_fim: dayData.isOpen ? dayData.closeTime : null,
        };

        if (dayData.id) {
          // Atualizar registro existente
          return supabase
            .from('horarios_funcionamento')
            .update(scheduleEntry)
            .eq('id', dayData.id);
        } else {
          // Criar novo registro
          return supabase
            .from('horarios_funcionamento')
            .insert([{ ...scheduleEntry, id: crypto.randomUUID() }]);
        }
      });

      const results = await Promise.all(schedulePromises);
      const hasError = results.some(result => result.error);

      if (hasError) {
        throw new Error('Erro ao salvar alguns horários');
      }

      toast({
        title: "Sucesso",
        description: "Horários de funcionamento salvos com sucesso!",
      });

      // Recarregar dados
      fetchSchedule();
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar horários de funcionamento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-3xl font-bold text-foreground">Horários de Funcionamento</h1>
          <p className="text-muted-foreground mt-2">
            Configure os horários de funcionamento da sua loja
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Horários
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configuração de Horários
          </CardTitle>
          <CardDescription>
            Defina os horários de funcionamento para cada dia da semana
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {WEEKDAYS.map((day) => (
            <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-32">
                <Label className="font-medium">{day.label}</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={scheduleData[day.key]?.isOpen || false}
                  onCheckedChange={(checked) => handleScheduleChange(day.key, 'isOpen', checked)}
                />
                <Label className="text-sm text-muted-foreground">
                  {scheduleData[day.key]?.isOpen ? 'Aberto' : 'Fechado'}
                </Label>
              </div>

              {scheduleData[day.key]?.isOpen && (
                <div className="flex items-center gap-4 ml-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Abertura:</Label>
                    <Input
                      type="time"
                      value={scheduleData[day.key]?.openTime || '09:00'}
                      onChange={(e) => handleScheduleChange(day.key, 'openTime', e.target.value)}
                      className="w-32"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Fechamento:</Label>
                    <Input
                      type="time"
                      value={scheduleData[day.key]?.closeTime || '18:00'}
                      onChange={(e) => handleScheduleChange(day.key, 'closeTime', e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule;