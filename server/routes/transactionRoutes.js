import express from "express";
import Transaction from "../models/Transaction.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ADD TRANSACTION
router.post("/", protect, async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;

    const transaction = await Transaction.create({
      title,
      amount,
      type,
      category,
      date,
      user: req.user._id,
    });

    res.status(201).json({
      message: "Transaction added successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add transaction" });
  }
});

// GET ALL USER TRANSACTIONS
router.get("/", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// UPDATE TRANSACTION
router.put("/:id", protect, async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, amount, type, category, date },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update transaction" });
  }
});

// DELETE TRANSACTION
router.delete("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete transaction" });
  }
});

export default router;