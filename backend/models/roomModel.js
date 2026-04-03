import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
     roomNumber:{type:Number,required:true,unique:true},
    capacity:{type:Number , required:true},
    occupiedCount:{type:Number , default:0},
    status:{type:String, enum:["active","inactive"],default:"active"},
},{timestamps:true})

const Room = new mongoose.model("Room",roomSchema)

export default Room