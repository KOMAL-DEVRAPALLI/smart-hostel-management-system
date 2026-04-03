import Student from "../models/studentModel.js";
import Room from "../models/roomModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";


// ================= ADD STUDENT =================

export const addStudent = async (req, res) => {
  try {

    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "Email already used",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    const student = await Student.create({
      name,
      phone,
      userId: user._id,
      status: "active",
      roomId: null,
    });

    res.status(201).json({
      message: "Student added successfully",
      data: student,
    });

  } catch (error) {

    res.status(500).json({
      message: "Error adding student",
    });

  }
};



// ================= GET ALL =================

export const getAllStudents = async (req, res) => {
  try {

    const students = await Student.find({
      status: "active",
    }).populate("roomId");

    res.status(200).json(students);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching students",
    });

  }
};



// ================= GET MY =================

export const getMyStudent = async (req, res) => {
  try {

    const student = await Student.findOne({
      userId: req.user.id,
      status: "active",
    }).populate("roomId");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json(student);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching student",
    });

  }
};



// ================= UPDATE =================

export const updateStudent = async (req, res) => {
  try {

    const { id } = req.params;

    const student = await Student.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student updated",
      data: student,
    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating student",
    });

  }
};



// ================= DEACTIVATE =================

export const deactivateStudent = async (req, res) => {
  try {

    const { id } = req.params;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    if (student.roomId) {

      const room = await Room.findById(student.roomId);

      if (room && room.occupiedCount > 0) {
        room.occupiedCount -= 1;
        await room.save();
      }

    }

    student.status = "inactive";
    student.roomId = null;

    await student.save();

    res.status(200).json({
      message: "Student deactivated",
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deactivating student",
    });

  }
};


export const autoAllocateAll = async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    const students = await Student.find({
      status: "active",
      roomId: null
    });

    const rooms = await Room.find({
      status: "active"
    }).sort({ occupiedCount: 1 });

    let allocatedCount = 0;

    for (let student of students) {

      const room = rooms.find(
        r => r.occupiedCount < r.capacity
      );

      if (!room) break;

      student.roomId = room._id;
      await student.save();

      room.occupiedCount += 1;
      await room.save();

      allocatedCount++;
    }

    res.status(200).json({
      message: `${allocatedCount} students auto allocated`
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// ================= ALLOCATE =================

export const autoAllocateRoom = async (req, res) => {
  try {

    const { studentId } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    // find student
    const student = await Student.findById(studentId);

    if (!student || student.status !== "active") {
      return res.status(404).json({
        message: "Student not found or inactive"
      });
    }

    if (student.roomId) {
      return res.status(400).json({
        message: "Student already has room"
      });
    }

    // find best room (least occupied but not full)
    const room = await Room.findOne({
      status: "active",
      $expr: { $lt: ["$occupiedCount", "$capacity"] }
    }).sort({ occupiedCount: 1 });

    if (!room) {
      return res.status(400).json({
        message: "No available rooms"
      });
    }

    // assign room
    student.roomId = room._id;
    await student.save();

    room.occupiedCount += 1;
    await room.save();

    res.status(200).json({
      message: `Room ${room.roomNumber} auto allocated`
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



// ================= DEALLOCATE =================

export const deallocateRoom = async (req, res) => {
  try {

    const { studentId } = req.body;

    const student = await Student.findById(studentId);

    if (!student || !student.roomId) {
      return res.status(400).json({
        message: "Student has no room",
      });
    }

    const room = await Room.findById(student.roomId);

    if (room && room.occupiedCount > 0) {
      room.occupiedCount -= 1;
      await room.save();
    }

    student.roomId = null;
    await student.save();

    res.status(200).json({
      message: "Room removed",
    });

  } catch (error) {

    res.status(500).json({
      message: "Error removing room",
    });

  }
};