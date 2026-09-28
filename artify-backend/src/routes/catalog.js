const router = require('express').Router();
const { Op } = require('sequelize');
const { Product, Artist, User, Category, Review } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { success, productResponse, userResponse } = require('../utils/api');

const productInclude = [
  { model: Artist, as:'artist', include:[{model:User,as:'user',attributes:['id','name','email','phone','address','avatarUrl','role','createdAt']}] },
  { model: Category, as:'category' }
];

function paged(content,page,size,totalElements) {
  const totalPages = Math.ceil(totalElements / size);
  return { content, page, size, totalElements, totalPages, last: page >= totalPages - 1 };
}

router.get('/products/search', async (req,res,next)=>{
  try {
    const q=String(req.query.q||'').trim(), page=Math.max(Number(req.query.page||0),0), size=Math.min(Math.max(Number(req.query.size||10),1),50);
    const where={ [Op.or]:[{title:{[Op.like]:`%${q}%`}},{description:{[Op.like]:`%${q}%`}}] };
    const {rows,count}=await Product.findAndCountAll({where,include:productInclude,order:[['createdAt','DESC']],limit:size,offset:page*size,distinct:true});
    res.json(paged(rows.map(productResponse),page,size,count));
  } catch(e){next(e);}
});

router.get('/products', async(req,res,next)=>{
  try {
    const page=Math.max(Number(req.query.page||0),0), size=Math.min(Math.max(Number(req.query.size||10),1),50);
    const where={};
    if(req.query.search?.trim()) where[Op.or]=[{title:{[Op.like]:`%${req.query.search.trim()}%`}},{description:{[Op.like]:`%${req.query.search.trim()}%`}}];
    else if(req.query.category) where.categoryId=Number(req.query.category);
    else if(req.query.minPrice !== undefined && req.query.maxPrice !== undefined) where.price={[Op.between]:[Number(req.query.minPrice),Number(req.query.maxPrice)]};
    const allowedSort=['createdAt','price','title','stock','status'];
    const sort=allowedSort.includes(req.query.sortBy)?req.query.sortBy:'createdAt';
    const dir=String(req.query.sortDir||'desc').toUpperCase()==='ASC'?'ASC':'DESC';
    const {rows,count}=await Product.findAndCountAll({where,include:productInclude,order:[[sort,dir]],limit:size,offset:page*size,distinct:true});
    res.json(paged(rows.map(productResponse),page,size,count));
  }catch(e){next(e);}
});

router.get('/products/artist/:artistId',async(req,res,next)=>{
 try{const rows=await Product.findAll({where:{artistId:Number(req.params.artistId)},include:productInclude});res.json(rows.map(productResponse));}catch(e){next(e);}
});

router.get('/products/:id',async(req,res,next)=>{
 try{const p=await Product.findByPk(req.params.id,{include:productInclude});if(!p)return res.status(404).json({success:false,message:`Product not found with id: ${req.params.id}`,data:null});success(res,'Product retrieved successfully',productResponse(p));}catch(e){next(e);}
});

router.post('/products',authenticate,requireRole('ARTIST'),async(req,res,next)=>{
 try{
  const {title,description,price,imageUrl,categoryId,stock,status='ACTIVE'}=req.body;
  if(!title||title.length<2||title.length>200||price===undefined||categoryId===undefined||stock===undefined)return res.status(400).json({success:false,message:'Invalid product fields',data:null});
  const artist=await Artist.findOne({where:{userId:req.user.id}});if(!artist)return res.status(404).json({success:false,message:'Artist not found',data:null});
  const category=await Category.findByPk(categoryId);if(!category)return res.status(404).json({success:false,message:`Category not found with id: ${categoryId}`,data:null});
  const p=await Product.create({title,description,price,imageUrl,stock,status:String(status).toUpperCase(),artistId:artist.id,categoryId:category.id});
  const result=await Product.findByPk(p.id,{include:productInclude});res.status(201).json({success:true,message:'Product created successfully',data:productResponse(result)});
 }catch(e){next(e);}
});

router.put('/products/:id',authenticate,requireRole('ARTIST'),async(req,res,next)=>{
 try{
  const p=await Product.findByPk(req.params.id);if(!p)return res.status(404).json({success:false,message:'Product not found',data:null});
  const artist=await Artist.findOne({where:{userId:req.user.id}});if(!artist||p.artistId!==artist.id)return res.status(403).json({success:false,message:'You are not authorized to update this product',data:null});
  const {title,description,price,imageUrl,categoryId,stock,status}=req.body;
  if(categoryId!==undefined){if(!(await Category.findByPk(categoryId)))return res.status(404).json({success:false,message:'Category not found',data:null});}
  await p.update({title,description,price,imageUrl,stock, ...(categoryId!==undefined&&{categoryId}), ...(status!==undefined&&{status:String(status).toUpperCase()})});
  const result=await Product.findByPk(p.id,{include:productInclude});success(res,'Product updated successfully',productResponse(result));
 }catch(e){next(e);}
});

