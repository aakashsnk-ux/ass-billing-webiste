import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

clientSchema.index({ name: 1 });

export default mongoose.model("Client", clientSchema);
