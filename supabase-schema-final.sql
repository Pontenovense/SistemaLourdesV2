-- Schema para Sistema Confeitaria Lourdes
-- Execute este script no SQL Editor do Supabase

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (para autenticação)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_abbreviated TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  description TEXT,
  category TEXT DEFAULT 'Diversos',
  type_snack TEXT CHECK (type_snack IN ('frito_promocional', 'frito_normal', 'frito_promocional_count', 'assado', 'null')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number INTEGER UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  total_value DECIMAL(10,2) NOT NULL CHECK (total_value >= 0),
  deposit_value DECIMAL(10,2) DEFAULT 0 CHECK (deposit_value >= 0),
  remaining_value DECIMAL(10,2) GENERATED ALWAYS AS (total_value - deposit_value) STORED,
  special_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL, -- Nome no momento da criação (caso produto seja alterado)
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  is_custom BOOLEAN DEFAULT FALSE, -- Para produtos "DIVERSOS"
  custom_description TEXT, -- Descrição personalizada
  cake_flavor TEXT, -- Para bolos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para produtos (todos autenticados podem ver e gerenciar)
CREATE POLICY "Authenticated users can view products" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE TO authenticated USING (true);

-- Políticas RLS para pedidos
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own orders" ON orders
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Políticas RLS para itens do pedido
CREATE POLICY "Users can view items from their orders" ON order_items
  FOR SELECT TO authenticated USING (
    order_id IN (
      SELECT id FROM orders WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT TO authenticated WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update items from their orders" ON order_items
  FOR UPDATE TO authenticated USING (
    order_id IN (
      SELECT id FROM orders WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their orders" ON order_items
  FOR DELETE TO authenticated USING (
    order_id IN (
      SELECT id FROM orders WHERE created_by = auth.uid()
    )
  );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar número sequencial do pedido
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(order_number), 0) + 1 INTO next_number FROM orders;
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para definir order_number automaticamente
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number = generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Dados iniciais (produtos existentes)
INSERT INTO products (name, name_abbreviated, price, description, category, type_snack) VALUES
('Salgado Mix', 'salg mix', 0.90, 'Salgado frito - valor por unidade', 'Salgados', 'null'),
('Coxinha', 'Coxinha', 0.90, 'Salgado frito - valor por unidade', 'Salgados', 'frito_promocional'),
('Risoles de carne', 'Risoles carne', 0.90, 'Salgado frito - valor por unidade', 'Salgados', 'frito_promocional'),
('Risoles de palmito', 'Risoles palmito', 1.20, 'Salgado frito - valor por unidade', 'Salgados', 'frito_promocional_count'),
('Kibe', 'Kibe', 0.90, 'Salgado frito - valor por unidade', 'Salgados', 'frito_promocional'),
('Bolinha de queijo', 'B.queijo', 0.90, 'Salgado frito - valor por unidade', 'Salgados', 'frito_promocional'),
('Croquete de presunto e queijo', 'Balão', 0.90, 'Salgado frito - valor por unidade', 'Salgados', 'frito_promocional'),
('Enroladinho de vina', 'Enroladinho vina', 0.90, 'Salgado frito - valor por unidade', 'Salgados', 'frito_promocional'),
('Pastel de carne', 'Pastel carne', 1.10, 'Salgado frito - valor por unidade', 'Salgados', 'frito_normal'),
('Pastel de queijo', 'Pastel queijo', 1.10, 'Salgado frito - valor por unidade', 'Salgados', 'frito_normal'),
('Bolinho de aipim c/ carne seca', 'B. aipim', 1.20, 'Salgado frito - valor por unidade', 'Salgados', 'frito_normal'),
('Mini churros de doce de leite', 'Churros frito', 1.20, 'Salgado frito - valor por unidade', 'Salgados', 'frito_normal'),
('Doguinho assado', 'Doguinho', 1.20, 'Salgado assado - valor por unidade', 'Salgados', 'assado'),
('Esfiha de carne', 'Esfiha carne', 1.20, 'Salgado assado - valor por unidade', 'Salgados', 'assado'),
('Esfiha de frango', 'Esfiha frango', 1.20, 'Salgado assado - valor por unidade', 'Salgados', 'assado'),
('Folhado de frango', 'Folh. frango', 1.20, 'Salgado assado - valor por unidade', 'Salgados', 'assado'),
('Folhado de palmito', 'Folh. palmito', 1.20, 'Salgado assado - valor por unidade', 'Salgados', 'assado'),
('Brigadeiro', 'Brigadeiro', 1.60, 'Doce - valor por unidade', 'Doces', null),
('Cajuzinho', 'Caju', 1.60, 'Doce - valor por unidade', 'Doces', null),
('Brigadeiro Branco', 'Brig. Branco', 1.60, 'Doce - valor por unidade', 'Doces', null),
('Beijinho', 'Beijinho', 1.60, 'Doce - valor por unidade', 'Doces', null),
('Dois Amores', '2 Amores', 1.60, 'Doce - valor por unidade', 'Doces', null),
('Amendoim', 'Amendoim', 1.60, 'Doce - valor por unidade', 'Doces', null),
('Bicho de pé', 'Bicho pé', 1.60, 'Doce - valor por unidade', 'Doces', null),
('Brigadeiro de Churros', 'Brig. Churros', 1.70, 'Doce - valor por unidade', 'Doces', null),
('Olho de Sogra', 'Olho Sogra', 1.70, 'Doce - valor por unidade', 'Doces', null),
('Leite ninho com nutella', 'ninho nutella', 1.80, 'Doce - valor por unidade', 'Doces', null),
('Surpresa de Uva', 'Surp. Uva', 1.80, 'Doce - valor por unidade', 'Doces', null),
('Mini donuts', 'Mini donuts', 2.50, 'Doce - valor por unidade', 'Doces', null),
('Mini brownie', 'Mini brownie', 3.00, 'Doce - valor por unidade', 'Doces', null),
('Oreo surprise', 'Oreo surprise', 3.00, 'Doce - valor por unidade', 'Doces', null),
('Ouriço de coco queimado', 'Ouriço', 2.00, 'Doce - valor por unidade', 'Doces', null),
('Bombom Cereja', 'Bomb. Cereja', 3.00, 'Doce - valor por unidade', 'Doces', null),
('Bombom Uva', 'Bomb. Uva', 3.00, 'Doce - valor por unidade', 'Doces', null),
('Bombom de Morango', 'Bomb. Morango', 4.00, 'Doce - valor por unidade', 'Doces', null),
('Brigadeiro Ferreiro', 'Ferreiro', 2.10, 'Doce - valor por unidade', 'Doces', null),
('Caixa Doce Mix 42un', 'Cx Doce Mix 42un', 70.00, 'Caixa de doces - valor por caixa', 'Doces', null),
('Caixa Doce Mix 100un', 'Cx Doce Mix 100un', 170.00, 'Caixa de doces - valor por caixa', 'Doces', null),
('Bolo', 'Bolo', 90.00, 'Bolos', 'Doces', null),
('Nega Maluca', 'Nega Maluca', 40.00, 'Bolos', 'Doces', null),
('Bolo Cenoura', 'Bolo Cenoura', 40.00, 'Bolos', 'Doces', null),
('Morango do Amor', 'Morango Amor', 10.00, 'Morango do Amor❤️', 'Doces', null),
('Bandeja Morango do Amor', 'Bandeja Morango Amor', 25.00, '5un Morango do Amor❤️', 'Doces', null),
('Bolo de Pote', 'Bolo Pote', 15.00, 'Bolo de Pote', 'Doces', null),
('Copo da Felicidade', 'Copo Felicidade', 15.00, 'Copo da Felicidade', 'Doces', null),
('Brownie', 'Brownie', 10.00, 'Brownie', 'Doces', null),
('DIVERSOS', 'DIVERSOS', 0.00, 'Produto personalizado - nome e preço definidos no pedido', 'Diversos', null);
