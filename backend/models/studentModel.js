import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    default: null,
  },

  status: {
    type: String,
    default: "active",
  },

});

export default mongoose.model(
  "Student",
  studentSchema
);