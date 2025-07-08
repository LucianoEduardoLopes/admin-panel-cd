import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: string | null;
  order: number | null;
}

interface CategoryFormProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    order: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name,
          type: category.type || '',
          order: category.order?.toString() || ''
        });
      } else {
        setFormData({
          name: '',
          type: '',
          order: ''
        });
      }
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categoryData = {
        name: formData.name,
        type: formData.type || null,
        order: formData.order ? parseInt(formData.order) : null
      };

      let error;

      if (category) {
        // Editar categoria existente
        const { error: updateError } = await supabase
          .from('categorias')
          .update(categoryData)
          .eq('id', category.id);
        error = updateError;
      } else {
        // Criar nova categoria
        const { error: insertError } = await supabase
          .from('categorias')
          .insert([{ ...categoryData, id: crypto.randomUUID() }]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: category ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar categoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {category ? 'Edite as informações da categoria' : 'Preencha os dados da nova categoria'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome da categoria"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              placeholder="Tipo da categoria (ex: bebidas, pratos)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Ordem</Label>
            <Input
              id="order"
              type="number"
              min="0"
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
              placeholder="Ordem de exibição"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {category ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};