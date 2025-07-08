import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Tag, Clock, Store, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOptionals: number;
  storeStatus: boolean;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOptionals: 0,
    storeStatus: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes, optionalsRes, storeRes] = await Promise.all([
          supabase.from('produtos').select('*', { count: 'exact' }),
          supabase.from('categorias').select('*', { count: 'exact' }),
          supabase.from('opcionais').select('*', { count: 'exact' }),
          supabase.from('loja').select('status').limit(1).single(),
        ]);

        setStats({
          totalProducts: productsRes.count || 0,
          totalCategories: categoriesRes.count || 0,
          totalOptionals: optionalsRes.count || 0,
          storeStatus: storeRes.data?.status || false,
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Produtos",
      value: stats.totalProducts,
      description: "Total de produtos cadastrados",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Categorias",
      value: stats.totalCategories,
      description: "Categorias de produtos",
      icon: Tag,
      color: "text-green-600",
    },
    {
      title: "Opcionais",
      value: stats.totalOptionals,
      description: "Adicionais disponíveis",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Status da Loja",
      value: stats.storeStatus ? "Aberta" : "Fechada",
      description: "Estado atual da loja",
      icon: Store,
      color: stats.storeStatus ? "text-green-600" : "text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do seu sistema iFood Admin
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Resumo do Sistema
            </CardTitle>
            <CardDescription>
              Informações importantes sobre seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status da Loja</span>
              <span className={`text-sm font-medium ${stats.storeStatus ? 'text-green-600' : 'text-red-600'}`}>
                {stats.storeStatus ? '🟢 Aberta' : '🔴 Fechada'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Produtos Ativos</span>
              <span className="text-sm font-medium">{stats.totalProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Categorias</span>
              <span className="text-sm font-medium">{stats.totalCategories}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Links para as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/products" className="block p-3 rounded-lg border hover:bg-muted transition-colors">
              <div className="font-medium">Gerenciar Produtos</div>
              <div className="text-sm text-muted-foreground">Adicionar, editar ou remover produtos</div>
            </a>
            <a href="/categories" className="block p-3 rounded-lg border hover:bg-muted transition-colors">
              <div className="font-medium">Organizar Categorias</div>
              <div className="text-sm text-muted-foreground">Criar e organizar categorias de produtos</div>
            </a>
            <a href="/store" className="block p-3 rounded-lg border hover:bg-muted transition-colors">
              <div className="font-medium">Configurar Loja</div>
              <div className="text-sm text-muted-foreground">Alterar informações da loja</div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
