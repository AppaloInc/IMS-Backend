import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            validate: {
              validator: function (value) {
                // Basic email regex to check for the presence of "@" and "."
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
              },
              message: "Invalid email format" // Custom error message for invalid email
            }
          },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        },
        admin: {
            type: Boolean,
            default: false, // Default value for admin is false
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {//we can not use arrow function here because it does not contain refrence
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){//adding method to userSchema
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            admin: this.admin // Include admin status in the token

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)