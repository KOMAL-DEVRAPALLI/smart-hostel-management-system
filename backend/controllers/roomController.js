import Room from "../models/roomModel.js";



// ================= ADD ROOM =================

export const addRoom = async (req, res) => {
  try {

    const { roomNumber, capacity } = req.body;

    if (!roomNumber || !capacity) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    if (capacity <= 0) {
      return res.status(400).json({
        message: "Capacity must be greater than 0",
      });
    }

    const existingRoom = await Room.findOne({
      roomNumber,
    });

    if (existingRoom) {
      return res.status(400).json({
        message: "Room number already exists",
      });
    }

    const room = await Room.create({
      roomNumber,
      capacity,
      occupiedCount: 0,
    });

    res.status(201).json({
      message: "Room added",
      data: room,
    });

  } catch (error) {

    res.status(500).json({
      message: "Error adding room",
    });

  }
};



// ================= GET ALL ROOMS =================

export const getAllRooms = async (req, res) => {
  try {

    const rooms = await Room.find();

    res.status(200).json(rooms);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching rooms",
    });

  }
};



// ================= UPDATE ROOM =================

export const updateRoom = async (req, res) => {
  try {

    const { id } = req.params;
    const { roomNumber, capacity } = req.body;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }


    // check duplicate number
    if (
      roomNumber &&
      roomNumber !== room.roomNumber
    ) {
      const duplicate = await Room.findOne({
        roomNumber,
      });

      if (duplicate) {
        return res.status(400).json({
          message: "Room number exists",
        });
      }

      room.roomNumber = roomNumber;
    }


    // capacity validation
    if (capacity !== undefined) {

      if (capacity <= 0) {
        return res.status(400).json({
          message: "Capacity must be > 0",
        });
      }

      if (capacity < room.occupiedCount) {
        return res.status(400).json({
          message:
            "Capacity less than occupied",
        });
      }

      room.capacity = capacity;
    }


    await room.save();

    res.status(200).json({
      message: "Room updated",
      data: room,
    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating room",
    });

  }
};



// ================= DEACTIVATE ROOM =================

export const deactivateRoom = async (req, res) => {
  try {

    const { id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (room.occupiedCount > 0) {
      return res.status(400).json({
        message:
          "Cannot deactivate room with students",
      });
    }

    room.status = "inactive";

    await room.save();

    res.status(200).json({
      message: "Room deactivated",
      data: room,
    });
console.log("Deactivate room id:", id);
console.log("Room before update:", room);
  } catch (error) {

    res.status(500).json({
      message: "Error deactivating room",
    });

  }
};