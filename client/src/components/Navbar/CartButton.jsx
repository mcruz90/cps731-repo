import { useState, useEffect } from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { cartService } from '@/services/api/cart';

const CartButton = () => {
  const [itemCount, setItemCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartCount();
    const unsubscribe = cartService.subscribeToCartChanges(() => fetchCartCount());
    return () => unsubscribe();
  }, []);

  const fetchCartCount = async () => {
    try {
      const count = await cartService.getCartCount();
      setItemCount(count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  return (
    <Tooltip title="Shopping Cart">
      <IconButton 
        color="inherit" 
        onClick={() => navigate('/client/cart')}
      >
        <Badge badgeContent={itemCount} color="error">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default CartButton;