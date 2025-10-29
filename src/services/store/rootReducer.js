import layout from "./layout";    
import auth from "./api/auth/authSlice";
import cart from "./api/shop/cartSlice";

const rootReducer = {
  layout, 
  auth,
  cart,
};
export default rootReducer;
