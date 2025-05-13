import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Alert, StatusBar, Platform, Image, Dimensions, SectionList } from 'react-native';
import Animated, { Extrapolation, interpolate, useSharedValue, Easing as EasingNode, withTiming, withRepeat, useAnimatedStyle, useAnimatedScrollHandler } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Placeholder, PlaceholderMedia, PlaceholderLine, Fade } from 'rn-placeholder';
import ImageHeader from '../../components/Store/ImageHeader'; // Changed from Restaurant/ImageHeader
import TextDefault from '../../components/Text/TextDefault/TextDefault';
import ConfigurationContext from '../../context/Configuration';
import UserContext from '../../context/User';
import { useStore } from '../../ui/hooks'; // Changed from useRestaurant
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import { scale } from '../../utils/scaling';
import { theme } from '../../utils/themeColors';
import styles from './styles';
import { DAYS } from '../../utils/enums'; // May need review for store opening hours
import { alignment } from '../../utils/alignment';
import TextError from '../../components/Text/TextError/TextError';
import { MaterialIcons } from '@expo/vector-icons';
import analytics from '../../utils/analytics';
import { gql, useApolloClient, useQuery } from '@apollo/client';
import { popularProducts, productDetails } from '../../apollo/queries'; // Changed from popularItems, food

import { useTranslation } from 'react-i18next';
import ProductCard from '../../components/ProductCards/ProductCards'; // Changed from ItemCard
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGE_LINK } from '../../utils/constants';
import PopularIcon from '../../assets/SVG/popular'; // Icon might need update

import { escapeRegExp } from '../../utils/regex';
import { isOpen } from '../../utils/customFunctions'; // Review for store open status

const { height } = Dimensions.get('screen');

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const TOP_BAR_HEIGHT = height * 0.05;
const HEADER_MAX_HEIGHT = Platform.OS === 'android' ? height * 0.65 : height * 0.61;
const HEADER_MIN_HEIGHT = height * 0.07 + TOP_BAR_HEIGHT;
const SCROLL_RANGE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const HALF_HEADER_SCROLL = HEADER_MAX_HEIGHT - TOP_BAR_HEIGHT;

const POPULAR_PRODUCTS = gql`
  ${popularProducts} 
`;
const PRODUCT_DETAILS = gql`
  ${productDetails}
`;

