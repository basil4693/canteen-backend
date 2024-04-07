const { default: mongoose } = require("mongoose");
const Cart = require("../models/Cart");
const User = require("../models/User");



const addToCart = async ({ food_id, userEmail }) => {

  try {
    let userObj = await User.findOne({email:userEmail})
    let updatedCart = await Cart.findOneAndUpdate(
      { user: userObj._id, "product": food_id },       //for matching
      { $inc: { "quantity": 1 } },                     //operation
      { upsert: true , new:true}
    );
    let cartResponse = await getCartItems({userEmail})
    console.log("Cart Items:", JSON.stringify(cartResponse.data.cartItems, null, 2));

    if(updatedCart){
        return{
            status:true,
            messaged: "food added to cart successfully", 
            data: cartResponse.data
        }
    }
  } catch (error) {
    return {
      status: false,
      message: "failed to add food to the cart",
      error:error.message
    };
  }
};

const removeFromCart = async({food_id,userEmail})=>{
  console.log("rem")
    try {
        let userObj =await User.findOne({email:userEmail})

        let updatedCart = await Cart.findOneAndUpdate(
            {user:userObj._id,product:food_id},
            {$inc:{quantity:-1}}, 
            {upsert:true,new:true}
        )
        if(updatedCart.quantity<1){
            await Cart.deleteOne(updatedCart)
            let cartResponse = await getCartItems({userEmail})

            return{
                status:true,
                message:"Food deleted from the cart",
                data:cartResponse.data
            }
        }
        
        else{
          let cartResponse = await getCartItems({userEmail}) 

            return{
                status:true,
                message:"Food removed from the cart", 
                data:cartResponse.data
            }
        }
    } catch (error) {
        return{ 
            status:false,
            message:"Failed to remove the food from the cart",
            error:error.message
        }
    }
    
}

const getCartItems = async({userEmail})=>{
   
    try {
        console.log(userEmail)
        let userObj = await User.findOne({email:userEmail})
        let user_Id =userObj._id

        console.log("cartuser"+user_Id)


        let cartItems = await Cart.aggregate([
            {
                $match:{user:new mongoose.Types.ObjectId(user_Id) }
            },
            {
                $lookup:{
                    from:"products",
                    localField:"product",
                    foreignField:"_id",
                    as:"food"
                }
            },
            { 
                $unwind:"$food"
            }
        ])

        if (cartItems?.length > 0) {
            let itemsTotal = cartItems
              ?.map((cartItem) => cartItem?.food?.price * cartItem?.quantity)
              ?.reduce((a, b) => parseFloat(a) + parseFloat(b));
            let discount = 0;
            return {
              status: true,
              message: "Cart items fetched Successfully",
              data: {
                cartItems,
                metaData: {
                  itemsTotal, 
                  discount,
                  grandTotal: itemsTotal - discount,
                },
              },
            };
          } else {
            return {
              status: false,
              message: "Cart items not found",
              data:{
                cartItems
              }
            };
          }
    
        
    } catch (error) {
        return{
            status:false,
            messages:"failed to fetch cart",
            error:error.message
        }
    }

}

const deleteCart = async({userEmail})=>{
  try {
    return new Promise(async(resolve,reject)=>{
      let user = await User.findOne({email:userEmail})
  let userId = user._id
await Cart.deleteMany({user:userId})

  let deletePromise ={
    status:true, 
    message:"cart deleted",
  }
  resolve(deletePromise)
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = { addToCart ,removeFromCart,getCartItems,deleteCart};
