const path = require('path')
const express = require('express')
const methodOverride = require('method-override')
const mongoose = require('mongoose')

const app = express()

// --- Model
const Product = require('./models/product')
const Garment = require('./models/garment')

// --- Connect MongoDB
mongoose.connect('mongodb://127.0.0.1/factory')
    .then((result) => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.log(err);
    });

app.set('views', path.join(path.dirname(__dirname), 'emongoose/views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(err => next(err));
    }
}

app.get('/', (req, res) => {
    res.send('ExpressJS with MongooseODM is running healthy');
})

app.get('/garments', wrapAsync(async (req, res) => {
    const garments = await Garment.find()
    res.render('garment/index', { garments })
}))

app.get('/garments/create', (req, res) => {
    res.render('garment/create')
})

app.post('/garments', wrapAsync(async (req, res) => {
    const garment = new Garment(req.body)
    await garment.save()
    res.redirect(`/garments`)
}))

app.get('/garments/:id', wrapAsync(async (req, res) => {
    const { id } = req.params
    const garment = await Garment.findById(id).populate('products')
    res.render('garment/show', { garment })
}))

app.delete('/garments/:garment_id', wrapAsync(async (req, res) => {
    const { garment_id } = req.params
    await Garment.findOneAndDelete({'_id': garment_id})
    res.redirect(`/garments`);
}))

app.get('/garments/:garment_id/product/create', (req, res) => {
    const { garment_id } = req.params
    res.render('product/create', { garment_id })
})

app.post('/garments/:garment_id/product', wrapAsync(async (req, res) => {
    const { garment_id } = req.params
    const garment = await Garment.findById(garment_id)
    const product = new Product(req.body)
    product.garment = garment
    garment.products.push(product)
    await garment.save()
    await product.save()
    res.redirect(`/garments/${garment_id}`);
}))

app.get('/products', async (req, res) => {
    const { category } = req.query
    if (category) {
        const products = await Product.find({ category })
        res.render('product/index', { products, category })
    } else {
        const products = await Product.find()
        res.render('product/index', { products, category: 'All' })
    }
})

app.post('/products', wrapAsync(async (req, res) => {
    const product = new Product(req.body)
    await product.save()
    res.redirect(`/products/${product._id}`)
}))

app.get('/products/:id', wrapAsync(async (req, res) => {
    const { id } = req.params
    const product = await Product.findById(id).populate('garment')
    res.render('product/show', { product })
}))

// app.get('/products/:id/edit', wrapAsync(async (req, res) => {
//     const { id } = req.params
//     const products = await Product.findById(id)
//     res.render('product/show', { products })
// }))

// --- run ExpressJS
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})