import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminLayout } from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Schedule from "./pages/Schedule";
import Delivery from "./pages/Delivery";
import Orders from "./pages/Orders";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            } />
            <Route path="/products" element={
              <AdminLayout>
                <Products />
              </AdminLayout>
            } />
            <Route path="/categories" element={
              <AdminLayout>
                <Categories />
              </AdminLayout>
            } />
            <Route path="/optionals" element={
              <AdminLayout>
                <div className="text-center py-8">
                  <h1 className="text-2xl font-bold">Opcionais</h1>
                  <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
                </div>
              </AdminLayout>
            } />
            <Route path="/schedule" element={
              <AdminLayout>
                <Schedule />
              </AdminLayout>
            } />
            <Route path="/delivery" element={
              <AdminLayout>
                <Delivery />
              </AdminLayout>
            } />
            <Route path="/store" element={
              <AdminLayout>
                <div className="text-center py-8">
                  <h1 className="text-2xl font-bold">Configurações da Loja</h1>
                  <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
                </div>
              </AdminLayout>
            } />
            <Route path="/users" element={
              <AdminLayout>
                <div className="text-center py-8">
                  <h1 className="text-2xl font-bold">Usuários</h1>
                  <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
                </div>
              </AdminLayout>
            } />
            <Route path="/orders" element={
              <AdminLayout>
                <Orders />
              </AdminLayout>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
