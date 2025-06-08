import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
    title: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        required: true,

    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    image: {
        type: String,
        required: true,
    },
    //reference to the user who created the book using the User model
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accounts_customuser", // Assuming the User model is named "User"
        required: true,
    },

},
    {timestamps: true}
);


const Book = mongoose.model("Book", bookSchema);

export default Book;