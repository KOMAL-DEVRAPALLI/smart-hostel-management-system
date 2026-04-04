import { useEffect, useState } from "react";
import { apiRequest, apiGet } from "../services/api";
import { API } from "../services/apiRoutes";
import MainLayout from "../components/layout/MainLayout";
import {
  tableStyle,
  thStyle,
  tdStyle,
  buttonDanger,
  buttonPrimary,
  tableContainer
} from "../styles/uiStyles";

import toast from "react-hot-toast";
import ConfirmDialog from "../components/common/ConfirmDialog";

const RoomManagement = () => {

  const [rooms, setRooms] = useState([]);

  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  const [editId, setEditId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);


  // ---------- FETCH ROOMS ----------

  const fetchRooms = async () => {
    try {
      const data = await apiGet(API.ROOMS.ALL);
      setRooms(data);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);


  // ---------- ADD ROOM ----------

  const handleAddRoom = async () => {

    if (!roomNumber || !capacity) {
      toast.error("All fields required");
      return;
    }

    try {
      setLoading(true);

      await apiRequest(API.ROOMS.ALL, "POST", {
        roomNumber,
        capacity
      });

      toast.success("Room created");

      setRoomNumber("");
      setCapacity("");

      fetchRooms();

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }

  };


  // ---------- EDIT ROOM ----------

  const handleEdit = (room) => {
    setRoomNumber(room.roomNumber);
    setCapacity(room.capacity);
    setEditId(room._id);
  };


  // ---------- UPDATE ROOM ----------

  const handleUpdate = async () => {
    try {

      await apiRequest(`${API.ROOMS.ALL}/${editId}`, "PUT", {
        roomNumber,
        capacity
      });

      toast.success("Room updated successfully");

      setRoomNumber("");
      setCapacity("");
      setEditId(null);

      fetchRooms();

    } catch (error) {
      toast.error(error.message);
    }
  };


  // ---------- OPEN CONFIRM ----------

  const openDeactivateDialog = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };


  // ---------- CONFIRM DEACTIVATE ----------

  const confirmDeactivate = async () => {
    try {

      await apiRequest(
        `${API.ROOMS.ALL}/${selectedId}/deactivate`,
        "PATCH"
      );

      toast.success("Room deactivated");

      fetchRooms();

    } catch (error) {
      toast.error(error.message);
    }

    setConfirmOpen(false);
  };


  // ---------- UI ----------

  return (
    <MainLayout>

      <div style={tableContainer}>

        <h2>Room Management</h2>
        <hr />

        {/* ---------- TABLE ---------- */}

        <table style={tableStyle}>

          <thead>
            <tr>
              <th style={thStyle}>Room</th>
              <th style={thStyle}>Capacity</th>
              <th style={thStyle}>Occupied</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {rooms
              .filter(room => room.status === "active")
              .map((room) => (

                <tr key={room._id}>
                  <td style={tdStyle}>{room.roomNumber}</td>
                  <td style={tdStyle}>{room.capacity}</td>
                  <td style={tdStyle}>{room.occupiedCount}</td>
                  <td style={tdStyle}>{room.status}</td>

                  <td style={tdStyle}>
                    <button
                      style={buttonPrimary}
                      onClick={() => handleEdit(room)}
                    >
                      Edit
                    </button>

                    <button
                      style={buttonDanger}
                      onClick={() =>
                        openDeactivateDialog(room._id)
                      }
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>

            ))}
          </tbody>

        </table>

        <hr style={{ margin: "20px 0", opacity: 0.2 }} />

        {/* ---------- FORM ---------- */}

        <h3>{editId ? "Update Room" : "Add Room"}</h3>

        <input
          placeholder="Room Number"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
        />

        <br /><br />

        {editId ? (
          <button
            style={buttonPrimary}
            onClick={handleUpdate}
            disabled={loading}
          >
            Update Room
          </button>
        ) : (
          <button
            style={buttonPrimary}
            onClick={handleAddRoom}
            disabled={loading}
          >
            Add Room
          </button>
        )}

      </div>

      {/* ---------- CONFIRM MODAL ---------- */}

      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate Room"
        message="Are you sure you want to deactivate this room?"
        onConfirm={confirmDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />

    </MainLayout>
  );
};

export default RoomManagement;