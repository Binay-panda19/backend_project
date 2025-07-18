import mongoose , { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase:true,
        index:true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trim: true,
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String, //cloudinary Url
        required:true
    },
    coverImage:{
        type: String, //cloudinary Url
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type: String,
        required: [true,"Password is required"],
    },
    refreshToken:{
        type: String
    }
    },
    {
        timestamps: true   // Automatically adds createdAt and updatedAt fields
    }
);

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();   
    this.password = await bcrypt.hash(this.password,10)
    next()
})
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}


userSchema.methods.createJWT = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName,
        }, 
        process.env.JWT_SECRET, 
        {expiresIn: process.env.JWT_EXPIRATION})
}

userSchema.methods.createRefreshJWT = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRATION}
    )
}

export const User = mongoose.model("User", userSchema);