import { View, Alert, StatusBar, Platform, Dimensions, ScrollView } from 'react-native';
import styles from './styles'; // Assuming you'll create a styles.js for ProductDetail
import RadioComponent from '../../components/CustomizeComponents/RadioComponent/RadioComponent'; // For size/color selection
import TitleComponent from '../../components/CustomizeComponents/TitleComponent/TitleComponent';
import CartComponent from '../../components/CustomizeComponents/CartComponent/CartComponent'; // To be adapted for TryOn Cart
import HeadingComponent from '../../components/CustomizeComponents/HeadingComponent/HeadingComponent';
import ImageHeader from '../../components/CustomizeComponents/ImageHeader/ImageHeader'; // Re-evaluate if needed or use a simpler image display
// import FrequentlyBoughtTogether from '../../components/ItemDetail/Section'; // May not be relevant for TryOn
// import Options from './Options'; // Options/Addons might be different for clothing
import { theme } from '../../utils/themeColors';
import analytics from '../../utils/analytics';
import { HeaderBackButton } from '@react-navigation/elements';
import { MaterialIcons } from '@expo/vector-icons';
import navigationService from '../../routes/navigationService';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import UserContext from '../../context/User';
import useNetworkStatus from '../../utils/useNetworkStatus';
import ErrorView from '../../components/ErrorView/ErrorView';

// Hooks
import React, { useState, useContext, useLayoutEffect, useEffect, useRef, useCallback } from 'react';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, useAnimatedRef } from 'react-native-reanimated';
import { IconButton } from 'react-native-paper';
import { Text } from 'react-native'; // Use TextDefault where appropriate
import TextDefault from '../../components/Text/TextDefault/TextDefault';
import { scale } from '../../utils/scaling';
import { TextField } from 'react-native-material-textfield'; // For special instructions if needed

// Import GraphQL queries for product details (adapt from existing food/item queries)
// import { GET_PRODUCT_DETAIL } from '../../apollo/queries'; // Example, create this query

const { height } = Dimensions.get('window');
const TOP_BAR_HEIGHT = height * 0.08;
const HEADER_MAX_HEIGHT = height * 0.4; // Adjust as needed for product images
const HEADER_MIN_HEIGHT = TOP_BAR_HEIGHT;
const SCROLL_RANGE = HEADER_MAX_HEIGHT;

