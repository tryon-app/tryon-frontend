import React, { useState, useEffect, useContext, useLayoutEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar, Platform, Alert, FlatList } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import TextDefault from '../../components/Text/TextDefault/TextDefault';
import styles from './styles'; // Create this file
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import UserContext from '../../context/User';
import ConfigurationContext from '../../context/Configuration';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { HeaderBackButton } from '@react-navigation/elements';
import navigationService from '../../routes/navigationService';
import { scale } from '../../utils/scaling';
import analytics from '../../utils/analytics';
// Import a component for individual item selection (similar to TryOnCartItem but with Keep/Return buttons)
// import TryOnSelectionItem from '../../components/TryOnSelectionItem/TryOnSelectionItem'; // Create this

// Placeholder for TryOnSelectionItem until it's created
const TryOnSelectionItem = ({ item, onSelectStatus, selectionStatus }) => {
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];
  const { t } = useTranslation();
  const isKept = selectionStatus === 'keep';
  const isReturned = selectionStatus === 'return';

  return (
    <View style={styles(currentTheme).selectionItemContainer}>
      <Image source={{ uri: item.image }} style={styles(currentTheme).itemImage} />
      <View style={styles(currentTheme).itemInfoContainer}>
        <TextDefault H6 bold textColor={currentTheme.fontMainColor}>{item.name}</TextDefault>
        <TextDefault Small textColor={currentTheme.fontSecondColor}>{t('Size')}: {item.size}, {t('Color')}: {item.color}</TextDefault>
      </View>
      <View style={styles(currentTheme).itemActionsContainer}>
        <TouchableOpacity 
          style={[styles(currentTheme).actionButton, isKept && styles(currentTheme).selectedButtonKeep]}
          onPress={() => onSelectStatus(item, 'keep')}
        >
          <TextDefault textColor={isKept ? currentTheme.white : currentTheme.iconColorPink} Small bold>{t('Keep')}</TextDefault>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles(currentTheme).actionButton, isReturned && styles(currentTheme).selectedButtonReturn]}
          onPress={() => onSelectStatus(item, 'return')}
        >
          <TextDefault textColor={isReturned ? currentTheme.white : currentTheme.textErrorColor} Small bold>{t('Return')}</TextDefault>
        </TouchableOpacity>
      </View>
    </View>
  );
};


