import React, { useState, useEffect, useContext, useLayoutEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar, Platform, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder';
import TryOnCartItem from '../../components/TryOnCartItem/TryOnCartItem'; // Create this component
import { scale } from '../../utils/scaling';
import { theme } from '../../utils/themeColors';
import { alignment } from '../../utils/alignment';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import ConfigurationContext from '../../context/Configuration';
import UserContext from '../../context/User';
import styles from './styles'; // Create this file
import TextDefault from '../../components/Text/TextDefault/TextDefault';
import { LocationContext } from '../../context/Location';
import EmptyCart from '../../assets/SVG/imageComponents/EmptyCart'; // Consider a TryOn specific empty state image
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { textStyles } from '../../utils/textStyles';
import analytics from '../../utils/analytics';
import { HeaderBackButton } from '@react-navigation/elements';
import navigationService from '../../routes/navigationService';
import { useTranslation } from 'react-i18next';
import { SpecialInstructions } from '../../components/Cart/SpecialInstructions'; // Re-evaluate if needed for TryOn
import useNetworkStatus from '../../utils/useNetworkStatus';
import ErrorView from '../../components/ErrorView/ErrorView';

// Constants - Add GraphQL queries if needed for fetching fees or promotions

function TryOnCart(props) {
  const Analytics = analytics();
  const navigation = useNavigation();
  const configuration = useContext(ConfigurationContext);
  // Adapt UserContext for TryOn cart: tryOnCart, tryOnCartCount, removeTryOnCartItem, clearTryOnCart, etc.
  const { isLoggedIn, profile, tryOnCart, tryOnCartCount, removeTryOnCartItem, clearTryOnCart, updateTryOnItemQuantity, instructions, setInstructions, maxTryOnItems, maxTryOnStores } = useContext(UserContext);
  const themeContext = useContext(ThemeContext);
  const { location } = useContext(LocationContext); // Needed for delivery calculations if applicable
  const { t, i18n } = useTranslation();
  const currentTheme = {
    isRTL: i18n.dir() === 'rtl',
    ...theme[themeContext.ThemeValue]
  };
  const [loadingData, setLoadingData] = useState(true); // Or false if cart data is directly from context
  const [tryOnFee, setTryOnFee] = useState(configuration.tryOnFee || 25); // Example fee
  const [serviceFee, setServiceFee] = useState(configuration.serviceFee || 5); // Example fee

  const isCartEmpty = tryOnCart?.length === 0;
  const cartLength = !isCartEmpty ? tryOnCart?.length : 0;

  // useEffect to set loadingData to false once context is available
  useEffect(() => {
    if (tryOnCart) {
      setLoadingData(false);
    }
  }, [tryOnCart]);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(currentTheme.menuBar);
      }
      StatusBar.setBarStyle(themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content');
    }, [currentTheme, themeContext.ThemeValue])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('titleTryOnCart'), // New translation key
      headerRight: null,
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: currentTheme.newFontcolor,
        ...textStyles.H4,
        ...textStyles.Bolder
      },
      headerStyle: {
        backgroundColor: currentTheme.newheaderBG
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View style={styles(currentTheme).backButton}>
              <AntDesign name='arrowleft' size={22} color={currentTheme.newIconColor} />
            </View>
          )}
          onPress={() => {
            navigationService.goBack();
          }}
        />
      )
    });
  }, [navigation, currentTheme, t]);

  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_TRYON_CART);
    }
    Track();
  }, [Analytics]);

  function calculateSubtotal() {
    // For TryOn, subtotal might just be the sum of fees, as items are not purchased yet.
    // Or, it could be 0 if fees are handled at a later stage.
    // This depends on the defined TryOn flow.
    return 0; // Placeholder - items are not being bought yet
  }

  function calculateTotal() {
    let total = 0;
    total += tryOnFee;
    total += serviceFee;
    // Add other fees if applicable (e.g., express delivery for TryOn)
    return parseFloat(total).toFixed(2);
  }

  const { isConnected: connect } = useNetworkStatus();
  if (!connect) return <ErrorView />;

  function emptyTryOnCart() {
    return (
      <View style={styles().subContainerImage}>
        <View style={styles().imageContainer}>
          <EmptyCart width={scale(200)} height={scale(200)} /> 
        </View>
        <View style={styles().descriptionEmpty}>
          <TextDefault textColor={currentTheme.fontMainColor} bolder center>
            {t('Your Try-On Cart is Empty')}
          </TextDefault>
          <TextDefault textColor={currentTheme.fontSecondColor} bold center>
            {t('Add some items to try them on at home!')}
          </TextDefault>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles(currentTheme).emptyButton}
          onPress={() => navigation.navigate('Discovery')} // Navigate to product browsing
        >
          <TextDefault textColor={currentTheme.buttonText} bolder B700 center uppercase>
            {t('Browse Products')}
          </TextDefault>
        </TouchableOpacity>
      </View>
    );
  }

  function loadingScreen() {
    return (
      <View style={styles(currentTheme).screenBackground}>
        <Placeholder Animation={(props) => <Fade {...props} style={styles(currentTheme).placeHolderFadeColor} duration={600} />} style={styles(currentTheme).placeHolderContainer}>
          <PlaceholderLine /><PlaceholderLine /><PlaceholderLine />
        </Placeholder>
        {/* Add more placeholders as needed */}
      </View>
    );
  }

  if (loadingData) return loadingScreen();

  return (
    <>
      <View style={styles(currentTheme).mainContainer}>
        {isCartEmpty ? (
          emptyTryOnCart()
        ) : (
          <>
            <ScrollView showsVerticalScrollIndicator={false} style={[styles().flex, styles().cartItems]}>
              <View style={styles(currentTheme).cartItemsContainer}>
                <TextDefault textColor={currentTheme.gray500} style={styles().totalOrder} H5 bolder isRTL>
                  {t('yourTryOnSelection')} ({cartLength})
                </TextDefault>
                {tryOnCart?.map((item, index) => (
                  <View key={item._id + item.size + item.color + index} style={[styles(currentTheme).itemContainer]}>
                    <TryOnCartItem
                      item={item}
                      onRemove={() => removeTryOnCartItem(item._id, item.size, item.color)} // Pass unique identifiers
                      // Add updateQuantity if users can select multiple of the *same* variant for try-on (unlikely)
                    />
                  </View>
                ))}
              </View>

              {/* Fee Summary Section */}
              <View style={styles(currentTheme).feeSummaryContainer}>
                <TextDefault H5 bold style={styles(currentTheme).summaryTitle}>{t('Fee Summary')}</TextDefault>
                <View style={styles(currentTheme).feeRow}>
                  <TextDefault>{t('Try-On Fee')}</TextDefault>
                  <TextDefault>{configuration.currencySymbol}{tryOnFee.toFixed(2)}</TextDefault>
                </View>
                <View style={styles(currentTheme).feeRow}>
                  <TextDefault>{t('Service Fee')}</TextDefault>
                  <TextDefault>{configuration.currencySymbol}{serviceFee.toFixed(2)}</TextDefault>
                </View>
                <View style={[styles(currentTheme).feeRow, styles(currentTheme).totalFeeRow]}>
                  <TextDefault bold>{t('Total Fees')}</TextDefault>
                  <TextDefault bold>{configuration.currencySymbol}{calculateTotal()}</TextDefault>
                </View>
              </View>

              {/* Special Instructions (Optional for TryOn) */}
              {/* <View style={styles(currentTheme).instructionsContainer}>
                <SpecialInstructions instructions={instructions} onSubmitInstructions={setInstructions} theme={currentTheme} t={t} />
              </View> */}
            </ScrollView>

            <View style={styles().totalBillContainer}>
              <View style={styles(currentTheme).buttonContainer}>
                <View style={styles().cartAmount}>
                  <TextDefault textColor={currentTheme.black} style={styles().totalBill} bolder H2 isRTL>
                    {configuration.currencySymbol}
                    {calculateTotal()} 
                  </TextDefault>
                  <TextDefault textColor={currentTheme.black} style={styles().totalBill} bolder Smaller isRTL>
                    {t('Total Fees')}
                  </TextDefault>
                </View>
                {isLoggedIn && profile ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      // Check item/store limits again before proceeding
                      if (tryOnCartCount > maxTryOnItems) {
                        Alert.alert(t('Limit Exceeded'), t('You have too many items in your cart. Max: {maxTryOnItems}', {maxTryOnItems}));
                        return;
                      }
                      const storesInCart = new Set(tryOnCart.map(item => item.storeId));
                      if (storesInCart.size > maxTryOnStores) {
                        Alert.alert(t('Limit Exceeded'), t('You have items from too many stores. Max: {maxTryOnStores}', {maxTryOnStores}));
                        return;
                      }
                      navigation.navigate('Checkout', { // Navigate to a TryOn specific checkout if needed
                        isTryOnOrder: true,
                        totalAmount: calculateTotal(),
                        items: tryOnCart // Pass items for order summary
                      });
                    }}
                    style={styles(currentTheme).checkoutButton}
                  >
                    <TextDefault textColor={currentTheme.white} H5 bold center>
                      {t('Proceed to Checkout')}
                    </TextDefault>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('CreateAccount')}
                    style={styles(currentTheme).checkoutButton}
                  >
                    <TextDefault textColor={currentTheme.white} H5 bold center>
                      {t('LoginToProceed')}
                    </TextDefault>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </>
  );
}

export default TryOnCart;

