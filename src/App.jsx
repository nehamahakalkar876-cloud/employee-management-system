
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "https://employee-management-system-7gv1.onrender.com";

function App() {
  const [employees, setEmployees] = useState([]);

  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("emsUserName") || ""
  );

  const [token, setToken] = useState(
    localStorage.getItem("emsToken") || ""
  );

  const [page, setPage] = useState(
    localStorage.getItem("emsToken") ? "dashboard" : "login"
  );

  const [editingId, setEditingId] = useState(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const emptyEmployee = {
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
  };

  const [employeeData, setEmployeeData] = useState(emptyEmployee);

  // Get Employees from MongoDB
  async function fetchEmployees() {
    try {
      const response = await fetch(`${API_URL}/api/employees`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load employees");
      }

      setEmployees(data);
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    if (token) {
      fetchEmployees();
    }
  }, [token]);

  // Registration
  async function register(e) {
    e.preventDefault();

    const email = registerData.email.trim().toLowerCase();

    if (registerData.password.length < 6) {
      alert("Password must contain at least 6 characters!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...registerData,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Registration Successful!");

      setRegisterData({
        name: "",
        email: "",
        password: "",
      });

      setPage("login");
    } catch (error) {
      alert(error.message);
    }
  }

  // Login
  async function login(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email.trim().toLowerCase(),
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("emsToken", data.token);
      localStorage.setItem("emsUserName", data.user.name);

      setToken(data.token);
      setLoggedIn(data.user.name);
      setLoginData({ email: "", password: "" });
      setPage("dashboard");

      alert("Login Successful!");
    } catch (error) {
      alert(error.message);
    }
  }

  // Logout
  function logout() {
    localStorage.removeItem("emsToken");
    localStorage.removeItem("emsUserName");

    setToken("");
    setLoggedIn("");
    setEmployees([]);
    setPage("login");
  }

  // Add and Update Employee
  async function saveEmployee(e) {
    e.preventDefault();

    const phone = employeeData.phone.trim();
    const email = employeeData.email.trim().toLowerCase();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Please enter a valid 10-digit Indian mobile number!");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address!");
      return;
    }

    const updatedData = {
      ...employeeData,
      email,
      phone,
    };

    try {
      const url = editingId
        ? `${API_URL}/api/employees/${editingId}`
        : `${API_URL}/api/employees`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save employee");
      }

      alert(
        editingId
          ? "Employee Updated Successfully!"
          : "Employee Added Successfully!"
      );

      setEmployeeData(emptyEmployee);
      setEditingId(null);

      await fetchEmployees();
      setPage("list");
    } catch (error) {
      alert(error.message);
    }
  }

  // Edit Employee
  function editEmployee(emp) {
    setEmployeeData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
    });

    setEditingId(emp._id);
    setPage("add");
  }

  // Delete Employee
  async function deleteEmployee(id) {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/employees/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete employee");
      }

      alert("Employee Deleted Successfully!");
      await fetchEmployees();
    } catch (error) {
      alert(error.message);
    }
  }

  // Login Page
  if (!loggedIn) {
    return (
      <div className="auth-container">
        <form className="auth-card" onSubmit={login}>
          <h1>Employee Management</h1>
          <p>Welcome Back! Please Login</p>

          <input
            type="email"
            placeholder="Email Address"
            required
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />

          <button type="submit">Login</button>

          <p>
            Don't have an account?{" "}
            <span onClick={() => setPage("register")}>
              Register Here
            </span>
          </p>

          {page === "register" && (
            <p>
              Please use the registration form below.
            </p>
          )}
        </form>

        {page === "register" && (
          <form className="auth-card" onSubmit={register}>
            <h1>Employee Registration</h1>
            <p>Create Your Account</p>

            <input
              type="text"
              placeholder="Full Name"
              required
              value={registerData.name}
              onChange={(e) =>
                setRegisterData({ ...registerData, name: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email Address"
              required
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password (minimum 6 characters)"
              minLength={6}
              required
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
            />

            <button type="submit">Register</button>

            <p>
              Already have an account?{" "}
              <span onClick={() => setPage("login")}>
                Login Here
              </span>
            </p>
          </form>
        )}
      </div>
    );
  }

  // Dashboard
  return (
    <div className="dashboard">
      <header className="topbar">
        <h2>Employee Management System</h2>

        <div>
          Welcome, {loggedIn} &nbsp;
          <button className="logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <h3>Dashboard</h3>

          <button onClick={() => setPage("dashboard")}>
            Home
          </button>

          <button
            onClick={() => {
              setEmployeeData(emptyEmployee);
              setEditingId(null);
              setPage("add");
            }}
          >
            Add Employee
          </button>

          <button
            onClick={() => {
              fetchEmployees();
              setPage("list");
            }}
          >
            View Employees
          </button>
        </aside>

        <main className="content">
          {page === "dashboard" && (
            <>
              <h1>Dashboard</h1>
              <p>Manage your employee records easily.</p>

              <div className="stats">
                <div className="stat-card">
                  <h2>{employees.length}</h2>
                  <p>Total Employees</p>
                </div>

                <div className="stat-card">
                  <h2>Active</h2>
                  <p>Account Status</p>
                </div>
              </div>

              <button onClick={() => setPage("add")}>
                + Add Employee
              </button>

              <button
                className="secondary"
                onClick={() => {
                  fetchEmployees();
                  setPage("list");
                }}
              >
                View Employee List
              </button>
            </>
          )}

          {page === "add" && (
            <>
              <h1>
                {editingId ? "Edit Employee" : "Add Employee"}
              </h1>

              <form className="employee-form" onSubmit={saveEmployee}>
                <input
                  type="text"
                  placeholder="Employee Name"
                  required
                  value={employeeData.name}
                  onChange={(e) =>
                    setEmployeeData({
                      ...employeeData,
                      name: e.target.value,
                    })
                  }
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={employeeData.email}
                  onChange={(e) =>
                    setEmployeeData({
                      ...employeeData,
                      email: e.target.value,
                    })
                  }
                />

                <input
                  type="tel"
                  placeholder="Enter 10-digit Mobile Number"
                  required
                  maxLength={10}
                  value={employeeData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setEmployeeData({
                      ...employeeData,
                      phone: value,
                    });
                  }}
                />

                <input
                  type="text"
                  placeholder="Department"
                  required
                  value={employeeData.department}
                  onChange={(e) =>
                    setEmployeeData({
                      ...employeeData,
                      department: e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="Designation"
                  required
                  value={employeeData.designation}
                  onChange={(e) =>
                    setEmployeeData({
                      ...employeeData,
                      designation: e.target.value,
                    })
                  }
                />

                <button type="submit">
                  {editingId ? "Update Employee" : "Save Employee"}
                </button>
              </form>
            </>
          )}

          {page === "list" && (
            <>
              <h1>Employee List</h1>

              <button
                onClick={() => {
                  setEmployeeData(emptyEmployee);
                  setEditingId(null);
                  setPage("add");
                }}
              >
                + Add New Employee
              </button>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp._id}>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.phone}</td>
                        <td>{emp.department}</td>
                        <td>{emp.designation}</td>

                        <td>
                          <button
                            className="edit"
                            onClick={() => editEmployee(emp)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete"
                            onClick={() => deleteEmployee(emp._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {employees.length === 0 && (
                  <p className="empty">No employees added yet.</p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
