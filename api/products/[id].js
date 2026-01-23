const { supabaseAdmin } = require('../_supabase');

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

    // Obter ID do produto da URL
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID do produto é obrigatório' });
    }

    switch (req.method) {
      case 'PUT':
        return await updateProduct(req, res, user.id, id);
      case 'DELETE':
        return await deleteProduct(req, res, user.id, id);
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function updateProduct(req, res, userId, productId) {
  try {
    const { nome, preco, descricao, categoria, tipoSalgado, nomeAbreviado } = req.body;

    if (!nome || preco === undefined || preco < 0) {
      return res.status(400).json({ error: 'Nome e preço válido são obrigatórios' });
    }

    const updateData = {
      name: nome,
      price: preco,
      description: descricao || '',
      category: categoria || 'Diversos',
      type_snack: tipoSalgado || null
    };

    if (nomeAbreviado) {
      updateData.name_abbreviated = nomeAbreviado;
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      return res.status(500).json({ error: 'Erro ao atualizar produto' });
    }

    // Retornar no formato do frontend
    const product = {
      id: data.id,
      nome: data.name,
      nomeAbreviado: data.name_abbreviated,
      preco: parseFloat(data.price),
      descricao: data.description,
      categoria: data.category,
      tipoSalgado: data.type_snack
    };

    res.status(200).json(product);

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function deleteProduct(req, res, userId, productId) {
  try {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Erro ao excluir produto:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      return res.status(500).json({ error: 'Erro ao excluir produto' });
    }

    res.status(200).json({ message: 'Produto excluído com sucesso' });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
