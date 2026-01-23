import { supabaseAdmin } from '../_supabase.js';

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

    // Obter ID do pedido da URL
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID do pedido é obrigatório' });
    }

    switch (req.method) {
      case 'GET':
        return await getOrder(req, res, user.id, id);
      case 'DELETE':
        return await deleteOrder(req, res, user.id, id);
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getOrder(req, res, userId, orderId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .eq('created_by', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar pedido:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      return res.status(500).json({ error: 'Erro ao buscar pedido' });
    }

    // Converter para formato compatível com frontend
    const order = {
      id: data.id,
      numero: data.order_number,
      cliente: data.customer_name,
      horario: data.scheduled_date,
      valor: parseFloat(data.total_value),
      deposito: parseFloat(data.deposit_value || 0),
      produtos: data.order_items.map(item => ({
        id: item.id,
        nome: item.product_name,
        quantidade: parseFloat(item.quantity),
        preco: parseFloat(item.unit_price),
        total: parseFloat(item.total_price),
        descricaoBolo: item.cake_flavor,
        nomePersonalizado: item.custom_description
      })),
      descricao: data.order_items.map(item =>
        `${item.quantity}x ${item.product_name} - R$ ${item.unit_price} = R$ ${item.total_price}`
      ).join('\n'),
      observacoes: data.special_notes,
      status: data.status
    };

    res.status(200).json(order);

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function deleteOrder(req, res, userId, orderId) {
  try {
    // Verificar se o pedido pertence ao usuário
    const { data: existingOrder, error: checkError } = await supabaseAdmin
      .from('orders')
      .select('id, created_by')
      .eq('id', orderId)
      .eq('created_by', userId)
      .single();

    if (checkError) {
      console.error('Erro ao verificar pedido:', checkError);
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      return res.status(500).json({ error: 'Erro ao verificar pedido' });
    }

    // Deletar pedido (itens serão deletados automaticamente pela FK CASCADE)
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Erro ao excluir pedido:', error);
      return res.status(500).json({ error: 'Erro ao excluir pedido' });
    }

    res.status(200).json({ message: 'Pedido excluído com sucesso' });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
