require('dotenv').config();
const express=require('express');
const cors=require('cors');
const sequelize=require('./config/database');
const authRoutes=require('./routes/auth');
const catalogRoutes=require('./routes/catalog');
const shopRoutes=require('./routes/shop');
const adminRoutes=require('./routes/admin');

const app=express();
app.use(cors({origin:true,credentials:true}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/api/health',(req,res)=>res.json({success:true,message:'Artify backend is running',data:null}));
app.use('/api/auth',authRoutes);
app.use('/api',catalogRoutes);
app.use('/api',shopRoutes);
app.use('/api/admin',adminRoutes);

app.use((req,res)=>res.status(404).json({success:false,message:'Endpoint not found',data:null}));
app.use((err,req,res,next)=>{
 console.error(err);
 const status=err.status||500;
 res.status(status).json({success:false,message:status===500?'Internal server error':err.message,data:null});
});

const PORT=Number(process.env.PORT||8081);
sequelize.authenticate()
  .then(async () => {
    console.log("PostgreSQL connected");

    await sequelize.sync();

    console.log("Database tables synchronized");

    app.listen(PORT, () => {
      console.log(
        `Artify Node/Express backend running on http://localhost:${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });