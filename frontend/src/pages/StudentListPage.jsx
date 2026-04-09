import { useEffect, useState } from "react";
import { apiGet, apiRequest } from "../services/api";
import { API } from "../services/apiRoutes";
import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";

import {
  tableStyle,
  thStyle,
  tdStyle,
  tableContainer,
  buttonPrimary,
  rowHover,
  statusActive,
  buttonDangerSmall,
  buttonInfoSmall,
  allocationCard,
  inputStyle,
  pageCard
} from "../styles/uiStyles";

import toast from "react-hot-toast";
import ConfirmDialog from "../components/common/ConfirmDialog";

const StudentListPage = () => {

  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [studentsData, roomsData] = await Promise.all([
        apiGet(API.STUDENTS.ALL),
        apiGet(API.ROOMS.ALL)
      ]);

      setStudents(studentsData);
      setRooms(roomsData);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  /* ===== FILTER ===== */

  const filteredStudents = students.filter(s => {
    const name = s.name?.toLowerCase() || "";
    const phone = s.phone || "";

    return (
      name.includes(search.toLowerCase()) ||
      phone.includes(search)
    );
  });

  /* ===== DEACTIVATE ===== */

  const confirmDeactivate = async () => {
    try {
      await apiRequest(
        API.STUDENTS.DEALLOCATE_ROOM,
        "PATCH"
      );

      setStudents(prev =>
        prev.filter(s => s._id !== selectedId)
      );

      toast.success("Student deactivated");

    } catch (error) {
      toast.error(error.message);
    } finally {
      setConfirmOpen(false);
    }
  };

  /* ===== ALLOCATE ===== */

  const handleAllocateRoom = async () => {

    if (!selectedStudentId || !selectedRoomId) {
      toast.error("Select student and room");
      return;
    }

    try {
      setActionLoading(true);

      await apiRequest(
        API.STUDENTS.ALLOCATE_ROOM,
        "POST",
        {
          studentId: selectedStudentId,
          roomId: selectedRoomId
        }
      );

      toast.success("Room allocated");

      loadData();

      setSelectedStudentId("");
      setSelectedRoomId("");

    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* ===== AUTO ===== */

  const autoAllocate = async (id) => {
    try {
      setActionLoading(true);

      await apiRequest(
        API.STUDENTS.ALLOCATE_ROOM,
        "POST",
        { studentId: id }
      );

      toast.success("Auto allocated");

      loadData();

    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* ===== DEALLOCATE ===== */

  const handleDeallocate = async (id) => {
    try {
      setActionLoading(true);

      await apiRequest(
        `${API.STUDENTS.ALL}/${selectedId}/deactivate`,
        "PATCH",
        { studentId: id }
      );

      setStudents(prev =>
        prev.map(s =>
          s._id === id ? { ...s, roomId: null } : s
        )
      );

      toast.success("Room removed");

    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <MainLayout>

      <div style={tableContainer}>

        <h2>Student Management</h2>

        {loading ? (
          <p>Loading students...</p>
        ) : (
          <>
            <Link to="/students/add">
              <button style={buttonPrimary}>Add Student</button>
            </Link>

            <br /><br />

            <div style={pageCard}>

              <input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={inputStyle}
              />

              {filteredStudents.length === 0 ? (
                <p>No students found</p>
              ) : (
                <table style={tableStyle}>

                  <thead>
                    <tr>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Phone</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Room</th>
                      <th style={thStyle}>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredStudents.map(student => (

                      <tr key={student._id} style={rowHover}>

                        <td style={tdStyle}>{student.name}</td>
                        <td style={tdStyle}>{student.phone}</td>

                        <td style={tdStyle}>
                          <span style={statusActive}>{student.status}</span>
                        </td>

                        <td style={tdStyle}>
                          {student.roomId?.roomNumber
                            ? `Room ${student.roomId.roomNumber}`
                            : "Not Assigned"}
                        </td>

                        <td style={tdStyle}>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>

                            {!student.roomId && (
                              <button
                                style={buttonPrimary}
                                onClick={() => autoAllocate(student._id)}
                                disabled={actionLoading}
                              >
                                Auto ⚡
                              </button>
                            )}

                            <button
                              style={buttonDangerSmall}
                              onClick={() => {
                                setSelectedId(student._id);
                                setConfirmOpen(true);
                              }}
                            >
                              Deactivate
                            </button>

                            {student.roomId && (
                              <button
                                style={buttonInfoSmall}
                                onClick={() => handleDeallocate(student._id)}
                              >
                                Remove Room
                              </button>
                            )}

                          </div>
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>
              )}

            </div>

            {/* ===== ALLOCATION ===== */}
            <div style={allocationCard}>

              <h3>Manual Allocation</h3>

              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Student</option>
                {students.filter(s => !s.roomId).map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>

              <br /><br />

              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Room</option>
                {rooms
                  .filter(r => r.status === "active" && r.occupiedCount < r.capacity)
                  .map(r => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNumber} ({r.occupiedCount}/{r.capacity})
                    </option>
                  ))}
              </select>

              <br /><br />

              <button
                style={buttonPrimary}
                onClick={handleAllocateRoom}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Allocate"}
              </button>

            </div>
          </>
        )}

        <ConfirmDialog
          open={confirmOpen}
          title="Deactivate Student"
          message="Are you sure?"
          onConfirm={confirmDeactivate}
          onCancel={() => setConfirmOpen(false)}
        />

      </div>

    </MainLayout>
  );
};

export default StudentListPage;