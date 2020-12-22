const moment = require('moment');

const db = require('../models/index');
const { Product } = require('../models/index');
const { Shop } = require('../models/index');

exports.getProducts = async function (req) {
	if (JSON.stringify(req.params) === '{}')
	{
		try{
			const productsData = await Product.findAll({
			});
			let products = [];
			for(productData of productsData)
			{
				products.push(productData.dataValues);
			}
			return products;
		} catch(err){
			console.log(err);
			return null;
		}
	}

	return null;	
};

exports.getFirstListProduct = async function (req) {
	try{
		const firstListProduct = await db.sequelize.query(`Select* from product
		limit 6
		`,{
			type: db.sequelize.QueryTypes.SELECT
		});
		return firstListProduct;
	} catch (err){
		console.log(err);
		return err;
	}
	return null;
}

exports.getProductById = async function(req) {
	try{
		const productById = await Product.findOne({
			where : {
				product_id : req.params.productId
			}
		});
		return productById.dataValues;
	}catch (err){
		console.log(err);
		return null;
	}
}
exports.getProductByCategoryId = async function(req){
	try {
		const productByCategorId = await Product.findAll({
			where : {
				category_id : req.params.categoryId
			}
		});
		let products = [];
		for (product of productByCategorId){
			products.push(product.dataValues);
		}
		return products;
	}catch(err){
		console.log(err);
		return null;
	}
}

exports.getProductByShopId = async function(req){
	try {
		const productByShopId = await Product.findAll({
			where :{
				shop_id : req.params.shop_id
			}
		});
		let products = [];
		for (product of productByShopId){
			products.push(product.dataValues);
		}
		return products;
	}
	catch(err){
		console.log(err);
		return null;
	}
}

exports.changeInfoProduct = async function(req,res) {
	try {
		const product = await Product.findByPk(req.params.product_id);
		if (product){
			product.product_image = `Image Product/${res.locals.name}/${req.file.originalname}`,
			product.product_name = req.body.product_name;
			product.product_price = req.body.product_price;
			product.product_description = req.body.product_description;
			product.quantityInStock = req.body.quantityInStock;
			product.category_id = req.body.category_id;
		}
		const updateProduct = await product.save();
		return {
			updateProduct: updateProduct.dataValues,
			message: "Success"
		}
	}
	catch(err){
		console.log(err);
		return {
			message: "Failed to update"
		}
	}
}

exports.addProduct = async function(req,res) {
	try {
		const newproduct = await Product.create({
			...req.body,
			shop_id : req.params.shop_id,
			product_image: `Image Product/${res.locals.name}/${req.file.originalname}`,
			createdAt : moment(),
			updatedAt : moment()
		});
		return {
			message: "Success"
		};
	}
	catch(err) {
		console.log(err);
		return {
			message: "Failed to create"
		};
	}
}

exports.getInfoShopByProductId = async function (req){
	try{
		const product = await Product.findByPk(req.params.product_id);
		const shop = await Shop.findOne({
			where : {
				shop_id : product.dataValues.shop_id
			}
		});
		return shop.dataValues;
	}
	catch(err){
		console.log(err);
		return null;
	}
}
exports.getTopSaleByShopId = async function (req) {
	try{
		const listProduct = await Product.findAll({
			where :{
				shop_id : req.params.shop_id
			},
			order :[["nosale","DESC"]],
			limit : 5
		});
		const products = [];
		for(product of listProduct)
			products.push(product.dataValues);
		return products;
	}
	catch(err){
		console.log(err);
		return null;
	}
}