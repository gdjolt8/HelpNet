import mongoose from "mongoose";

export type ReportType = {
    _id: string;
    postId: string;
    message: string;
    createdAt: Date;
    reporter: string;
}
const reportSchema = new mongoose.Schema({
    postId: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    reporter: { type: String, required: true },
});
  
const Report = mongoose.models.Reports || mongoose.model("Reports", reportSchema);
export default Report;  