function Store(props) { // Changed from Restaurant
  const { _id: storeId } = props.route.params; // Changed from restaurantId
  const Analytics = analytics();
  const { t, i18n } = useTranslation();
  const scrollRef = useRef(null);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const propsData = route.params;
  const animation = useSharedValue(0);
  const translationY = useSharedValue(0);
  const circle = useSharedValue(0);
  const themeContext = useContext(ThemeContext);

  const currentTheme = {
    isRTL: i18n.dir() === 'rtl',
    ...theme[themeContext.ThemeValue]
  };
  const configuration = useContext(ConfigurationContext);
  const [selectedLabel, selectedLabelSetter] = useState(0);
  const [buttonClicked, buttonClickedSetter] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterData, setFilterData] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { store: cartStore, setTryOnCartStore, tryOnCartCount, addTryOnCartItem, addTryOnQuantity, clearTryOnCart, checkTryOnItemCart } = useContext(UserContext); // Adapted for TryOn cart
  const { data, refetch, networkStatus, loading, error } = useStore(propsData._id); // Changed from useRestaurant

  const client = useApolloClient();
  const { data: popularProductsData } = useQuery(POPULAR_PRODUCTS, { // Changed from popularItems
    variables: { storeId } // Changed from restaurantId
  });

  const fetchProductDetails = (itemId) => {
    return client.readFragment({ id: `Product:${itemId}`, fragment: PRODUCT_DETAILS }); // Changed from Food
  };

  const dataList =
    popularProductsData &&
    popularProductsData?.popularProducts?.map((item) => { // Changed from popularItems
      const productDetails = fetchProductDetails(item?.id);
      return productDetails;
    });

  const searchHandler = () => {
    setSearchOpen(!searchOpen);
    setShowSearchResults(!showSearchResults);
  };

  const searchPopupHandler = () => {
    setSearchOpen(!searchOpen);
    setSearch('');
    translationY.value = 0;
  };

  useEffect(() => {
    if (search === '') {
      const filteredData = [];
      productCategories?.forEach((category) => { // Changed from deals to productCategories
        category.data.forEach((product) => { // Changed from deals to product
          filteredData.push(product);
        });
      });
      setFilterData(filteredData);
      setShowSearchResults(false);
    } else if (productCategories) { // Changed from deals
      const escapedSearchText = escapeRegExp(search);
      const regex = new RegExp(escapedSearchText, 'i');
      const filteredData = [];
      productCategories.forEach((category) => { // Changed from deals
        category.data.forEach((product) => { // Changed from deals
          const title = product.title.search(regex);
          if (title < 0) {
            const description = product.description.search(regex);
            if (description > 0) {
              filteredData.push(product);
            }
          } else {
            filteredData.push(product);
          }
        });
      });
      setFilterData(filteredData);
      setShowSearchResults(true);
    }
  }, [search, searchOpen]);

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(currentTheme.menuBar);
    }
    StatusBar.setBarStyle(themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content');
  });
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_STORE_SCREEN); // Changed event name
    }
    Track();
  }, []);
  useEffect(() => {
    if (data && data?.store && (!data?.store?.isAvailable || !isOpen(data?.store))) { // Changed from restaurant
      Alert.alert(
        '',
        t('Store Closed at the moment'), // Changed from Restaurant
        [
          {
            text: t('Go back to stores'), // Changed from restaurants
            onPress: () => {
              navigation.goBack();
            },
            style: 'cancel'
          },
          {
            text: t('See Products'), // Changed from See Menu
            onPress: () => console.log('see products')
          }
        ],
        { cancelable: false }
      );
    }
  }, [data]);

  const zIndexAnimation = useAnimatedStyle(() => {
    return {
      zIndex: interpolate(translationY.value, [0, TOP_BAR_HEIGHT, SCROLL_RANGE / 2], [-1, 1, 99], Extrapolation.CLAMP)
    };
  });

  const onPressItem = async (product) => { // Changed from food to product
    if (!data?.store?.isAvailable || !isOpen(data?.store)) { // Changed from restaurant
      Alert.alert(
        '',
        t('storeClosed'), // Changed from restaurantClosed
        [
          {
            text: t('backToStores'), // Changed from backToRestaurants
            onPress: () => {
              navigation.goBack();
            },
            style: 'cancel'
          },
          {
            text: t('seeProducts'), // Changed from seeMenu
            onPress: () => console.log('see products')
          }
        ],
        { cancelable: false }
      );
      return;
    }
    // Logic for adding to TryOn cart (max 5 items, 3 stores)
    // This will need significant changes based on TryOn cart logic from UserContext
    if (!cartStore || product.store === cartStore) { // product.store needs to be product.storeId._id or similar
      await addToTryOnCart(product, product.store !== cartStore); 
    } else if (product.store !== cartStore) {
      Alert.alert(
        '',
        t('clearTryOnCartText'), // New translation key
        [
          {
            text: t('Cancel'),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          },
          {
            text: t('okText'),
            onPress: async () => {
              await addToTryOnCart(product, true);
            }
          }
        ],
        { cancelable: false }
      );
    }
  };

  function wrapContentAfterWords(content, numWords) {
    const words = content.split(' ');
    const wrappedContent = [];

    for (let i = 0; i < words.length; i += numWords) {
      wrappedContent.push(words.slice(i, i + numWords).join(' '));
    }

    return wrappedContent.join('\n');
  }

  const addToTryOnCart = async (product, clearFlag) => { // Changed from addToCart, food to product
    // Navigate to ProductDetail screen for TryOn selection
    if (clearFlag) await clearTryOnCart();
    navigation.navigate('ProductDetail', { // Changed from ItemDetail
      product,
      storeId: data?.store?._id // Pass storeId
      // Addons and options might not be relevant for clothing, or handled differently
    });
  };

  function tagTryOnCart(itemId) { // Changed from tagCart
    if (checkTryOnItemCart) {
      const cartValue = checkTryOnItemCart(itemId);
      if (cartValue.exist) {
        return (
          <>
            <View style={styles(currentTheme).triangleCorner} />
            <TextDefault style={styles(currentTheme).tagText} numberOfLines={1} textColor={currentTheme.fontWhite} bold small center>
              {cartValue.quantity}
            </TextDefault>
          </>
        );
      }
    }
    return null;
  }

  const scaleValue = useSharedValue(1);

  const scaleStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  function animate() {
    scaleValue.value = withRepeat(withTiming(1.5, { duration: 250 }), 2, true);
  }
  const config = (to) => ({
    duration: 250,
    toValue: to,
    easing: EasingNode.inOut(EasingNode.ease)
  });

  const scrollToSection = (index) => {
    if (scrollRef.current != null) {
      scrollRef.current.scrollToLocation({
        animated: true,
        sectionIndex: index,
        itemIndex: 0,
        viewOffset: -(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT),
        viewPosition: 0
      });
    }
  };

  const onScrollEndSnapToEdge = (event) => {
    event.persist();
    const y = event.nativeEvent.contentOffset.y;

    if (y > 0 && y < HALF_HEADER_SCROLL / 2) {
      if (scrollRef.current) {
        withTiming(translationY.value, config(0), (finished) => {
          if (finished) {
            scrollRef.current.scrollToLocation({
              animated: false,
              sectionIndex: 0,
              itemIndex: 0,
              viewOffset: HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
              viewPosition: 0
            });
          }
        });
      }
    } else if (HALF_HEADER_SCROLL / 2 <= y && y < HALF_HEADER_SCROLL) {
      if (scrollRef.current) {
        withTiming(translationY.value, config(SCROLL_RANGE), (finished) => {
          if (finished) {
            scrollRef.current.scrollToLocation({
              animated: false,
              sectionIndex: 0,
              itemIndex: 0,
              viewOffset: -(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT),
              viewPosition: 0
            });
          }
        });
      }
    }
    buttonClickedSetter(false);
  };
  const scrollHandler = useAnimatedScrollHandler((event) => {
    translationY.value = event.contentOffset.y;
  });

  function changeIndex(index) {
    if (selectedLabel !== index) {
      selectedLabelSetter(index);
      buttonClickedSetter(true);
      scrollToSection(index);
      scrollToNavbar(index);
    }
  }
  function scrollToNavbar(value = 0) {
    if (flatListRef.current != null) {
      flatListRef.current.scrollToIndex({
        animated: true,
        index: value,
        viewPosition: 0.5
      });
    }
  }

  function onViewableItemsChanged({ viewableItems }) {
    buttonClickedSetter(false);
    if (viewableItems.length === 0) return;
    if (selectedLabel !== viewableItems[0].section.index && buttonClicked === false) {
      selectedLabelSetter(viewableItems[0].section.index);
      scrollToNavbar(viewableItems[0].section.index);
    }
  }

  const iconColor = currentTheme.white;
  const iconBackColor = currentTheme.white;
  const iconRadius = scale(15);
  const iconSize = scale(20);
  const iconTouchHeight = scale(30);
  const iconTouchWidth = scale(30);

  const circleSize = interpolate(circle.value, [0, 0.5, 1], [scale(18), scale(24), scale(18)], Extrapolation.CLAMP);
  const radiusSize = interpolate(circle.value, [0, 0.5, 1], [scale(9), scale(12), scale(9)], Extrapolation.CLAMP);

  const fontStyles = useAnimatedStyle(() => {
    return {
      fontSize: interpolate(circle.value, [0, 0.5, 1], [8, 12, 8], Extrapolation.CLAMP)
    };
  });

  if (loading) {
    return (
      <View style={[styles(currentTheme).flex]}>
        <ImageHeader iconColor={iconColor} iconSize={iconSize} iconBackColor={iconBackColor} iconRadius={iconRadius} iconTouchWidth={iconTouchWidth} iconTouchHeight={iconTouchHeight} storeName={propsData?.name ?? data?.store?.name} storeId={propsData?._id} storeImage={propsData?.image ?? data?.store?.image} store={null} topaBarData={[]} loading={loading} minimumOrder={propsData?.minimumOrder ?? data?.store?.minimumOrder} tax={propsData?.tax ?? data?.store?.tax} updatedProductCategories={[]} searchOpen={searchOpen} showSearchResults={showSearchResults} setSearch={setSearch} search={search} searchHandler={searchHandler} searchPopupHandler={searchPopupHandler} translationY={translationY} />
        <View
          style={[
            styles(currentTheme).navbarContainer,
            styles(currentTheme).flex,
            {
              paddingTop: HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - TOP_BAR_HEIGHT
            }
          ]}
        >
          {Array.from(Array(10), (_, i) => (
            <Placeholder
              key={i}
              Animation={(props) => <Fade {...props} style={{ backgroundColor: currentTheme.gray }} duration={600} />}
              Left={PlaceholderMedia}
              style={{
                padding: 12
              }}
            >
              <PlaceholderLine width={80} />
              <PlaceholderLine width={80} />
            </Placeholder>
          ))}
        </View>
      </View>
    );
  }
  if (error) return <TextError text={JSON.stringify(error)} />;
  const store = data.store; // Changed from restaurant
  const allProductCategories = store?.productCategories.filter((cat) => cat?.products?.length); // Changed from categories, foods to productCategories, products
  const productCategories = allProductCategories.map((c, index) => ({ // Changed from deals
    ...c,
    data: c.products, // Changed from foods
    index: dataList?.length > 0 ? index + 1 : index
  }));

  const updatedProductCategories =
    dataList?.length > 0
      ? [
          {
            title: 'Popular Products', // Changed from Popular
            id: new Date().getTime(),
            data: dataList?.slice(0, 4),
            index: 0
          },
          ...productCategories // Changed from deals
        ]
      : [...productCategories]; // Changed from deals

  return (
    <>
      <SafeAreaView style={styles(currentTheme).flex}>
        <Animated.View style={styles(currentTheme).flex}>
          <ImageHeader
            ref={flatListRef}
            iconColor={iconColor}
            iconSize={iconSize}
            iconBackColor={iconBackColor}
            iconRadius={iconRadius}
            iconTouchWidth={iconTouchWidth}
            iconTouchHeight={iconTouchHeight}
            storeName={propsData?.name ?? data?.store?.name} // Changed from restaurantName
            storeId={propsData?._id} // Changed from restaurantId
            storeImage={propsData?.image ?? data?.store?.image} // Changed from restaurantImage
            store={data?.store} // Changed from restaurant
            topaBarData={updatedProductCategories} // Changed from updatedDeals
            changeIndex={changeIndex}
            selectedLabel={selectedLabel}
            minimumOrder={
              propsData?.minimumOrder ?? data?.store?.minimumOrder // Changed from restaurant
            }
            tax={propsData?.tax ?? data?.store?.tax} // Changed from restaurant
            updatedProductCategories={updatedProductCategories} // Changed from updatedDeals
            searchOpen={searchOpen}
            showSearchResults={showSearchResults}
            setSearch={setSearch}
            search={search}
            searchHandler={searchHandler}
            searchPopupHandler={searchPopupHandler}
            translationY={translationY}
          />

          {showSearchResults || searchOpen ? (
            <ScrollView style={[styles(currentTheme).flex, styles(currentTheme).searchResultContainer]}>
              {filterData.map((item, index) => (
                <ProductCard // Changed from ItemCard
                  key={index.toString()}
                  deal={item}
                  searchResult={true}
                  onPress={onPressItem}
                  imgWidth={scale(80)}
                  imgHeight={scale(80)}
                  price={item.price}
                  dealPrice={item.dealPrice}
                  tagCart={tagTryOnCart(item._id)} // Changed from tagCart
                />
              ))}
            </ScrollView>
          ) : (
            <AnimatedSectionList
              ref={scrollRef}
              sections={updatedProductCategories} // Changed from updatedDeals
              keyExtractor={(item, index) => item._id + index}
              stickySectionHeadersEnabled={false}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onViewableItemsChanged={onViewableItemsChanged}
              onScrollEndDrag={onScrollEndSnapToEdge}
              onMomentumScrollEnd={onScrollEndSnapToEdge}
              onScroll={scrollHandler}
              viewabilityConfig={{
                itemVisiblePercentThreshold: 50
              }}
              contentContainerStyle={{
                paddingTop: HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - TOP_BAR_HEIGHT,
                paddingBottom: scale(50)
              }}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles(currentTheme).sectionHeaderContainer}>
                  {title === 'Popular Products' && (
                    <PopularIcon width={scale(18)} height={scale(18)} />
                  )}
                  <TextDefault H5 bold style={styles(currentTheme).sectionHeaderText}>
                    {title}
                  </TextDefault>
                </View>
              )}
              renderItem={({ item, index, section }) => (
                <ProductCard // Changed from ItemCard
                  key={index.toString()}
                  deal={item}
                  onPress={onPressItem}
                  imgWidth={scale(80)}
                  imgHeight={scale(80)}
                  price={item.price}
                  dealPrice={item.dealPrice}
                  tagCart={tagTryOnCart(item._id)} // Changed from tagCart
                />
              )}
            />
          )}
        </Animated.View>
      </SafeAreaView>
      <Animated.View
        style={[
          styles(currentTheme).addToCart,
          styles(currentTheme).cartBtn,
          scaleStyles,
          zIndexAnimation
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles(currentTheme).addToCartContainer}
          onPress={() => {
            if (tryOnCartCount > 0) { // Changed from cartCount
              navigation.navigate('TryOnCart'); // Navigate to TryOnCart screen
            } else {
              Alert.alert('', t('yourCartIsEmpty'));
            }
          }}
        >
          <View style={styles(currentTheme).totalContainer}>
            <View style={styles(currentTheme).quantityContainer}>
              <TextDefault H6 style={styles(currentTheme).textWhite}>
                {tryOnCartCount} ITEM{tryOnCartCount > 1 ? 'S' : ''} {/* Changed from cartCount */}
              </TextDefault>
            </View>
            <TextDefault H6 style={styles(currentTheme).textWhite}>
              {t('viewTryOnCart')} {/* New translation key */}
            </TextDefault>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

export default Store; // Changed from Restaurant