function TryOnProcessScreen(props) {
  const route = useRoute();
  const { orderId, items: orderItems } = route.params; // Expect orderId and items from navigation

  const { t, i18n } = useTranslation();
  const themeContext = useContext(ThemeContext);
  const { profile, updateTryOnOrderStatus, notifyDriverTryOnCompletion } = useContext(UserContext);
  const configuration = useContext(ConfigurationContext);
  const currentTheme = { isRTL: i18n.dir() === 'rtl', ...theme[themeContext.ThemeValue] };
  const navigation = useNavigation();
  const Analytics = analytics();

  const initialTime = configuration.tryOnTimerDuration || 15 * 60; // 15 minutes in seconds or from config
  const [remainingTime, setRemainingTime] = useState(initialTime);
  const [timerKey, setTimerKey] = useState(0); // To restart timer
  const [timerPlaying, setTimerPlaying] = useState(true);
  const [canExtend, setCanExtend] = useState(true); // Allow one extension
  const [itemSelections, setItemSelections] = useState({}); // { itemId: 'keep' | 'return' }

  useEffect(() => {
    // Initialize selections - by default, all items are 'undecided' or 'return'
    const initialSelections = {};
    orderItems.forEach(item => {
      // unique key for item variant
      const itemKey = `${item._id}-${item.size}-${item.color}`;
      initialSelections[itemKey] = 'return'; // Default to return, user must explicitly keep
    });
    setItemSelections(initialSelections);
  }, [orderItems]);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(currentTheme.menuBar);
      }
      StatusBar.setBarStyle(themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content');
      Analytics.track(Analytics.events.NAVIGATE_TO_TRYON_PROCESS, { orderId });
      return () => {
        // Cleanup if needed
      };
    }, [currentTheme, themeContext.ThemeValue, orderId, Analytics])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('Try-On Session'),
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: currentTheme.newheaderBG },
      headerTitleStyle: { color: currentTheme.newFontcolor },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => <AntDesign name='arrowleft' size={scale(22)} color={currentTheme.newIconColor} />}
          onPress={() => Alert.alert(
            t('End Try-On?'),
            t('Are you sure you want to end the try-on session early?'),
            [
              { text: t('Cancel'), style: 'cancel' },
              { text: t('End Session'), onPress: () => handleConfirmSelections(true) } // true for early exit
            ]
          )}
        />
      ),
    });
  }, [navigation, currentTheme, t, itemSelections]);

  const handleTimeExtension = () => {
    if (canExtend) {
      const extensionDuration = configuration.tryOnTimerExtension || 5 * 60; // 5 minutes extension
      setRemainingTime(prev => prev + extensionDuration);
      setTimerKey(prevKey => prevKey + 1); // Re-render timer with new duration
      setCanExtend(false);
      Alert.alert(t('Timer Extended'), t('You have {extensionDuration} more minutes.', { extensionDuration: extensionDuration / 60 }));
      Analytics.track(Analytics.events.TRYON_TIMER_EXTENDED, { orderId });
    }
  };

  const handleItemSelection = (item, status) => {
    const itemKey = `${item._id}-${item.size}-${item.color}`;
    setItemSelections(prev => ({ ...prev, [itemKey]: status }));
  };

  const handleConfirmSelections = async (earlyExit = false) => {
    setTimerPlaying(false); // Stop the timer
    const keptItems = orderItems.filter(item => {
        const itemKey = `${item._id}-${item.size}-${item.color}`;
        return itemSelections[itemKey] === 'keep';
    });
    const returnedItems = orderItems.filter(item => {
        const itemKey = `${item._id}-${item.size}-${item.color}`;
        return itemSelections[itemKey] === 'return';
    });

    try {
      // Update order status in backend (e.g., 'TRYON_COMPLETED')
      // This might involve a mutation call
      await updateTryOnOrderStatus(orderId, 'TRYON_COMPLETED', keptItems, returnedItems);
      // Notify driver with the selection
      await notifyDriverTryOnCompletion(orderId, keptItems.length, returnedItems.length);
      
      Analytics.track(Analytics.events.TRYON_COMPLETED, { 
        orderId, 
        keptCount: keptItems.length, 
        returnedCount: returnedItems.length,
        earlyExit 
      });

      // Navigate to a summary/payment screen for kept items
      navigation.replace('OrderConfirmation', { // Or a new screen like 'TryOnSummary'
        orderId,
        keptItems,
        returnedItems,
        finalAmount: keptItems.reduce((sum, item) => sum + item.price, 0) // Calculate final amount
      });
    } catch (error) {
      console.error('Error confirming selections:', error);
      Alert.alert(t('Error'), t('Could not finalize your selections. Please try again.'));
      setTimerPlaying(true); // Resume timer if error
    }
  };

  const onTimerComplete = () => {
    Alert.alert(
      t('Time Up!'),
      t('Your try-on time has expired. Please confirm your selections.'),
      [{ text: t('OK'), onPress: () => handleConfirmSelections(false) }]
    );
    // Automatically confirm selections or force user to confirm
    // For now, we prompt and then call handleConfirmSelections
  };

  const renderItem = ({ item }) => {
    const itemKey = `${item._id}-${item.size}-${item.color}`;
    return (
        <TryOnSelectionItem 
            item={item} 
            onSelectStatus={handleItemSelection} 
            selectionStatus={itemSelections[itemKey]}
        />
    );
  };

  return (
    <View style={styles(currentTheme).screenBase}>
      <ScrollView contentContainerStyle={styles(currentTheme).scrollContainer}>
        <View style={styles(currentTheme).timerContainer}>
          <CountdownCircleTimer
            key={timerKey}
            isPlaying={timerPlaying}
            duration={remainingTime} // Use state for dynamic duration
            initialRemainingTime={remainingTime} // Ensure timer starts from current remaining time on re-render
            colors={[currentTheme.iconColorPink, '#F7B801', '#A30000', '#A30000']}
            colorsTime={[remainingTime * 0.7, remainingTime * 0.4, remainingTime * 0.2, 0]}
            onComplete={onTimerComplete}
            size={scale(120)}
            strokeWidth={scale(10)}
          >
            {({ remainingTime, elapsedTime }) => (
              <TextDefault H4 bold textColor={currentTheme.fontMainColor}>
                {`${Math.floor(remainingTime / 60).toString().padStart(2, '0')}:${(remainingTime % 60).toString().padStart(2, '0')}`}
              </TextDefault>
            )}
          </CountdownCircleTimer>
          {canExtend && (
            <TouchableOpacity style={styles(currentTheme).extendButton} onPress={handleTimeExtension}>
              <MaterialCommunityIcons name="timer-plus-outline" size={scale(20)} color={currentTheme.iconColorPink} />
              <TextDefault textColor={currentTheme.iconColorPink} style={styles(currentTheme).extendButtonText} Small bold>
                {t('Extend Time (+{configuration.tryOnTimerExtensionMinutes} min)', { configuration })}
              </TextDefault>
            </TouchableOpacity>
          )}
        </View>

        <TextDefault H5 style={styles(currentTheme).instructionsText}>
          {t('Select items you want to keep or return.')}
        </TextDefault>

        <FlatList
          data={orderItems}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item._id}-${item.size}-${item.color}-${index}`}
          style={styles(currentTheme).itemList}
          scrollEnabled={false} // If inside ScrollView, disable FlatList scroll
        />
      </ScrollView>
      <TouchableOpacity style={styles(currentTheme).confirmButton} onPress={() => handleConfirmSelections(false)}>
        <TextDefault H5 bold textColor={currentTheme.white}>{t('Confirm Selections')}</TextDefault>
      </TouchableOpacity>
    </View>
  );
}

export default TryOnProcessScreen;

