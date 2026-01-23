import { supabaseAdmin } from './_supabase.js';

export default async function handler(req, res) {
  try {
    // Verificar autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acesso não fornecido' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    switch (req.method) {
      case 'GET':
        return await getOrders(req, res, user.id);
      case 'POST':
        return await createOrder(req, res, user.id);
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getOrders(req, res, userId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }

    // Converter para formato compatível com frontend
    const orders = data.map(order => ({
      id: order.id,
      numero: order.order_number,
      cliente: order.customer_name,
      horario: order.scheduled_date,
      valor: parseFloat(order.total_value),
      deposito: parseFloat(order.deposit_value || 0),
      produtos: order.order_items.map(item => ({
        id: item.id,
        nome: item.product_name,
        quantidade: parseFloat(item.quantity),
        preco: parseFloat(item.unit_price),
        total: parseFloat(item.total_price),
        descricaoBolo: item.cake_flavor,
        nomePersonalizado: item.custom_description
      })),
      descricao: order.order_items.map(item =>
        `${item.quantity}x ${item.product_name} - R$ ${item.unit_price} = R$ ${item.total_price}`
      ).join('\n'),
      observacoes: order.special_notes,
      status: order.status
    }));

    res.status(200).json(orders);

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function createOrder(req, res, userId) {
  try {
    const {
      cliente,
      horario,
      valor,
      deposito,
      produtos,
      observacoes
    } = req.body;

    if (!cliente || !produtos || produtos.length === 0) {
      return res.status(400).json({ error: 'Cliente e produtos são obrigatórios' });
    }

    // Iniciar transação
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: cliente,
        scheduled_date: horario,
        total_value: valor,
        deposit_value: deposito || 0,
        special_notes: observacoes,
        created_by: userId
      })
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError);
      return res.status(500).json({ error: 'Erro ao criar pedido' });
    }

    // Inserir itens do pedido
    const orderItems = produtos.map(produto => ({
      order_id: orderData.id,
      product_id: produto.id || null,
      product_name: produto.nome,
      quantity: produto.quantidade,
      unit_price: produto.preco,
      total_price: produto.total,
      custom_description: produto.nomePersonalizado,
      cake_flavor: produto.descricaoBolo
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Erro ao criar itens do pedido:', itemsError);
      // Tentar remover pedido se itens falharam
      await supabaseAdmin.from('orders').delete().eq('id', orderData.id);
      return res.status(500).json({ error: 'Erro ao criar itens do pedido' });
    }

    // Buscar pedido completo
    const { data: fullOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderData.id)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar pedido criado:', fetchError);
      return res.status(500).json({ error: 'Erro ao buscar pedido criado' });
    }

    // Retornar no formato do frontend
    const order = {
      id: fullOrder.id,
      numero: fullOrder.order_number,
      cliente: fullOrder.customer_name,
      horario: fullOrder.scheduled_date,
      valor: parseFloat(fullOrder.total_value),
      deposito: parseFloat(fullOrder.deposit_value || 0),
      produtos: fullOrder.order_items.map(item => ({
        id: item.id,
        nome: item.product_name,
        quantidade: parseFloat(item.quantity),
        preco: parseFloat(item.unit_price),
        total: parseFloat(item.total_price),
        descricaoBolo: item.cake_flavor,
        nomePersonalizado: item.custom_description
      })),
      descricao: fullOrder.order_items.map(item =>
        `${item.quantity}x ${item.product_name} - R$ ${item.unit_price} = R$ ${item.total_price}`
      ).join('\n'),
      observacoes: fullOrder.special_notes,
      status: fullOrder.status
    };

    res.status(201).json(order);

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
