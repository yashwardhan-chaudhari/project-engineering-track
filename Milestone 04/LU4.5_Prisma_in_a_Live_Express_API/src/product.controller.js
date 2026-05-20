const prisma = require('./prisma');

const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const VALID_SORT_FIELDS = new Set(['id', 'name', 'price', 'stock']);
const VALID_SORT_ORDERS = new Set(['asc', 'desc']);
const VALID_PRODUCT_FIELDS = new Set(['id', 'name', 'price', 'stock']);

function parsePage(value) {
  if (value === undefined) return DEFAULT_PAGE;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseLimit(value) {
  if (value === undefined) return DEFAULT_LIMIT;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= MAX_LIMIT ? parsed : null;
}

async function getProducts(req, res) {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);

    if (req.query.page && page === null) {
      return res.status(400).json({ error: 'page must be a positive integer' });
    }
    if (req.query.limit && limit === null) {
      return res.status(400).json({ error: `limit must be a positive integer and no greater than ${MAX_LIMIT}` });
    }

    const sortBy = req.query.sortBy ? req.query.sortBy.trim() : 'id';
    if (!VALID_SORT_FIELDS.has(sortBy)) {
      return res.status(400).json({ error: `sortBy must be one of: ${[...VALID_SORT_FIELDS].join(', ')}` });
    }

    const order = req.query.order ? req.query.order.trim().toLowerCase() : 'asc';
    if (!VALID_SORT_ORDERS.has(order)) {
      return res.status(400).json({ error: 'order must be asc or desc' });
    }

    let select;
    if (req.query.fields) {
      const requestedFields = req.query.fields
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean);

      if (requestedFields.length === 0) {
        return res.status(400).json({ error: 'fields query cannot be empty' });
      }

      const invalidFields = requestedFields.filter((field) => !VALID_PRODUCT_FIELDS.has(field));
      if (invalidFields.length > 0) {
        return res.status(400).json({ error: `Invalid fields requested: ${invalidFields.join(', ')}` });
      }

      select = requestedFields.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {});
    }

    const total = await prisma.product.count();
    const products = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: order },
      ...(select ? { select } : {}),
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));
    res.json({
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
      data: products,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProductById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ name: product.name, price: product.price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getProducts, getProductById };