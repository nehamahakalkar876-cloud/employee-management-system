
import express from "express";
import Employee from "../models/Employee.js";

const router = express.Router();

// Add Employee
router.post("/", async (req, res) => {
  try {
    const employee = await Employee.create(req.body);

    res.status(201).json({
      message: "Employee added successfully",
      employee
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// View All Employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find();

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit Employee
router.put("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json({
      message: "Employee updated successfully",
      employee
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Employee
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(
      req.params.id
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
