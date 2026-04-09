import Complaint from "../models/complaintModel.js";
import Student from "../models/studentModel.js";



// ================= RAISE =================

export const raiseComplaint = async (req, res) => {
  try {

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "All fields required",
      });
    }


    const student = await Student.findOne({
      userId: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }


    const complaint = await Complaint.create({
      studentId: student._id,
      title,
      description,
      status: "open",
    });
    const io = req.app.get("io");

io.emit("newComplaint", {
  message: `📢 New complaint raised: ${complaint.title}`
});

    res.status(201).json({
      message: "Complaint raised",
      data: complaint,
    });

  } catch (error) {

    res.status(500).json({
      message: "Error raising complaint",
    });

  }
};



// ================= GET =================

export const getComplaints = async (req, res) => {
  try {

    let complaints;

    if (req.user.role === "student") {

      const student = await Student.findOne({
        userId: req.user.id,
      });

      if (!student) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      complaints = await Complaint.find({
        studentId: student._id,
      });

    } else {

      complaints = await Complaint.find();

    }

    res.status(200).json(complaints);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching complaints",
    });

  }
};



// ================= UPDATE STATUS =================

export const updateComplaintStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status required",
      });
    }

    if (!["open", "resolved"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }


    const complaint =
      await Complaint.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }
    const io = req.app.get("io");

io.emit("complaintResolved", {
  message: `✅ Complaint resolved: ${complaint.title}`
});

    res.status(200).json({
      message: "Complaint updated",
      data: complaint,
    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating complaint",
    });

  }
};