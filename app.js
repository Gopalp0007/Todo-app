require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// Schema + Model
const todoSchema = new mongoose.Schema({
    text: String,
    done: { type: Boolean, default: false }
});
const Task = mongoose.model("Task", todoSchema);

// Routes
app.get("/", async (req,res) => {
    const items = await Task.find();
    res.render("list", { items });
});

app.post("/add", async (req,res) => {
    if (!req.body.ele1.trim()) {
        return res.send("<script>alert('Task cannot be empty!'); window.location.href='/'</script>");
    }
    await Task.create({ text: req.body.ele1 });
    res.redirect("/");
});

app.post("/delete", async (req,res) => {
    await Task.findByIdAndDelete(req.body.id);
    res.redirect("/");
});

app.post("/toggle", async (req,res) => {
    const task = await Task.findById(req.body.id);
    if (task) {
        task.done = !task.done;
        await task.save();
    }
    res.redirect("/");
});

app.post("/edit", async (req,res) => {
    if (req.body.newText.trim()) {
        await Task.findByIdAndUpdate(req.body.id, { text: req.body.newText });
    }
    res.redirect("/");
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
