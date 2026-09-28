function success(res, message, data) {
  return res.json({ success: true, message, data });
}

function error(res, status, message) {
  return res.status(status).json({ success: false, message, data: null });
}

function userResponse(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    address: user.address,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt
  };
}

function productResponse(product) {
  return {
    id: product.id,
    artistId: product.artist?.id ?? product.artistId ?? null,
    categoryId: product.category?.id ?? product.categoryId ?? null,
    title: product.title,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    stock: product.stock,
    status: product.status,
    createdAt: product.createdAt,
    artistName: product.artist?.user?.name ?? null,
    categoryName: product.category?.name ?? null
  };
}

module.exports = { success, error, userResponse, productResponse };
