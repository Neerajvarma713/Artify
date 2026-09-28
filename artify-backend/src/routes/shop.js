const router=require('express').Router();
const { Op }=require('sequelize');
const crypto=require('crypto');
const {sequelize,User,Cart,CartItem,Product,Artist,Category,Order,OrderItem,Payment}=require('../models');
const {authenticate,requireRole}=require('../middleware/auth');
const {success,productResponse}=require('../utils/api');

const productInclude=[{model:Artist,as:'artist',include:[{model:User,as:'user',attributes:['id','name','email','phone','address','avatarUrl','role','createdAt']}]},{model:Category,as:'category'}];

function orderResponse(o){
 return {id:o.id,userId:o.userId,totalAmount:o.totalAmount,status:o.status,shippingAddress:o.shippingAddress,createdAt:o.createdAt,items:(o.items||[]).map(i=>({id:i.id,orderId:i.orderId,productId:i.productId,quantity:i.quantity,priceAtPurchase:i.priceAtPurchase,product:productResponse(i.product)}))};
}
function cartResponse(c){
 return {id:c.id,userId:c.userId,items:(c.items||[]).map(i=>({id:i.id,cartId:i.cartId,productId:i.productId,quantity:i.quantity,product:productResponse(i.product)})),totalAmount:(c.items||[]).reduce((s,i)=>s+i.quantity*i.product.price,0)};
}
const cartInclude=[{model:CartItem,as:'items',include:[{model:Product,as:'product',include:productInclude}]}];
const orderInclude=[{model:OrderItem,as:'items',include:[{model:Product,as:'product',include:productInclude}]}];

async function getCart(userId){let c=await Cart.findOne({where:{userId},include:cartInclude});if(!c)c=await Cart.create({userId});return c;}

router.get('/cart',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{try{success(res,'Cart retrieved successfully',cartResponse(await getCart(req.user.id)));}catch(e){next(e);}});
router.post('/cart/items',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{try{const {productId,quantity}=req.body;if(!productId||!quantity||quantity<1)return res.status(400).json({success:false,message:'Product ID and valid quantity are required',data:null});const c=await getCart(req.user.id);const p=await Product.findByPk(productId,{include:productInclude});if(!p)return res.status(404).json({success:false,message:'Product not found',data:null});let item=await CartItem.findOne({where:{cartId:c.id,productId}});if(item)await item.update({quantity:item.quantity+Number(quantity)});else await CartItem.create({cartId:c.id,productId,quantity});success(res,'Item added to cart successfully',cartResponse(await getCart(req.user.id)));}catch(e){next(e);}});
router.put('/cart/items/:itemId',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{try{const c=await getCart(req.user.id),item=await CartItem.findOne({where:{id:req.params.itemId,cartId:c.id}});if(!item)return res.status(404).json({success:false,message:'CartItem not found',data:null});if(!req.body.quantity||req.body.quantity<1)return res.status(400).json({success:false,message:'Quantity must be at least 1',data:null});await item.update({quantity:req.body.quantity});success(res,'Cart item updated successfully',cartResponse(await getCart(req.user.id)));}catch(e){next(e);}});
router.delete('/cart/items/:itemId',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{try{const c=await getCart(req.user.id),item=await CartItem.findOne({where:{id:req.params.itemId,cartId:c.id}});if(!item)return res.status(404).json({success:false,message:'CartItem not found',data:null});await item.destroy();success(res,'Item removed from cart successfully',cartResponse(await getCart(req.user.id)));}catch(e){next(e);}});
router.delete('/cart',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{try{const c=await getCart(req.user.id);await CartItem.destroy({where:{cartId:c.id}});success(res,'Cart cleared successfully',null);}catch(e){next(e);}});

router.post('/orders',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{
 const t=await sequelize.transaction();
 try{
  const {shippingAddress}=req.body;if(!shippingAddress?.trim()){await t.rollback();return res.status(400).json({success:false,message:'Shipping address is required',data:null});}
  const cart=await Cart.findOne({where:{userId:req.user.id},transaction:t,lock:t.LOCK.UPDATE});
  const cartItems=cart?await CartItem.findAll({where:{cartId:cart.id},transaction:t}):[];
  if(!cartItems.length){await t.rollback();return res.status(400).json({success:false,message:'Cart is empty. Cannot place order.',data:null});}
  const order=await Order.create({userId:req.user.id,shippingAddress,status:'PENDING',totalAmount:0},{transaction:t});
  let total=0;
  for(const ci of cartItems){const p=await Product.findByPk(ci.productId,{transaction:t,lock:t.LOCK.UPDATE});if(!p||p.stock<ci.quantity){await t.rollback();return res.status(400).json({success:false,message:`Insufficient stock for product: ${p?.title||'unknown'}`,data:null});}total+=ci.quantity*p.price;await OrderItem.create({orderId:order.id,productId:p.id,quantity:ci.quantity,priceAtPurchase:p.price},{transaction:t});await p.update({stock:p.stock-ci.quantity},{transaction:t});}
  await order.update({totalAmount:total},{transaction:t});await CartItem.destroy({where:{cartId:cart.id},transaction:t});await t.commit();
  const full=await Order.findByPk(order.id,{include:orderInclude});res.status(201).json({success:true,message:'Order placed successfully',data:orderResponse(full)});
 }catch(e){if(!t.finished)await t.rollback();next(e);}
});