router.delete('/products/:id',authenticate,requireRole('ARTIST','ADMIN'),async(req,res,next)=>{
 try{
  const p=await Product.findByPk(req.params.id);if(!p)return res.status(404).json({success:false,message:'Product not found',data:null});
  if(req.user.role!=='ADMIN'){const artist=await Artist.findOne({where:{userId:req.user.id}});if(!artist||p.artistId!==artist.id)return res.status(403).json({success:false,message:'You are not authorized to delete this product',data:null});}
  await p.destroy();success(res,'Product deleted successfully',null);
 }catch(e){next(e);}
});

router.get('/categories',async(req,res,next)=>{try{const rows=await Category.findAll();res.json(rows.map(c=>({id:c.id,name:c.name,description:c.description,imageUrl:c.imageUrl})));}catch(e){next(e);}});
router.post('/categories',authenticate,requireRole('ADMIN'),async(req,res,next)=>{try{const {name,description,imageUrl}=req.body;if(await Category.findOne({where:{name}}))return res.status(409).json({success:false,message:`Category already exists with name: ${name}`,data:null});const c=await Category.create({name,description,imageUrl});success(res,'Category created successfully',{id:c.id,name:c.name,description:c.description,imageUrl:c.imageUrl});}catch(e){next(e);}});
router.put('/categories/:id',authenticate,requireRole('ADMIN'),async(req,res,next)=>{try{const c=await Category.findByPk(req.params.id);if(!c)return res.status(404).json({success:false,message:'Category not found',data:null});await c.update(req.body);success(res,'Category updated successfully',{id:c.id,name:c.name,description:c.description,imageUrl:c.imageUrl});}catch(e){next(e);}});

router.get('/artists',async(req,res,next)=>{try{const rows=await Artist.findAll({include:[{model:User,as:'user'}]});res.json(rows.map(a=>({id:a.id,userId:a.userId,bio:a.bio,portfolioUrl:a.portfolioUrl,isVerified:a.isVerified,rating:a.rating,user:userResponse(a.user)})));}catch(e){next(e);}});
router.get('/artists/:id',async(req,res,next)=>{try{const a=await Artist.findByPk(req.params.id,{include:[{model:User,as:'user'}]});if(!a)return res.status(404).json({success:false,message:'Artist not found',data:null});success(res,'Artist retrieved successfully',{id:a.id,userId:a.userId,bio:a.bio,portfolioUrl:a.portfolioUrl,isVerified:a.isVerified,rating:a.rating,user:userResponse(a.user)});}catch(e){next(e);}});
router.put('/artists/:id/verify',authenticate,requireRole('ADMIN'),async(req,res,next)=>{try{const a=await Artist.findByPk(req.params.id);if(!a)return res.status(404).json({success:false,message:'Artist not found',data:null});await a.update({isVerified:true});const full=await Artist.findByPk(a.id,{include:[{model:User,as:'user'}]});success(res,'Artist verified successfully',{id:full.id,userId:full.userId,bio:full.bio,portfolioUrl:full.portfolioUrl,isVerified:full.isVerified,rating:full.rating,user:userResponse(full.user)});}catch(e){next(e);}});

router.post('/reviews',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{try{const {productId,rating,comment}=req.body;if(!productId||rating<1||rating>5)return res.status(400).json({success:false,message:'Invalid review',data:null});const product=await Product.findByPk(productId);if(!product)return res.status(404).json({success:false,message:'Product not found',data:null});if(await Review.findOne({where:{userId:req.user.id,productId}}))return res.status(409).json({success:false,message:'You have already reviewed this product',data:null});const r=await Review.create({userId:req.user.id,productId,rating,comment});const full=await Review.findByPk(r.id,{include:[{model:User,as:'user'}]});res.status(201).json({success:true,message:'Review created successfully',data:{id:full.id,userId:full.userId,productId:full.productId,rating:full.rating,comment:full.comment,createdAt:full.createdAt,userName:full.user.name}});}catch(e){next(e);}});
router.get('/reviews/product/:productId',async(req,res,next)=>{try{const rows=await Review.findAll({where:{productId:req.params.productId},include:[{model:User,as:'user'}]});res.json(rows.map(r=>({id:r.id,userId:r.userId,productId:r.productId,rating:r.rating,comment:r.comment,createdAt:r.createdAt,userName:r.user?.name})));}catch(e){next(e);}});
router.delete('/reviews/:id',authenticate,requireRole('CUSTOMER','ADMIN'),async(req,res,next)=>{try{const r=await Review.findByPk(req.params.id);if(!r)return res.status(404).json({success:false,message:'Review not found',data:null});if(req.user.role!=='ADMIN'&&r.userId!==req.user.id)return res.status(403).json({success:false,message:'You are not authorized to delete this review',data:null});await r.destroy();success(res,'Review deleted successfully',null);}catch(e){next(e);}});

module.exports=router;
