const express=require('express');
const app=express();
const {User}=require('./model/User');
const mongoose = require('mongoose');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const cors=require('cors');
const morgan=require('morgan');



//connecting db
mongoose.connect('mongodb://127.0.0.1:27017/shopifyEcom')
.then(()=>{
    console.log('connected to Database');
})
.catch((err)=>{
    console.log('Database is not connected',err);
    
})

//middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

//task1- create a register route
app.post('/register',async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        //checking if any feild is missing
        if(!name || !email || !password){
            return res.status(400).json({message:'Some feilds are missiing'});
        }
        //check if any user aldready exists
        const isUserAlreadyExists=await User.findOne({email}); 
        if(isUserAlreadyExists){
            return res.status(400).json({message:'user already exists'})
         }else{
            //hashing password
            const salt=await bcrypt.genSaltSync(10);
            const hashedPassword=await bcrypt.hashSync(password,salt);

            //jwt token
            const token=jwt.sign({email},'supersecret',{expiresIn:'365d'});
            //creating new user
            await User.create({
                name,
                email,
                password:hashedPassword,
                token,
                role:'user'
            })
            return res.status(201).json({message:'User created succesfully'});
         }

     }catch(error){
        console.log(error);
        return res.status(500).json({message:'Internal server error'});
        
     }
})

//task2-create a login route
app.post('/login',async(req,res)=>{
    try{
        const{email,password}=req.body;

        //check any feild missing
        if(!email || !password){
            return res.status(400).json({message:'some feilds ae missing'});
        }
    
        //user exits or not
        const user=await User.findOne({email});
        if(!user){
           return res.status(400).json({message:'user dose not exits.please register first'});
        } 

        //compare
        const isPasswordMatched=await bcrypt.compareSync(password,user.password);
        if(!isPasswordMatched){
            return res.status(400).json({message:'password is incorrect'});
        }

        //SUCCESFULLY LOGGED IN
        return res.status(200).json({
            message:'User logged in Successfully',
            id:user._id,
            name:user.name,
            email:user.email,
            token:user.token,
            role:user.role
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'Internal server error'});
        
     }
})
  

const PORT=8080;

app.listen(PORT,()=>{
    console.log(`server is connected to port ${PORT}`);
    
})