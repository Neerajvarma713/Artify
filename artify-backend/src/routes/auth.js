const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Artist, Cart } = require('../models');
const { authenticate } = require('../middleware/auth');
const { success } = require('../utils/api');

function tokenFor(user) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: Math.floor(Number(process.env.JWT_EXPIRATION_MS || 86400000) / 1000)
  });
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'CUSTOMER' } = req.body;
    if (!name || name.length < 2 || name.length > 100) return res.status(400).json({ success:false,message:'Name is required and must be 2-100 characters',data:null });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({success:false,message:'Email should be valid',data:null});
    if (!password || password.length < 6 || password.length > 40) return res.status(400).json({success:false,message:'Password must be between 6 and 40 characters',data:null});
    if (await User.findOne({ where: { email } })) return res.status(409).json({success:false,message:`User already exists with email: ${email}`,data:null});

    const validRoles = ['CUSTOMER', 'ARTIST', 'ADMIN'];
    const normalizedRole = validRoles.includes(String(role).toUpperCase()) ? String(role).toUpperCase() : 'CUSTOMER';
    const user = await User.create({
      name, email, password: await bcrypt.hash(password, 10), phone, role: normalizedRole
    });
    if (normalizedRole === 'ARTIST') await Artist.create({ userId: user.id, bio: '', portfolioUrl: '', isVerified: false, rating: 0 });
    if (normalizedRole === 'CUSTOMER') await Cart.create({ userId: user.id });

    return res.status(201).json({ success:true, message:'Registration successful', data:{ token:tokenFor(user), tokenType:'Bearer', user:userResponse(user) } });
  } catch (e) { next(e); }
});

router.post('/login', async (req,res,next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where:{ email } });
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({success:false,message:'Invalid email or password',data:null});
    return success(res,'Login successful',{ token:tokenFor(user), tokenType:'Bearer', user:userResponse(user) });
  } catch(e){ next(e); }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'A valid email address is required', data: null });
    }
    if (!newPassword || newPassword.length < 8 || newPassword.length > 40) {
      return res.status(400).json({ success: false, message: 'Password must be between 8 and 40 characters', data: null });
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with that email address', data: null });

    await user.update({ password: await bcrypt.hash(newPassword, 10) });
    return success(res, 'Password reset successfully. You can now sign in.', null);
  } catch (e) { next(e); }
});

router.get('/profile', authenticate, async (req, res, next) => {
  try { return success(res,'Profile retrieved successfully',userResponse(req.user)); } catch(e){next(e);}
});

router.put('/profile', authenticate, async (req,res,next) => {
  try {
    const { name, phone, address, avatarUrl } = req.body;
    if (name !== undefined && (name.length < 2 || name.length > 100)) return res.status(400).json({success:false,message:'Name must be between 2 and 100 characters',data:null});
    await req.user.update({ ...(name !== undefined && {name}), ...(phone !== undefined && {phone}), ...(address !== undefined && {address}), ...(avatarUrl !== undefined && {avatarUrl}) });
    return success(res,'Profile updated successfully',userResponse(req.user));
  } catch(e){next(e);}
});

function userResponse(user) {
  return {id:user.id,email:user.email,name:user.name,phone:user.phone,address:user.address,avatarUrl:user.avatarUrl,role:user.role,createdAt:user.createdAt};
}
module.exports = router;