router.get('/orders',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{try{const rows=await Order.findAll({where:{userId:req.user.id},include:orderInclude,order:[['createdAt','DESC']]});res.json(rows.map(orderResponse));}catch(e){next(e);}});
router.get('/orders/:id',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{try{const o=await Order.findOne({where:{id:req.params.id,userId:req.user.id},include:orderInclude});if(!o)return res.status(404).json({success:false,message:'Order not found',data:null});success(res,'Order retrieved successfully',orderResponse(o));}catch(e){next(e);}});
router.put('/orders/:id/cancel',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{const t=await sequelize.transaction();try{const o=await Order.findOne({where:{id:req.params.id,userId:req.user.id},include:orderInclude,transaction:t});if(!o){await t.rollback();return res.status(404).json({success:false,message:'Order not found',data:null});}if(!['PENDING','CONFIRMED'].includes(o.status)){await t.rollback();return res.status(400).json({success:false,message:`Order cannot be cancelled. Current status: ${o.status}`,data:null});}for(const i of o.items){const p=await Product.findByPk(i.productId,{transaction:t,lock:t.LOCK.UPDATE});if(p)await p.update({stock:p.stock+i.quantity},{transaction:t});}await o.update({status:'CANCELLED'},{transaction:t});await t.commit();const full=await Order.findByPk(o.id,{include:orderInclude});success(res,'Order cancelled successfully',orderResponse(full));}catch(e){if(!t.finished)await t.rollback();next(e);}});
router.get('/orders/:id/track',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{try{const o=await Order.findOne({where:{id:req.params.id,userId:req.user.id},include:orderInclude});if(!o)return res.status(404).json({success:false,message:'Order not found',data:null});success(res,'Order tracking info retrieved',orderResponse(o));}catch(e){next(e);}});

router.post('/payments/process',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{try{const {orderId,method}=req.body;const o=await Order.findOne({where:{id:orderId,userId:req.user.id}});if(!o)return res.status(404).json({success:false,message:'Order not found',data:null});if(o.status!=='PENDING')return res.status(400).json({success:false,message:`Order is not in PENDING status. Current status: ${o.status}`,data:null});const methods=['CREDIT_CARD','DEBIT_CARD','UPI','NET_BANKING','WALLET','CASH_ON_DELIVERY'];const m=String(method||'').toUpperCase();if(!methods.includes(m))return res.status(400).json({success:false,message:`Invalid payment method: ${method}`,data:null});const cod=m==='CASH_ON_DELIVERY';const p=await Payment.create({orderId:o.id,method:m,transactionId:crypto.randomUUID(),amount:o.totalAmount,status:cod?'PENDING':'COMPLETED',paidAt:cod?null:new Date()});if(!cod)await o.update({status:'CONFIRMED'});success(res,'Payment processed successfully',{id:p.id,orderId:p.orderId,method:p.method,transactionId:p.transactionId,amount:p.amount,status:p.status,paidAt:p.paidAt});}catch(e){next(e);}});
router.get('/payments/:orderId',authenticate,requireRole('CUSTOMER'),async(req,res,next)=>{try{const o=await Order.findOne({where:{id:req.params.orderId,userId:req.user.id}});if(!o)return res.status(404).json({success:false,message:'Order not found',data:null});const p=await Payment.findOne({where:{orderId:req.params.orderId}});if(!p)return res.status(404).json({success:false,message:'Payment not found',data:null});success(res,'Payment retrieved successfully',{id:p.id,orderId:p.orderId,method:p.method,transactionId:p.transactionId,amount:p.amount,status:p.status,paidAt:p.paidAt});}catch(e){next(e);}});
router.put('/payments/:orderId/mark-cod-complete',authenticate,requireRole('ADMIN'),async(req,res,next)=>{try{const p=await Payment.findOne({where:{orderId:req.params.orderId},include:[{model:Order,as:'order'}]});if(!p)return res.status(404).json({success:false,message:'Payment not found',data:null});if(p.method!=='CASH_ON_DELIVERY')return res.status(400).json({success:false,message:'Payment method is not CASH_ON_DELIVERY. Cannot mark as completed.',data:null});if(p.status==='COMPLETED')return res.status(400).json({success:false,message:'Payment is already completed.',data:null});await p.update({status:'COMPLETED',paidAt:new Date()});if(p.order.status==='PENDING')await p.order.update({status:'CONFIRMED'});success(res,'COD payment marked as completed',{id:p.id,orderId:p.orderId,method:p.method,transactionId:p.transactionId,amount:p.amount,status:p.status,paidAt:p.paidAt});}catch(e){next(e);}});

module.exports=router;