function ProductDetail(props) {
  // const { product, storeId } = props?.route?.params; // Expecting product and storeId
  const route = useRoute();
  const { product, storeId } = route.params; // Get product and storeId from navigation params


  // States
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1); // For TryOn, usually 1 per unique item

  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const Analytics = analytics();
  // Adapt UserContext for TryOn cart
  const { tryOnCart, addTryOnCartItem, checkTryOnItemCart, tryOnCartCount, maxTryOnItems, maxTryOnStores } = useContext(UserContext);
  const themeContext = useContext(ThemeContext);
  const inset = useSafeAreaInsets();
  const { isConnected: connect } = useNetworkStatus();
  const scrollViewRef = useAnimatedRef();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    }
  });

  // Animated styles (can be simplified if header animation is not complex)
  const animatedTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [SCROLL_RANGE - 10, SCROLL_RANGE], [0, 1], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [
        {
          translateY: interpolate(scrollY.value, [0, SCROLL_RANGE], [HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT, 0], Extrapolation.CLAMP)
        }
      ]
    };
  });

  const currentTheme = {
    isRTL: i18n.dir() === 'rtl',
    ...theme[themeContext.ThemeValue]
  };

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(currentTheme.menuBar);
      }
      StatusBar.setBarStyle(themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content');
    }, [currentTheme, themeContext.ThemeValue])
  );

  useEffect(() => {
    async function Track() {
      try {
        await Analytics.track(Analytics.events.OPENED_PRODUCT_DETAIL, {
          storeID: storeId,
          productID: product?._id,
          productName: product?.name,
          // productStoreName: product?.store?.name // If available
        });
      } catch (error) {
        console.error('Analytics tracking failed:', error);
      }
    }
    Track();
  }, [Analytics, product, storeId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: null,
      title: product?.name || t('Product Details'),
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: currentTheme.newheaderBG
      },
      headerTitleStyle: {
        color: currentTheme.newFontcolor
      },
      headerShadowVisible: false,
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View style={styles(currentTheme).backBtnContainer}>
              <MaterialIcons name='arrow-back' size={scale(25)} color={currentTheme.newIconColor} />
            </View>
          )}
          onPress={() => {
            navigationService.goBack();
          }}
        />
      )
    });
  }, [navigation, product, currentTheme, t]);

  const handleAddToTryOnCart = async () => {
    if (!selectedSize || !selectedColor) {
      Alert.alert(t('Please select size and color'));
      return;
    }

    const cartCheck = checkTryOnItemCart(product._id, selectedSize, selectedColor);
    if (cartCheck.exist) {
        Alert.alert(t('Item already in TryOn cart'));
        return;
    }

    if (tryOnCartCount >= maxTryOnItems) {
        Alert.alert(t('Maximum items reached'), t('You can only add up to {maxTryOnItems} items to your TryOn cart.', {maxTryOnItems}));
        return;
    }
    
    // Check max stores rule
    const storesInCart = new Set(tryOnCart.map(item => item.storeId));
    if (!storesInCart.has(storeId) && storesInCart.size >= maxTryOnStores) {
        Alert.alert(t('Maximum stores reached'), t('You can only select items from up to {maxTryOnStores} different stores.', {maxTryOnStores}));
        return;
    }

    const itemToAdd = {
      _id: product._id,
      name: product.name,
      image: product.images?.[0]?.url || product.image, // Use first image or main image
      price: product.price, // Or salePrice if applicable
      size: selectedSize,
      color: selectedColor,
      storeId: storeId,
      storeName: product.store?.name, // Assuming product object has store info
      quantity: 1, // Always 1 for TryOn unique items
      specialInstructions: specialInstructions
    };

    try {
      await addTryOnCartItem(itemToAdd);
      Analytics.track(Analytics.events.ADD_TO_TRYON_CART, {
        productID: product._id,
        productName: product.name,
        size: selectedSize,
        color: selectedColor,
        storeID: storeId
      });
      navigation.navigate('TryOnCart'); // Or navigate back to Store screen, or show a success message
    } catch (e) {
      Alert.alert(t('Error'), e.message || t('Could not add item to TryOn cart'));
    }
  };
  
  // Dummy data for sizes and colors - replace with actual data from product object
  const availableSizes = product?.attributes?.find(attr => attr.name === 'Size')?.values || ['S', 'M', 'L', 'XL'];
  const availableColors = product?.attributes?.find(attr => attr.name === 'Color')?.values || ['Red', 'Blue', 'Black', 'White'];

  if (!connect) return <ErrorView />;
  if (!product) return <ErrorView text={t('Product not found')} />;

  return (
    <>
      <View style={[styles().flex, styles(currentTheme).mainContainer]}>
        <Animated.ScrollView
          ref={scrollViewRef}
          onScroll={scrollHandler}
          style={[styles(currentTheme).scrollViewStyle]}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingBottom: scale(height * 0.15) // Space for the cart button
          }}
        >
          <View>
            {/* Product Image - Use a carousel for multiple images if available */}
            <ImageHeader image={product.images?.[0]?.url || product.image} /> 
            <HeadingComponent title={product.name} price={product.price} />
            <TextDefault H5 style={styles(currentTheme).descriptionText}>
              {product.description}
            </TextDefault>
          </View>

          <View style={[styles(currentTheme).subContainer]}>
            {/* Size Selection */}
            <TitleComponent title={t('Select Size')} status={t('Required')} />
            <RadioComponent 
              options={availableSizes.map(s => ({ _id: s, title: s, price: 0 }))} // Adapt if sizes have different prices
              selected={selectedSize ? {_id: selectedSize} : null}
              onPress={(item) => setSelectedSize(item._id)}
            />

            {/* Color Selection */}
            <TitleComponent title={t('Select Color')} status={t('Required')} />
            <RadioComponent
              options={availableColors.map(c => ({ _id: c, title: c, price: 0 }))} // Adapt if colors affect price
              selected={selectedColor ? {_id: selectedColor} : null}
              onPress={(item) => setSelectedColor(item._id)}
            />
            
            {/* Special Instructions (Optional) */}
            <View style={styles(currentTheme).line}></View>
            <View style={styles(currentTheme).inputContainer}>
              <TitleComponent title={t('specialInstructions')} subTitle={t('anySpecificPreferences')} status={t('optional')} />
              <TextField 
                style={styles(currentTheme).input}
                placeholder={t('e.g. gift wrap')}
                textAlignVertical='center' 
                value={specialInstructions} 
                onChangeText={setSpecialInstructions} 
                maxLength={144} 
                textColor={currentTheme.fontMainColor} 
                baseColor={currentTheme.lightHorizontalLine} 
                errorColor={currentTheme.textErrorColor} 
                tintColor={currentTheme.themeBackground} 
                placeholderTextColor={currentTheme.fontGrayNew} 
              />
            </View>
          </View>
        </Animated.ScrollView>

        {/* Animated Title (Optional, can be removed for simplicity) */}
        <Animated.View style={[styles(currentTheme).titleContainer, animatedTitleStyle]}>
          <HeadingComponent title={product.name} price={product.price} />
        </Animated.View>

        {/* Add to Try-On Cart Button */}
        <View style={{ backgroundColor: currentTheme.themeBackground }}>
          <CartComponent 
            onPress={handleAddToTryOnCart} 
            disabled={!selectedSize || !selectedColor} // Disable if size/color not selected
            buttonText={t('Add to Try-On Cart')} // Customize button text
            total={product.price} // Display item price
            quantity={tryOnCartCount} // Show total items in TryOn cart
          />
        </View>
        <View
          style={{
            paddingBottom: inset.bottom,
            backgroundColor: currentTheme.themeBackground
          }}
        />
      </View>
    </>
  );
}

export default ProductDetail;

