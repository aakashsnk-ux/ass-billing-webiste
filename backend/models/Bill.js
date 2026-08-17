import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    desc: { type: String, required: true },
    qty: { type: Number, required: true, default: 1 },
    rate: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    billNo: { type: String, required: true },
    date: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    clientName: { type: String, required: true },
    clientPhone: { type: String, default: "" },
    clientAddress: { type: String, default: "" },
    items: { type: [itemSchema], required: true },
    subtotal: { type: Number, required: true },
    taxPercent: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Bill", billSchema);
