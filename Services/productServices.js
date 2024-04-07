const Product = require('../models/Product')


const addFood=async(food,callback)=>{

    try {
        const newFood = await Product.create(food)
        
    } catch (error) {
        console.log('error adding food'+error)
    }
}

const getAllProducts=()=>{
    try {
        return new Promise (async(resolve,reject)=>{ 
            let products = await Product.find()           
            resolve(products)
        })
        
    } catch (error) {
        console.log(error) 
    }
}

const quantityDecrement = async(quantity,foodId)=>{
    console.log(quantity)
    console.log(foodId)

    try {
        return new Promise (async(resolve,reject)=>{
            let food = await Product.findOne({_id:foodId})

            console.log(food.quantity)
            food.quantity -= quantity

            await food.save();
            console.log(food.quantity)

        })
        
    } catch (error) {
        console.log(error)
    }
}

module.exports ={addFood,getAllProducts,quantityDecrement}