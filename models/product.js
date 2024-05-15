const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['Baju', 'Celana', 'Aksesoris', 'Jaket'],
    },
    garment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Garment',
        required: true,
    }
})
const Product = mongoose.model('Product', productSchema);

module.exports = Product;