const router=require('express').Router();
const {Product,User,Artist,Order,Category}=require('../models');
const {authenticate,requireRole}=require('../middleware/auth');
const {success,productResponse,userResponse}=require('../utils/api');
const productInclude=[{model:Artist,as:'artist',include:[{model:User,as:'user'}]},{model:Category,as:'category'}];

router.use(authenticate,requireRole('ADMIN'));
router.get('/users',async(req,res,next)=>{try{res.json((await User.findAll()).map(userResponse));}catch(e){next(e);}});
router.put('/users/:id/role',async(req,res,next)=>{try{const u=await User.findByPk(req.params.id);if(!u)return res.status(404).json({success:false,message:'User not found',data:null});const role=String(req.body.role||'').toUpperCase();if(!['CUSTOMER','ARTIST','ADMIN'].includes(role))return res.status(400).json({success:false,message:`Invalid role: ${req.body.role}`,data:null});await u.update({role});if(role==='ARTIST'&&!await Artist.findOne({where:{userId:u.id}}))await Artist.create({userId:u.id,isVerified:false,rating:0});success(res,'User role updated successfully',userResponse(u));}catch(e){next(e);}});
router.delete('/users/:id',async(req,res,next)=>{try{const u=await User.findByPk(req.params.id);if(!u)return res.status(404).json({success:false,message:'User not found',data:null});await u.destroy();success(res,'User deleted successfully',null);}catch(e){next(e);}});
router.get('/products',async(req,res,next)=>{try{const page=Math.max(Number(req.query.page||0),0),size=Math.min(Math.max(Number(req.query.size||10),1),50);const {rows,count}=await Product.findAndCountAll({include:productInclude,order:[['createdAt','DESC']],limit:size,offset:page*size,distinct:true});const totalPages=Math.ceil(count/size);res.json({content:rows.map(productResponse),page,size,totalElements:count,totalPages,last:page>=totalPages-1});}catch(e){next(e);}});
router.delete('/products/:id',async(req,res,next)=>{try{const p=await Product.findByPk(req.params.id);if(!p)return res.status(404).json({success:false,message:'Product not found',data:null});await p.destroy();success(res,'Product deleted successfully',null);}catch(e){next(e);}});
router.get('/reports/summary',async(req,res,next)=>{try{const [totalUsers,totalProducts,totalOrders,totalRevenue]=await Promise.all([User.count(),Product.count(),Order.count(),Order.sum('totalAmount')]);success(res,'Report summary retrieved successfully',{totalUsers,totalProducts,totalOrders,totalRevenue:totalRevenue||0});}catch(e){next(e);}});
module.exports=router;
