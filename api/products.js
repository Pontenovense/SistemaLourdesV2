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
        return await getProducts(req, res, user.id);
      case 'POST':
        return await createProduct(req, res, user.id);
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getProducts(req, res, userId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return res.status(500).json({ error: 'Erro ao buscar produtos' });
    }

    // Converter para formato compatível com frontend
    const products = data.map(product => ({
      id: product.id,
      nome: product.name,
      nomeAbreviado: product.name_abbreviated,
      preco: parseFloat(product.price),
      descricao: product.description,
      categoria: product.category,
      tipoSalgado: product.type_snack
    }));

    res.status(200).json(products);

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function createProduct(req, res, userId) {
  try {
    const { nome, preco, descricao, categoria, tipoSalgado } = req.body;

    if (!nome || preco === undefined || preco < 0) {
      return res.status(400).json({ error: 'Nome e preço válido são obrigatórios' });
    }

    // Gerar nome abreviado se não fornecido
    let nomeAbreviado = req.body.nomeAbreviado;
    if (!nomeAbreviado) {
      nomeAbreviado = nome.length > 15 ? nome.substring(0, 15) + '...' : nome;
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: nome,
        name_abbreviated: nomeAbreviado,
        price: preco,
        description: descricao || '',
        category: categoria || 'Diversos',
        type_snack: tipoSalgado || null
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      return res.status(500).json({ error: 'Erro ao criar produto' });
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

    res.status(201).json(product);

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
