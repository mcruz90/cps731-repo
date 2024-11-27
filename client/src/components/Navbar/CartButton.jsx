import { useState, useEffect, useRef } from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { cartService } from '@/services/api/cart';

const CartButton = () => {
  const [uniqueItemCount, setUniqueItemCount] = useState(0);
  const navigate = useNavigate();
  const isFirstSubscriptionCall = useRef(true);

  // Fetch unique item count from cart
  const fetchUniqueCartCount = async () => {
    try {
      const count = await cartService.getUniqueCartCount();
      setUniqueItemCount(count);
    } catch (error) {
      console.error('Error fetching unique cart count:', error);
    }
  };

  useEffect(() => {
    // start by fetching initial unique item count
    fetchUniqueCartCount();

    // then subscribe to cart changes like if the user adds or removes items from the cart
    const unsubscribe = cartService.subscribeToCartChanges(() => {
      if (isFirstSubscriptionCall.current) {

        // skip the first call by setting the state to false because it's already been done and this shouldn't be repeated after the first call on loading the page
        isFirstSubscriptionCall.current = false;
        return;
      }
      fetchUniqueCartCount();
    });

    // Unsubscribe to prevent memory leak
    return () => unsubscribe();
  }, []);


  return (
    // tooltip is used to show the cart icon and the badge count
    <Tooltip title="Shopping Cart">
      <IconButton 
        color="inherit" 
        onClick={() => navigate('/client/cart')}
      >
        {/* only show the badge if there are items in the cart */}
        <Badge badgeContent={uniqueItemCount} color="error" invisible={uniqueItemCount === 0}>
          <ShoppingCartIcon color="primary" />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default CartButton;